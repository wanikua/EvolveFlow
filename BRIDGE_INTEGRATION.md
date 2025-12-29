# Claude Code → EvolveFlow Bridge Integration Guide

Complete guide to visualizing Claude Code sessions in EvolveFlow.

## Quick Start (5 Minutes)

### Step 1: Start All Services

```bash
# Terminal 1 - EvolveFlow Backend
cd backend
python main.py

# Terminal 2 - Bridge Server
cd bridge
python realtime_streamer.py

# Terminal 3 - EvolveFlow Frontend
cd frontend
npm run dev
```

### Step 2: Test Integration

Open browser to `http://localhost:3000`. You should see:
- Main canvas (center)
- Toolbar (top-left)
- Live Session widget (bottom-right)

### Step 3: Send Test Event

```bash
curl -X POST http://localhost:8001/api/events/capture \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "thought",
    "content": "Testing bridge integration",
    "metadata": {}
  }'
```

Watch the Live Session widget update and a new Thought node appear on canvas!

## Full Integration

### Capturing Real Claude Code Sessions

#### Method 1: Direct Piping (Best for Active Sessions)

```bash
# Your Claude Code command with output piped to bridge
your-claude-code-command 2>&1 | python bridge/capture_claude_session.py
```

Example:
```bash
echo "Let me help you" | python bridge/capture_claude_session.py
```

#### Method 2: Log File Watching (Best for Debugging)

```bash
# If Claude Code writes to a log file
tail -f /path/to/claude_code.log | python bridge/capture_claude_session.py
```

#### Method 3: Manual Event Injection (Best for Testing)

Create a test script:

```python
import asyncio
import httpx

async def test_workflow():
    events = [
        {"event_type": "thought", "content": "I need to fix the authentication bug"},
        {"event_type": "tool_call", "content": "Reading auth.py",
         "metadata": {"tool_name": "Read"}},
        {"event_type": "tool_result", "content": "File read successfully",
         "metadata": {"status": "completed"}},
        {"event_type": "thought", "content": "Found the issue on line 42"},
        {"event_type": "tool_call", "content": "Editing file",
         "metadata": {"tool_name": "Edit"}},
        {"event_type": "tool_result", "content": "Edit successful",
         "metadata": {"status": "completed"}},
    ]

    async with httpx.AsyncClient() as client:
        for event in events:
            await client.post(
                "http://localhost:8001/api/events/capture",
                json=event
            )
            await asyncio.sleep(0.5)  # Pause between events

asyncio.run(test_workflow())
```

## Understanding the Flow

### 1. Telemetry Capture

Claude Code outputs text → Parser detects patterns → Structured events

**Detected Patterns**:
- `<invoke name="ToolName">` → Tool Call event
- `<function_results>` → Tool Result event
- "Let me...", "I will..." → Thought event

### 2. Event Transformation

Structured event → MCP-compliant format → EvolveFlow node

**Example**:
```
Tool Call: Read
    ↓
{
  "id": "node-act-1",
  "type": "act",
  "data": {
    "tool_name": "read_file",
    "description": "Read file contents",
    "input_schema": {...}
  }
}
```

### 3. Skill Extraction

Sequence of events → Pattern detection → Reusable skill

**Example Pattern**:
```
Read → Thought → Edit → Result
    ↓
Skill: "Code Bug Fix" (85% confidence)
```

## Skill Extraction Patterns

### Pattern 1: Bug Fix (85% confidence)
```
1. Read file (Read tool)
2. Analyze code (Thought)
3. Edit file (Edit tool)
4. Verify fix (Tool result)
```

### Pattern 2: Feature Implementation (80% confidence)
```
1. Plan feature (Thought)
2. Write code (Write tool)
3. Run tests (Bash tool)
4. Verify results (Tool result)
```

### Pattern 3: Code Refactoring (75% confidence)
```
1. Multiple Edit operations
2. Consistent goal
3. All edits successful
```

### Pattern 4: Debug Investigation (82% confidence)
```
1. Search codebase (Grep/Glob)
2. Read relevant files (Read × 2+)
3. Analyze issue (Thought)
4. Apply fix (Edit)
```

## Live Session Widget

### Features

**Real-time Stats**:
- Thought count (purple)
- Tool call count (orange)
- Observation count (indigo)

**Latest Event Display**:
Shows most recent event type and content

**Extract Skills Button**:
Analyzes session and creates skills from detected patterns

**Reset Button**:
Clears current session and starts fresh

### WebSocket Events

The widget receives these event types:

```typescript
// New node created
{
  "type": "new_node",
  "node": {...},
  "event": {...}
}

// Skills extracted
{
  "type": "skills_extracted",
  "count": 2,
  "skills": [...]
}

// Session reset
{
  "type": "session_reset",
  "workflow_id": "..."
}
```

## API Reference

### Capture Event

```bash
POST /api/events/capture
Content-Type: application/json

{
  "event_type": "thought | tool_call | tool_result | observation",
  "content": "Event description",
  "metadata": {
    "tool_name": "ToolName",  // For tool_call
    "status": "completed"     // For tool_result
  }
}
```

### Extract Skills

```bash
POST /api/skills/extract

Response:
{
  "success": true,
  "skills_extracted": 2,
  "skills": [
    {
      "name": "Code Bug Fix",
      "description": "Pattern: Read → Analyze → Edit → Verify",
      "confidence": 0.85,
      ...
    }
  ]
}
```

