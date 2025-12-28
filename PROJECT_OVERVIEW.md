# EvolveFlow - Project Overview

## What is EvolveFlow?

EvolveFlow is a **self-evolving AI agent workflow visualization system** that implements:
- Visual ReAct (Reasoning + Acting) loop
- MCP (Model Context Protocol) compliant tool discovery
- Automatic skill learning through evolution
- Node-based workflow canvas

## Key Concepts

### 1. ReAct Pattern

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│ THOUGHT │─────>│   ACT   │─────>│ OBSERVE │
│ (Reason)│      │ (Action)│      │(Feedback)│
└─────────┘      └─────────┘      └─────────┘
     ▲                                   │
     └───────────────────────────────────┘
```

- **Thought**: AI reasoning about what to do next
- **Act**: Execute tool/action via MCP
- **Observe**: Process results and feedback

### 2. Self-Evolution Mechanism

```
Tool Failure
    │
    v
┌─────────────┐
│  PROPOSE    │ ← Generate solution (Code as Action)
└─────────────┘
    │
    v
┌─────────────┐
│  EVALUATE   │ ← Validate syntax & performance
└─────────────┘
    │
    v
┌─────────────┐
│  UPDATE     │ ← Create new skill if successful
└─────────────┘
    │
    v
New Skill Node Added to Canvas
```

### 3. MCP Compliance

Every tool follows MCP specification:

```json
{
  "name": "tool_name",
  "description": "What it does",
  "input_schema": {
    "type": "object",
    "properties": {...},
    "required": [...]
  }
}
```

### 4. Skill Library

Learned skills are:
- **Composable**: Drag-drop to canvas
- **Reusable**: Use across workflows
- **Versioned**: Track success metrics
- **Hybrid**: Can be workflow OR code-based

## System Architecture

### Data Flow

```
┌──────────────────────────────────────────────────────┐
│                     Frontend                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   Canvas   │  │  Toolbar   │  │   Skills   │     │
│  │(React Flow)│  │ (Actions)  │  │  Library   │     │
│  └────────────┘  └────────────┘  └────────────┘     │
│         │               │               │             │
│         └───────────────┴───────────────┘             │
│                     │                                 │
│              ┌──────────────┐                         │
│              │ Zustand Store│                         │
│              └──────────────┘                         │
└─────────────────────│────────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────│────────────────────────────────┐
│                     │         Backend                 │
│              ┌──────────────┐                         │
│              │  FastAPI App │                         │
│              └──────────────┘                         │
│                     │                                 │
│      ┌──────────────┼──────────────┐                 │
│      │              │              │                 │
│  ┌───────┐   ┌──────────┐   ┌──────────┐            │
│  │  MCP  │   │Evolution │   │  Skill   │            │
│  │Client │   │  Engine  │   │ Manager  │            │
│  └───────┘   └──────────┘   └──────────┘            │
└──────────────────────────────────────────────────────┘
```

## File Organization

### Backend (`backend/`)

```
main.py              - FastAPI routes & WebSocket
├─ Workflow endpoints
├─ Tool endpoints (MCP)
├─ Skill endpoints
├─ Evolution endpoints
└─ WebSocket for real-time

models.py            - Pydantic data models
├─ Node types (Thought, Act, Observe, Skill)
├─ Workflow state
├─ MCP tool config
├─ Evolution records
└─ Request/Response schemas

mcp_client.py        - MCP tool management
├─ Tool discovery
├─ Tool registration
├─ Tool execution
└─ Built-in tools (weather, calc, search)

evolution_engine.py  - Self-evolution logic
├─ Propose solutions
├─ Evaluate code
├─ Update system
└─ Track evolution history

skill_manager.py     - Skill library
├─ Add/get/delete skills
├─ Execute skills
├─ Search skills
└─ Track metrics
```

### Frontend (`frontend/src/`)

```
App.tsx              - Main application component
├─ Layout
├─ Header
└─ Canvas wrapper

components/
├─ Canvas.tsx        - React Flow canvas
│  ├─ Node rendering
│  ├─ Edge connections
│  ├─ Drag & drop
│  └─ Minimap
│
├─ Toolbar.tsx       - Action buttons
│  ├─ Add nodes
│  ├─ Execute
│  └─ Open skills
│
├─ SkillLibrary.tsx  - Skill gallery sidebar
│  ├─ Search & filter
│  ├─ Category tags
│  └─ Add to canvas
│
└─ NodeTypes/        - Custom node components
   ├─ ThoughtNode.tsx
   ├─ ActNode.tsx
   ├─ ObserveNode.tsx
   └─ SkillNode.tsx

