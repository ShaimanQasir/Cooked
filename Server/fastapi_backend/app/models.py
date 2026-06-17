from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# --- INPUT MODELS ---

class UserPreferences(BaseModel):
    dietary_restrictions: List[str] = []
    preferences_summary: str = ""

class ImageScanRequest(BaseModel):
    image_base64: str
    user_preferences: Optional[UserPreferences] = None

class RecipeGenerationRequest(BaseModel):
    ingredients: List[str]
    user_preferences: Optional[User_Preferences] = None

class IngredientSubstitutionRequest(BaseModel):
    ingredient: str
    reason: Optional[str] = None
    user_preferences: Optional[UserPreferences] = None

class GroceryListRequest(BaseModel):
    recipes: List[str]
    user_preferences: Optional[UserPreferences] = None

class NutritionalAnalysisRequest(BaseModel):
    recipe: str
    user_preferences: Optional[UserPreferences] = None

class MealPlanRequest(BaseModel):
    days: int = 7
    user_preferences: Optional[UserPreferences] = None

# --- OUTPUT MODELS (Structured AI Responses) ---

class IngredientIdentification(BaseModel):
    name: str = Field(description="Name of the ingredient")
    quantity: str = Field(description="Estimated quantity (e.g., 2 pieces, 500g)")

class ImageRecognitionResponse(BaseModel):
    ingredients: List[IngredientIdentification]

class NutritionEstimate(BaseModel):
    calories: int
    protein: float
    carbs: float
    fat: float

class RecipeResponse(BaseModel):
    title: str
    description: str
    ingredients: List[str] = Field(description="List of ingredients with quantities")
    instructions: List[str] = Field(description="Step-by-step cooking steps")
    prep_time: str
    cook_time: str
    servings: int
    difficulty: str
    nutrition_estimate: NutritionEstimate

class SubstituteInfo(BaseModel):
    substitute: str
    ratio: str = Field(description="Ratio to use compared to original (e.g., 1:1)")
    reason: str = Field(description="Why this is a good substitute")

class IngredientSubstitutionResponse(BaseModel):
    substitutes: List[SubstituteInfo]

class GroceryListResponse(BaseModel):
    categories: Dict[str, List[str]] = Field(description="Categorized ingredients (e.g., Produce, Dairy)")

class NutritionalAnalysisResponse(BaseModel):
    calories: int
    protein: float
    carbs: float
    fats: float
    vitamins_minerals: List[str]
    health_score: int = Field(ge=1, le=10)
    summary: str

class MealEntry(BaseModel):
    breakfast: str
    lunch: str
    dinner: str
    snacks: List[str]

class MealPlanResponse(BaseModel):
    plan: Dict[str, MealEntry] = Field(description="Meal plan indexed by Day (e.g., Day 1, Day 2)")