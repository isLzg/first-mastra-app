# Routing Agent 测试提示词指南

本文档提供了多个精心设计的提示词，用于测试和展示 Agent Network 的协作能力。

## 🚀 快速开始

运行测试脚本：

```bash
# 运行中等复杂度测试（默认）
bun run test:routing-agent.ts

# 运行指定场景
bun run test:routing-agent.ts simple
bun run test:routing-agent.ts medium
bun run test:routing-agent.ts complex
bun run test:routing-agent.ts workflow
bun run test:routing-agent.ts multiCity
bun run test:routing-agent.ts structured
```

## 📋 测试场景说明

### 1. Simple（简单场景）
**提示词**: `上海现在的天气怎么样？`

**预期行为**:
- Routing Agent 识别这是一个简单的天气查询
- 直接调用 `weatherTool` 获取天气数据
- 可能只使用 `analysisAgent` 来格式化回答

**适合观察**: Tool 的直接调用，简单的路由决策

---

### 2. Medium（中等复杂度）
**提示词**: `请帮我研究一下杭州的天气情况，并分析一下适合做什么活动`

**预期行为**:
- Routing Agent 识别需要研究和分析两个步骤
- 调用 `researchAgent` 收集天气信息
- 调用 `analysisAgent` 分析数据并给出建议
- 可能需要调用 `weatherTool` 获取数据

**适合观察**: 两个 agent 的协作，顺序执行

---

### 3. Complex（高复杂度）
**提示词**: 
```
请帮我完成以下任务：
1. 研究一下成都的天气情况
2. 分析这些天气数据，给出适合的活动建议
3. 将研究结果和分析写成一份完整的报告，要求：
   - 包含天气概况
   - 包含活动推荐
   - 使用段落形式，不要用 bullet points
   - 语言要专业且易读
```

**预期行为**:
- Routing Agent 识别需要三个步骤：研究 → 分析 → 写作
- 调用 `researchAgent` 收集信息
- 调用 `analysisAgent` 进行分析
- 调用 `writingAgent` 生成最终报告
- 展示完整的 agent 协作链

**适合观察**: 多个 agent 的完整协作流程，数据在 agent 间传递

---

### 4. Workflow（工作流场景）
**提示词**: `我想知道广州的天气，并基于天气情况给我一些活动建议`

**预期行为**:
- Routing Agent 识别这是一个完整的天气+活动规划任务
- 直接调用 `weatherWorkflow` 处理整个流程
- Workflow 内部会调用相关 agent 和 tool

**适合观察**: Workflow 的执行，workflow 与 agent 的协作

---

### 5. MultiCity（多城市对比）
**提示词**:
```
请对比分析以下三个城市的天气情况：
- 北京
- 上海  
- 深圳

然后写一份对比报告，包括：
1. 每个城市的天气概况
2. 适合的活动建议
3. 综合对比分析
```

**预期行为**:
- Routing Agent 识别需要处理多个城市
- 可能多次调用 `researchAgent` 或 `weatherTool` 获取多个城市数据
- 调用 `analysisAgent` 进行对比分析
- 调用 `writingAgent` 生成对比报告

**适合观察**: 循环调用 agent，复杂的数据聚合

---

### 6. Structured（结构化输出）
**提示词**: `分析一下重庆的天气，并给出详细的活动建议`

**预期行为**:
- Routing Agent 执行分析和研究
- 使用结构化输出 schema 生成格式化的结果
- 返回符合 schema 的 JSON 对象

**适合观察**: 结构化输出的生成过程

## 🎯 推荐测试顺序

1. **Simple** - 先看最简单的场景，理解基础流程
2. **Medium** - 观察两个 agent 的协作
3. **Complex** - 看完整的多 agent 协作链
4. **Workflow** - 了解 workflow 的使用
5. **MultiCity** - 测试复杂的数据处理
6. **Structured** - 体验结构化输出

## 📊 观察要点

运行测试时，注意观察：

1. **路由决策**: Routing Agent 如何理解请求并决定调用哪些 agent/workflow/tool
2. **执行顺序**: 各个 agent 的执行顺序是否符合预期
3. **数据传递**: 数据如何在 agent 之间传递
4. **事件流**: 各种事件（agent-execution-start, tool-execution-start 等）的触发顺序
5. **最终结果**: 最终输出是否符合预期，是否完整

## 💡 自定义提示词

你也可以直接在代码中修改 `TEST_PROMPTS` 对象，添加自己的测试提示词：

```typescript
const TEST_PROMPTS = {
  // ... 现有提示词
  myCustom: "你的自定义提示词",
};
```

然后运行：
```bash
bun run test:routing-agent.ts myCustom
```

## 🔍 调试技巧

如果某个 agent 没有按预期执行，可以：

1. 检查 agent 的 `description` 是否清晰
2. 检查 routing agent 的 `instructions` 是否明确
3. 查看执行日志中的事件顺序
4. 尝试更明确地描述任务需求
