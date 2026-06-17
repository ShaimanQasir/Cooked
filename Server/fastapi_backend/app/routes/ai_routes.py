from fastapi import APIRouter, Depends
from ..dependencies import verify_internal_request
from ..services.grok_services import GrokService
from ..services.gemini_services import GeminiService
from ..models import (
    ImageScanRequest, 
    RecipeGenerationRequest, 
    IngredientSubstitutionRequest, 
    GroceryListRequest,
    NutritionalAnalysisRequest,
    MealPlanRequest
)

router = APIRouter(prefix="/ai", dependencies=[Depends(verify_internal_request)])

@router.post("/scan-image")
async def scan_image(request: ImageScanRequest):
    try:
        result = await GeminiService().ImageRecognition(request)
        if result is None:
            return {"status": "error", "message": "Failed to process image"}
        
        return {"status": "success", "analysis": result}

    except Exception as e:
        print(f"Error in scan_image: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/generate-recipe")
async def generate_recipe(request: RecipeGenerationRequest):
    try:
        result = await GrokService().RecipieGeneration(request)
        if result is None:
            return {"status": "error", "message": "Failed to generate recipe"}
        
        return {"status": "success", "recipe": result}

    except Exception as e:
        print(f"Error in generate_recipe: {e}")
        return {"status": "error", "message": str(e)}
    
@router.post("/substitute-ingredient")
async def substitute_ingredient(request: IngredientSubstitutionRequest):
    try:
        result = await GrokService().IngredientSubstitution(request)
        if result is None:
            return {"status": "error", "message": "Failed to substitute ingredient"}
        
        return {"status": "success", "substitution": result}

    except Exception as e:
        print(f"Error in substitute_ingredient: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/create-grocery-list")
async def create_grocery_list(request: GroceryListRequest):
    try:
        result = await GrokService().GroceryListCreation(request)
        if result is None:
            return {"status": "error", "message": "Failed to create grocery list"}
        
        return {"status": "success", "grocery_list": result}

    except Exception as e:
        print(f"Error in create_grocery_list: {e}")
        return {"status": "error", "message": str(e)}
    
@router.post("/nutritional-analysis")
async def nutritional_analysis(request: NutritionalAnalysisRequest):
    try:
        result = await GeminiService().NutritionalAnalysis(request)
        if result is None:
            return {"status": "error", "message": "Failed to perform nutritional analysis"}
        
        return {"status": "success", "analysis": result}

    except Exception as e:
        print(f"Error in nutritional_analysis: {e}")
        return {"status": "error", "message": str(e)}
    
@router.post("/meal-planning")
async def meal_planning(request: MealPlanRequest):
    try:
        result = await GeminiService().MealPlanning(request)
        if result is None:
            return {"status": "error", "message": "Failed to perform meal planning"}
        
        return {"status": "success", "meal_plan": result}

    except Exception as e:
        print(f"Error in meal_planning: {e}")
        return {"status": "error", "message": str(e)}
