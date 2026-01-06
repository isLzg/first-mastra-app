# Mastra Agent 集成指南

本指南说明如何在 Elysia 后端项目中调用 Mastra Agent 的接口。

## 目录

1. [概述](#概述)
2. [启动 Mastra Agent 服务器](#启动-mastra-agent-服务器)
3. [在 Elysia 项目中集成](#在-elysia-项目中集成)
4. [API 接口说明](#api-接口说明)
5. [完整示例](#完整示例)
6. [错误处理](#错误处理)
7. [常见问题](#常见问题)

## 概述

Mastra Agent 通过 HTTP API 暴露接口，你的 Elysia 后端项目可以通过 HTTP 请求调用这些接口。本指南将帮助你完成集成。

### 架构说明

```
┌─────────────────┐         HTTP Request          ┌──────────────────┐
│  Elysia 后端    │ ────────────────────────────> │ Mastra Agent API │
│   项目          │ <──────────────────────────── │     服务器       │
└─────────────────┘         HTTP Response         └──────────────────┘
```

## 启动 Mastra Agent 服务器

### 1. 安装依赖

在 Mastra 项目目录中，确保已安装所有依赖：

```bash
bun install
```

### 2. 配置环境变量

确保 `.env` 文件包含必要的配置：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. 启动服务器

启动 Mastra Agent API 服务器：

```bash
bun run server
```

服务器将在 `http://localhost:3001` 启动。

### 4. 验证服务器运行

访问 `http://localhost:3001` 查看 API 端点信息。

## 在 Elysia 项目中集成

### 1. 安装 HTTP 客户端

在你的 Elysia 项目中，你可以使用 Bun 内置的 `fetch` API，或者安装其他 HTTP 客户端库（如 `axios`）。

使用 Bun 内置的 `fetch`（推荐）：

```typescript
// 无需安装额外依赖，Bun 内置支持 fetch
```

或使用 `axios`：

```bash
bun add axios
```

### 2. 创建 Agent 服务模块

在你的 Elysia 项目中创建一个服务模块来封装对 Mastra Agent 的调用：

**`src/services/mastra-agent.service.ts`**

```typescript
const MASTRA_API_BASE_URL = process.env.MASTRA_API_BASE_URL || 'http://localhost:3001';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export class MastraAgentService {
  private baseUrl: string;

  constructor(baseUrl: string = MASTRA_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 发送消息给 Weather Agent（非流式）
   */
  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/weatherAgent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 发送消息给 Weather Agent（流式响应）
   */
  async *stream(messages: ChatMessage[]): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/weatherAgent/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                yield data.chunk;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
}

export const mastraAgentService = new MastraAgentService();
```

### 3. 在 Elysia 路由中使用

**`src/routes/weather.route.ts`**

```typescript
import { Elysia } from 'elysia';
import { mastraAgentService } from '../services/mastra-agent.service';

export const weatherRoutes = new Elysia()
  // 非流式聊天接口
  .post('/api/weather/chat', async ({ body }) => {
    const { messages } = body as { messages: Array<{ role: string; content: string }> };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        success: false,
        error: 'Messages array is required',
      };
    }

    const result = await mastraAgentService.chat(
      messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }))
    );

    return result;
  })

  // 流式聊天接口
  .post('/api/weather/stream', async ({ body, set }) => {
    const { messages } = body as { messages: Array<{ role: string; content: string }> };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      set.status = 400;
      return {
        success: false,
        error: 'Messages array is required',
      };
    }

    // 设置 SSE 响应头
    set.headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    };

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of mastraAgentService.stream(
              messages.map((msg) => ({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content,
              }))
            )) {
              const data = `data: ${JSON.stringify({ chunk })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
            controller.close();
          } catch (error) {
            console.error('Stream error:', error);
            const errorData = `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorData));
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  });
```

### 4. 在主应用中注册路由

**`src/index.ts`** 或你的主应用文件：

```typescript
import { Elysia } from 'elysia';
import { weatherRoutes } from './routes/weather.route';

const app = new Elysia()
  .use(weatherRoutes)
  .listen(3000);

console.log(`🚀 Elysia server is running on http://localhost:3000`);
```

## API 接口说明

### 1. 非流式聊天接口

**端点**: `POST /api/agents/weatherAgent/chat`

**请求体**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "今天北京的天气怎么样？"
    }
  ]
}
```

**响应**:
```json
{
  "success": true,
  "response": "今天北京的天气..."
}
```

### 2. 流式聊天接口

**端点**: `POST /api/agents/weatherAgent/stream`

**请求体**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "今天北京的天气怎么样？"
    }
  ]
}
```

**响应**: Server-Sent Events (SSE) 流

```
data: {"chunk":"今天"}
data: {"chunk":"北京"}
data: {"chunk":"的天气"}
...
```

## 完整示例

### 示例 1: 简单的天气查询

```typescript
import { mastraAgentService } from './services/mastra-agent.service';

// 在路由处理函数中
const result = await mastraAgentService.chat([
  {
    role: 'user',
    content: '今天北京的天气怎么样？',
  },
]);

if (result.success) {
  console.log('Agent 回复:', result.response);
} else {
  console.error('错误:', result.error);
}
```

### 示例 2: 流式响应

```typescript
import { mastraAgentService } from './services/mastra-agent.service';

// 在路由处理函数中
for await (const chunk of mastraAgentService.stream([
  {
    role: 'user',
    content: '今天北京的天气怎么样？',
  },
])) {
  // 处理每个文本块
  console.log('收到:', chunk);
  // 可以发送给客户端（SSE）
}
```

### 示例 3: 在 Elysia 中使用

```typescript
import { Elysia } from 'elysia';
import { mastraAgentService } from './services/mastra-agent.service';

const app = new Elysia()
  .post('/ask-weather', async ({ body }) => {
    const { question } = body as { question: string };

    const result = await mastraAgentService.chat([
      {
        role: 'user',
        content: question,
      },
    ]);

    return result;
  })
  .listen(3000);
```

## 错误处理

### 常见错误

1. **连接错误**: 确保 Mastra Agent 服务器正在运行
2. **消息格式错误**: 确保 `messages` 数组格式正确
3. **API 密钥错误**: 检查 Mastra 项目的 `.env` 文件

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

## 环境变量配置

在你的 Elysia 项目中，可以配置 Mastra API 的基础 URL：

**`.env`**:
```bash
MASTRA_API_BASE_URL=http://localhost:3001
```

如果 Mastra Agent 服务器运行在不同的主机或端口，修改此值即可。

## 常见问题

### Q: 如何在不同端口运行 Mastra Agent 服务器？

A: 修改 `server.ts` 文件中的端口号：

```typescript
.listen(3001); // 改为你想要的端口
```

### Q: 如何在生产环境中部署？

A: 
1. 确保 Mastra Agent 服务器和 Elysia 服务器都在运行
2. 使用环境变量配置正确的 API URL
3. 考虑添加认证和限流机制

### Q: 如何处理并发请求？

A: Mastra Agent 服务器可以处理多个并发请求。如果你的 Elysia 应用需要处理大量并发，考虑：
- 使用连接池
- 实现请求队列
- 添加限流机制

### Q: 如何调试？

A: 
1. 检查 Mastra Agent 服务器的日志
2. 检查 Elysia 应用的日志
3. 使用网络工具（如 Postman）直接测试 Mastra API
4. 检查环境变量配置

## 总结

通过以上步骤，你的 Elysia 后端项目就可以成功调用 Mastra Agent 的接口了。记住：

1. ✅ 确保 Mastra Agent 服务器正在运行
2. ✅ 正确配置环境变量
3. ✅ 使用正确的消息格式
4. ✅ 处理错误情况

如有问题，请参考 Mastra 官方文档或检查服务器日志。

