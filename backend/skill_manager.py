"""
Skill Manager - Manages learned skills and skill library
"""
from typing import Dict, List, Optional, Any
from loguru import logger
from models import SkillDefinition, SkillWorkflow
import json


class SkillManager:
    """Manages skill library and skill execution"""

    def __init__(self):
        self.skills: Dict[str, SkillDefinition] = {}
        self._initialize_default_skills()

    def _initialize_default_skills(self):
        """Initialize with default skills"""

        default_skill = SkillDefinition(
            skill_id="skill-weather-query",
            name="Weather Query",
            description="Query weather information for any city",
            category="Information Retrieval",
            success_count=0,
            workflow=SkillWorkflow(
                nodes=[
                    {
                        "id": "thought-1",
                        "type": "thought",
                        "position": {"x": 0, "y": 0},
                        "data": {"label": "Parse city parameter", "content": "Extract city from input"}
                    },
                    {
                        "id": "act-1",
                        "type": "act",
                        "position": {"x": 200, "y": 0},
                        "data": {
                            "label": "Get Weather",
                            "tool_name": "get_weather",
                            "tool_description": "Fetch weather data"
                        }
                    },
                    {
                        "id": "observe-1",
                        "type": "observe",
                        "position": {"x": 400, "y": 0},
                        "data": {"label": "Format result", "interpretation": "Format weather output"}
                    }
                ],
                edges=[
                    {"source": "thought-1", "target": "act-1"},
                    {"source": "act-1", "target": "observe-1"}
                ]
            ),
            input_schema={
                "type": "object",
                "properties": {
                    "city": {"type": "string"}
                },
                "required": ["city"]
            },
            output_schema={
                "type": "object",
                "properties": {
                    "result": {"type": "string"}
                }
            }
        )

        self.add_skill(default_skill)
        logger.info(f"Initialized with {len(self.skills)} default skills")

    def add_skill(self, skill: SkillDefinition) -> bool:
        """Add new skill to library"""
        if skill.skill_id in self.skills:
            logger.warning(f"Skill {skill.skill_id} already exists, updating...")

        self.skills[skill.skill_id] = skill
        logger.info(f"Added skill: {skill.name} ({skill.skill_id})")
        return True

    def get_skill(self, skill_id: str) -> Optional[SkillDefinition]:
        """Get skill by ID"""
        return self.skills.get(skill_id)

    def list_skills(self, category: Optional[str] = None) -> List[SkillDefinition]:
        """List all skills, optionally filtered by category"""
        skills = list(self.skills.values())

        if category:
            skills = [s for s in skills if s.category == category]

        return sorted(skills, key=lambda s: s.success_count, reverse=True)

    def search_skills(self, query: str) -> List[SkillDefinition]:
        """Search skills by name or description"""
        query_lower = query.lower()
        results = [
            skill for skill in self.skills.values()
            if query_lower in skill.name.lower() or query_lower in skill.description.lower()
        ]

        return sorted(results, key=lambda s: s.success_count, reverse=True)

    async def execute_skill(
        self,
        skill_id: str,
        inputs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a skill"""

        skill = self.get_skill(skill_id)
        if not skill:
            return {
                "success": False,
                "error": f"Skill {skill_id} not found"
            }

        try:
            if skill.code:
                result = await self._execute_code_skill(skill, inputs)
            else:
                result = await self._execute_workflow_skill(skill, inputs)

            skill.success_count += 1

            return {
                "success": True,
                "result": result,
                "skill_name": skill.name
            }

        except Exception as e:
            logger.error(f"Skill execution failed: {skill.name}, error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def _execute_code_skill(
        self,
        skill: SkillDefinition,
        inputs: Dict[str, Any]
    ) -> Any:
        """Execute code-based skill"""

        local_scope = {"inputs": inputs, "result": None}

        try:
            exec(skill.code, {"__builtins__": {}}, local_scope)
            return local_scope.get("result")
        except Exception as e:
            raise RuntimeError(f"Code execution failed: {e}")

    async def _execute_workflow_skill(
        self,
        skill: SkillDefinition,
        inputs: Dict[str, Any]
    ) -> Any:
        """Execute workflow-based skill (placeholder)"""

        logger.info(f"Executing workflow skill: {skill.name}")
        return {
            "message": f"Workflow skill {skill.name} executed",
            "inputs": inputs,
            "workflow_nodes": len(skill.workflow.nodes)
        }

    def create_skill_from_workflow(
        self,
        name: str,
        description: str,
        category: str,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        input_schema: Dict[str, Any],
        output_schema: Dict[str, Any]
    ) -> SkillDefinition:
        """Create new skill from workflow"""

        skill = SkillDefinition(
            name=name,
            description=description,
            category=category,
            workflow=SkillWorkflow(nodes=nodes, edges=edges),
            input_schema=input_schema,
            output_schema=output_schema
        )

        self.add_skill(skill)
        return skill

    def delete_skill(self, skill_id: str) -> bool:
        """Delete skill from library"""
        if skill_id in self.skills:
            del self.skills[skill_id]
            logger.info(f"Deleted skill: {skill_id}")
            return True
        return False

    def get_skill_stats(self) -> Dict[str, Any]:
        """Get skill library statistics"""

        categories = {}
        for skill in self.skills.values():
            categories[skill.category] = categories.get(skill.category, 0) + 1

        total_executions = sum(s.success_count for s in self.skills.values())

        return {
            "total_skills": len(self.skills),
            "categories": categories,
            "total_executions": total_executions,
            "most_used": self._get_most_used_skill()
        }

    def _get_most_used_skill(self) -> Optional[Dict[str, Any]]:
        """Get most frequently used skill"""
        if not self.skills:
            return None

        most_used = max(self.skills.values(), key=lambda s: s.success_count)

        return {
            "skill_id": most_used.skill_id,
            "name": most_used.name,
            "success_count": most_used.success_count
        }


skill_manager = SkillManager()
