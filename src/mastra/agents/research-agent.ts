import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools/weather-tool";

export const researchAgent = new Agent({
  id: "research-agent",
  name: "Research Agent",
  description: `This agent gathers concise research insights in bullet-point form.
    It's designed to extract key facts without generating full
    responses or narrative content. Use this agent when you need to collect
    factual information, weather data, or research findings.`,
  instructions: `
    You are a research specialist focused on gathering factual information.
    Your role is to collect data and present it in a clear, structured format.
    
    When researching:
    - Use bullet points to organize information
    - Focus on facts and data, not narrative
    - Include relevant details like dates, numbers, and specific information
    - Keep responses concise and well-organized
    - Use the weatherTool when weather information is needed
  `,
  model: "deepseek/deepseek-chat",
  tools: { weatherTool },
});
