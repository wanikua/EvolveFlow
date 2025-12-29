# Claude Code → EvolveFlow Bridge - Complete Summary

## What We Built

A real-time telemetry system that captures Claude Code's reasoning and tool execution, visualizes it on a React Flow canvas, and automatically extracts reusable skills.

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code Session                       │
│         (Your interactions with Claude Code)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ Terminal Output
         ┌───────────────────────┐
         │  Telemetry Capture    │ ← Parses reasoning & tool calls
         │  (Python Parser)      │
         └───────────┬───────────┘
                     │
                     ↓ Structured Events
         ┌───────────────────────┐
         │   Bridge Service      │ ← Transforms to MCP format
         │   (FastAPI Server)    │
         └───────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
   [HTTP API]  [WebSocket]  [Skill Extractor]
        │            │            │
        ↓            ↓            ↓
┌──────────────────────────────────────────┐
│      EvolveFlow Backend (Port 8000)      │
│  - Workflow management                   │
│  - MCP tool registry                     │
│  - Skill library                         │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│   React Flow Frontend (Port 3000)        │
│  - Visual canvas with nodes/edges        │
│  - Live Session widget                   │
│  - Skill Library sidebar                 │
└──────────────────────────────────────────┘
```

## File Structure

```
EvolveFlow/
├── bridge/                    ← NEW: Bridge components
│   ├── telemetry_capture.py  # Parse Claude Code output
│   ├── bridge_service.py     # Transform to EvolveFlow
│   ├── skill_extractor.py    # Detect & create skills
│   ├── realtime_streamer.py  # WebSocket server
│   ├── capture_claude_session.py  # CLI capture tool
│   ├── claude_code_hook.sh   # Shell hook script
│   ├── test_bridge.py        # Integration tests
│   ├── requirements.txt      # Dependencies
│   └── README.md             # Bridge docs
│
├── backend/                   # Existing EvolveFlow backend
├── frontend/                  # Existing + Live Session widget
│   └── src/components/
│       └── LiveSession.tsx   ← NEW: Real-time stats
│
├── BRIDGE_INTEGRATION.md     ← NEW: Integration guide
└── BRIDGE_SUMMARY.md         ← This file
```

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt

# Bridge
cd ../bridge
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Start All Services

**Option A: Manual (3 terminals)**

```bash
# Terminal 1
cd backend && python main.py

# Terminal 2
cd bridge && python realtime_streamer.py

# Terminal 3
cd frontend && npm run dev
```

**Option B: Startup Script**

```bash
chmod +x START_ALL.sh
./START_ALL.sh
```

### 3. Test the Integration

```bash
# Run integration test
cd bridge
python test_bridge.py
```

Expected output:
```
✅ ALL TESTS PASSED!

The bridge is working correctly. You should see:
  1. Nodes on the canvas at http://localhost:3000
  2. Live Session widget showing stats
  3. Extracted skills in the Skill Library
```

### 4. Open the Interface

Open browser to: **http://localhost:3000**

You should see:
- Main canvas in center
- Toolbar (top-left)
- Skill Library button
- **Live Session widget** (bottom-right) ← NEW!

## How It Works

### Telemetry Capture

Captures Claude Code patterns:

```
Claude Code Output               Detected Event
──────────────────              ───────────────
"Let me read the file"      →   Thought event
<invoke name="Read">        →   Tool call event
<function_results>          →   Tool result event
"Found the bug on line 42"  →   Thought event
```

### MCP Tool Mapping

Claude Code tools → MCP format:

| Claude Tool | MCP Name | Schema |
|------------|----------|--------|
| Read | `read_file` | `{file_path: string}` |
| Write | `write_file` | `{file_path, content}` |
| Edit | `edit_file` | `{file_path, old_string, new_string}` |
| Bash | `bash_command` | `{command: string}` |
| Grep | `search_code` | `{pattern, path?}` |
| Glob | `find_files` | `{pattern}` |

### Visual Nodes

Events become React Flow nodes:

```
Thought Event    →  Thought Node (purple, brain icon)
Tool Call        →  Act Node (orange, zap icon)
Tool Result      →  Observe Node (indigo, eye icon)
```

### Skill Extraction

Pattern detection:

**Bug Fix Pattern** (85% confidence):
```
Read → Thought → Edit → Verify
  ↓
Skill: "Code Bug Fix"
```

**Feature Implementation** (80% confidence):
```
Plan → Write → Test
  ↓
Skill: "Feature Implementation"
```

**Debug Investigation** (82% confidence):
```
Search → Read → Analyze → Fix
  ↓
