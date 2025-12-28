import { useEffect, useState } from 'react'
import { Sparkles, X, Search, Plus } from 'lucide-react'
import { useWorkflowStore } from '../store/workflow'
import type { Skill, Position } from '../types'

interface SkillLibraryProps {
  isOpen: boolean
  onClose: () => void
}

const SkillLibrary = ({ isOpen, onClose }: SkillLibraryProps) => {
  const { skills, loadSkills, addNode } = useWorkflowStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const categories = ['all', ...new Set(skills.map((s) => s.category))]

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || skill.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleAddSkill = (skill: Skill) => {
    const position: Position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    }

    addNode({
      id: `node-skill-${Date.now()}`,
      type: 'skill',
      position,
      data: {
        label: skill.name,
        skill_id: skill.skill_id,
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-bold">Skill Library</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSkills.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No skills found
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div
              key={skill.skill_id}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{skill.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {skill.description}
                  </p>
                </div>
                <button
                  onClick={() => handleAddSkill(skill)}
                  className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-purple-100 rounded transition"
                  title="Add to canvas"
                >
                  <Plus className="w-4 h-4 text-purple-600" />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                  {skill.category}
                </span>
                <span>{skill.success_count} uses</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Total Skills:</span>
            <span className="font-semibold">{skills.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Uses:</span>
            <span className="font-semibold">
              {skills.reduce((sum, s) => sum + s.success_count, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillLibrary
