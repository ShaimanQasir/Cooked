import json
from .langchain_utils import (
    get_user_prefs_context, 
    get_gemini_model, 
    IMAGE_RECOGNITION_PROMPT,
    NUTRITIONAL_ANALYSIS_PROMPT,
    MEAL_PLAN_PROMPT
)
from ..models import (
    ImageScanRequest, 
    NutritionalAnalysisRequest, 
    MealPlanRequest,
    ImageRecognitionResponse,
    NutritionalAnalysisResponse,
    MealPlanResponse
)

class GeminiService:
    def __init__(self):
        self.raw_model = get_gemini_model()
        
    async def ImageRecognition(self, request: ImageScanRequest):
        try:
            user_context = get_user_prefs_context(request.user_preferences)
            structured_model = self.raw_model.with_structured_output(ImageRecognitionResponse)
            chain = IMAGE_RECOGNITION_PROMPT | structured_model
            
            response = await chain.ainvoke({
                "user_context": user_context,
                "image_base64": request.image_base64
            })
        
            return response.dict()
        except Exception as e:
            print(f"Error in GeminiService.ImageRecognition: {e}")
            return None
        
    async def NutritionalAnalysis(self, request: NutritionalAnalysisRequest):
        try:
            user_context = get_user_prefs_context(request.user_preferences)
            structured_model = self.raw_model.with_structured_output(NutritionalAnalysisResponse)
            chain = NUTRITIONAL_ANALYSIS_PROMPT | structured_model
            
            response = await chain.ainvoke({
                "user_context": user_context,
                "recipe": request.recipe
            })
        
            return response.dict()
        except Exception as e:
            print(f"Error in GeminiService.NutritionalAnalysis: {e}")
            return None

    async def MealPlanning(self, request: MealPlanRequest):
        try:
            from .meal_plan_graph import run_meal_plan_graph
            user_context = get_user_prefs_context(request.user_preferences)
            result = await run_meal_plan_graph(request.days, user_context)
            
            # result is already a MealPlanResponse object from LangGraph node if updated
            if isinstance(result, str):
                return json.loads(result)
            return result.dict() if hasattr(result, 'dict') else result
        except Exception as e:
            print(f"Error in GeminiService.MealPlanning: {e}")
            return None
