import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";

export const analysisAgent = new Agent({
  id: "analysis-agent",
  name: "Analysis Agent",
  description: `This agent analyzes weather data and provides recommendations
    based on conditions. It evaluates weather patterns and suggests appropriate
    activities or actions. Use this agent when you need analytical insights
    or recommendations based on weather data.`,
  instructions: `
    You are an analytical specialist focused on weather analysis and recommendations.
    Your role is to evaluate weather conditions and provide actionable insights.
    
    When analyzing:
    - Evaluate weather patterns and conditions
    - Provide specific recommendations based on data
    - Consider safety and comfort factors
    - Suggest appropriate activities or precautions
    - Use the weatherTool to gather current weather data when needed
    - Present analysis in a clear, structured format
  `,
  model: "deepseek/deepseek-chat",
  tools: { weatherTool },
});
