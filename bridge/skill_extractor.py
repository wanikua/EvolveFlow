"""
Skill Extractor - Detects successful outcomes and creates reusable skills
Analyzes Claude Code sessions to identify learnable patterns
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from loguru import logger

from telemetry_capture import ClaudeCodeEvent, EventType


class SkillPattern:
    """Represents a detected skill pattern"""

    def __init__(
        self,
        name: str,
        description: str,
        events: List[ClaudeCodeEvent],
        confidence: float
    ):
        self.name = name
        self.description = description
        self.events = events
        self.confidence = confidence


class SkillExtractor:
    """
    Analyzes event sequences to detect learnable skills
    """

    def __init__(self, min_confidence: float = 0.7):
        self.min_confidence = min_confidence
        self.patterns: List[SkillPattern] = []

    def detect_bug_fix_pattern(
        self,
        events: List[ClaudeCodeEvent]
    ) -> Optional[SkillPattern]:
        """
        Detect: Read file → Identify issue → Edit file → Verify
        """
        if len(events) < 4:
            return None

        read_count = sum(
            1 for e in events
            if e.event_type == EventType.TOOL_CALL
            and e.metadata.get("tool_name") == "Read"
        )

        edit_count = sum(
            1 for e in events
            if e.event_type == EventType.TOOL_CALL
            and e.metadata.get("tool_name") == "Edit"
        )

        thought_count = sum(
            1 for e in events
            if e.event_type == EventType.THOUGHT
        )

        if read_count >= 1 and edit_count >= 1 and thought_count >= 1:
            return SkillPattern(
                name="Code Bug Fix",
                description="Pattern: Read → Analyze → Edit → Verify",
                events=events,
                confidence=0.85
            )

        return None

    def detect_feature_addition_pattern(
        self,
        events: List[ClaudeCodeEvent]
    ) -> Optional[SkillPattern]:
        """
        Detect: Plan → Write new code → Test → Iterate
        """
        write_count = sum(
            1 for e in events
            if e.event_type == EventType.TOOL_CALL
            and e.metadata.get("tool_name") == "Write"
        )

        bash_count = sum(
            1 for e in events
            if e.event_type == EventType.TOOL_CALL
            and e.metadata.get("tool_name") == "Bash"
        )

        if write_count >= 1 and bash_count >= 1:
            return SkillPattern(
                name="Feature Implementation",
                description="Pattern: Plan → Write → Test → Refine",
                events=events,
                confidence=0.80
            )

        return None

    def detect_refactoring_pattern(
        self,
        events: List[ClaudeCodeEvent]
    ) -> Optional[SkillPattern]:
        """
        Detect: Multiple edits with consistent goal
        """
        edit_events = [
            e for e in events
            if e.event_type == EventType.TOOL_CALL
            and e.metadata.get("tool_name") == "Edit"
        ]

        if len(edit_events) >= 3:
            return SkillPattern(
                name="Code Refactoring",
                description="Pattern: Multiple coordinated edits",
                events=events,
                confidence=0.75
            )

        return None

    def detect_debugging_pattern(
        self,
        events: List[ClaudeCodeEvent]
    ) -> Optional[SkillPattern]:
        """
        Detect: Search → Read → Analyze → Fix
        """
        grep_count = sum(
            1 for e in events
            if e.event_type == EventType.TOOL_CALL
            and e.metadata.get("tool_name") in ["Grep", "Glob"]
        )

        read_count = sum(
            1 for e in events
            if e.event_type == EventType.TOOL_CALL
            and e.metadata.get("tool_name") == "Read"
        )

        if grep_count >= 1 and read_count >= 2:
            return SkillPattern(
                name="Debug Investigation",
                description="Pattern: Search → Read → Analyze → Fix",
                events=events,
                confidence=0.82
            )

        return None

    def analyze_session(
        self,
        events: List[ClaudeCodeEvent]
    ) -> List[SkillPattern]:
        """
        Analyze complete session and extract all patterns
        """
        patterns = []

        pattern = self.detect_bug_fix_pattern(events)
        if pattern and pattern.confidence >= self.min_confidence:
            patterns.append(pattern)

        pattern = self.detect_feature_addition_pattern(events)
        if pattern and pattern.confidence >= self.min_confidence:
            patterns.append(pattern)

        pattern = self.detect_refactoring_pattern(events)
        if pattern and pattern.confidence >= self.min_confidence:
            patterns.append(pattern)

        pattern = self.detect_debugging_pattern(events)
        if pattern and pattern.confidence >= self.min_confidence:
            patterns.append(pattern)

        return patterns

    def pattern_to_skill_definition(
        self,
        pattern: SkillPattern
    ) -> Dict[str, Any]:
        """
        Convert detected pattern to EvolveFlow skill definition
        """
        nodes = []
        edges = []

        for i, event in enumerate(pattern.events):
            node_id = f"skill-node-{i}"

            if event.event_type == EventType.THOUGHT:
                node = {
                    "id": node_id,
                    "type": "thought",
                    "position": {"x": i * 200, "y": 100},
                    "data": {
                        "label": "Reasoning",
                        "content": event.content,
                        "status": "completed"
                    }
                }
            elif event.event_type == EventType.TOOL_CALL:
                tool_name = event.metadata.get("tool_name", "unknown")
                node = {
                    "id": node_id,
                    "type": "act",
                    "position": {"x": i * 200, "y": 100},
                    "data": {
                        "label": f"Tool: {tool_name}",
                        "tool_name": tool_name,
                        "tool_description": f"Execute {tool_name}",
                        "input_schema": {},
                        "status": "success"
                    }
                }
            else:
                node = {
                    "id": node_id,
                    "type": "observe",
                    "position": {"x": i * 200, "y": 100},
                    "data": {
                        "label": "Observation",
                        "observation": event.metadata,
                        "interpretation": event.content,
                        "needs_evolution": False
                    }
                }

            nodes.append(node)

            if i > 0:
                edge = {
                    "source": f"skill-node-{i-1}",
                    "target": node_id
                }
                edges.append(edge)

        return {
            "skill_id": f"skill-extracted-{datetime.utcnow().timestamp()}",
            "name": pattern.name,
            "description": f"{pattern.description} (Confidence: {pattern.confidence:.0%})",
            "category": "Claude Code Learned",
            "created_at": datetime.utcnow().isoformat(),
            "success_count": 0,
            "workflow": {
                "nodes": nodes,
                "edges": edges
            },
            "input_schema": {
                "type": "object",
                "properties": {
                    "context": {"type": "string", "description": "Task context"}
                }
            },
            "output_schema": {
                "type": "object",
                "properties": {
                    "result": {"type": "string"}
                }
            },
            "metadata": {
                "confidence": pattern.confidence,
                "event_count": len(pattern.events),
                "extracted_at": datetime.utcnow().isoformat()
            }
        }

    def extract_skills_from_session(
        self,
        events: List[ClaudeCodeEvent]
    ) -> List[Dict[str, Any]]:
        """
        Main extraction method - returns list of skill definitions
        """
        patterns = self.analyze_session(events)
        skills = [self.pattern_to_skill_definition(p) for p in patterns]

        logger.info(f"Extracted {len(skills)} skills from {len(events)} events")

        for skill in skills:
            logger.info(
                f"  - {skill['name']} "
                f"(confidence: {skill['metadata']['confidence']:.0%})"
            )

        return skills
