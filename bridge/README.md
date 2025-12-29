# EvolveFlow Bridge - Claude Code Integration

Connect Claude Code's terminal output to EvolveFlow's React Flow visualization in real-time.

## Overview

The Bridge captures Claude Code's reasoning and tool execution, transforming them into visual nodes on the EvolveFlow canvas. When Claude successfully completes a task, the Bridge extracts that workflow as a reusable skill.

## Architecture

```
Claude Code Terminal
    ↓
Telemetry Capture (Python)
    ↓
Bridge Service (FastAPI)
    ↓ HTTP/WebSocket
EvolveFlow Backend
    ↓
React Flow Frontend
```

## Components

### 1. Telemetry Capture (`telemetry_capture.py`)

Parses Claude Code output and extracts structured events:
- **Thought**: Reasoning patterns ("Let me...", "I need to...")
- **Tool Call**: Tool invocations (`<invoke name="ToolName">`)
- **Tool Result**: Execution results (`<function_results>`)
- **Observation**: Environmental feedback

### 2. Bridge Service (`bridge_service.py`)

Transforms events into EvolveFlow nodes:
- Maps Claude Code tools to MCP format
- Creates React Flow nodes
- Manages workflow state
- Connects nodes with edges

### 3. Skill Extractor (`skill_extractor.py`)

Detects successful patterns and creates skills:
- **Bug Fix**: Read → Analyze → Edit → Verify
- **Feature Addition**: Plan → Write → Test
- **Refactoring**: Multiple coordinated edits
- **Debugging**: Search → Read → Analyze → Fix

### 4. Real-time Streamer (`realtime_streamer.py`)

WebSocket server for live updates:
- Streams events to frontend
- Broadcasts node creation
- Triggers skill extraction
- Session management

## Installation

```bash
cd bridge

# Install dependencies
pip install -r requirements.txt

# Make hook script executable
chmod +x claude_code_hook.sh
chmod +x capture_claude_session.py
```

## Usage

### Option 1: Python Capture (Recommended)

**Terminal 1** - Start Bridge Server:
```bash
cd bridge
python realtime_streamer.py
# Runs on http://localhost:8001
```

**Terminal 2** - Start EvolveFlow Backend:
```bash
cd ../backend
python main.py
# Runs on http://localhost:8000
```

**Terminal 3** - Start EvolveFlow Frontend:
```bash
cd ../frontend
npm run dev
# Runs on http://localhost:3000
```

**Terminal 4** - Capture Claude Code Session:
```bash
cd bridge
# Pipe Claude Code output through capture
claude-code | python capture_claude_session.py
```

### Option 2: File Watching

If you have a Claude Code log file:

```bash
# Watch log file
python capture_claude_session.py /path/to/claude_code.log

# Or use the shell script
./claude_code_hook.sh tail -f /path/to/claude_code.log
```

### Option 3: Manual Event Sending

Send events manually via API:

```bash
curl -X POST http://localhost:8001/api/events/capture \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "thought",
    "content": "I need to fix this bug",
    "metadata": {"type": "reasoning"}
  }'
```

## Event Types

### Thought Events
```json
{
  "event_type": "thought",
  "content": "Let me read the file first",
  "metadata": {"type": "planning"}
}
```

Becomes **Thought Node** in EvolveFlow.

### Tool Call Events
```json
{
  "event_type": "tool_call",
  "content": "Reading file",
  "metadata": {"tool_name": "Read"}
}
```

Becomes **Act Node** with MCP tool mapping.

### Tool Result Events
```json
{
  "event_type": "tool_result",
  "content": "File read successfully",
  "metadata": {"status": "completed"}
}
```

Becomes **Observe Node** with results.

## MCP Tool Mapping

Claude Code tools are automatically mapped to MCP format:

| Claude Code Tool | MCP Name | Description |
|-----------------|----------|-------------|
| `Read` | `read_file` | Read file contents |
| `Write` | `write_file` | Write to file |
| `Edit` | `edit_file` | Find-replace edit |
| `Bash` | `bash_command` | Execute shell command |
| `Grep` | `search_code` | Search for pattern |
| `Glob` | `find_files` | Find files by pattern |

## Skill Extraction

Extract learned skills from session:

```bash
# Via API
curl -X POST http://localhost:8001/api/skills/extract

# Via Frontend
# Click "Extract Skills" button in Live Session widget
```

