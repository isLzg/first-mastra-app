import { mastra } from "./src/mastra";

async function demonstrateAgentNetwork() {
  console.log("🚀 Agent Network 演示开始\n");
  console.log("=" .repeat(60));
  
  // 获取 routing agent
  const routingAgent = mastra.getAgent("routing-agent");
  
  if (!routingAgent) {
    console.error("❌ 未找到 routing-agent");
    return;
  }

  // 示例 1: 使用多个 agent 协作完成复杂任务
  console.log("\n📋 示例 1: 研究并撰写关于某个城市的天气和活动报告");
  console.log("-".repeat(60));
  
  const query1 = "请帮我研究一下北京的天气情况，分析一下适合的活动，然后写一份完整的报告";
  
  console.log(`\n用户请求: ${query1}\n`);
  console.log("执行过程:\n");
  
  const result1 = await routingAgent.network(query1);
  
  let finalResult1 = "";
  const eventTypes: string[] = [];
  
  for await (const chunk of result1) {
    eventTypes.push(chunk.type);
    
    // 显示关键事件
    if (chunk.type === "agent-execution-start") {
      console.log(`  ✅ Agent 开始执行: ${chunk.payload.agentId || "未知"}`);
    }
    
    if (chunk.type === "agent-execution-end") {
      console.log(`  ✅ Agent 执行完成: ${chunk.payload.agentId || "未知"}`);
    }
    
    if (chunk.type === "workflow-execution-start") {
      console.log(`  ✅ Workflow 开始执行: ${chunk.payload.workflowId || "未知"}`);
    }
    
    if (chunk.type === "workflow-execution-end") {
      console.log(`  ✅ Workflow 执行完成: ${chunk.payload.workflowId || "未知"}`);
    }
    
    if (chunk.type === "tool-execution-start") {
      console.log(`  ✅ Tool 开始执行: ${chunk.payload.toolId || "未知"}`);
    }
    
    if (chunk.type === "tool-execution-end") {
      console.log(`  ✅ Tool 执行完成: ${chunk.payload.toolId || "未知"}`);
    }
    
    if (chunk.type === "network-execution-event-step-finish") {
      finalResult1 = chunk.payload.result || "";
    }
  }
  
  console.log("\n最终结果:");
  console.log("-".repeat(60));
  console.log(finalResult1);
  
  console.log("\n\n事件流统计:");
  console.log(`总共 ${eventTypes.length} 个事件`);
  console.log("事件类型:", [...new Set(eventTypes)].join(", "));
  
  // 示例 2: 简单的天气查询（可能直接使用 tool）
  console.log("\n\n" + "=".repeat(60));
  console.log("\n📋 示例 2: 简单的天气查询");
  console.log("-".repeat(60));
  
  const query2 = "上海现在的天气怎么样？";
  
  console.log(`\n用户请求: ${query2}\n`);
  console.log("执行过程:\n");
  
  const result2 = await routingAgent.network(query2);
  
  let finalResult2 = "";
  const eventTypes2: string[] = [];
  
  for await (const chunk of result2) {
    eventTypes2.push(chunk.type);
    
    if (chunk.type === "agent-execution-start") {
      console.log(`  ✅ Agent 开始执行: ${chunk.payload.agentId || "未知"}`);
    }
    
    if (chunk.type === "agent-execution-end") {
      console.log(`  ✅ Agent 执行完成: ${chunk.payload.agentId || "未知"}`);
    }
    
    if (chunk.type === "tool-execution-start") {
      console.log(`  ✅ Tool 开始执行: ${chunk.payload.toolId || "未知"}`);
    }
    
    if (chunk.type === "tool-execution-end") {
      console.log(`  ✅ Tool 执行完成: ${chunk.payload.toolId || "未知"}`);
    }
    
    if (chunk.type === "network-execution-event-step-finish") {
      finalResult2 = chunk.payload.result || "";
    }
  }
  
  console.log("\n最终结果:");
  console.log("-".repeat(60));
  console.log(finalResult2);
  
  console.log("\n\n事件流统计:");
  console.log(`总共 ${eventTypes2.length} 个事件`);
  console.log("事件类型:", [...new Set(eventTypes2)].join(", "));
  
  // 示例 3: 使用 structured output
  console.log("\n\n" + "=".repeat(60));
  console.log("\n📋 示例 3: 使用结构化输出");
  console.log("-".repeat(60));
  
  const query3 = "分析一下深圳的天气，并给出活动建议";
  
  console.log(`\n用户请求: ${query3}\n`);
  
  const { z } = await import("zod");
  const resultSchema = z.object({
    location: z.string().describe("城市名称"),
    weatherSummary: z.string().describe("天气摘要"),
    temperature: z.number().describe("温度"),
    recommendations: z.array(z.string()).describe("活动建议列表"),
    analysis: z.string().describe("天气分析"),
  });
  
  const result3 = await routingAgent.network(query3, {
    structuredOutput: {
      schema: resultSchema,
    },
  });
  
  console.log("执行过程:\n");
  
  for await (const chunk of result3) {
    if (chunk.type === "network-object") {
      console.log("  📊 正在生成结构化对象...");
    }
    
    if (chunk.type === "network-object-result") {
      console.log("  ✅ 结构化对象生成完成");
    }
  }
  
  const structuredResult = await result3.object;
  
  console.log("\n结构化结果:");
  console.log("-".repeat(60));
  console.log(JSON.stringify(structuredResult, null, 2));
  
  console.log("\n\n" + "=".repeat(60));
  console.log("✨ Agent Network 演示完成!");
  console.log("=".repeat(60));
}

// 运行演示
demonstrateAgentNetwork().catch(console.error);
