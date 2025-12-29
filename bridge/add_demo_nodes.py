#!/usr/bin/env python3
"""
Add demo nodes to the FIRST workflow (the one frontend is viewing)
This will make nodes visible immediately
"""
import httpx
import asyncio
import time


async def main():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Get all workflows
        resp = await client.get("http://localhost:8000/api/workflows")
        workflows = resp.json()

        # Use the FIRST workflow (the one frontend is displaying)
        if not workflows:
            print("No workflows found!")
            return

        # Find first workflow or create one
        target_wf = workflows[0]
        workflow_id = target_wf["workflow_id"]

        print(f"Adding nodes to: {workflow_id}")
        print(f"Workflow name: {target_wf['name']}")
        print(f"Current nodes: {len(target_wf['nodes'])}\n")

        # Create 6 demo nodes showing a complete ReAct cycle
        demo_nodes = [
            {
                "id": "demo-thought-start",
                "type": "thought",
                "position": {"x": 100, "y": 100},
                "data": {
                    "label": "🧠 Claude's Analysis",
                    "content": "I'm going to optimize the EvolveFlow backend by adding missing API endpoints",
                    "status": "completed",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
            },
            {
                "id": "demo-act-read",
                "type": "act",
                "position": {"x": 400, "y": 100},
                "data": {
                    "label": "📖 Read Code",
                    "tool_name": "read_file",
                    "tool_description": "Reading backend/main.py",
                    "input_schema": {},
                    "status": "success",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
            },
            {
                "id": "demo-observe-analysis",
                "type": "observe",
                "position": {"x": 700, "y": 100},
                "data": {
                    "label": "👁️ Found Issue",
                    "observation": {"issue": "Missing UPDATE endpoint"},
                    "interpretation": "The backend lacks PUT /api/workflows/{id} endpoint",
                    "needs_evolution": False,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
            },
            {
                "id": "demo-thought-plan",
                "type": "thought",
                "position": {"x": 100, "y": 300},
                "data": {
                    "label": "💡 Implementation Plan",
                    "content": "I'll add @app.put() endpoint to enable workflow updates",
                    "status": "completed",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
            },
            {
                "id": "demo-act-edit",
                "type": "act",
                "position": {"x": 400, "y": 300},
                "data": {
                    "label": "✏️ Edit Code",
                    "tool_name": "edit_file",
                    "tool_description": "Adding PUT endpoint to main.py",
                    "input_schema": {},
                    "output": "Added update_workflow function",
                    "status": "success",
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
            },
            {
                "id": "demo-observe-success",
                "type": "observe",
                "position": {"x": 700, "y": 300},
                "data": {
                    "label": "✅ Success",
                    "observation": {"lines_added": 10, "endpoint": "PUT /api/workflows/{id}"},
                    "interpretation": "Endpoint added! System can now persist workflow changes",
                    "needs_evolution": False,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
            },
        ]

        demo_edges = [
            {"id": "e1", "source": "demo-thought-start", "target": "demo-act-read", "animated": True},
            {"id": "e2", "source": "demo-act-read", "target": "demo-observe-analysis", "animated": True},
            {"id": "e3", "source": "demo-observe-analysis", "target": "demo-thought-plan", "animated": True},
            {"id": "e4", "source": "demo-thought-plan", "target": "demo-act-edit", "animated": True},
            {"id": "e5", "source": "demo-act-edit", "target": "demo-observe-success", "animated": True},
        ]

        # Update the workflow
        target_wf["nodes"] = demo_nodes
        target_wf["edges"] = demo_edges
        target_wf["status"] = "completed"

        # Save using the new PUT endpoint
        update_resp = await client.put(
            f"http://localhost:8000/api/workflows/{workflow_id}",
            json=target_wf
        )

        if update_resp.status_code == 200:
            print("✅ SUCCESS! Nodes added to workflow\n")
            print("📊 What was added:")
            for node in demo_nodes:
                print(f"  {node['data']['label']}")

            print("\n🌐 Now refresh your browser at http://localhost:3000")
            print("   You should see 6 nodes showing Claude's optimization workflow!")
        else:
            print(f"❌ Failed: {update_resp.status_code}")
            print(update_resp.text)


if __name__ == "__main__":
    asyncio.run(main())
