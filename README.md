# EvolveFlow

A self-evolving AI agent workflow system with visual ReAct loop and MCP (Model Context Protocol) support.

## Overview

EvolveFlow is a prototype system that visualizes agent reasoning processes and features self-evolution capabilities. It implements the ReAct (Reasoning + Acting) pattern with visual nodes and supports automatic skill learning.

## Architecture

```
EvolveFlow/
├── backend/                 # FastAPI backend
│   ├── main.py             # API entry point
│   ├── models.py           # Pydantic data models
│   ├── mcp_client.py       # MCP tool discovery
│   ├── evolution_engine.py # Self-evolution logic
│   ├── skill_manager.py    # Skill library
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React + React Flow frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── NodeTypes/  # Custom node components
│   │   │   ├── Canvas.tsx  # React Flow canvas
│   │   │   ├── Toolbar.tsx # Action toolbar
│   │   │   └── SkillLibrary.tsx # Skill gallery
│   │   ├── store/          # Zustand state
│   │   ├── api/            # API client
│   │   ├── types.ts        # TypeScript types
│   │   └── App.tsx         # Main app
│   └── package.json
│
└── docs/
    └── data-structures.json # Data schema definition
```

## Core Features

### 1. Visual ReAct Loop

Three fundamental node types:
- **Thought Node**: Reasoning and planning
- **Act Node**: Tool execution (MCP-compliant)
- **Observe Node**: Environment feedback

Nodes connect in a closed loop with animated edges showing execution flow.

### 2. MCP Tool Discovery

- Dynamic tool registration following MCP specification
- Each Act node accepts: `name`, `description`, `input_schema`
- Built-in tools: weather, calculator, web search
- Extensible tool system

### 3. Self-Evolution Logic

Implements **Propose → Evaluate → Update** cycle:

1. **Propose**: When a tool fails, generate solution (Code as Action)
2. **Evaluate**: Validate syntax and test performance
3. **Update**: Create new skill node if successful

Evolution triggers on:
- Tool not found errors
- Invalid input errors
- Timeout errors

### 4. Skill Library

- Sidebar gallery of learned skills
- Drag-and-drop skills to canvas
- Categorized by type
- Tracks success count
- Stores workflow patterns and code

## Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
# Server runs at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
# App runs at http://localhost:3000
```

### Access

- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Usage

### Creating a Workflow

1. Open the app - a default workflow is created
2. Use toolbar to add nodes:
   - Click "Thought" to add reasoning node
   - Click "Act" to add tool execution node
   - Click "Observe" to add feedback node
3. Connect nodes by dragging from output to input handles
4. Click "Skills" to open skill library

### Executing Nodes

1. Click a node to select it
2. Click "Execute Node" in toolbar
3. Watch status change and output appear
4. If execution fails, evolution may trigger

### Evolution Example

```
Act Node (get_weather) → Fails with "Tool not found"
    ↓
Evolution Engine
    ↓ Propose: Generate custom implementation
    ↓ Evaluate: Validate syntax
    ↓ Update: Create new skill node
    ↓
New Skill Node appears on canvas
```

### Adding Skills to Library

Skills are auto-created when:
- Evolution successfully resolves an error
- Manual skill creation via API

Skills contain:
- Workflow pattern (nodes + edges)
- Input/output schemas
- Optional code implementation
- Success metrics

## API Endpoints

### Workflows

```
POST   /api/workflows              Create workflow
GET    /api/workflows              List workflows
GET    /api/workflows/{id}         Get workflow
DELETE /api/workflows/{id}         Delete workflow
POST   /api/execute                Execute node
```

### Tools (MCP)

```
GET    /api/tools                  List tools
GET    /api/tools/{name}           Get tool
POST   /api/tools/register         Register tool
```

### Skills

```
GET    /api/skills                 List skills
GET    /api/skills/{id}            Get skill
POST   /api/skills                 Create skill
DELETE /api/skills/{id}            Delete skill
```

### Evolution

```
GET    /api/evolution/history      Get evolution records
GET    /api/evolution/stats        Get evolution statistics
```

### WebSocket

```
WS     /ws/{workflow_id}           Real-time updates
```

## Data Structures

See `docs/data-structures.json` for complete schema definitions.

Key models:
- `WorkflowState`: Complete workflow with nodes/edges
- `MCPToolConfig`: MCP tool specification
- `SkillDefinition`: Learned skill with workflow
- `EvolutionRecord`: Evolution event log

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation
- **WebSockets**: Real-time updates
- **Loguru**: Logging

### Frontend
- **React 18**: UI framework
- **React Flow**: Node-based canvas
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Vite**: Build tool

## MCP Compliance

This system follows Model Context Protocol:

1. **Tool Discovery**: Dynamic registration
2. **Schema Validation**: JSON Schema for inputs
3. **Error Handling**: Standardized error responses
4. **Extensibility**: Plugin architecture

## Extension Points

### Custom Nodes

Add new node types in `frontend/src/components/NodeTypes/`:

```tsx
const CustomNode = ({ data }: NodeProps<CustomData>) => {
  return (
    <div className="custom-node">
      {/* Your component */}
    </div>
  )
}
```

### Custom Tools

Register via API:

```python
tool = MCPToolConfig(
    name="my_tool",
    description="Does something",
    input_schema={...},
    handler="handle_my_tool"
)
mcp_client.register_tool(tool)
```

### Evolution Strategies

Modify `evolution_engine.py`:

```python
async def _propose_solution(self, trigger, context):
    # Custom evolution logic
    pass
```

## Development

### Run Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Serve with backend
cd ../backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Roadmap

- [ ] Persistent storage (PostgreSQL)
- [ ] Multi-user support
- [ ] LLM integration for reasoning
- [ ] Advanced evolution strategies
- [ ] Performance monitoring
- [ ] Skill versioning
- [ ] Export/import workflows

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

---

Built with ❤️ for AI agent development