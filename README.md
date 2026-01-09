# first-mastra-app

A Mastra application with DeepSeek model support.

## Setup

### Install dependencies

```bash
bun install
```

### Configure environment variables

Create a `.env` file in the root directory with your DeepSeek API key:

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

You can get your API key from [DeepSeek Platform](https://platform.deepseek.com/).

### Run

#### Development Mode (Mastra CLI)
```bash
bun run dev
```

#### Start API Server
To expose the agent as an HTTP API server:
```bash
bun run server
```

The API server will run on `http://localhost:3001`.

### API Endpoints

- `GET /` - API information
- `POST /api/agents/weatherAgent/chat` - Chat with Weather Agent (non-streaming)
- `POST /api/agents/weatherAgent/stream` - Chat with Weather Agent (streaming)

### Agent Network Demo

This project includes an Agent Network implementation that demonstrates multiple agents working together. To run the demo:

```bash
bun run index.ts
```

The demo showcases:
- **Research Agent**: Gathers factual information and weather data
- **Writing Agent**: Transforms research into polished written content
- **Analysis Agent**: Analyzes weather data and provides recommendations
- **Routing Agent**: Coordinates multiple agents to handle complex tasks

The demo includes three examples:
1. Complex task requiring multiple agents (research → analysis → writing)
2. Simple weather query (direct tool usage)
3. Structured output with schema validation

### Agent Network Architecture

```
Routing Agent (Coordinator)
├── Research Agent (收集信息)
├── Writing Agent (撰写报告)
├── Analysis Agent (分析数据)
├── Weather Workflow (完整工作流)
└── Weather Tool (天气工具)
```

The routing agent uses LLM reasoning to interpret user requests and decide which agents, workflows, or tools to call, demonstrating intelligent task delegation and coordination.

### Integration

For detailed integration guide with Elysia or other backend projects, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md).

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
