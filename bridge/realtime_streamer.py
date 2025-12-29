"""
Real-time Streamer - WebSocket-based live session streaming
Streams Claude Code events to EvolveFlow frontend in real-time
"""
import asyncio
import json
from typing import Optional, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import httpx
from loguru import logger

from telemetry_capture import ClaudeCodeEvent, EventType, TelemetryCapture
from bridge_service import EvolveFlowBridge
from skill_extractor import SkillExtractor


app = FastAPI(title="EvolveFlow Bridge Streamer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
active_connections: Set[WebSocket] = set()

# Bridge instance
bridge = EvolveFlowBridge()
skill_extractor = SkillExtractor()

# Event buffer for skill extraction
event_buffer: list = []


@app.on_event("startup")
async def startup():
    """Initialize bridge on startup"""
    await bridge.initialize_workflow()
    logger.info("Bridge initialized")


@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """
    WebSocket endpoint for streaming events
    Clients connect here to receive real-time updates
    """
    await websocket.accept()
    active_connections.add(websocket)
    logger.info(f"Client connected, total: {len(active_connections)}")

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received: {data}")

    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info(f"Client disconnected, remaining: {len(active_connections)}")


async def broadcast_event(event_data: dict):
    """Broadcast event to all connected clients"""
    disconnected = set()

    for connection in active_connections:
        try:
            await connection.send_json(event_data)
        except Exception as e:
            logger.error(f"Broadcast failed: {e}")
            disconnected.add(connection)

    active_connections.difference_update(disconnected)


@app.post("/api/events/capture")
async def capture_event(event_data: dict):
    """
    Endpoint to receive events from Claude Code
    Can be called via HTTP POST
    """
    try:
        event_type_str = event_data.get("event_type", "thought")
        event_type = EventType(event_type_str)

        event = ClaudeCodeEvent(
            event_type=event_type,
            content=event_data.get("content", ""),
            metadata=event_data.get("metadata", {})
        )

        event_buffer.append(event)

        node = bridge.event_to_node(event)
        await bridge.add_node_to_workflow(node)

        await broadcast_event({
            "type": "new_node",
            "node": node,
            "event": event.to_dict()
        })

        logger.info(f"Captured event: {event_type.value}")

        return {"success": True, "node_id": node["id"]}

    except Exception as e:
        logger.error(f"Event capture failed: {e}")
        return {"success": False, "error": str(e)}


@app.post("/api/skills/extract")
async def extract_skills():
    """
    Endpoint to trigger skill extraction from current session
    """
    try:
        skills = skill_extractor.extract_skills_from_session(event_buffer)

        async with httpx.AsyncClient() as client:
            for skill in skills:
                response = await client.post(
                    f"{bridge.api_url}/skills",
                    json=skill
                )
                logger.info(f"Created skill: {skill['name']}")

        await broadcast_event({
            "type": "skills_extracted",
            "count": len(skills),
            "skills": skills
        })

        return {
            "success": True,
            "skills_extracted": len(skills),
            "skills": skills
        }

    except Exception as e:
        logger.error(f"Skill extraction failed: {e}")
        return {"success": False, "error": str(e)}


@app.post("/api/session/reset")
async def reset_session():
    """Reset session and start fresh"""
    global event_buffer
    event_buffer = []
    bridge.telemetry.clear_events()

    await bridge.initialize_workflow()

    await broadcast_event({
        "type": "session_reset",
        "workflow_id": bridge.workflow_id
    })

    return {"success": True, "workflow_id": bridge.workflow_id}


@app.get("/api/stats")
async def get_stats():
    """Get current session statistics"""
    return {
        "events_captured": len(event_buffer),
        "active_connections": len(active_connections),
        "workflow_id": bridge.workflow_id,
        "event_types": {
            "thoughts": sum(1 for e in event_buffer if e.event_type == EventType.THOUGHT),
            "tool_calls": sum(1 for e in event_buffer if e.event_type == EventType.TOOL_CALL),
            "observations": sum(1 for e in event_buffer if e.event_type == EventType.OBSERVATION),
        }
    }


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "bridge_active": bridge.workflow_id is not None,
        "connections": len(active_connections)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
