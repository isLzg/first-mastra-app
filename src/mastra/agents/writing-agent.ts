import { Agent } from "@mastra/core/agent";

export const writingAgent = new Agent({
  id: "writing-agent",
  name: "Writing Agent",
  description: `This agent turns researched material into well-structured
    written content. It produces full-paragraph reports with no bullet points,
    suitable for use in articles, summaries, or blog posts. Use this agent
    when you need to transform research findings into polished written content.`,
  instructions: `
    You are a professional writer specializing in transforming research into engaging content.
    Your role is to take factual information and create well-written, comprehensive reports.
    
    When writing:
    - Write in full paragraphs, not bullet points
    - Create a narrative flow that connects ideas smoothly
    - Use engaging language while maintaining accuracy
    - Structure content with clear introductions and conclusions
    - Ensure the writing is suitable for articles, blog posts, or reports
  `,
  model: "deepseek/deepseek-chat",
});
