import json
from .langchain_utils import (
    get_user_prefs_context, 
    get_grok_model, 
    RECIPE_GENERATION_PROMPT,
    MULTIPLE_RECIPES_GENERATION_PROMPT,
    SUBSTITUTE_INGREDIENT_PROMPT,
    GROCERY_LIST_PROMPT
)
from ..models import (
    RecipeGenerationRequest, 
    IngredientSubstitutionRequest, 
    GroceryListRequest,
    RecipeResponse,
    MultipleRecipesResponse,
    IngredientSubstitutionResponse,
    GroceryListResponse
)

class GrokService:
    def __init__(self):
        self.raw_model = get_grok_model()
        
    async def RecipieGeneration(self, request: RecipeGenerationRequest):
        try:
            user_context = get_user_prefs_context(request.user_preferences)
            structured_model = self.raw_model.with_structured_output(RecipeResponse)
            chain = RECIPE_GENERATION_PROMPT | structured_model
            
            response = await chain.ainvoke({
                "user_context": user_context,
                "ingredients": ", ".join(request.ingredients)
            })
        
            return response.dict()

        except Exception as e:
            print(f"Error in GrokService.RecipieGeneration: {e}")
            return None
        
    async def IngredientSubstitution(self, request: IngredientSubstitutionRequest):
        try:
            user_context = get_user_prefs_context(request.user_preferences)
            structured_model = self.raw_model.with_structured_output(IngredientSubstitutionResponse)
            chain = SUBSTITUTE_INGREDIENT_PROMPT | structured_model
            
            response = await chain.ainvoke({
                "user_context": user_context,
                "ingredient": request.ingredient,
                "reason": request.reason or "Not specified"
            })
        
            return response.dict()
        except Exception as e:
            print(f"Error in GrokService.IngredientSubstitution: {e}")
            return None
        
    async def GroceryListCreation(self, request: GroceryListRequest):
        try:
            user_context = get_user_prefs_context(request.user_preferences)
            structured_model = self.raw_model.with_structured_output(GroceryListResponse)
            chain = GROCERY_LIST_PROMPT | structured_model
            
            response = await chain.ainvoke({
                "user_context": user_context,
                "recipes": ", ".join(request.recipes)
            })
        
            return response.dict()
        except Exception as e:
            print(f"Error in GrokService.GroceryListCreation: {e}")
            return None

    async def RecipieListGeneration(self, request: RecipeGenerationRequest):
        try:
            user_context = get_user_prefs_context(request.user_preferences)
            structured_model = self.raw_model.with_structured_output(MultipleRecipesResponse)
            chain = MULTIPLE_RECIPES_GENERATION_PROMPT | structured_model
            
            response = await chain.ainvoke({
                "user_context": user_context,
                "ingredients": ", ".join(request.ingredients)
            })
        
            return response.dict()
        except Exception as e:
            print(f"Error in GrokService.RecipieListGeneration: {e}")
            return None
