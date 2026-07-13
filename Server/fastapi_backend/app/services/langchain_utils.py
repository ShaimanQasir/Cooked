from typing import List, Optional
from ..models import UserPreferences
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
import os

def get_user_prefs_context(prefs: Optional[UserPreferences]) -> str:
    if not prefs:
        return "No specific user preferences provided."
    
    context = f"Dietary Restrictions: {', '.join(prefs.dietary_restrictions) if prefs.dietary_restrictions else 'None'}\n"
    context += f"Additional Preferences: {prefs.preferences_summary if prefs.preferences_summary else 'None'}"
    return context

def get_gemini_model(model_name: str = "gemini-2.0-flash"):
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.2
    )

def get_grok_model(model_name: str = "grok-2"):
    return ChatGroq(
        model=model_name,
        groq_api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.2
    )

# --- PROMPT TEMPLATES ---

IMAGE_RECOGNITION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are an expert chef and nutritionist. Your task is to identify ingredients from an image and estimate their quantities. Output strictly in the requested JSON structure."),
    ("user", [
        {"type": "text", "text": "Analyze this image and identify all the ingredients present. For each ingredient, estimate the accurate quantity if possible.\n\nUser Context:\n{user_context}"},
        {"type": "image_url", "image_url": "data:image/jpeg;base64,{image_base64}"}
    ])
])

RECIPE_GENERATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a world-class chef. Create a delicious recipe based on the provided ingredients and user preferences. Output strictly in the requested JSON structure."),
    ("user", "Ingredients: {ingredients}\n\nUser Context:\n{user_context}")
])

SUBSTITUTE_INGREDIENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a culinary expert. Suggest the best substitutes for an ingredient based on the user's needs. Output strictly in the requested JSON structure."),
    ("user", "Ingredient to substitute: {ingredient}\nReason: {reason}\n\nUser Context:\n{user_context}")
])

GROCERY_LIST_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are an organized kitchen manager. Create a consolidated grocery list from multiple recipes. Output strictly in the requested JSON structure."),
    ("user", "Recipes: {recipes}\n\nUser Context:\n{user_context}")
])

NUTRITIONAL_ANALYSIS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a certified nutritionist. Provide a detailed nutritional breakdown for the given recipe. Output strictly in the requested JSON structure."),
    ("user", "Recipe: {recipe}\n\nUser Context:\n{user_context}")
])

MEAL_PLAN_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a professional meal planner. Create a balanced meal plan for the requested duration. Output strictly in the requested JSON structure."),
    ("user", "Days: {days}\n\nUser Context:\n{user_context}")
])

MULTIPLE_RECIPES_GENERATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a world-class chef. Create exactly 3 distinct, creative and delicious recipes based on the provided ingredients and user preferences. Output strictly in the requested JSON structure matching MultipleRecipesResponse."),
    ("user", "Ingredients: {ingredients}\n\nUser Context:\n{user_context}")
])
