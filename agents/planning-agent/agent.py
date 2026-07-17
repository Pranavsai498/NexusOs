"""
Planning Agent

This agent interacts with the Planning MCP to manage family goals, tasks, and timelines.
It generates recommendations based on life events (e.g. "Child is 10, start 529 plan").
"""

import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PlanningAgent")

class PlanningAgent:
    def __init__(self):
        # Connects to Planning MCP
        self.mcp_server_url = os.environ.get("PLANNING_MCP_URL", "http://localhost:8002")
        logger.info(f"Initialized Planning Agent connecting to {self.mcp_server_url}")

    def generate_recommendations(self, family_profile: dict):
        """
        Analyzes the family profile (pulled from Knowledge Graph via Life Brain)
        and calls Planning MCP's `generate_tasks` or creates new goals.
        """
        logger.info(f"Generating recommendations for family profile.")
        
        # MOCK IMPLEMENTATION for Hackathon
        recommendations = [
            {"type": "goal_suggestion", "title": "Create a College Savings Goal", "category": "finance"},
            {"type": "task_suggestion", "title": "Update Estate Planning Docs", "category": "legal"}
        ]
        
        return {
            "status": "success",
            "recommendations": recommendations
        }

if __name__ == "__main__":
    agent = PlanningAgent()
    print(agent.generate_recommendations({"members": [{"name": "Sarah", "age": 10}]}))
