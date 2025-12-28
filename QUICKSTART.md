# EvolveFlow Quick Start Guide

## Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Install Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install Frontend

```bash
cd frontend
npm install
```

## Running the System

### Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python main.py
```

Backend runs at: http://localhost:8000

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:3000

## First Workflow

### 1. Create ReAct Loop

1. Click **"Thought"** button → Node appears
2. Click **"Act"** button → Another node appears
3. Click **"Observe"** button → Third node appears
4. Connect them: Thought → Act → Observe → Thought (loop)

### 2. Configure Act Node

1. Click the Act node
2. In toolbar, see tool name: `get_weather`
3. This node will call the weather API

### 3. Execute Workflow

1. Click **Thought node** to select it
2. Click **"Execute Node"** button
3. Watch the status change to "completed"
4. Click **Act node** and execute
5. See output appear in the node

### 4. Trigger Evolution

1. Edit Act node's tool_name to something invalid (e.g., `nonexistent_tool`)
2. Execute the Act node
3. Node fails with "Tool not found" error
4. Evolution engine activates
5. New skill node appears on canvas

## Example API Calls

### Create Workflow

```bash
curl -X POST "http://localhost:8000/api/workflows?name=Test%20Workflow"
```

### List Tools

```bash
curl http://localhost:8000/api/tools
```

### Get Skills

```bash
curl http://localhost:8000/api/skills
```

### Execute Node

```bash
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "workflow-abc123",
    "node_id": "node-act-xyz",
    "inputs": {"city": "Beijing"}
  }'
```

## Built-in Tools

### 1. get_weather
```json
{
  "name": "get_weather",
  "input": {
    "city": "string",
    "unit": "celsius" | "fahrenheit"
  }
}
```

### 2. calculate
```json
{
  "name": "calculate",
  "input": {
    "expression": "string"
  }
}
```

Example: `{"expression": "2 + 2 * 3"}`

### 3. web_search
```json
{
  "name": "web_search",
  "input": {
    "query": "string",
    "limit": "number"
  }
}
```

## Common Issues

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Activate venv: `source venv/bin/activate`
- Reinstall deps: `pip install -r requirements.txt`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

### Can't connect nodes
- Make sure nodes have handles (small circles)
- Drag from right handle to left handle
- Connection must be source → target

### Evolution not triggering
- Node must fail with specific errors
- Check backend logs for evolution records
- Verify error type matches evolution triggers

## Next Steps

1. **Add Custom Tool**: See `backend/mcp_client.py`
2. **Create Custom Node**: See `frontend/src/components/NodeTypes/`
3. **Modify Evolution**: See `backend/evolution_engine.py`
4. **Check API Docs**: http://localhost:8000/docs

## Keyboard Shortcuts

- `Del` - Delete selected node/edge
- `Ctrl/Cmd + Z` - Undo (coming soon)
- `Ctrl/Cmd + C` - Copy (coming soon)

## Resources

- API Documentation: http://localhost:8000/docs
- Data Structures: `docs/data-structures.json`
- Full README: `README.md`

---

Happy building! 🚀
