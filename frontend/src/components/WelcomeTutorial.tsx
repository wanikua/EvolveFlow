import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface WelcomeTutorialProps {
  onClose: () => void
}

export default function WelcomeTutorial({ onClose }: WelcomeTutorialProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: '🎯 Welcome to EvolveFlow!',
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            A <strong>self-evolving AI agent workflow system</strong> that visualizes and captures Claude Code's reasoning process.
          </p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What you can do:</h4>
            <ul className="space-y-2 text-sm">
              <li>✅ Visualize AI reasoning with the ReAct pattern</li>
              <li>✅ Create and execute workflow nodes</li>
              <li>✅ Extract reusable skills from successful workflows</li>
              <li>✅ Monitor live Claude Code sessions</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: '🧠 Understanding the ReAct Loop',
      content: (
        <div className="space-y-4">
          <p>EvolveFlow uses the <strong>ReAct pattern</strong>: Reasoning + Acting</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-purple-100 p-3 rounded-lg text-center">
              <div className="text-2xl mb-2">🧠</div>
              <div className="font-semibold text-sm">Thought</div>
              <div className="text-xs text-gray-600 mt-1">Reasoning & Planning</div>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-semibold text-sm">Act</div>
              <div className="text-xs text-gray-600 mt-1">Tool Execution</div>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg text-center">
              <div className="text-2xl mb-2">👁️</div>
              <div className="font-semibold text-sm">Observe</div>
              <div className="text-xs text-gray-600 mt-1">Results & Feedback</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Connect these nodes to create intelligent workflows that think, act, and learn!
          </p>
        </div>
      ),
    },
    {
      title: '🛠️ Using the Toolbar',
      content: (
        <div className="space-y-4">
          <p>The toolbar (top-left) is your control center:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-gray-50 p-3 rounded">
              <div className="bg-purple-600 text-white w-8 h-8 rounded flex items-center justify-center flex-shrink-0">🧠</div>
              <div>
                <div className="font-semibold">Thought</div>
                <div className="text-sm text-gray-600">Add a reasoning node to plan or analyze</div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 p-3 rounded">
              <div className="bg-orange-600 text-white w-8 h-8 rounded flex items-center justify-center flex-shrink-0">⚡</div>
              <div>
                <div className="font-semibold">Act</div>
                <div className="text-sm text-gray-600">Call MCP tools (search, read files, weather, etc.)</div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 p-3 rounded">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded flex items-center justify-center flex-shrink-0">👁️</div>
              <div>
                <div className="font-semibold">Observe</div>
                <div className="text-sm text-gray-600">Record results and observations</div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 p-3 rounded">
              <div className="bg-purple-600 text-white w-8 h-8 rounded flex items-center justify-center flex-shrink-0">✨</div>
              <div>
                <div className="font-semibold">Skills</div>
                <div className="text-sm text-gray-600">Browse and reuse learned workflow patterns</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '🎮 Quick Actions',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Keyboard Shortcuts:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Add Thought node</span>
                <kbd className="bg-white px-2 py-1 rounded border">T</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Add Act node</span>
                <kbd className="bg-white px-2 py-1 rounded border">A</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Add Observe node</span>
                <kbd className="bg-white px-2 py-1 rounded border">O</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Open Skills</span>
                <kbd className="bg-white px-2 py-1 rounded border">S</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Execute selected node</span>
                <kbd className="bg-white px-2 py-1 rounded border">E</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Delete selected node</span>
                <kbd className="bg-white px-2 py-1 rounded border">Del</kbd>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Live Session Widget:</h4>
            <p className="text-sm text-gray-700">
              Watch the bottom-right corner to see real-time statistics when Claude Code is running!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: '🚀 Ready to Start!',
      content: (
        <div className="space-y-4">
          <p className="text-lg">You're all set to create intelligent workflows!</p>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Try these next:</h4>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Click on existing nodes to see their details</li>
              <li>Add a new Thought node (click 🧠 or press <kbd className="bg-white px-1 rounded">T</kbd>)</li>
              <li>Connect nodes by dragging from one to another</li>
              <li>Open the Skills library to see learned patterns</li>
              <li>Check the docs at <code className="bg-white px-1 rounded text-xs">FEATURES_GUIDE.md</code></li>
            </ol>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded">
            <span>💡</span>
            <span>Tip: You can reopen this tutorial anytime from the help button!</span>
          </div>
        </div>
      ),
    },
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && step < steps.length - 1) {
        setStep(step + 1)
      } else if (e.key === 'ArrowLeft' && step > 0) {
        setStep(step - 1)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, onClose])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 hover:bg-white/20 p-2 rounded-lg transition-colors"
            aria-label="Close tutorial"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold">{steps[step].title}</h2>
          <div className="mt-2 text-sm text-purple-100">
            Step {step + 1} of {steps.length}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {steps[step].content}
        </div>

        <div className="border-t p-4 flex items-center justify-between bg-gray-50">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Previous
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-semibold"
              >
                Get Started! 🚀
              </button>
            )}
          </div>
        </div>

        <div className="px-4 pb-3 text-xs text-gray-500 text-center">
          Use arrow keys to navigate • Press ESC to close
        </div>
      </div>
    </div>
  )
}