store/workflow.ts    - Zustand state management
├─ Workflow CRUD
├─ Node operations
├─ Edge operations
├─ Node execution
└─ Skill/tool loading

api/client.ts        - API client
├─ Axios instance
├─ Workflow API
├─ Tool API
├─ Skill API
└─ Evolution API

types.ts             - TypeScript definitions
```

## API Surface

### Core Operations

```typescript
// Workflows
POST   /api/workflows              // Create
GET    /api/workflows              // List all
GET    /api/workflows/{id}         // Get one
DELETE /api/workflows/{id}         // Delete
POST   /api/execute                // Execute node

// Tools (MCP)
GET    /api/tools                  // Discover tools
GET    /api/tools/{name}           // Get tool spec
POST   /api/tools/register         // Add new tool

// Skills
GET    /api/skills                 // List skills
GET    /api/skills/{id}            // Get skill
POST   /api/skills                 // Create skill
DELETE /api/skills/{id}            // Delete skill

// Evolution
GET    /api/evolution/history      // Evolution log
GET    /api/evolution/stats        // Metrics

// WebSocket
WS     /ws/{workflow_id}           // Real-time updates
```

## Extension Points

### 1. Add Custom Tool

```python
# backend/mcp_client.py

async def handle_my_tool(self, params: Dict[str, Any]) -> Dict[str, Any]:
    """Custom tool implementation"""
    result = do_something(params)
    return {"status": "success", "data": result}

# Register
tool = MCPToolConfig(
    name="my_tool",
    description="Does X",
    input_schema={...},
    handler="handle_my_tool"
)
mcp_client.register_tool(tool)
```

### 2. Add Custom Node Type

```tsx
// frontend/src/components/NodeTypes/CustomNode.tsx

const CustomNode = ({ data, selected }: NodeProps<CustomData>) => {
  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      {/* Your UI */}
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Register in nodeTypes
export const nodeTypes = {
  // ...existing
  custom: CustomNode
}
```

### 3. Custom Evolution Strategy

```python
# backend/evolution_engine.py

async def _propose_solution(self, trigger, context):
    """Custom evolution logic"""

    if trigger.error_type == "MyCustomError":
        # Generate custom solution
        code = generate_custom_code(context)
        return EvolutionProposal(
            approach="Custom approach",
            code=code,
            estimated_complexity="medium"
        )

    # Fallback to default
    return await super()._propose_solution(trigger, context)
```

## Deployment

### Development
```bash
# Terminal 1 - Backend
cd backend && python main.py

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Serve with backend
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend served from backend at /static
```

### Docker (Future)
```dockerfile
# Coming soon
FROM python:3.11
# ... backend setup

FROM node:18
# ... frontend build

# Multi-stage build
```

## Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Run backend
cd backend && python main.py &

# Run frontend tests against live API
cd frontend && npm run test:integration
```

## Performance Considerations

- **Frontend**: React Flow handles 1000+ nodes efficiently
- **Backend**: Async FastAPI supports high concurrency
- **WebSocket**: Real-time updates for workflow changes
- **Evolution**: Code generation is lazy (on-demand)
- **Skill Library**: In-memory cache (TODO: Redis)

## Security Notes

- **Code Execution**: Evolution generates code - needs sandboxing in production
- **Input Validation**: All inputs validated via Pydantic
- **CORS**: Currently allows all origins (restrict in production)
- **Authentication**: Not implemented (add OAuth/JWT for production)

## Future Enhancements

1. **Database**: PostgreSQL for persistence
2. **LLM Integration**: Use Claude/GPT for reasoning
3. **Skill Sharing**: Export/import skills
4. **Workflow Templates**: Pre-built patterns
5. **Monitoring**: Metrics & logs
6. **Multi-tenancy**: User accounts
7. **Version Control**: Git-like for workflows

## Key Metrics to Track

- Total workflows created
- Total evolutions triggered
- Evolution success rate
- Most used tools
- Most successful skills
- Average workflow execution time
- Node failure rate by type

---

**Built for AI agent developers who want to visualize and evolve their agent workflows** 🚀
