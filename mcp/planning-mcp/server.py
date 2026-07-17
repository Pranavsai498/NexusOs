import os
import uvicorn
from fastapi import FastAPI
from mcp.server import Server
from mcp.types import Tool, TextContent
from typing import Any
import json
import logging
from datetime import datetime

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PlanningMCP")

app = FastAPI(title="Planning MCP", description="Manages Family Goals, Timeline, and Tasks")
mcp = Server("planning-mcp")

# Mock DB for Hackathon
planning_db = {
    "goals": [],
    "events": [],
    "tasks": []
}

@mcp.list_tools()
async def list_tools() -> list[Tool]:
    """Expose Planning operations as MCP tools."""
    return [
        Tool(
            name="create_goal",
            description="Add a new family goal (e.g., Save for College, Buy a House).",
            inputSchema={
                "type": "object",
                "properties": {
                    "goal_id": {"type": "string"},
                    "title": {"type": "string"},
                    "target_date": {"type": "string"},
                    "category": {"type": "string"}
                },
                "required": ["goal_id", "title", "category"]
            }
        ),
        Tool(
            name="get_timeline",
            description="Retrieve upcoming life events and deadlines.",
            inputSchema={
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "default": 10}
                }
            }
        ),
        Tool(
            name="generate_tasks",
            description="Generate tasks based on a specific goal.",
            inputSchema={
                "type": "object",
                "properties": {
                    "goal_id": {"type": "string"}
                },
                "required": ["goal_id"]
            }
        )
    ]

@mcp.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Handle tool execution."""
    if name == "create_goal":
        goal = {
            "goal_id": arguments.get("goal_id"),
            "title": arguments.get("title"),
            "target_date": arguments.get("target_date"),
            "category": arguments.get("category"),
            "status": "active"
        }
        planning_db["goals"].append(goal)
        msg = f"Goal created: {goal['title']}."
        logger.info(msg)
        return [TextContent(type="text", text=msg)]
        
    elif name == "get_timeline":
        limit = arguments.get("limit", 10)
        # In real code, sort by date. Here we return the mock events.
        timeline = planning_db["events"][:limit]
        return [TextContent(type="text", text=json.dumps(timeline, indent=2))]
        
    elif name == "generate_tasks":
        goal_id = arguments.get("goal_id")
        goal = next((g for g in planning_db["goals"] if g["goal_id"] == goal_id), None)
        if not goal:
            return [TextContent(type="text", text=f"Goal {goal_id} not found.")]
            
        # Mock AI logic for task generation based on category
        generated_tasks = []
        if goal["category"].lower() == "finance":
            generated_tasks = [
                {"task": "Review monthly budget", "assigned_to": "parent"},
                {"task": "Open savings account", "assigned_to": "parent"}
            ]
        else:
            generated_tasks = [
                {"task": f"Research options for {goal['title']}", "assigned_to": "unassigned"}
            ]
            
        return [TextContent(type="text", text=json.dumps(generated_tasks, indent=2))]
        
    raise ValueError(f"Unknown tool: {name}")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "planning-mcp"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
