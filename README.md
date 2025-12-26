# 🤖 AI Customer Support Agent

A production-ready, full-stack AI support agent capable of holding context-aware conversations and answering domain-specific queries using OpenAI's GPT-4o-mini.

##Note
I have deployed backend on render and render shuts downthe services if there is no traffic.
So please wait for a moment when you enter the first query ,render restart the service so there will be a delay in the 1st query .

## 🚀 Quick Start (Run Locally)

### Prerequisites
-   Node.js must be installed in a system
-   PostgreSQL (running locally)
-   OpenAI API Key

### 1. Clone & Install
```bash
git clone https://github.com/baroonjha/ai-support-agent.git
cd ai-support-agent
```

### 2. Backend Setup
```bash
cd backend
npm install
```
**Configure `.env`**:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/ai_support_agent
OPENAI_API_KEY=sk-your-key-here
# Make SSL = false when you are using locally running postgres and make SSL = true  when you are using the managed postgres like neon.
SSL=false
```

### 3. Database Migration
We use a script that creates the DB if missing and applies the schema.
```bash
npx ts-node src/db/migrate.ts
```

### 4. Run Servers
**Backend:**
```bash
# In /backend
npx ts-node src/server.ts
```
**Frontend:**
***Create .env file***
```bash
 VITE_API_URL=http://localhost:3000 || backend_hosted_url
```
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` to chat!

---

## 🏗️ Architecture Overview

The system is a Monorepo structured into two main packages:

### 1. Backend (`/backend`)
*   **Tech**: Node.js, Express, TypeScript, PostgreSQL (`pg` pool).
*   **Structure**:
    *   `/routes`: API endpoints (`POST /chat/message`, `GET /chat/history`).
    *   `/utils`: Helper logic, specifically `llm.ts` for OpenAI interaction.
    *   `/db`: Database connection and schema migrations.
*   **Key Design**:
    *   **Stateless REST API**: Uses `sessionId` to retrieve context from the DB.
    *   **Robustness**: Input validation (length caps, empty checks) & Graceful Error Handling.

### 2. Frontend (`/frontend`)
*   **Tech**: React, Vite, TypeScript, Tailwind css.
*   **Key Design**:
    *   **Persistence**: Saves `sessionId` to `localStorage` to restore chat on reload.
    *   **Optimistic UI**: Immediate feedback for user actions.
    *   **Defense in Depth**: Frontend validation (maxLength) complements backend security.

---

## 🧠 LLM Usage & Prompt Engineering

*   **Provider**: OpenAI (`gpt-4o-mini`).
*   **Strategy**:
    *   **Role-Prompting**: "You are a helpful customer support agent for resolving user queries."
    *   **RAG-Lite**: We hardcoded domain knowledge (Shipping, Returns, Hours) directly into the System Prompt.
    *   **Context Window**: We fetch the last 10 messages from Postgres and inject them into every API call to give the AI "Memory".

---

## ⚖️ Trade-offs & Future Improvements

### "If I had more time..."
1.  **Streaming Responses**: Currently, we wait for the full response. Implementing Server-Sent Events (SSE) would make it feel faster (like ChatGPT).
2.  **Vector Database**: Hardcoding FAQs works for small data. For a real knowledge base, I would use `pgvector` or Pinecone to search thousands of documents.I have implemented a RAG system(DisputeGuard) for large knowledge base using gemini and pinceone.You can check it out on my portfolio site.
3.**Tool Use**: Giving the AI the ability to query "Order Status" from a real API via Function Calling.
4.**Feedback for Analytics**: For analytics after responding to user,when user click end chat (end chat button needs to be implemented).It will show emoji like(👍,👎,etc) and we can store it in database and use it for analytics.
5.**Authentication**: Currently, anyone can chat. Adding Auth0 would secure user data.

### Assumptions
*   The user is running a local Postgres instance.
*   The conversation history fits within the context window (capped at last 10 messages).
*   Messages > 500 characters are truncatable or rejectable.
