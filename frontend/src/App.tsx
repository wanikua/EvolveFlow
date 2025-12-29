import { useEffect, useState } from 'react'
import { ReactFlowProvider } from 'reactflow'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import SkillLibrary from './components/SkillLibrary'
import LiveSession from './components/LiveSession'
import { useWorkflowStore } from './store/workflow'

function App() {
  const { createWorkflow, loadWorkflows, loadWorkflow, setCurrentWorkflow, loadTools } = useWorkflowStore()
  const [isSkillLibraryOpen, setIsSkillLibraryOpen] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      // Load existing workflows first
      await loadWorkflows()

      // Get workflows from store
      const workflows = useWorkflowStore.getState().workflows

      if (workflows && workflows.length > 0) {
        // Load the first workflow (which has our demo nodes)
        console.log('Loading existing workflow:', workflows[0].workflow_id)
        await loadWorkflow(workflows[0].workflow_id)
      } else {
        // Only create new if none exist
        console.log('Creating new workflow')
        await createWorkflow('My First Workflow')
      }

      await loadTools()
    }

    initializeApp()
  }, [])

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
          <Toolbar onToggleSkillLibrary={() => setIsSkillLibraryOpen((v) => !v)} />
        </ReactFlowProvider>

        <SkillLibrary
          isOpen={isSkillLibraryOpen}
          onClose={() => setIsSkillLibraryOpen(false)}
        />

        <LiveSession bridgeUrl="http://localhost:8001" />
      </div>
    </div>
  )
}

export default App