### Get Stats

```bash
GET /api/stats

Response:
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

### Reset Session

```bash
POST /api/session/reset

Response:
{
  "success": true,
  "workflow_id": "workflow-xyz789"
}
```

## Complete Example Workflow

Let's trace a complete bug fix workflow:

### 1. Initial Reasoning
```bash
curl -X POST http://localhost:8001/api/events/capture \
  -d '{"event_type":"thought","content":"User reported login issue, investigating"}'
```
→ Creates Thought node on canvas

### 2. Search for Login Code
```bash
curl -X POST http://localhost:8001/api/events/capture \
  -d '{"event_type":"tool_call","content":"Searching for auth code","metadata":{"tool_name":"Grep"}}'
```
→ Creates Act node (tool: search_code)

### 3. Search Results
```bash
curl -X POST http://localhost:8001/api/events/capture \
  -d '{"event_type":"tool_result","content":"Found auth.py","metadata":{"status":"completed"}}'
```
→ Creates Observe node

### 4. Read File
```bash
curl -X POST http://localhost:8001/api/events/capture \
  -d '{"event_type":"tool_call","content":"Reading auth.py","metadata":{"tool_name":"Read"}}'
```
→ Creates Act node (tool: read_file)

### 5. Analysis
```bash
curl -X POST http://localhost:8001/api/events/capture \
  -d '{"event_type":"thought","content":"Found bug: password validation is broken on line 42"}'
```
→ Creates Thought node

### 6. Fix Bug
```bash
curl -X POST http://localhost:8001/api/events/capture \
  -d '{"event_type":"tool_call","content":"Fixing auth.py line 42","metadata":{"tool_name":"Edit"}}'
```
→ Creates Act node (tool: edit_file)

### 7. Verification
```bash
curl -X POST http://localhost:8001/api/events/capture \
  -d '{"event_type":"tool_result","content":"Edit successful, bug fixed","metadata":{"status":"completed"}}'
```
→ Creates Observe node

### 8. Extract Skill
```bash
curl -X POST http://localhost:8001/api/skills/extract
```

Response:
```json
{
  "success": true,
  "skills_extracted": 1,
  "skills": [
    {
      "name": "Debug Investigation",
      "description": "Pattern: Search → Read → Analyze → Fix (Confidence: 82%)",
      "category": "Claude Code Learned",
      "workflow": {
        "nodes": [/* 7 nodes */],
        "edges": [/* 6 edges */]
      }
    }
  ]
}
```

Now this skill appears in the Skill Library and can be reused!

## Integration with Your Workflow

### For Development

Add to your `.bashrc` or `.zshrc`:

```bash
# Function to capture Claude Code sessions
capture-claude() {
    "$@" 2>&1 | python /path/to/bridge/capture_claude_session.py
}

# Usage
capture-claude claude-code --help
```

### For Continuous Learning

Create a cron job to analyze daily sessions:

```bash
# crontab -e
0 23 * * * curl -X POST http://localhost:8001/api/skills/extract
```

### For Team Sharing

Export learned skills:

```bash
# Get all skills
curl http://localhost:8000/api/skills > team_skills.json

# Import on another machine
curl -X POST http://localhost:8000/api/skills \
  -H "Content-Type: application/json" \
  -d @team_skills.json
```

## Troubleshooting

### Events not appearing

**Check bridge is running**:
```bash
curl http://localhost:8001/health
```

**Check backend connection**:
```bash
curl http://localhost:8000/health
```

**Check frontend connection**:
Open browser console, look for WebSocket connection

### Skills not extracting

**Not enough events**: Need minimum 3-4 events
**Pattern not matched**: Review detection logic in `skill_extractor.py`
**Check logs**:
```bash
# Bridge logs show pattern matching
tail -f /tmp/bridge.log
```

### WebSocket disconnecting

**CORS issue**: Check bridge allows origin `http://localhost:3000`
**Port conflict**: Ensure nothing else on port 8001
**Firewall**: Allow localhost connections

## Advanced: Custom Patterns

Add your own skill detection pattern:

```python
# In skill_extractor.py

def detect_api_integration_pattern(self, events):
    """Detect API integration workflow"""

    # Look for: Research → Write → Test → Document
    write_api = any(
        e.event_type == EventType.TOOL_CALL
        and "api" in e.content.lower()
        for e in events
    )

    bash_test = any(
        e.event_type == EventType.TOOL_CALL
        and e.metadata.get("tool_name") == "Bash"
        for e in events
    )

    if write_api and bash_test:
        return SkillPattern(
            name="API Integration",
            description="Research → Implement → Test → Document",
            events=events,
            confidence=0.88
        )

    return None

# Register in analyze_session():
pattern = self.detect_api_integration_pattern(events)
if pattern and pattern.confidence >= self.min_confidence:
    patterns.append(pattern)
```

## Performance Tips

1. **Rate Limiting**: Bridge processes 10 events/second max
2. **Buffering**: Events buffered for skill extraction
3. **Cleanup**: Reset session periodically to clear memory
4. **Filtering**: Add filters to ignore noisy events

## Next Steps

1. **Automate**: Set up automatic capture for all Claude Code sessions
2. **Customize**: Add your own skill patterns
3. **Share**: Export skills to share with team
4. **Analyze**: Review extracted skills to understand patterns
5. **Optimize**: Tune confidence thresholds for better detection

---

Transform every Claude Code session into reusable knowledge! 🚀
