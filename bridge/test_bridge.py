#!/usr/bin/env python3
"""
Test script for Bridge integration
Simulates a Claude Code session and verifies all components
"""
import asyncio
import httpx
import time
from loguru import logger


class BridgeTest:
    """Test the bridge integration"""

    def __init__(self):
        self.bridge_url = "http://localhost:8001"
        self.backend_url = "http://localhost:8000"

    async def check_health(self):
        """Check if all services are running"""
        logger.info("Checking service health...")

        try:
            async with httpx.AsyncClient() as client:
                # Check bridge
                bridge_health = await client.get(f"{self.bridge_url}/health", timeout=5.0)
                assert bridge_health.status_code == 200, "Bridge not healthy"
                logger.success("✓ Bridge is running")

                # Check backend
                backend_health = await client.get(f"{self.backend_url}/health", timeout=5.0)
                assert backend_health.status_code == 200, "Backend not healthy"
                logger.success("✓ Backend is running")

                return True

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            logger.info("Make sure to start:")
            logger.info("  1. Backend: cd backend && python main.py")
            logger.info("  2. Bridge: cd bridge && python realtime_streamer.py")
            return False

    async def simulate_bug_fix_session(self):
        """Simulate a complete bug fix workflow"""
        logger.info("\n=== Simulating Bug Fix Session ===\n")

        events = [
            {
                "event_type": "thought",
                "content": "User reported authentication bug, let me investigate",
                "metadata": {"type": "planning"}
            },
            {
                "event_type": "tool_call",
                "content": "Searching for authentication code",
                "metadata": {"tool_name": "Grep"}
            },
            {
                "event_type": "tool_result",
                "content": "Found auth.py and login.py",
                "metadata": {"status": "completed"}
            },
            {
                "event_type": "thought",
                "content": "Let me read the auth.py file first",
                "metadata": {"type": "planning"}
            },
            {
                "event_type": "tool_call",
                "content": "Reading auth.py",
                "metadata": {"tool_name": "Read"}
            },
            {
                "event_type": "tool_result",
                "content": "File read successfully",
                "metadata": {"status": "completed"}
            },
            {
                "event_type": "thought",
                "content": "Found the bug! Password validation is broken on line 42",
                "metadata": {"type": "analysis"}
            },
            {
                "event_type": "tool_call",
                "content": "Fixing the password validation logic",
                "metadata": {"tool_name": "Edit"}
            },
            {
                "event_type": "tool_result",
                "content": "Edit successful, bug fixed",
                "metadata": {"status": "completed"}
            },
            {
                "event_type": "thought",
                "content": "Now let me verify the fix works",
                "metadata": {"type": "verification"}
            },
            {
                "event_type": "tool_call",
                "content": "Running authentication tests",
                "metadata": {"tool_name": "Bash"}
            },
            {
                "event_type": "tool_result",
                "content": "All tests passed! Bug is fixed.",
                "metadata": {"status": "completed"}
            },
        ]

        async with httpx.AsyncClient() as client:
            for i, event in enumerate(events, 1):
                logger.info(f"[{i}/{len(events)}] {event['event_type']}: {event['content']}")

                response = await client.post(
                    f"{self.bridge_url}/api/events/capture",
                    json=event,
                    timeout=10.0
                )

                if response.status_code == 200:
                    result = response.json()
                    logger.success(f"  → Created node: {result.get('node_id', 'unknown')}")
                else:
                    logger.error(f"  → Failed: {response.text}")

                await asyncio.sleep(0.3)

        logger.info("\n=== Session Complete ===\n")

    async def check_stats(self):
        """Check session statistics"""
        logger.info("Fetching session stats...")

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.bridge_url}/api/stats", timeout=5.0)
            stats = response.json()

            logger.info(f"\nSession Statistics:")
            logger.info(f"  Events captured: {stats['events_captured']}")
            logger.info(f"  Thoughts: {stats['event_types']['thoughts']}")
            logger.info(f"  Tool calls: {stats['event_types']['tool_calls']}")
            logger.info(f"  Observations: {stats['event_types'].get('observations', 0)}")
            logger.info(f"  Active connections: {stats['active_connections']}")
            logger.info(f"  Workflow ID: {stats['workflow_id']}\n")

    async def extract_skills(self):
        """Extract skills from session"""
        logger.info("Extracting skills from session...")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.bridge_url}/api/skills/extract",
                timeout=10.0
            )

            if response.status_code == 200:
                result = response.json()
                count = result.get('skills_extracted', 0)

                logger.success(f"\n✓ Extracted {count} skill(s)!\n")

                for skill in result.get('skills', []):
                    logger.info(f"  Skill: {skill['name']}")
                    logger.info(f"    Description: {skill['description']}")
                    logger.info(f"    Confidence: {skill['metadata']['confidence']:.0%}")
                    logger.info(f"    Events: {skill['metadata']['event_count']}\n")

                return count
            else:
                logger.error(f"Skill extraction failed: {response.text}")
                return 0

    async def verify_skills_in_library(self):
        """Verify skills appear in EvolveFlow skill library"""
        logger.info("Checking skill library...")

        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.backend_url}/api/skills", timeout=5.0)

            if response.status_code == 200:
                skills = response.json()
                learned_skills = [s for s in skills if s['category'] == 'Claude Code Learned']

                logger.success(f"✓ Found {len(learned_skills)} learned skills in library")

                for skill in learned_skills:
                    logger.info(f"  - {skill['name']} (used {skill['success_count']} times)")

                return len(learned_skills)
            else:
                logger.error("Failed to fetch skills from library")
                return 0

    async def run_full_test(self):
        """Run complete integration test"""
        logger.info("=" * 60)
        logger.info("EvolveFlow Bridge Integration Test")
        logger.info("=" * 60 + "\n")

        # Step 1: Health check
        if not await self.check_health():
            return False

        # Step 2: Simulate session
        await self.simulate_bug_fix_session()

        # Step 3: Check stats
        await self.check_stats()

        # Step 4: Extract skills
        skill_count = await self.extract_skills()

        # Step 5: Verify in library
        library_count = await self.verify_skills_in_library()

        # Summary
        logger.info("=" * 60)
        logger.info("Test Summary")
        logger.info("=" * 60)

        success = skill_count > 0 and library_count > 0

        if success:
            logger.success("\n✅ ALL TESTS PASSED!\n")
            logger.info("The bridge is working correctly. You should see:")
            logger.info("  1. Nodes on the canvas at http://localhost:3000")
            logger.info("  2. Live Session widget showing stats")
            logger.info("  3. Extracted skills in the Skill Library")
        else:
            logger.error("\n❌ TESTS FAILED\n")
            logger.info("Check the logs above for errors")

        return success


async def main():
    """Main entry point"""
    test = BridgeTest()

    try:
        success = await test.run_full_test()
        exit(0 if success else 1)

    except KeyboardInterrupt:
        logger.info("\nTest interrupted")
        exit(1)

    except Exception as e:
        logger.error(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)


if __name__ == "__main__":
    asyncio.run(main())
