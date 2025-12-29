# 查看可视化节点

## 方法 1: 刷新页面

打开: http://localhost:3000
然后刷新浏览器 (Cmd+R 或 F5)

## 方法 2: 查看所有工作流

```bash
curl -s http://localhost:8000/api/workflows | python3 -m json.tool
```

找到有节点的工作流:
- workflow-a37173dd: 16 nodes (这是演示创建的工作流)

## 方法 3: 查看 Live Session 统计

在浏览器右下角的 "Live Session" 小部件中，你应该看到:
- Thoughts: 6
- Tool Calls: 5  
- Events captured: 16

## 方法 4: 直接查询工作流

```bash
curl -s http://localhost:8000/api/workflows/workflow-a37173dd | python3 -m json.tool | less
```

你会看到所有 16 个节点的详细信息！

## 成功！

你刚刚看到的是我（Claude Code）实时优化 EvolveFlow 的完整过程：
1. 我发现了缺少 UPDATE API 端点的问题
2. 我添加了 PUT /api/workflows/{id} 端点  
3. 我修复了 Bridge 的 add_node_to_workflow 方法
4. 我重启了服务
5. 我运行了演示，创建了 16 个节点

所有这些步骤都被 Bridge 捕获并可视化了！
