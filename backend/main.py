"""
EvolveFlow Backend API
FastAPI server implementing MCP-compliant agent workflow system
"""
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from loguru import logger
import sys

from models import (
    WorkflowState, ExecuteNodeRequest, ExecuteNodeResponse,
    ThoughtNode, ActNode, ObserveNode, SkillNode,
    MCPToolConfig, SkillDefinition, Position
)
from mcp_client import mcp_client
from evolution_engine import evolution_engine
from skill_manager import skill_manager

logger.remove()
logger.add(sys.stderr, level="INFO")

app = FastAPI(
    title="EvolveFlow API",
    description="Self-evolving AI agent workflow system with MCP support",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

workflows: Dict[str, WorkflowState] = {}
active_connections: List[WebSocket] = []


# ==================== Workflow Endpoints ====================

@app.post("/api/workflows", response_model=WorkflowState)
async def create_workflow(name: str):
    """Create new workflow"""

    workflow = WorkflowState(name=name)
    workflows[workflow.workflow_id] = workflow

    logger.info(f"Created workflow: {workflow.workflow_id}")
    return workflow


@app.get("/api/workflows/{workflow_id}", response_model=WorkflowState)
async def get_workflow(workflow_id: str):
    """Get workflow by ID"""

    workflow = workflows.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return workflow


@app.get("/api/workflows", response_model=List[WorkflowState])
async def list_workflows():
    """List all workflows"""
    return list(workflows.values())


@app.put("/api/workflows/{workflow_id}", response_model=WorkflowState)
async def update_workflow(workflow_id: str, workflow: WorkflowState):
    """Update existing workflow"""

    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")

    workflows[workflow_id] = workflow
    logger.info(f"Updated workflow: {workflow_id}")
    return workflow


@app.delete("/api/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str):
    """Delete workflow"""

    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")

    del workflows[workflow_id]
    return {"success": True, "message": "Workflow deleted"}


# ==================== Node Execution ====================

@app.post("/api/execute", response_model=ExecuteNodeResponse)
async def execute_node(request: ExecuteNodeRequest):
    """Execute a node in the workflow"""

    workflow = workflows.get(request.workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    node = next((n for n in workflow.nodes if n["id"] == request.node_id), None)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    workflow.current_node = request.node_id
    workflow.status = "running"

    node_type = node["type"]

    try:
        if node_type == "thought":
            result = await execute_thought_node(node, request.inputs)
        elif node_type == "act":
            result = await execute_act_node(node, request.inputs, workflow)
        elif node_type == "observe":
            result = await execute_observe_node(node, request.inputs, workflow)
        elif node_type == "skill":
            result = await execute_skill_node(node, request.inputs)
        else:
            raise ValueError(f"Unknown node type: {node_type}")

        await broadcast_update({
            "type": "node_executed",
            "workflow_id": workflow.workflow_id,
            "node_id": request.node_id,
            "result": result
        })

        return result

    except Exception as e:
        logger.error(f"Node execution failed: {e}")
        workflow.status = "failed"

        return ExecuteNodeResponse(
            success=False,
            node_id=request.node_id,
            error=str(e),
            evolution_triggered=False
        )


async def execute_thought_node(node: Dict[str, Any], inputs: Optional[Dict[str, Any]]) -> ExecuteNodeResponse:
    """Execute Thought node"""

    node["data"]["status"] = "processing"

    content = node["data"].get("content", "")
    logger.info(f"Thought: {content}")

    node["data"]["status"] = "completed"

    return ExecuteNodeResponse(
        success=True,
        node_id=node["id"],
        result={"thought": content}
    )


async def execute_act_node(
    node: Dict[str, Any],
    inputs: Optional[Dict[str, Any]],
    workflow: WorkflowState
) -> ExecuteNodeResponse:
    """Execute Act node - call MCP tool"""

    node["data"]["status"] = "executing"

    tool_name = node["data"]["tool_name"]
    params = inputs or node["data"].get("input_params", {})

    logger.info(f"Calling tool: {tool_name} with params: {params}")

    tool_result = await mcp_client.call_tool(tool_name, params)

    if tool_result["success"]:
        node["data"]["status"] = "success"
        node["data"]["output"] = tool_result["result"]

        return ExecuteNodeResponse(
            success=True,
            node_id=node["id"],
            result=tool_result["result"]
        )
    else:
        node["data"]["status"] = "error"
        node["data"]["error_message"] = tool_result["error"]

        evolution_record = await evolution_engine.trigger_evolution(
            node_id=node["id"],
            error_type="ToolExecutionError",
            error_message=tool_result["error"],
            context={"tool_name": tool_name, "params": params}
        )

        new_nodes, new_edges = create_evolution_nodes(evolution_record, workflow)

        return ExecuteNodeResponse(
            success=False,
            node_id=node["id"],
            error=tool_result["error"],
            evolution_triggered=True,
            new_nodes=new_nodes,
            new_edges=new_edges
        )


async def execute_observe_node(
    node: Dict[str, Any],
    inputs: Optional[Dict[str, Any]],
    workflow: WorkflowState
) -> ExecuteNodeResponse:
    """Execute Observe node - process tool output"""

    observation = inputs or {}

    interpretation = f"Observed: {observation}"
    node["data"]["observation"] = observation
    node["data"]["interpretation"] = interpretation

    logger.info(interpretation)

    return ExecuteNodeResponse(
        success=True,
        node_id=node["id"],
        result={"observation": observation, "interpretation": interpretation}
    )


async def execute_skill_node(node: Dict[str, Any], inputs: Optional[Dict[str, Any]]) -> ExecuteNodeResponse:
    """Execute Skill node"""

    node["data"]["status"] = "executing"

    skill_id = node["data"]["skill_id"]
    skill_inputs = inputs or node["data"].get("inputs", {})

    result = await skill_manager.execute_skill(skill_id, skill_inputs)

    if result["success"]:
        node["data"]["status"] = "completed"
        node["data"]["outputs"] = result["result"]

        return ExecuteNodeResponse(
            success=True,
            node_id=node["id"],
            result=result["result"]
        )
    else:
        node["data"]["status"] = "failed"

        return ExecuteNodeResponse(
            success=False,
            node_id=node["id"],
            error=result["error"]
        )


def create_evolution_nodes(evolution_record, workflow: WorkflowState) -> tuple:
    """Create new nodes/edges from evolution"""

    new_nodes = []
    new_edges = []

    if evolution_record.update.new_skill_created:
        skill_id = evolution_record.update.skill_id

        skill_node = {
            "id": f"node-evolved-{evolution_record.evolution_id}",
            "type": "skill",
            "position": {"x": 600, "y": 200},
            "data": {
                "label": f"Evolved Skill: {skill_id}",
                "skill_id": skill_id,
                "status": "ready",
                "evolution_id": evolution_record.evolution_id
            }
        }

        new_nodes.append(skill_node)
        workflow.nodes.append(skill_node)

        new_edge = {
            "id": f"edge-evolution-{evolution_record.evolution_id}",
            "source": evolution_record.trigger.node_id,
            "target": skill_node["id"],
            "type": "evolution",
            "animated": True,
            "style": {"stroke": "#ff6b6b", "strokeWidth": 2}
        }

        new_edges.append(new_edge)
        workflow.edges.append(new_edge)

        workflow.metadata.total_evolutions += 1

    return new_nodes, new_edges


# ==================== MCP Tool Endpoints ====================

@app.get("/api/tools", response_model=List[MCPToolConfig])
async def list_tools():
    """List all available MCP tools"""
    return mcp_client.discover_tools()


@app.get("/api/tools/{tool_name}", response_model=MCPToolConfig)
async def get_tool(tool_name: str):
    """Get specific tool configuration"""

    tool = mcp_client.get_tool(tool_name)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    return tool


@app.post("/api/tools/register")
async def register_tool(tool: MCPToolConfig):
    """Register new MCP tool"""

    mcp_client.register_tool(tool)
    return {"success": True, "message": f"Tool {tool.name} registered"}


# ==================== Skill Endpoints ====================

@app.get("/api/skills", response_model=List[SkillDefinition])
async def list_skills(category: Optional[str] = None):
    """List all skills"""
    return skill_manager.list_skills(category)


@app.get("/api/skills/{skill_id}", response_model=SkillDefinition)
async def get_skill(skill_id: str):
    """Get skill by ID"""

    skill = skill_manager.get_skill(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    return skill


@app.post("/api/skills", response_model=SkillDefinition)
async def create_skill(skill: SkillDefinition):
    """Create new skill"""

    skill_manager.add_skill(skill)
    return skill


@app.delete("/api/skills/{skill_id}")
async def delete_skill(skill_id: str):
    """Delete skill"""

    success = skill_manager.delete_skill(skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")

    return {"success": True, "message": "Skill deleted"}


# ==================== Evolution Endpoints ====================

@app.get("/api/evolution/history")
async def get_evolution_history():
    """Get evolution history"""
    return evolution_engine.evolution_history


@app.get("/api/evolution/stats")
async def get_evolution_stats():
    """Get evolution statistics"""
    return evolution_engine.get_evolution_stats()


# ==================== WebSocket for Real-time Updates ====================

@app.websocket("/ws/{workflow_id}")
async def websocket_endpoint(websocket: WebSocket, workflow_id: str):
    """WebSocket connection for real-time workflow updates"""

    await websocket.accept()
    active_connections.append(websocket)

    logger.info(f"WebSocket connected for workflow: {workflow_id}")

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received: {data}")

    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected for workflow: {workflow_id}")


async def broadcast_update(message: Dict[str, Any]):
    """Broadcast update to all connected clients"""

    for connection in active_connections:
        try:
            await connection.send_json(message)
        except Exception as e:
            logger.error(f"Broadcast failed: {e}")


# ==================== Health Check ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "workflows": len(workflows),
        "tools": len(mcp_client.tools),
        "skills": len(skill_manager.skills),
        "evolutions": len(evolution_engine.evolution_history)
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "EvolveFlow API",
        "version": "1.0.0",
        "description": "Self-evolving AI agent workflow system",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
