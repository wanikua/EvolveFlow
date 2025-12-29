"""
Bridge Service - Connects Claude Code telemetry to EvolveFlow
Transforms events into React Flow nodes and edges
"""
import asyncio
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime
from loguru import logger

from telemetry_capture import (
    ClaudeCodeEvent, EventType, TelemetryCapture,
    map_tool_to_mcp
)


class EvolveFlowBridge:
    """
    Bridge between Claude Code and EvolveFlow
    Transforms telemetry events into workflow nodes
    """

    def __init__(
        self,
        evolveflow_api_url: str = "http://localhost:8000/api",
        workflow_name: str = "Claude Code Session"
    ):
        self.api_url = evolveflow_api_url
        self.workflow_name = workflow_name
        self.workflow_id: Optional[str] = None
        self.telemetry = TelemetryCapture()
        self.node_counter = 0
        self.position_x = 100
        self.position_y = 100

    async def initialize_workflow(self):
        """Create new workflow in EvolveFlow"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/workflows",
                params={"name": self.workflow_name}
            )
            workflow = response.json()
            self.workflow_id = workflow["workflow_id"]
            logger.info(f"Created workflow: {self.workflow_id}")
            return self.workflow_id

    def _get_next_position(self) -> Dict[str, float]:
        """Calculate next node position"""
        pos = {"x": self.position_x, "y": self.position_y}
        self.position_x += 250
        if self.position_x > 1000:
            self.position_x = 100
            self.position_y += 200
        return pos

    def event_to_node(self, event: ClaudeCodeEvent) -> Dict[str, Any]:
        """
        Transform telemetry event to EvolveFlow node
        """
        self.node_counter += 1
        position = self._get_next_position()

        if event.event_type == EventType.THOUGHT:
            return {
                "id": f"node-thought-{self.node_counter}",
                "type": "thought",
                "position": position,
                "data": {
                    "label": "Claude Reasoning",
                    "content": event.content,
                    "timestamp": event.timestamp.isoformat(),
                    "status": "completed"
                }
            }

        elif event.event_type == EventType.TOOL_CALL:
            tool_name = event.metadata.get("tool_name", "unknown")
            mcp_tool = map_tool_to_mcp(tool_name)

            return {
                "id": f"node-act-{self.node_counter}",
                "type": "act",
                "position": position,
                "data": {
                    "label": f"Tool: {tool_name}",
                    "tool_name": tool_name,
                    "tool_description": mcp_tool["description"] if mcp_tool else "",
                    "input_schema": mcp_tool["input_schema"] if mcp_tool else {},
                    "status": "executing",
                    "timestamp": event.timestamp.isoformat()
                }
            }

        elif event.event_type == EventType.TOOL_RESULT:
            return {
                "id": f"node-observe-{self.node_counter}",
                "type": "observe",
                "position": position,
                "data": {
                    "label": "Tool Result",
                    "observation": event.metadata,
                    "interpretation": event.content,
                    "needs_evolution": False,
                    "timestamp": event.timestamp.isoformat()
                }
            }

        else:
            return {
                "id": f"node-generic-{self.node_counter}",
                "type": "thought",
                "position": position,
                "data": {
                    "label": "Event",
                    "content": event.content,
                    "timestamp": event.timestamp.isoformat(),
                    "status": "completed"
                }
            }

    async def add_node_to_workflow(self, node: Dict[str, Any]):
        """Add node to EvolveFlow workflow via API"""
        if not self.workflow_id:
            await self.initialize_workflow()

        async with httpx.AsyncClient() as client:
            workflow_response = await client.get(
                f"{self.api_url}/workflows/{self.workflow_id}"
            )
            workflow = workflow_response.json()

            workflow["nodes"].append(node)

            if len(workflow["nodes"]) > 1:
                prev_node = workflow["nodes"][-2]
                edge = {
                    "id": f"edge-{prev_node['id']}-{node['id']}",
                    "source": prev_node["id"],
                    "target": node["id"],
                    "type": "default",
                    "animated": True
                }
                workflow["edges"].append(edge)

            # Save updated workflow back to backend
            update_response = await client.put(
                f"{self.api_url}/workflows/{self.workflow_id}",
                json=workflow
            )

            logger.info(f"Added node: {node['id']} ({node['type']})")

    async def process_event(self, event: ClaudeCodeEvent):
        """Process single event and send to EvolveFlow"""
        node = self.event_to_node(event)
        await self.add_node_to_workflow(node)

    async def capture_and_stream(self, log_source):
        """
        Continuously capture from log source and stream to EvolveFlow
        log_source: iterable of log lines
        """
        await self.initialize_workflow()

        for line in log_source:
            event = self.telemetry.capture_from_log(line)
            if event:
                await self.process_event(event)
                await asyncio.sleep(0.1)  # Rate limiting

    async def create_skill_from_session(
        self,
        skill_name: str,
        description: str
    ) -> Optional[str]:
        """
        Extract current session as a reusable skill
        """
        if not self.workflow_id:
            logger.warning("No active workflow")
            return None

        async with httpx.AsyncClient() as client:
            workflow_response = await client.get(
                f"{self.api_url}/workflows/{self.workflow_id}"
            )
            workflow = workflow_response.json()

            skill_data = {
                "name": skill_name,
                "description": description,
                "category": "Claude Code Automation",
                "workflow": {
                    "nodes": workflow["nodes"],
                    "edges": workflow["edges"]
                },
                "input_schema": {
                    "type": "object",
                    "properties": {}
                },
                "output_schema": {
                    "type": "object",
                    "properties": {
                        "result": {"type": "string"}
                    }
                }
            }

            skill_response = await client.post(
                f"{self.api_url}/skills",
                json=skill_data
            )
            skill = skill_response.json()

            logger.info(f"Created skill: {skill['skill_id']}")
            return skill["skill_id"]


async def watch_terminal_output(file_path: str, bridge: EvolveFlowBridge):
    """
    Watch terminal output file and stream to EvolveFlow
    Useful for capturing Claude Code sessions
    """
    logger.info(f"Watching {file_path}")

    with open(file_path, 'r') as f:
        f.seek(0, 2)  # Go to end of file

        while True:
            line = f.readline()
            if line:
                event = bridge.telemetry.capture_from_log(line)
                if event:
                    await bridge.process_event(event)
            else:
                await asyncio.sleep(0.1)


# CLI Interface
if __name__ == "__main__":
    import sys

    async def main():
        bridge = EvolveFlowBridge()

        if len(sys.argv) > 1:
            log_file = sys.argv[1]
            logger.info(f"Starting bridge, watching {log_file}")
            await watch_terminal_output(log_file, bridge)
        else:
            logger.info("Starting bridge in test mode")
            await bridge.initialize_workflow()

            test_events = [
                ClaudeCodeEvent(
                    EventType.THOUGHT,
                    "I need to read the file to understand the code"
                ),
                ClaudeCodeEvent(
                    EventType.TOOL_CALL,
                    "Reading file",
                    {"tool_name": "Read"}
                ),
                ClaudeCodeEvent(
                    EventType.TOOL_RESULT,
                    "File read successfully",
                    {"status": "completed"}
                ),
                ClaudeCodeEvent(
                    EventType.OBSERVATION,
                    "The file contains a bug in line 42"
                ),
            ]

            for event in test_events:
                await bridge.process_event(event)
                await asyncio.sleep(0.5)

            await bridge.create_skill_from_session(
                "Debug Line 42",
                "Identified and fixed bug in line 42"
            )

    asyncio.run(main())
