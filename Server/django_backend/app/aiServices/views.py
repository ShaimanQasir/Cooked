import requests
import base64
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .utils import get_ai_user_preferences

class AIScanImageView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if 'image' not in request.FILES:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        image_file = request.FILES['image']

        # 1. Convert Image to Base64
        try:
            image_base64 = base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            return Response({"error": f"Failed to process image: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Get User Preferences
        user_preferences = get_ai_user_preferences(request.user)

        # 3. Call FastAPI
        fastapi_url = f"{settings.FASTAPI_SERVICE_URL}/ai/scan-image"
        headers = {
            "X-Internal-Secret": settings.INTERNAL_AUTH_SECRET,
            "Content-Type": "application/json"
        }
        payload = {
            "image_base64": image_base64,
            "user_preferences": user_preferences
        }

        try:
            response = requests.post(fastapi_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({
                "error": "Failed to connect to AI Service",
                "details": str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class AIGenerateRecipeView(APIView):
    def post(self, request):
        user_preferences = get_ai_user_preferences(request.user)
        fastapi_url = f"{settings.FASTAPI_SERVICE_URL}/ai/generate-recipe"
        headers = {
            "X-Internal-Secret": settings.INTERNAL_AUTH_SECRET,
            "Content-Type": "application/json"
        }
        payload = {
            "ingredients": request.data.get("ingredients", []),
            "user_preferences": user_preferences
        }

        try:
            response = requests.post(fastapi_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({
                "error": "Failed to connect to AI Service",
                "details": str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class AISubstituteIngredientView(APIView):
    def post(self, request):
        user_preferences = get_ai_user_preferences(request.user)
        fastapi_url = f"{settings.FASTAPI_SERVICE_URL}/ai/substitute-ingredient"
        headers = {
            "X-Internal-Secret": settings.INTERNAL_AUTH_SECRET,
            "Content-Type": "application/json"
        }
        payload = {
            "ingredient": request.data.get("ingredient"),
            "reason": request.data.get("reason", "unknown"),
            "user_preferences": user_preferences
        }

        try:
            response = requests.post(fastapi_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({
                "error": "Failed to connect to AI Service",
                "details": str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class AIGroceryListView(APIView):
    def post(self, request):
        user_preferences = get_ai_user_preferences(request.user)
        fastapi_url = f"{settings.FASTAPI_SERVICE_URL}/ai/create-grocery-list"
        headers = {
            "X-Internal-Secret": settings.INTERNAL_AUTH_SECRET,
            "Content-Type": "application/json"
        }
        payload = {
            "recipes": request.data.get("recipes", []),
            "user_preferences": user_preferences
        }

        try:
            response = requests.post(fastapi_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({
                "error": "Failed to connect to AI Service",
                "details": str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class AINutritionalAnalysisView(APIView):
    def post(self, request):
        user_preferences = get_ai_user_preferences(request.user)
        fastapi_url = f"{settings.FASTAPI_SERVICE_URL}/ai/nutritional-analysis"
        headers = {
            "X-Internal-Secret": settings.INTERNAL_AUTH_SECRET,
            "Content-Type": "application/json"
        }
        payload = {
            "recipe": request.data.get("recipe"),
            "user_preferences": user_preferences
        }

        try:
            response = requests.post(fastapi_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({
                "error": "Failed to connect to AI Service",
                "details": str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class AIGenerateMealPlanView(APIView):
    def post(self, request):
        user_preferences = get_ai_user_preferences(request.user)
        fastapi_url = f"{settings.FASTAPI_SERVICE_URL}/ai/meal-planning"
        headers = {
            "X-Internal-Secret": settings.INTERNAL_AUTH_SECRET,
            "Content-Type": "application/json"
        }
        payload = {
            "days": request.data.get("days", 7),
            "user_preferences": user_preferences
        }

        try:
            response = requests.post(fastapi_url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return Response(response.json(), status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            return Response({
                "error": "Failed to connect to AI Service",
                "details": str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            
            