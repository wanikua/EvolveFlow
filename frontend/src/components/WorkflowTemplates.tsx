import { FileText, Bug, Code, Search, X } from 'lucide-react'
import { useWorkflowStore } from '../store/workflow'
import type { FlowNode, FlowEdge } from '../types'

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  nodes: FlowNode[]
  edges: FlowEdge[]
}

const templates: Template[] = [
  {
    id: 'bug-fix',
    name: 'Bug Fix Workflow',
    description: 'Search → Analyze → Fix → Verify pattern for debugging',
    icon: <Bug className="w-6 h-6" />,
    nodes: [
      {
        id: 'template-thought-1',
        type: 'thought',
        position: { x: 100, y: 100 },
        data: {
          label: 'Identify Bug',
          content: 'What is the bug? Where might it be located?',
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-act-1',
        type: 'act',
        position: { x: 400, y: 100 },
        data: {
          label: 'Search Code',
          tool_name: 'search_code',
          tool_description: 'Search for relevant code sections',
          input_schema: {},
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-observe-1',
        type: 'observe',
        position: { x: 700, y: 100 },
        data: {
          label: 'Found Issues',
          observation: null,
          interpretation: 'Review search results and identify problem areas',
          needs_evolution: false,
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-thought-2',
        type: 'thought',
        position: { x: 100, y: 300 },
        data: {
          label: 'Plan Fix',
          content: 'How should we fix this bug?',
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-act-2',
        type: 'act',
        position: { x: 400, y: 300 },
        data: {
          label: 'Apply Fix',
          tool_name: 'edit_file',
          tool_description: 'Edit the problematic file',
          input_schema: {},
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-observe-2',
        type: 'observe',
        position: { x: 700, y: 300 },
        data: {
          label: 'Verify Fix',
          observation: null,
          interpretation: 'Confirm the bug is fixed',
          needs_evolution: false,
          timestamp: new Date().toISOString(),
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'template-thought-1', target: 'template-act-1', animated: true },
      { id: 'e2', source: 'template-act-1', target: 'template-observe-1', animated: true },
      { id: 'e3', source: 'template-observe-1', target: 'template-thought-2', animated: true },
      { id: 'e4', source: 'template-thought-2', target: 'template-act-2', animated: true },
      { id: 'e5', source: 'template-act-2', target: 'template-observe-2', animated: true },
    ],
  },
  {
    id: 'feature-implementation',
    name: 'Feature Implementation',
    description: 'Plan → Implement → Test pattern for new features',
    icon: <Code className="w-6 h-6" />,
    nodes: [
      {
        id: 'template-thought-3',
        type: 'thought',
        position: { x: 100, y: 100 },
        data: {
          label: 'Design Feature',
          content: 'What should this feature do? What are the requirements?',
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-act-3',
        type: 'act',
        position: { x: 400, y: 100 },
        data: {
          label: 'Write Code',
          tool_name: 'write_file',
          tool_description: 'Create new feature implementation',
          input_schema: {},
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-observe-3',
        type: 'observe',
        position: { x: 700, y: 100 },
        data: {
          label: 'Review Implementation',
          observation: null,
          interpretation: 'Check if implementation meets requirements',
          needs_evolution: false,
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-act-4',
        type: 'act',
        position: { x: 400, y: 300 },
        data: {
          label: 'Run Tests',
          tool_name: 'bash_command',
          tool_description: 'Execute test suite',
          input_schema: {},
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-observe-4',
        type: 'observe',
        position: { x: 700, y: 300 },
        data: {
          label: 'Test Results',
          observation: null,
          interpretation: 'Verify all tests pass',
          needs_evolution: false,
          timestamp: new Date().toISOString(),
        },
      },
    ],
    edges: [
      { id: 'e6', source: 'template-thought-3', target: 'template-act-3', animated: true },
      { id: 'e7', source: 'template-act-3', target: 'template-observe-3', animated: true },
      { id: 'e8', source: 'template-observe-3', target: 'template-act-4', animated: true },
      { id: 'e9', source: 'template-act-4', target: 'template-observe-4', animated: true },
    ],
  },
  {
    id: 'code-analysis',
    name: 'Code Analysis',
    description: 'Read → Analyze → Document pattern for understanding code',
    icon: <Search className="w-6 h-6" />,
    nodes: [
      {
        id: 'template-thought-5',
        type: 'thought',
        position: { x: 100, y: 100 },
        data: {
          label: 'Define Scope',
          content: 'What code do we need to analyze? What are we looking for?',
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-act-5',
        type: 'act',
        position: { x: 400, y: 100 },
        data: {
          label: 'Read Code',
          tool_name: 'read_file',
          tool_description: 'Read target file',
          input_schema: {},
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-observe-5',
        type: 'observe',
        position: { x: 700, y: 100 },
        data: {
          label: 'Code Structure',
          observation: null,
          interpretation: 'Understand the code structure and patterns',
          needs_evolution: false,
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-thought-6',
        type: 'thought',
        position: { x: 100, y: 300 },
        data: {
          label: 'Generate Insights',
          content: 'What did we learn? What are the key findings?',
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
    ],
    edges: [
      { id: 'e10', source: 'template-thought-5', target: 'template-act-5', animated: true },
      { id: 'e11', source: 'template-act-5', target: 'template-observe-5', animated: true },
      { id: 'e12', source: 'template-observe-5', target: 'template-thought-6', animated: true },
    ],
  },
  {
    id: 'simple-react',
    name: 'Simple ReAct Loop',
    description: 'Basic Thought → Act → Observe cycle',
    icon: <FileText className="w-6 h-6" />,
    nodes: [
      {
        id: 'template-thought-7',
        type: 'thought',
        position: { x: 100, y: 150 },
        data: {
          label: 'Think',
          content: 'What do I need to do?',
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-act-6',
        type: 'act',
        position: { x: 400, y: 150 },
        data: {
          label: 'Act',
          tool_name: 'get_weather',
          tool_description: 'Execute an action',
          input_schema: {},
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: 'template-observe-6',
        type: 'observe',
        position: { x: 700, y: 150 },
        data: {
          label: 'Observe',
          observation: null,
          interpretation: 'What happened?',
          needs_evolution: false,
          timestamp: new Date().toISOString(),
        },
      },
    ],
    edges: [
      { id: 'e13', source: 'template-thought-7', target: 'template-act-6', animated: true },
      { id: 'e14', source: 'template-act-6', target: 'template-observe-6', animated: true },
    ],
  },
]

interface WorkflowTemplatesProps {
  isOpen: boolean
  onClose: () => void
}

export default function WorkflowTemplates({ isOpen, onClose }: WorkflowTemplatesProps) {
  const { currentWorkflow, setCurrentWorkflow } = useWorkflowStore()

  const applyTemplate = (template: Template) => {
    if (!currentWorkflow) return

    // Add unique IDs to avoid conflicts
    const timestamp = Date.now()
    const newNodes = template.nodes.map((node, index) => ({
      ...node,
      id: `${node.id}-${timestamp}-${index}`,
    }))

    const newEdges = template.edges.map((edge, index) => ({
      ...edge,
      id: `${edge.id}-${timestamp}-${index}`,
      source: `${edge.source}-${timestamp}-${template.nodes.findIndex((n) => n.id === edge.source)}`,
      target: `${edge.target}-${timestamp}-${template.nodes.findIndex((n) => n.id === edge.target)}`,
    }))

    setCurrentWorkflow({
      ...currentWorkflow,
      nodes: [...currentWorkflow.nodes, ...newNodes],
      edges: [...currentWorkflow.edges, ...newEdges],
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Workflow Templates</h2>
            <p className="text-sm text-purple-100 mt-1">
              Quick start with pre-built workflow patterns
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            aria-label="Close templates"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => applyTemplate(template)}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg text-purple-600 flex-shrink-0">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{template.nodes.length} nodes</span>
                      <span>•</span>
                      <span>{template.edges.length} connections</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-xl">💡</span>
              <div className="text-sm text-gray-700">
                <strong>Tip:</strong> Click any template to add it to your current workflow.
                You can then customize the nodes and connections as needed.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
