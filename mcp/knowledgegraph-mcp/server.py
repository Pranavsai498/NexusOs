import os
import uvicorn
from fastapi import FastAPI
from mcp.server import Server
from mcp.server.sse import SseServerTransport
from mcp.types import Tool, TextContent
from typing import Any
import json
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("KnowledgeGraphMCP")

# FastAPI App
app = FastAPI(title="Knowledge Graph MCP", description="Manages Family Life Entity Relationships")

# MCP Server
mcp = Server("knowledge-graph-mcp")

# --- MOCK DATABASE (For Hackathon/Fast Iteration) ---
# In a real setup, we would connect to Neo4j or MongoDB using `motor`.
graph_db = {
    "nodes": [],
    "edges": []
}

@mcp.list_tools()
async def list_tools() -> list[Tool]:
    """Expose Knowledge Graph operations as MCP tools."""
    return [
        Tool(
            name="add_node",
            description="Add a new entity (person, asset, goal, etc.) to the Knowledge Graph.",
            inputSchema={
                "type": "object",
                "properties": {
                    "node_id": {"type": "string"},
                    "label": {"type": "string"},
                    "properties": {"type": "object"}
                },
                "required": ["node_id", "label"]
            }
        ),
        Tool(
            name="add_edge",
            description="Create a relationship between two entities.",
            inputSchema={
                "type": "object",
                "properties": {
                    "source_id": {"type": "string"},
                    "target_id": {"type": "string"},
                    "relationship": {"type": "string"},
                    "properties": {"type": "object"}
                },
                "required": ["source_id", "target_id", "relationship"]
            }
        ),
        Tool(
            name="query_graph",
            description="Query related nodes and relationships for a specific entity.",
            inputSchema={
                "type": "object",
                "properties": {
                    "node_id": {"type": "string", "description": "The ID of the central node."}
                },
                "required": ["node_id"]
            }
        )
    ]

@mcp.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Handle tool execution."""
    if name == "add_node":
        node_id = arguments.get("node_id")
        label = arguments.get("label")
        props = arguments.get("properties", {})
        
        # Simple mock logic
        existing = next((n for n in graph_db["nodes"] if n["node_id"] == node_id), None)
        if not existing:
            graph_db["nodes"].append({"node_id": node_id, "label": label, "properties": props})
            msg = f"Added node {node_id} ({label})"
        else:
            msg = f"Node {node_id} already exists."
            
        logger.info(msg)
        return [TextContent(type="text", text=msg)]
        
    elif name == "add_edge":
        source_id = arguments.get("source_id")
        target_id = arguments.get("target_id")
        relationship = arguments.get("relationship")
        props = arguments.get("properties", {})
        
        graph_db["edges"].append({
            "source": source_id, 
            "target": target_id, 
            "relationship": relationship, 
            "properties": props
        })
        msg = f"Added relationship {source_id} -[{relationship}]-> {target_id}"
        logger.info(msg)
        return [TextContent(type="text", text=msg)]
        
    elif name == "query_graph":
        node_id = arguments.get("node_id")
        
        # Find edges connected to the node
        connected_edges = [e for e in graph_db["edges"] if e["source"] == node_id or e["target"] == node_id]
        connected_nodes = []
        for e in connected_edges:
            other_id = e["target"] if e["source"] == node_id else e["source"]
            node = next((n for n in graph_db["nodes"] if n["node_id"] == other_id), None)
            if node:
                connected_nodes.append({
                    "relationship": e["relationship"],
                    "direction": "outgoing" if e["source"] == node_id else "incoming",
                    "node": node
                })
                
        result = {
            "center_node": next((n for n in graph_db["nodes"] if n["node_id"] == node_id), None),
            "connections": connected_nodes
        }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
        
    raise ValueError(f"Unknown tool: {name}")

# --- API ENDPOINTS ---
@app.get("/sse")
async def sse_endpoint():
    """SSE endpoint for MCP clients."""
    transport = SseServerTransport("/messages")
    # In a production app with concurrent users, we would manage transport lifecycle properly.
    # We pass it to the MCP server.
    return await transport.handle_sse(mcp)

@app.post("/messages")
async def messages_endpoint():
    """Message endpoint for MCP SSE communication."""
    # This requires the transport reference from the SSE endpoint which is complex in FastAPI
    # without a session manager. For this hackathon stub, we assume the Life Brain handles
    # communication via standard HTTP if SSE is too complex, or we use Stdio for local testing.
    pass

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "knowledge-graph-mcp"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