### Detected Patterns

**1. Bug Fix Pattern**
- Confidence: 85%
- Sequence: Read → Thought → Edit → Verify
- Creates skill: "Code Bug Fix"

**2. Feature Addition Pattern**
- Confidence: 80%
- Sequence: Plan → Write → Bash (test)
- Creates skill: "Feature Implementation"

**3. Refactoring Pattern**
- Confidence: 75%
- Sequence: Multiple Edit operations
- Creates skill: "Code Refactoring"

**4. Debugging Pattern**
- Confidence: 82%
- Sequence: Grep/Glob → Read → Analyze → Fix
- Creates skill: "Debug Investigation"

## API Endpoints

### Bridge Server (Port 8001)

```
POST   /api/events/capture     Capture new event
POST   /api/skills/extract     Extract skills from session
POST   /api/session/reset      Reset session
GET    /api/stats             Get session statistics
GET    /health                Health check
WS     /ws/stream             WebSocket stream
```

### Session Stats
```bash
curl http://localhost:8001/api/stats
```

Response:
```json
{
  "events_captured": 42,
  "active_connections": 1,
  "workflow_id": "workflow-abc123",
  "event_types": {
    "thoughts": 15,
    "tool_calls": 20,
    "observations": 7
  }
}
```

## Frontend Integration

The Live Session widget appears in bottom-right corner:

**Features**:
- Real-time event count
- Latest event display
- Extract Skills button
- Session reset
- Connection status

**WebSocket Connection**:
```typescript
const ws = new WebSocket('ws://localhost:8001/ws/stream')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // data.type: "new_node", "skills_extracted", "session_reset"
  // data.node: Node object
  // data.skills: Extracted skills
}
```

## Example Session

```
1. Claude Code starts: "Let me fix this bug"
   → Thought Node created

2. Claude calls Read tool
   → Act Node created (tool: read_file)

3. File read completes
   → Observe Node created

4. Claude analyzes: "Found the issue on line 42"
   → Thought Node created

5. Claude calls Edit tool
   → Act Node created (tool: edit_file)

6. Edit succeeds
   → Observe Node created

7. Click "Extract Skills"
   → Skill "Code Bug Fix" created (85% confidence)
   → Saved to Skill Library
```

## Troubleshooting

### Bridge not receiving events

Check if capture is running:
```bash
curl http://localhost:8001/health
```

Should return:
```json
{
  "status": "healthy",
  "bridge_active": true,
  "connections": 1
}
```

### WebSocket not connecting

- Ensure bridge is running on port 8001
- Check browser console for connection errors
- Verify CORS is enabled

### No skills extracted

- Need minimum 3 events for skill detection
- Check event types match pattern requirements
- Review logs for pattern matching

### Events not appearing on canvas

- Verify EvolveFlow backend is running (port 8000)
- Check bridge can reach backend API
- Review bridge logs for errors

## Advanced Usage

### Custom Event Patterns

Add custom patterns to `skill_extractor.py`:

```python
def detect_my_pattern(self, events):
    # Your detection logic
    if condition:
        return SkillPattern(
            name="My Custom Pattern",
            description="Custom skill",
            events=events,
            confidence=0.80
        )
    return None
```

### Custom Tool Mapping

Add tools to `telemetry_capture.py`:

```python
CLAUDE_CODE_TOOL_MAPPING["MyTool"] = {
    "name": "my_custom_tool",
    "description": "Does something",
    "input_schema": {...}
}
```

### Filtering Events

Add filters in `capture_claude_session.py`:

```python
def should_capture(self, line: str) -> bool:
    # Your filter logic
    if "DEBUG" in line:
        return False
    return True
```

## Performance

- **Latency**: <100ms from capture to display
- **Throughput**: 100+ events/second
- **Memory**: ~50MB for 1000 events
- **Storage**: Skills stored in EvolveFlow backend

## Security Notes

- Bridge runs locally (localhost only)
- No external API calls
- Events stored in memory (cleared on reset)
- Skills persisted to EvolveFlow backend

## Next Steps

1. **Automatic Capture**: Configure Claude Code to auto-pipe to bridge
2. **Pattern Library**: Add more skill detection patterns
3. **Filtering**: Implement event filtering and deduplication
4. **Export**: Export sessions as standalone workflows
5. **Playback**: Replay captured sessions

---

Built to capture and learn from AI agent workflows 🚀
