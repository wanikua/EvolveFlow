import { useEffect, useState } from 'react'
import { Radio, Activity, Zap, CheckCircle } from 'lucide-react'

interface SessionStats {
  events_captured: number
  active_connections: number
  workflow_id: string
  event_types: {
    thoughts: number
    tool_calls: number
    observations: number
  }
}

interface LiveSessionProps {
  bridgeUrl?: string
}

const LiveSession = ({ bridgeUrl = 'http://localhost:8001' }: LiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [latestEvent, setLatestEvent] = useState<any>(null)

  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket(`${bridgeUrl.replace('http', 'ws')}/ws/stream`)

      websocket.onopen = () => {
        setIsConnected(true)
        console.log('Connected to bridge')
      }

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setLatestEvent(data)
        console.log('Received event:', data)
      }

      websocket.onclose = () => {
        setIsConnected(false)
        console.log('Disconnected from bridge')
        setTimeout(connectWebSocket, 3000)
      }

      setWs(websocket)
    }

    connectWebSocket()

    return () => {
      ws?.close()
    }
  }, [bridgeUrl])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${bridgeUrl}/api/stats`)
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 2000)

    return () => clearInterval(interval)
  }, [bridgeUrl])

  const handleExtractSkills = async () => {
    try {
      const response = await fetch(`${bridgeUrl}/api/skills/extract`, {
        method: 'POST',
      })
      const data = await response.json()
      alert(`Extracted ${data.skills_extracted} skills!`)
    } catch (error) {
      console.error('Failed to extract skills:', error)
      alert('Failed to extract skills')
    }
  }

  const handleResetSession = async () => {
    try {
      await fetch(`${bridgeUrl}/api/session/reset`, {
        method: 'POST',
      })
      setLatestEvent(null)
    } catch (error) {
      console.error('Failed to reset session:', error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white shadow-2xl rounded-lg border border-gray-200 z-50">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5" />
            <span className="font-bold">Claude Code Live</span>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-xs">Connected</span>
              </>
            ) : (
              <span className="text-xs opacity-75">Disconnected</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {stats && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-semibold text-purple-700">Thoughts</div>
              <div className="text-lg font-bold text-purple-900">
                {stats.event_types.thoughts}
              </div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="font-semibold text-orange-700">Tool Calls</div>
              <div className="text-lg font-bold text-orange-900">
                {stats.event_types.tool_calls}
              </div>
            </div>
            <div className="bg-indigo-50 p-2 rounded">
              <div className="font-semibold text-indigo-700">Observations</div>
              <div className="text-lg font-bold text-indigo-900">
                {stats.event_types.observations}
              </div>
            </div>
          </div>
        )}

        {latestEvent && (
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-semibold text-gray-700">
                Latest Event
              </span>
            </div>
            <div className="text-xs text-gray-600">
              <div className="font-semibold capitalize mb-1">
                {latestEvent.type?.replace('_', ' ')}
              </div>
              {latestEvent.node && (
                <div className="bg-white p-2 rounded text-xs">
                  <span className="font-semibold">{latestEvent.node.type}:</span>{' '}
                  {latestEvent.node.data?.label}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleExtractSkills}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Extract Skills</span>
          </button>

          <button
            onClick={handleResetSession}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
          >
            Reset
          </button>
        </div>

        {stats && (
          <div className="text-xs text-gray-500">
            <div>Session: {stats.workflow_id?.slice(0, 12)}...</div>
            <div>Events: {stats.events_captured}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveSession
