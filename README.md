# NexusAI – AI Family Guardian 🚀
**One AI. Multiple Expert Agents. Complete Family Care.**

NexusAI is a revolutionary Multi-Agent AI Platform built on the Model Context Protocol (MCP). It is not just a chatbot; it is a full operating system for your family, orchestrated by a central **Life Brain** that delegates tasks to specialized AI Expert Agents.

## 🏗 Architecture
- **Frontend**: Next.js 14, React, TailwindCSS, Shadcn UI, Framer Motion
- **Backend**: FastAPI (Python), Motor (Async), Beanie ODM
- **Database**: MongoDB
- **AI Core**: OpenAI GPT-4, NitroStack MCP SDK

## 🧠 The 11 AI Agents (MCP Servers)
All MCP servers are now unified in the `agents/` directory as standalone microservices:
1. **document-agent**: Digital vault, OCR, semantic search.
2. **government-agent**: Scheme finder, eligibility checker.
3. **finance-agent**: Budget calculator, loan planner, insurance analysis.
4. **health-agent**: Medical records summarization, reminders.
5. **education-agent**: Academic progress and scholarship finder.
6. **legal-agent**: Contract management and legal document analysis.
7. **planning-agent**: Timeline management, college/retirement plans.
8. **knowledgegraph-agent**: Network visualization of family entities.
9. **life-brain**: The master orchestrator that routes user queries.
10. **emergency-agent**: SOS protocols and crisis management.
11. **notification-agent**: Global unified alerting system.

## ⚙️ Getting Started

### 1. Environment Setup
Create a `.env` file in the root directory based on `.env.example`:
```bash
cp .env.example .env
```
*Add your `OPENAI_API_KEY` to unlock the Life Brain orchestration.*

### 2. Run the Backend (FastAPI + MongoDB)
Ensure you have MongoDB running locally on port 27017.
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Run the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 4. Run the MCP Servers (TypeScript)
```bash
cd agents/life-brain
npm install
npm run start
```
*(Repeat for any specific MCP server in `mcp/` you wish to run standalone).*

## 🌟 Hackathon Deliverables Completed
- [x] Complete MongoDB Integration
- [x] JWT Authentication & Role-Based Access
- [x] 6 Specialized MCP Agents Built
- [x] Glassmorphism Dashboard UI
- [x] Life Brain LLM Orchestration
