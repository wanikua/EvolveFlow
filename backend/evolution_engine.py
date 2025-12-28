"""
Evolution Engine - Implements Propose -> Evaluate -> Update cycle
"""
from typing import Dict, Any, Optional, List
from loguru import logger
from models import (
    EvolutionRecord, EvolutionTrigger, EvolutionProposal,
    EvolutionEvaluation, EvolutionUpdate, SkillDefinition, SkillWorkflow
)
import ast
import re


class EvolutionEngine:
    """
    Self-evolving logic engine
    Generates new code when existing tools fail
    """

    def __init__(self):
        self.evolution_history: List[EvolutionRecord] = []

    async def trigger_evolution(
        self,
        node_id: str,
        error_type: str,
        error_message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> EvolutionRecord:
        """Main evolution pipeline"""

        trigger = EvolutionTrigger(
            node_id=node_id,
            error_type=error_type,
            error_message=error_message
        )

        proposal = await self._propose_solution(trigger, context)
        evaluation = await self._evaluate_proposal(proposal)
        update = await self._update_system(proposal, evaluation)

        record = EvolutionRecord(
            trigger=trigger,
            proposal=proposal,
            evaluation=evaluation,
            update=update
        )

        self.evolution_history.append(record)
        logger.info(f"Evolution completed: {record.evolution_id}")

        return record

    async def _propose_solution(
        self,
        trigger: EvolutionTrigger,
        context: Optional[Dict[str, Any]]
    ) -> EvolutionProposal:
        """Generate solution proposal"""

        if "not found" in trigger.error_message.lower():
            approach = "Generate custom tool implementation"
            code = self._generate_tool_code(trigger, context)
            complexity = "medium"

        elif "invalid" in trigger.error_message.lower():
            approach = "Add input validation layer"
            code = self._generate_validation_code(trigger, context)
            complexity = "low"

        elif "timeout" in trigger.error_message.lower():
            approach = "Implement retry with exponential backoff"
            code = self._generate_retry_code(trigger, context)
            complexity = "low"

        else:
            approach = "Generic error handler"
            code = self._generate_generic_handler(trigger, context)
            complexity = "high"

        return EvolutionProposal(
            approach=approach,
            code=code,
            estimated_complexity=complexity
        )

    def _generate_tool_code(
        self,
        trigger: EvolutionTrigger,
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Generate new tool implementation"""

        tool_name = self._extract_tool_name(trigger.error_message)

        code_template = f'''async def {tool_name}(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Auto-generated tool implementation
    Generated due to: {trigger.error_type}
    """
    try:
        # Extract parameters
        input_data = params.get("input", {{}})

        # Core logic (placeholder - needs refinement)
        result = {{
            "status": "success",
            "data": input_data,
            "processed": True
        }}

        return result

    except Exception as e:
        logger.error(f"Tool execution failed: {{str(e)}}")
        return {{
            "status": "error",
            "error": str(e)
        }}
'''
        return code_template

    def _generate_validation_code(
        self,
        trigger: EvolutionTrigger,
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Generate validation wrapper"""

        code_template = '''def validate_and_execute(func):
    """Validation decorator"""
    async def wrapper(params: Dict[str, Any]) -> Dict[str, Any]:
        # Pre-validation
        if not params:
            raise ValueError("Parameters cannot be empty")

        # Execute
        result = await func(params)

        # Post-validation
        if not result:
            raise ValueError("Function returned empty result")

        return result

    return wrapper
'''
        return code_template

    def _generate_retry_code(
        self,
        trigger: EvolutionTrigger,
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Generate retry mechanism"""

        code_template = '''import asyncio

async def retry_with_backoff(func, max_retries=3):
    """Exponential backoff retry"""
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt
            await asyncio.sleep(wait_time)
'''
        return code_template

    def _generate_generic_handler(
        self,
        trigger: EvolutionTrigger,
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Generate generic error handler"""

        code_template = f'''async def handle_error(error: Exception, context: Dict[str, Any]):
    """
    Generic error handler
    Triggered by: {trigger.error_type}
    """
    error_type = type(error).__name__

    if error_type == "ValueError":
        return {{"handled": True, "action": "fix_input"}}
    elif error_type == "TimeoutError":
        return {{"handled": True, "action": "retry"}}
    else:
        return {{"handled": False, "action": "escalate"}}
'''
        return code_template

    async def _evaluate_proposal(self, proposal: EvolutionProposal) -> EvolutionEvaluation:
        """Evaluate proposed solution"""

        test_passed = self._validate_code_syntax(proposal.code)

        performance_score = 0.0
        if test_passed:
            if proposal.estimated_complexity == "low":
                performance_score = 0.9
            elif proposal.estimated_complexity == "medium":
                performance_score = 0.75
            else:
                performance_score = 0.6

        feedback = "Syntax valid, ready for deployment" if test_passed else "Syntax error detected"

        return EvolutionEvaluation(
            test_passed=test_passed,
            performance_score=performance_score,
            feedback=feedback
        )

    def _validate_code_syntax(self, code: str) -> bool:
        """Validate Python syntax"""
        try:
            ast.parse(code)
            return True
        except SyntaxError as e:
            logger.error(f"Syntax error in generated code: {e}")
            return False

    async def _update_system(
        self,
        proposal: EvolutionProposal,
        evaluation: EvolutionEvaluation
    ) -> EvolutionUpdate:
        """Update system with new capability"""

        if not evaluation.test_passed:
            return EvolutionUpdate(
                new_skill_created=False,
                nodes_added=[],
                edges_added=[]
            )

        skill_id = f"skill-evolved-{len(self.evolution_history)}"

        return EvolutionUpdate(
            new_skill_created=True,
            skill_id=skill_id,
            nodes_added=[f"node-skill-{skill_id}"],
            edges_added=[f"edge-to-{skill_id}"]
        )

    def _extract_tool_name(self, error_message: str) -> str:
        """Extract tool name from error message"""
        match = re.search(r"'(\w+)'", error_message)
        if match:
            return match.group(1)
        return "auto_generated_tool"

    def get_evolution_stats(self) -> Dict[str, Any]:
        """Get evolution statistics"""
        total = len(self.evolution_history)
        successful = sum(1 for r in self.evolution_history if r.evaluation.test_passed)

        return {
            "total_evolutions": total,
            "successful_evolutions": successful,
            "success_rate": successful / total if total > 0 else 0.0,
            "avg_complexity": self._calculate_avg_complexity()
        }

    def _calculate_avg_complexity(self) -> float:
        """Calculate average complexity score"""
        if not self.evolution_history:
            return 0.0

        complexity_map = {"low": 0.3, "medium": 0.6, "high": 0.9}
        total_score = sum(
            complexity_map[r.proposal.estimated_complexity]
            for r in self.evolution_history
        )

        return total_score / len(self.evolution_history)


evolution_engine = EvolutionEngine()
