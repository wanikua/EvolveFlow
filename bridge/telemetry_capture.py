"""
Telemetry Capture for Claude Code
Captures tool calls, reasoning, and outcomes from Claude Code sessions
"""
import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum


class EventType(Enum):
    THOUGHT = "thought"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    OBSERVATION = "observation"
    SKILL_LEARNED = "skill_learned"


class ClaudeCodeEvent:
    """Represents a single event from Claude Code"""

    def __init__(
        self,
        event_type: EventType,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None
    ):
        self.event_type = event_type
        self.content = content
        self.metadata = metadata or {}
        self.timestamp = timestamp or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_type": self.event_type.value,
            "content": self.content,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat()
        }


class TelemetryCapture:
    """
    Captures and parses Claude Code output
    Extracts structured events from terminal streams
    """

    def __init__(self):
        self.events: List[ClaudeCodeEvent] = []
        self.current_session_id: Optional[str] = None

    def parse_tool_call(self, line: str) -> Optional[ClaudeCodeEvent]:
        """
        Parse tool call from Claude Code output
        Format: <invoke name="ToolName">
        """
        invoke_match = re.search(r'<invoke name="([^"]+)">', line)
        if invoke_match:
            tool_name = invoke_match.group(1)
            return ClaudeCodeEvent(
                event_type=EventType.TOOL_CALL,
                content=f"Calling tool: {tool_name}",
                metadata={"tool_name": tool_name, "status": "initiated"}
            )
        return None

    def parse_tool_result(self, line: str) -> Optional[ClaudeCodeEvent]:
        """
        Parse tool result from Claude Code output
        Format: <function_results>
        """
        if "<function_results>" in line:
            return ClaudeCodeEvent(
                event_type=EventType.TOOL_RESULT,
                content="Tool execution completed",
                metadata={"status": "completed"}
            )
        return None

    def parse_reasoning(self, line: str) -> Optional[ClaudeCodeEvent]:
        """
        Parse reasoning/thinking from Claude Code
        Detects natural language reasoning
        """
        thinking_patterns = [
            r"Let me",
            r"I will",
            r"I need to",
            r"First,",
            r"Now",
            r"Next,",
        ]

        for pattern in thinking_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                return ClaudeCodeEvent(
                    event_type=EventType.THOUGHT,
                    content=line.strip(),
                    metadata={"type": "reasoning"}
                )
        return None

    def detect_skill_acquisition(
        self,
        events: List[ClaudeCodeEvent]
    ) -> Optional[Dict[str, Any]]:
        """
        Detect when Claude Code successfully completes a task
        Returns skill definition if pattern found
        """
        if len(events) < 3:
            return None

        tool_calls = [e for e in events if e.event_type == EventType.TOOL_CALL]
        successful_results = [
            e for e in events
            if e.event_type == EventType.TOOL_RESULT
            and e.metadata.get("status") == "completed"
        ]

        if len(tool_calls) >= 2 and len(successful_results) >= 2:
            return {
                "skill_name": f"Task completed at {datetime.utcnow().isoformat()}",
                "description": "Multi-step task completion",
                "steps": [e.to_dict() for e in events],
                "tool_sequence": [e.metadata.get("tool_name") for e in tool_calls]
            }

        return None

    def capture_from_log(self, log_line: str) -> Optional[ClaudeCodeEvent]:
        """
        Main capture method - process a single log line
        Returns event if one was detected
        """
        event = self.parse_tool_call(log_line)
        if event:
            self.events.append(event)
            return event

        event = self.parse_tool_result(log_line)
        if event:
            self.events.append(event)
            return event

        event = self.parse_reasoning(log_line)
        if event:
            self.events.append(event)
            return event

        return None

    def get_recent_events(self, limit: int = 10) -> List[ClaudeCodeEvent]:
        """Get most recent events"""
        return self.events[-limit:]

    def clear_events(self):
        """Clear event history"""
        self.events = []


# Tool mapping to MCP format
CLAUDE_CODE_TOOL_MAPPING = {
    "Read": {
        "name": "read_file",
        "description": "Read file contents from filesystem",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string", "description": "Path to file"}
            },
            "required": ["file_path"]
        }
    },
    "Write": {
        "name": "write_file",
        "description": "Write content to file",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string"},
                "content": {"type": "string"}
            },
            "required": ["file_path", "content"]
        }
    },
    "Edit": {
        "name": "edit_file",
        "description": "Edit file with find-replace",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string"},
                "old_string": {"type": "string"},
                "new_string": {"type": "string"}
            },
            "required": ["file_path", "old_string", "new_string"]
        }
    },
    "Bash": {
        "name": "bash_command",
        "description": "Execute bash command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string"}
            },
            "required": ["command"]
        }
    },
    "Grep": {
        "name": "search_code",
        "description": "Search for pattern in code",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {"type": "string"},
                "path": {"type": "string"}
            },
            "required": ["pattern"]
        }
    },
    "Glob": {
        "name": "find_files",
        "description": "Find files by pattern",
        "input_schema": {
            "type": "object",
            "properties": {
                "pattern": {"type": "string"}
            },
            "required": ["pattern"]
        }
    }
}


def map_tool_to_mcp(tool_name: str) -> Optional[Dict[str, Any]]:
    """Map Claude Code tool to MCP format"""
    return CLAUDE_CODE_TOOL_MAPPING.get(tool_name)
