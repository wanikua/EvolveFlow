#!/usr/bin/env python3
"""
Python-based session capture for Claude Code
More robust than shell script, with better parsing
"""
import sys
import re
import asyncio
import httpx
from datetime import datetime


class ClaudeCodeCapture:
    """Captures Claude Code output and sends to bridge"""

    def __init__(self, bridge_url: str = "http://localhost:8001"):
        self.bridge_url = bridge_url
        self.session_id = datetime.utcnow().isoformat()

    async def send_event(self, event_type: str, content: str, metadata: dict = None):
        """Send event to bridge"""
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{self.bridge_url}/api/events/capture",
                    json={
                        "event_type": event_type,
                        "content": content,
                        "metadata": metadata or {}
                    },
                    timeout=5.0
                )
                print(f"[BRIDGE] Sent {event_type}: {content[:50]}...", file=sys.stderr)
        except Exception as e:
            print(f"[BRIDGE ERROR] {e}", file=sys.stderr)

    def parse_line(self, line: str) -> list:
        """Parse line and return list of events"""
        events = []

        # Tool call detection
        invoke_match = re.search(r'<invoke name="([^"]+)">', line)
        if invoke_match:
            tool_name = invoke_match.group(1)
            events.append(("tool_call", f"Calling tool: {tool_name}", {"tool_name": tool_name}))

        # Tool result detection
        if "<function_results>" in line:
            events.append(("tool_result", "Tool execution completed", {"status": "completed"}))

        # Reasoning detection
        reasoning_patterns = [
            (r"Let me", "planning"),
            (r"I will", "intention"),
            (r"I need to", "requirement"),
            (r"First,", "step"),
            (r"Now", "action"),
            (r"I'm going to", "intention"),
        ]

        for pattern, thought_type in reasoning_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                events.append(("thought", line.strip(), {"type": thought_type}))
                break

        return events

    async def capture_stdin(self):
        """Capture from stdin and send to bridge"""
        print("[BRIDGE] Starting capture from stdin...", file=sys.stderr)

        for line in sys.stdin:
            # Echo to stdout
            print(line, end='')

            # Parse and send events
            events = self.parse_line(line)
            for event_type, content, metadata in events:
                await self.send_event(event_type, content, metadata)

    async def capture_file(self, file_path: str):
        """Capture from file (tail -f style)"""
        print(f"[BRIDGE] Watching {file_path}...", file=sys.stderr)

        with open(file_path, 'r') as f:
            # Go to end
            f.seek(0, 2)

            while True:
                line = f.readline()
                if line:
                    events = self.parse_line(line)
                    for event_type, content, metadata in events:
                        await self.send_event(event_type, content, metadata)
                else:
                    await asyncio.sleep(0.1)


async def main():
    """Main entry point"""
    capture = ClaudeCodeCapture()

    if len(sys.argv) > 1:
        # File mode
        file_path = sys.argv[1]
        await capture.capture_file(file_path)
    else:
        # Stdin mode
        await capture.capture_stdin()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[BRIDGE] Capture stopped", file=sys.stderr)
