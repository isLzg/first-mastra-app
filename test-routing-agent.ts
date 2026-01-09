import { mastra } from "./src/mastra";

/**
 * 测试 Routing Agent 的提示词集合
 * 这些提示词设计用于展示不同复杂度的 Agent Network 协作场景
 */

const TEST_PROMPTS = {
  // 简单场景：直接使用 tool
  simple: "上海现在的天气怎么样？",

  // 中等复杂度：需要研究和分析
  medium: "请帮我研究一下杭州的天气情况，并分析一下适合做什么活动",

  // 高复杂度：需要多个 agent 协作（研究 → 分析 → 写作）
  complex: `请帮我完成以下任务：
1. 研究一下成都的天气情况
2. 分析这些天气数据，给出适合的活动建议
3. 将研究结果和分析写成一份完整的报告，要求：
   - 包含天气概况
   - 包含活动推荐
   - 使用段落形式，不要用 bullet points
   - 语言要专业且易读`,

  // 使用 workflow 的场景
  workflow: "我想知道广州的天气，并基于天气情况给我一些活动建议",

  // 多城市对比场景
  multiCity: `请对比分析以下三个城市的天气情况：
- 北京
- 上海  
- 深圳

然后写一份对比报告，包括：
1. 每个城市的天气概况
2. 适合的活动建议
3. 综合对比分析`,

  // 结构化输出场景
  structured: "分析一下重庆的天气，并给出详细的活动建议",
};

async function testRoutingAgent(promptKey: keyof typeof TEST_PROMPTS) {
  const routingAgent = mastra.getAgent("routing-agent");

  if (!routingAgent) {
    console.error("❌ 未找到 routing-agent");
    return;
  }

  const prompt = TEST_PROMPTS[promptKey];
  
  console.log("\n" + "=".repeat(80));
  console.log(`📋 测试场景: ${promptKey.toUpperCase()}`);
  console.log("=".repeat(80));
  console.log(`\n💬 用户提示词:\n${prompt}\n`);
  console.log("🔄 执行过程:\n");

  const startTime = Date.now();
  const result = await routingAgent.network(prompt);

  let finalResult = "";
  const executionLog: Array<{ type: string; agentId?: string; toolId?: string; workflowId?: string; timestamp: number }> = [];

  for await (const chunk of result) {
    const timestamp = Date.now() - startTime;
    
    // 记录所有关键事件
    if (chunk.type === "routing-agent-start") {
      console.log(`  [${timestamp}ms] 🎯 Routing Agent 开始分析请求...`);
      executionLog.push({ type: chunk.type, timestamp });
    }
    
    if (chunk.type === "routing-agent-end") {
      console.log(`  [${timestamp}ms] ✅ Routing Agent 完成路由决策`);
      executionLog.push({ type: chunk.type, timestamp });
    }
    
    if (chunk.type === "agent-execution-start") {
      const agentId = chunk.payload.agentId || "未知";
      console.log(`  [${timestamp}ms] 🤖 Agent 开始执行: ${agentId}`);
      executionLog.push({ type: chunk.type, agentId, timestamp });
    }
    
    if (chunk.type === "agent-execution-end") {
      const agentId = chunk.payload.agentId || "未知";
      console.log(`  [${timestamp}ms] ✅ Agent 执行完成: ${agentId}`);
      executionLog.push({ type: chunk.type, agentId, timestamp });
    }
    
    if (chunk.type === "workflow-execution-start") {
      const workflowId = chunk.payload.workflowId || "未知";
      console.log(`  [${timestamp}ms] 🔄 Workflow 开始执行: ${workflowId}`);
      executionLog.push({ type: chunk.type, workflowId, timestamp });
    }
    
    if (chunk.type === "workflow-execution-end") {
      const workflowId = chunk.payload.workflowId || "未知";
      console.log(`  [${timestamp}ms] ✅ Workflow 执行完成: ${workflowId}`);
      executionLog.push({ type: chunk.type, workflowId, timestamp });
    }
    
    if (chunk.type === "tool-execution-start") {
      const toolId = chunk.payload.toolId || "未知";
      console.log(`  [${timestamp}ms] 🔧 Tool 开始执行: ${toolId}`);
      executionLog.push({ type: chunk.type, toolId, timestamp });
    }
    
    if (chunk.type === "tool-execution-end") {
      const toolId = chunk.payload.toolId || "未知";
      console.log(`  [${timestamp}ms] ✅ Tool 执行完成: ${toolId}`);
      executionLog.push({ type: chunk.type, toolId, timestamp });
    }
    
    if (chunk.type === "network-execution-event-step-finish") {
      finalResult = chunk.payload.result || "";
      console.log(`  [${timestamp}ms] 📝 网络执行步骤完成`);
    }
  }

  const totalTime = Date.now() - startTime;

  console.log("\n" + "-".repeat(80));
  console.log("📊 执行统计:");
  console.log("-".repeat(80));
  console.log(`总耗时: ${totalTime}ms`);
  console.log(`总事件数: ${executionLog.length}`);
  
  // 统计各类型事件
  const eventCounts: Record<string, number> = {};
  executionLog.forEach(log => {
    eventCounts[log.type] = (eventCounts[log.type] || 0) + 1;
  });
  
  console.log("\n事件类型统计:");
  Object.entries(eventCounts).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count} 次`);
  });

  // 显示执行顺序
  console.log("\n执行顺序:");
  executionLog.forEach((log, index) => {
    const details = log.agentId || log.toolId || log.workflowId || "";
    console.log(`  ${index + 1}. [${log.timestamp}ms] ${log.type}${details ? ` (${details})` : ""}`);
  });

  console.log("\n" + "-".repeat(80));
  console.log("📄 最终结果:");
  console.log("-".repeat(80));
  console.log(finalResult);
  console.log("=".repeat(80) + "\n");
}

// 主函数：运行指定的测试场景
async function main() {
  const args = process.argv.slice(2);
  const promptKey = (args[0] as keyof typeof TEST_PROMPTS) || "medium";

  if (!(promptKey in TEST_PROMPTS)) {
    console.error(`❌ 无效的测试场景: ${promptKey}`);
    console.log("\n可用的测试场景:");
    Object.keys(TEST_PROMPTS).forEach(key => {
      console.log(`  - ${key}: ${TEST_PROMPTS[key as keyof typeof TEST_PROMPTS].substring(0, 50)}...`);
    });
    return;
  }

  await testRoutingAgent(promptKey);
}

// 如果直接运行此文件
if (import.meta.main) {
  main().catch(console.error);
}

export { testRoutingAgent, TEST_PROMPTS };
