#!/usr/bin/env python3
"""
Live demonstration of Claude Code optimization workflow
Watch in real-time at http://localhost:3000
"""
import asyncio
import httpx
import time


async def send_event(event_type: str, content: str, metadata: dict = None):
    """Send event to bridge and wait a bit"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8001/api/events/capture",
            json={
                "event_type": event_type,
                "content": content,
                "metadata": metadata or {}
            },
            timeout=10.0
        )
        result = response.json()
        print(f"✓ {event_type}: {content[:50]}... → {result['node_id']}")
        await asyncio.sleep(1.5)  # Pause for visualization


async def live_optimization_demo():
    """Demonstrate Claude Code optimizing EvolveFlow"""

    print("\n" + "="*60)
    print("  LIVE OPTIMIZATION DEMO")
    print("  Open http://localhost:3000 to watch!")
    print("="*60 + "\n")

    # Step 1: Planning
    await send_event(
        "thought",
        "I'm going to optimize the EvolveFlow backend code. Let me start by examining the main API file.",
        {"type": "planning"}
    )

    # Step 2: Read file
    await send_event(
        "tool_call",
        "Reading backend/main.py to understand current implementation",
        {"tool_name": "Read"}
    )

    await send_event(
        "tool_result",
        "Successfully read main.py - 427 lines of FastAPI code",
        {"status": "completed", "lines": 427}
    )

    # Step 3: Analysis
    await send_event(
        "thought",
        "Found optimization opportunities: Missing input validation in several endpoints, error handling could be more robust, and we need better type hints.",
        {"type": "analysis"}
    )

    # Step 4: Read models
    await send_event(
        "tool_call",
        "Reading models.py to understand data structures",
        {"tool_name": "Read"}
    )

    await send_event(
        "tool_result",
        "Read models.py - found 20+ Pydantic models, all well-structured",
        {"status": "completed"}
    )

    # Step 5: Decision
    await send_event(
        "thought",
        "I'll add input validation to the workflow endpoints first. This will prevent invalid data from entering the system.",
        {"type": "planning"}
    )

    # Step 6: Edit file
    await send_event(
        "tool_call",
        "Adding input validation to create_workflow endpoint",
        {"tool_name": "Edit"}
    )

    await send_event(
        "tool_result",
        "Successfully added validation - workflow names must be 1-100 characters",
        {"status": "completed"}
    )

    # Step 7: Verification thought
    await send_event(
        "thought",
        "Good! Now let me add better error messages for the execute endpoint.",
        {"type": "planning"}
    )

    # Step 8: Another edit
    await send_event(
        "tool_call",
        "Improving error messages in execute_node function",
        {"tool_name": "Edit"}
    )

    await send_event(
        "tool_result",
        "Enhanced error messages - now provides specific guidance on failures",
        {"status": "completed"}
    )

    # Step 9: Testing thought
    await send_event(
        "thought",
        "Let me test these changes by running the backend",
        {"type": "verification"}
    )

    # Step 10: Run tests
    await send_event(
        "tool_call",
        "Running backend health check",
        {"tool_name": "Bash"}
    )

    await send_event(
        "tool_result",
        "✓ Backend health check passed - all optimizations working correctly",
        {"status": "completed"}
    )

    # Step 11: Success
    await send_event(
        "thought",
        "Optimization complete! The backend now has better validation, clearer error messages, and improved robustness.",
        {"type": "conclusion"}
    )

    print("\n" + "="*60)
    print("  DEMO COMPLETE!")
    print("  Check http://localhost:3000 to see the full workflow")
    print("  Click 'Extract Skills' to save this optimization pattern")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(live_optimization_demo())
