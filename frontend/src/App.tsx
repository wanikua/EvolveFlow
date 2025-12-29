import { useEffect, useState } from 'react'
import { ReactFlowProvider } from 'reactflow'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import SkillLibrary from './components/SkillLibrary'
import LiveSession from './components/LiveSession'
import WelcomeTutorial from './components/WelcomeTutorial'
import WorkflowTemplates from './components/WorkflowTemplates'
import NotificationContainer from './components/NotificationContainer'
import { useWorkflowStore } from './store/workflow'

function App() {
  const { createWorkflow, loadWorkflows, loadWorkflow, setCurrentWorkflow, loadTools, addNode, selectedNode, executeNode, deleteNode } = useWorkflowStore()
  const [isSkillLibraryOpen, setIsSkillLibraryOpen] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      await loadWorkflows()

      const workflows = useWorkflowStore.getState().workflows

      if (workflows && workflows.length > 0) {
        console.log('Loading existing workflow:', workflows[0].workflow_id)
        await loadWorkflow(workflows[0].workflow_id)
      } else {
        console.log('Creating new workflow')
        await createWorkflow('My First Workflow')
      }

      await loadTools()

      // Show tutorial on first visit
      const hasSeenTutorial = localStorage.getItem('evolveflow_tutorial_seen')
      if (!hasSeenTutorial) {
        setShowTutorial(true)
        localStorage.setItem('evolveflow_tutorial_seen', 'true')
      }
    }

    initializeApp()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const position = { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 }

      switch (e.key.toLowerCase()) {
        case 't':
          // Add Thought node
          addNode({
            id: `node-thought-${Date.now()}`,
            type: 'thought',
            position,
            data: {
              label: 'New thought',
              content: 'Enter your reasoning here...',
              status: 'pending',
              timestamp: new Date().toISOString(),
            },
          })
          break

        case 'a':
          // Add Act node
          addNode({
            id: `node-act-${Date.now()}`,
            type: 'act',
            position,
            data: {
              label: 'New act',
              tool_name: 'get_weather',
              tool_description: 'Tool description',
              input_schema: {},
              status: 'pending',
              timestamp: new Date().toISOString(),
            },
          })
          break

        case 'o':
          // Add Observe node
          addNode({
            id: `node-observe-${Date.now()}`,
            type: 'observe',
            position,
            data: {
              label: 'New observe',
              observation: null,
              interpretation: 'Observation...',
              needs_evolution: false,
              timestamp: new Date().toISOString(),
            },
          })
          break

        case 's':
          // Toggle skill library
          setIsSkillLibraryOpen((v) => !v)
          break

        case 'e':
          // Execute selected node
          if (selectedNode) {
            executeNode(selectedNode)
          }
          break

        case 'h':
          // Open help/tutorial
          setShowTutorial(true)
          break

        case 'w':
          // Open workflow templates
          setShowTemplates(true)
          break

        case 'delete':
        case 'backspace':
          // Delete selected node
          if (selectedNode && !e.metaKey && !e.ctrlKey) {
            deleteNode(selectedNode)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedNode, addNode, executeNode, deleteNode])

  return (
    <div className="w-screen h-screen flex flex-col">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">EvolveFlow</h1>
            <p className="text-sm text-purple-100">
              Self-Evolving AI Agent Workflow System
            </p>
          </div>
          <div className="text-xs bg-white/20 px-3 py-2 rounded">
            <span className="font-semibold">MCP-Compliant</span>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <ReactFlowProvider>
          <Canvas />
          <Toolbar
            onToggleSkillLibrary={() => setIsSkillLibraryOpen((v) => !v)}
            onOpenTutorial={() => setShowTutorial(true)}
            onOpenTemplates={() => setShowTemplates(true)}
          />
        </ReactFlowProvider>

        <SkillLibrary
          isOpen={isSkillLibraryOpen}
          onClose={() => setIsSkillLibraryOpen(false)}
        />

        <LiveSession bridgeUrl="http://localhost:8001" />

        {showTutorial && (
          <WelcomeTutorial onClose={() => setShowTutorial(false)} />
        )}

        {showTemplates && (
          <WorkflowTemplates
            isOpen={showTemplates}
            onClose={() => setShowTemplates(false)}
          />
        )}

        <NotificationContainer />
      </div>
    </div>
  )
}

export default App
