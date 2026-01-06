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

### Integration

For detailed integration guide with Elysia or other backend projects, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md).

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
