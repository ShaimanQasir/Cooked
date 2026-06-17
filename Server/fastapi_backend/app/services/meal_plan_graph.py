from typing import TypedDict, List, Optional, Annotated, Union
from langgraph.graph import StateGraph, END
from .langchain_utils import get_gemini_model, MEAL_PLAN_PROMPT
from ..models import MealPlanResponse
import json

class PlanState(TypedDict):
    days: int
    user_context: str
    meal_plan: Optional[Union[str, MealPlanResponse]]
    iterations: int
    error: Optional[str]

async def plan_meals_node(state: PlanState):
    model = get_gemini_model()
    # Use structured output in the node
    structured_model = model.with_structured_output(MealPlanResponse)
    chain = MEAL_PLAN_PROMPT | structured_model
    
    response = await chain.ainvoke({
        "days": state["days"],
        "user_context": state["user_context"]
    })
    
    return {
        "meal_plan": response,
        "iterations": state.get("iterations", 0) + 1
    }

async def validate_plan_node(state: PlanState):
    # With with_structured_output, the model output is already a MealPlanResponse object
    # Pydantic has already validated the basic structure.
    # We could add extra business logic validation here.
    if not state["meal_plan"]:
        return {"error": "Meal plan generation failed."}
    return {"error": None}

def should_continue(state: PlanState):
    if state["error"] and state["iterations"] < 3:
        return "plan_meals"
    return END

def create_meal_plan_graph():
    workflow = StateGraph(PlanState)
    
    workflow.add_node("plan_meals", plan_meals_node)
    workflow.add_node("validate_plan", validate_plan_node)
    
    workflow.set_entry_point("plan_meals")
    workflow.add_edge("plan_meals", "validate_plan")
    
    workflow.add_conditional_edges(
        "validate_plan",
        should_continue,
        {
            "plan_meals": "plan_meals",
            END: END
        }
    )
    
    return workflow.compile()

async def run_meal_plan_graph(days: int, user_context: str):
    app = create_meal_plan_graph()
    final_state = await app.ainvoke({
        "days": days,
        "user_context": user_context,
        "iterations": 0,
        "meal_plan": None,
        "error": None
    })
    return final_state["meal_plan"]