Skill: "Debug Investigation"
```

## Live Session Widget

Bottom-right widget shows:

```
┌──────────────────────────────┐
│ 🔴 Claude Code Live          │
│    Connected ● ● ●           │
├──────────────────────────────┤
│ Thoughts:     15 (purple)    │
│ Tool Calls:   20 (orange)    │
│ Observations:  7 (indigo)    │
├──────────────────────────────┤
│ Latest Event:                │
│   Tool Call: edit_file       │
├──────────────────────────────┤
│ [Extract Skills] [Reset]     │
└──────────────────────────────┘
```

## Usage Examples

### Example 1: Simulate Bug Fix

```bash
# Send events via API
curl -X POST http://localhost:8001/api/events/capture \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "thought",
    "content": "User reported auth bug, investigating"
  }'

# Watch nodes appear on canvas!
```

### Example 2: Extract Skills

After simulating a workflow:

```bash
curl -X POST http://localhost:8001/api/skills/extract
```

Or click **"Extract Skills"** button in UI.

### Example 3: View Stats

```bash
curl http://localhost:8001/api/stats
```

Response:
```json
{
  "events_captured": 42,
  "event_types": {
    "thoughts": 15,
    "tool_calls": 20,
    "observations": 7
  }
}
```

## Key Features

✅ **Real-time Visualization**: See Claude's reasoning as it happens
✅ **MCP Compliance**: All tools mapped to MCP standard
✅ **Skill Extraction**: Automatic pattern detection
✅ **WebSocket Streaming**: Live updates to frontend
✅ **Persistent Skills**: Saved to Skill Library for reuse
✅ **Session Management**: Reset, stats, history

## API Endpoints

### Bridge Server (Port 8001)

```
POST /api/events/capture      # Capture new event
POST /api/skills/extract      # Extract skills
POST /api/session/reset       # Reset session
GET  /api/stats              # Get statistics
GET  /health                 # Health check
WS   /ws/stream              # WebSocket stream
```

### EvolveFlow Backend (Port 8000)

```
POST /api/workflows           # Create workflow
GET  /api/tools              # List MCP tools
GET  /api/skills             # List skills
POST /api/execute            # Execute node
```

## Testing

### Integration Test

```bash
cd bridge
python test_bridge.py
```

Tests:
1. ✅ Services health check
2. ✅ Event capture
3. ✅ Node creation
4. ✅ Skill extraction
5. ✅ Skill library persistence

### Manual Test

1. Open http://localhost:3000
2. Run test script:
   ```bash
   cd bridge
   python test_bridge.py
   ```
3. Watch:
   - Nodes appear on canvas
   - Live Session updates
   - Skills extracted

## Troubleshooting

### Services won't start

```bash
# Check ports
lsof -i :8000  # Backend
lsof -i :8001  # Bridge
lsof -i :3000  # Frontend

# Check logs
tail -f logs/backend.log
tail -f logs/bridge.log
tail -f logs/frontend.log
```

### Events not appearing

```bash
# Verify bridge health
curl http://localhost:8001/health

# Verify backend health
curl http://localhost:8000/health

# Check WebSocket in browser console
# Should see: "Connected to bridge"
```

### Skills not extracting

Need minimum pattern match:
- 3+ events
- Matching tool sequence
- Successful completions

## Next Steps

### 1. Capture Real Sessions

```bash
# Pipe Claude Code output
your-claude-command | python bridge/capture_claude_session.py
```

### 2. Customize Patterns

Add your patterns in `skill_extractor.py`:

```python
def detect_my_pattern(self, events):
    # Your detection logic
    pass
```

### 3. Share Skills

```bash
# Export skills
curl http://localhost:8000/api/skills > my_skills.json

# Import on another machine
curl -X POST http://localhost:8000/api/skills \
  -d @my_skills.json
```

### 4. Continuous Learning

Set up automatic extraction:

```bash
# Cron job to extract daily
0 23 * * * curl -X POST http://localhost:8001/api/skills/extract
```

## Architecture Benefits

1. **Meta-Learning**: Learn from your own Claude Code sessions
2. **Pattern Recognition**: Automatic detection of successful workflows
3. **Skill Accumulation**: Build library of reusable solutions
4. **Visual Reasoning**: See the agent's thought process
5. **MCP Compliance**: Standard tool interface
6. **Real-time**: Live updates as events happen

## CS-461 Alignment

This implements key concepts from your lecture:

✅ **ReAct Loop**: Thought → Act → Observe visualization
✅ **MCP Integration**: Tool standardization
✅ **Skill Library**: Persistent learned behaviors
✅ **Self-Evolution**: Pattern detection → Skill creation
✅ **Telemetry**: Full observability of agent loop

## Success Metrics

After running test:
- ✅ 12 events captured
- ✅ 12 nodes created on canvas
- ✅ 1+ skills extracted
- ✅ Skills appear in library
- ✅ WebSocket connected
- ✅ Real-time updates working

---

**You now have a complete meta-learning system that captures, visualizes, and learns from Claude Code sessions!** 🚀

Open http://localhost:3000 to see it in action.
