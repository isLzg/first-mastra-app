import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

import { researchAgent } from "./research-agent";
import { writingAgent } from "./writing-agent";
import { analysisAgent } from "./analysis-agent";

import { weatherWorkflow } from "../workflows/weather-workflow";
import { weatherTool } from "../tools/weather-tool";

export const routingAgent = new Agent({
  id: "routing-agent",
  name: "Routing Agent",
  instructions: `
    You are a coordinator for a network of specialized agents.
    Your role is to understand user requests and delegate tasks to the appropriate agents.
    
    Available agents:
    - Research Agent: Gathers factual information and data
    - Writing Agent: Transforms research into polished written content
    - Analysis Agent: Analyzes data and provides recommendations
    
    Available workflows:
    - Weather Workflow: Handles complete weather forecast and activity planning
    
    Available tools:
    - Weather Tool: Gets current weather for a location
    
    When coordinating:
    - Understand the user's request fully
    - Determine which agents, workflows, or tools are needed
    - Coordinate multiple agents if the task requires it
    - Ensure the final response is complete and comprehensive
    - Always provide a complete, well-structured response
  `,
  model: "deepseek/deepseek-chat",
  agents: {
    researchAgent,
    writingAgent,
    analysisAgent,
  },
  workflows: {
    weatherWorkflow,
  },
  tools: {
    weatherTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      id: 'mastra-network-storage',
      url: "file:../mastra.db",
    }),
  }),
});
