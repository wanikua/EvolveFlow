import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { nodeTypes } from './NodeTypes'
import { useWorkflowStore } from '../store/workflow'
import type { FlowNode, FlowEdge } from '../types'

const Canvas = () => {
  const { currentWorkflow, addEdge: addWorkflowEdge, selectNode } = useWorkflowStore()

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>([])

  useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.nodes as any)
      setEdges(
        currentWorkflow.edges.map((edge) => ({
          ...edge,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
          },
        })) as any
      )
    }
  }, [currentWorkflow, setNodes, setEdges])

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge: FlowEdge = {
        id: `edge-${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        type: 'default',
        animated: true,
      }

      addWorkflowEdge(edge)

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds
        )
      )
    },
    [addWorkflowEdge, setEdges]
  )

  const onNodeClick = useCallback(
    (_: any, node: FlowNode) => {
      selectNode(node.id)
    },
    [selectNode]
  )

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'thought':
                return '#a78bfa'
              case 'act':
                return '#fb923c'
              case 'observe':
                return '#818cf8'
              case 'skill':
                return '#c084fc'
              default:
                return '#94a3b8'
            }
          }}
        />
      </ReactFlow>
    </div>
  )
}

export default Canvas
