# EvolveFlow 功能完整指南

## 🎯 你现在可以做的事情

### 1️⃣ 查看现有工作流

✅ 你已经看到了！画布上的 6 个节点展示了：
- 🧠 Claude 的推理过程
- 📖 读取代码文件
- 👁️ 发现问题
- 💡 制定计划
- ✏️ 编辑代码
- ✅ 验证成功

**操作**：
- 点击节点查看详情
- 拖动节点重新排列
- 缩放和平移画布

### 2️⃣ 添加新节点

使用左上角工具栏：

**Thought 按钮** 🧠
- 创建推理节点
- 用于记录思考过程

**Act 按钮** ⚡
- 创建动作节点
- 调用 MCP 工具（天气、计算器、搜索）

**Observe 按钮** 👁️
- 创建观察节点
- 记录执行结果

**Skills 按钮** ✨
- 打开技能库
- 拖拽已学习的技能

### 3️⃣ 连接节点

**创建工作流**：
1. 添加节点到画布
2. 从一个节点的右侧圆点拖动
3. 连接到另一个节点的左侧圆点
4. 形成 ReAct 循环

### 4️⃣ 执行节点

**步骤**：
1. 点击选中一个节点
2. 工具栏出现 "Execute Node" 按钮
3. 点击执行
4. 观察状态变化和输出

### 5️⃣ 使用技能库

**打开技能库**：
1. 点击 "Skills" 按钮
2. 右侧出现技能面板
3. 查看已学习的技能：
   - Weather Query（天气查询）
   - Code Bug Fix（代码修复）
   - Debug Investigation（调试分析）

**使用技能**：
1. 浏览技能列表
2. 点击 ➕ 图标
3. 技能节点添加到画布
4. 连接到你的工作流

### 6️⃣ 实时监控（右下角）

**Live Session 小部件**显示：
- Thoughts 计数：推理次数
- Tool Calls 计数：工具调用次数
- Observations 计数：观察次数
- 最新事件

**操作**：
- **Extract Skills**：从当前会话提取新技能
- **Reset**：清空会话重新开始

### 7️⃣ 创建完整的 ReAct 工作流

**示例：调试一个 Bug**

```
1. 🧠 Thought: "我需要找到登录 bug"
   ↓
2. ⚡ Act: 使用 search_code 工具搜索 "login"
   ↓
3. 👁️ Observe: "在 auth.py 第 42 行发现问题"
   ↓
4. 🧠 Thought: "我需要修复密码验证逻辑"
   ↓
5. ⚡ Act: 使用 edit_file 修复代码
   ↓
6. 👁️ Observe: "修复成功，测试通过"
```

### 8️⃣ 自动提取技能

当你完成一个成功的工作流：
1. 点击右下角 **"Extract Skills"**
2. 系统分析工作流模式
3. 自动创建可重用技能
4. 技能出现在技能库中

**检测的模式**：
- Bug 修复（85% 置信度）
- 功能实现（80% 置信度）
- 代码重构（75% 置信度）
- 调试分析（82% 置信度）

### 9️⃣ 查看 API 文档

打开浏览器：http://localhost:8000/docs

查看所有可用的：
- MCP 工具
- 工作流 API
- 技能 API
- 进化 API

### 🔟 命令行操作

**查看所有工作流**：
```bash
curl http://localhost:8000/api/workflows | python3 -m json.tool
```

**查看技能库**：
```bash
curl http://localhost:8000/api/skills | python3 -m json.tool
```

**查看 MCP 工具**：
```bash
curl http://localhost:8000/api/tools | python3 -m json.tool
```

**查看会话统计**：
```bash
curl http://localhost:8001/api/stats | python3 -m json.tool
```

## 🚀 高级用法

### 捕获真实的 Claude Code 会话

```bash
# 方法 1: 实时捕获
your-command | python3 bridge/capture_claude_session.py

# 方法 2: 监控日志文件
python3 bridge/capture_claude_session.py /path/to/log.txt
```

### 创建自定义工作流

1. 在画布上添加节点
2. 按 ReAct 模式连接
3. 配置每个节点
4. 执行并观察结果
5. 提取为技能

### 分享技能

```bash
# 导出技能
curl http://localhost:8000/api/skills > my_skills.json

# 在另一台机器导入
curl -X POST http://localhost:8000/api/skills \
  -H "Content-Type: application/json" \
  -d @my_skills.json
```

## 💡 实用场景

### 场景 1: 自动化调试

创建工作流：
1. 搜索代码 → 2. 读取文件 → 3. 分析 → 4. 修复 → 5. 测试

保存为技能，下次遇到类似 bug 直接使用。

### 场景 2: 代码审查

创建工作流：
1. 读取代码 → 2. 分析质量 → 3. 生成建议 → 4. 应用改进

### 场景 3: 学习新技能

每次 Claude Code 成功完成任务：
1. 过程被自动捕获
2. 形成可视化工作流
3. 提取为可重用技能
4. 积累技能库

## 🎓 学习路径

1. ✅ **已完成**：查看演示工作流
2. **下一步**：手动添加节点并连接
3. **然后**：执行节点看效果
4. **进阶**：使用技能库
5. **高级**：捕获真实 Claude Code 会话

## 🐛 故障排除

**节点不显示**：
- 硬刷新浏览器
- 检查控制台错误
- 运行 `python3 diagnose.py`

**执行失败**：
- 检查后端日志
- 验证工具配置
- 查看节点详情中的错误

**技能提取失败**：
- 确保有足够事件（>3个）
- 检查工作流完整性
- 查看 Bridge 日志

---

**现在开始实验吧！** 🚀

尝试添加新节点，创建你自己的工作流！
