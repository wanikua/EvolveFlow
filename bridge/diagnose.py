#!/usr/bin/env python3
"""
Diagnostic tool to check why nodes aren't showing
"""
import httpx
import asyncio


async def diagnose():
    print("\n" + "="*70)
    print("  EVOLVEFLOW DIAGNOSTIC TOOL")
    print("="*70 + "\n")

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Check backend
        print("1️⃣  Checking Backend...")
        try:
            health = await client.get("http://localhost:8000/health")
            print(f"   ✓ Backend is UP (port 8000)")
            health_data = health.json()
            print(f"   ✓ Workflows in memory: {health_data['workflows']}")
        except Exception as e:
            print(f"   ✗ Backend is DOWN: {e}")
            return

        # Check workflows
        print("\n2️⃣  Checking Workflows...")
        workflows = await client.get("http://localhost:8000/api/workflows")
        wf_list = workflows.json()
        print(f"   ✓ Total workflows: {len(wf_list)}")

        for i, wf in enumerate(wf_list[:3], 1):
            print(f"\n   Workflow {i}:")
            print(f"      ID: {wf['workflow_id']}")
            print(f"      Name: {wf['name']}")
            print(f"      Nodes: {len(wf['nodes'])}")
            print(f"      Edges: {len(wf['edges'])}")

            if len(wf['nodes']) > 0:
                print(f"      ✓ HAS NODES! This workflow has content")
                print(f"      Node types: {[n['type'] for n in wf['nodes'][:5]]}")

        # Check first workflow in detail
        if wf_list:
            print(f"\n3️⃣  Detailed Check of First Workflow...")
            first_wf = wf_list[0]
            wf_id = first_wf['workflow_id']

            detail = await client.get(f"http://localhost:8000/api/workflows/{wf_id}")
            wf_data = detail.json()

            print(f"   Workflow: {wf_id}")
            print(f"   Nodes: {len(wf_data['nodes'])}")

            if wf_data['nodes']:
                print(f"\n   Node Details:")
                for node in wf_data['nodes'][:3]:
                    print(f"      - {node['type']}: {node['data'].get('label', 'No label')}")
                    print(f"        Position: {node['position']}")
                    print(f"        ID: {node['id']}")
            else:
                print(f"   ✗ No nodes in this workflow!")

        # Check frontend
        print(f"\n4️⃣  Checking Frontend...")
        try:
            frontend = await client.get("http://localhost:3000")
            if frontend.status_code == 200:
                print(f"   ✓ Frontend is UP (port 3000)")
            else:
                print(f"   ✗ Frontend returned: {frontend.status_code}")
        except Exception as e:
            print(f"   ✗ Frontend is DOWN: {e}")

        # Check Bridge
        print(f"\n5️⃣  Checking Bridge...")
        try:
            bridge = await client.get("http://localhost:8001/health")
            bridge_data = bridge.json()
            print(f"   ✓ Bridge is UP (port 8001)")
            print(f"   ✓ Bridge active: {bridge_data['bridge_active']}")
            print(f"   ✓ Connections: {bridge_data['connections']}")
        except Exception as e:
            print(f"   ✗ Bridge is DOWN: {e}")

        print("\n" + "="*70)
        print("  DIAGNOSIS COMPLETE")
        print("="*70)

        if wf_list and any(len(wf['nodes']) > 0 for wf in wf_list):
            print("\n✅ GOOD NEWS: Workflows with nodes exist in backend!")
            print("   Problem: Frontend might not be loading them correctly")
            print("\n   Try:")
            print("   1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)")
            print("   2. Open browser console (F12) and check for errors")
            print("   3. Check Network tab to see if /api/workflows is called")
        else:
            print("\n⚠️  WARNING: No workflows have nodes")
            print("   Run: python3 add_demo_nodes.py")

        print("\n")


if __name__ == "__main__":
    asyncio.run(diagnose())
