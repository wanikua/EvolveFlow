"""
EvolveFlow 数据模型定义
遵循 docs/data-structures.json 中的规范
"""
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4


# ==================== Node Models ====================

class Position(BaseModel):
    x: float
    y: float


class ThoughtNodeData(BaseModel):
    label: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: Literal["pending", "processing", "completed", "failed"] = "pending"


class ThoughtNode(BaseModel):
    id: str = Field(default_factory=lambda: f"node-thought-{uuid4().hex[:8]}")
    type: Literal["thought"] = "thought"
    position: Position
    data: ThoughtNodeData


class ActNodeData(BaseModel):
    label: str
    tool_name: str
    tool_description: str
    input_schema: Dict[str, Any]
    input_params: Dict[str, Any] = Field(default_factory=dict)
    output: Optional[Any] = None
    status: Literal["pending", "executing", "success", "error"] = "pending"
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ActNode(BaseModel):
    id: str = Field(default_factory=lambda: f"node-act-{uuid4().hex[:8]}")
    type: Literal["act"] = "act"
    position: Position
    data: ActNodeData


class ObserveNodeData(BaseModel):
    label: str
    observation: Any
    interpretation: str
    needs_evolution: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ObserveNode(BaseModel):
    id: str = Field(default_factory=lambda: f"node-observe-{uuid4().hex[:8]}")
    type: Literal["observe"] = "observe"
    position: Position
    data: ObserveNodeData


class SkillNodeData(BaseModel):
    label: str
    skill_id: str
    inputs: Dict[str, Any] = Field(default_factory=dict)
    outputs: Optional[Dict[str, Any]] = None
    status: Literal["ready", "executing", "completed", "failed"] = "ready"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SkillNode(BaseModel):
    id: str = Field(default_factory=lambda: f"node-skill-{uuid4().hex[:8]}")
    type: Literal["skill"] = "skill"
    position: Position
    data: SkillNodeData


# ==================== Edge Models ====================

class Edge(BaseModel):
    id: str = Field(default_factory=lambda: f"edge-{uuid4().hex[:8]}")
    source: str
    target: str
    type: str = "default"
    animated: bool = False
    label: Optional[str] = None
    style: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None


# ==================== MCP Tool Config ====================

class RetryPolicy(BaseModel):
    max_retries: int = 3
    backoff: Literal["linear", "exponential"] = "exponential"


class MCPToolConfig(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]
    endpoint: Optional[str] = None
    handler: Optional[str] = None
    timeout: int = 30
    retry_policy: RetryPolicy = Field(default_factory=RetryPolicy)


# ==================== Skill Definition ====================

class SkillWorkflow(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


class SkillDefinition(BaseModel):
    skill_id: str = Field(default_factory=lambda: f"skill-{uuid4().hex[:8]}")
    name: str
    description: str
    category: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    success_count: int = 0
    workflow: SkillWorkflow
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    code: Optional[str] = None


# ==================== Evolution Record ====================

class EvolutionTrigger(BaseModel):
    node_id: str
    error_type: str
    error_message: str


class EvolutionProposal(BaseModel):
    approach: str
    code: str
    estimated_complexity: Literal["low", "medium", "high"]


class EvolutionEvaluation(BaseModel):
    test_passed: bool
    performance_score: float  # 0-1
    feedback: str


class EvolutionUpdate(BaseModel):
    new_skill_created: bool
    skill_id: Optional[str] = None
    nodes_added: List[str] = Field(default_factory=list)
    edges_added: List[str] = Field(default_factory=list)


class EvolutionRecord(BaseModel):
    evolution_id: str = Field(default_factory=lambda: f"evo-{uuid4().hex[:8]}")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    trigger: EvolutionTrigger
    proposal: EvolutionProposal
    evaluation: EvolutionEvaluation
    update: EvolutionUpdate


# ==================== Workflow State ====================

class WorkflowMetadata(BaseModel):
    total_evolutions: int = 0
    total_skills_learned: int = 0
    success_rate: float = 0.0


class ExecutionRecord(BaseModel):
    node_id: str
    timestamp: datetime
    status: str
    result: Optional[Any] = None
    error: Optional[str] = None


class WorkflowState(BaseModel):
    workflow_id: str = Field(default_factory=lambda: f"workflow-{uuid4().hex[:8]}")
    name: str
    status: Literal["idle", "running", "paused", "completed", "failed"] = "idle"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)
    current_node: Optional[str] = None
    execution_history: List[ExecutionRecord] = Field(default_factory=list)
    metadata: WorkflowMetadata = Field(default_factory=WorkflowMetadata)


# ==================== Request/Response Models ====================

class ExecuteNodeRequest(BaseModel):
    workflow_id: str
    node_id: str
    inputs: Optional[Dict[str, Any]] = None


class ExecuteNodeResponse(BaseModel):
    success: bool
    node_id: str
    result: Optional[Any] = None
    error: Optional[str] = None
    evolution_triggered: bool = False
    new_nodes: List[Dict[str, Any]] = Field(default_factory=list)
    new_edges: List[Dict[str, Any]] = Field(default_factory=list)
