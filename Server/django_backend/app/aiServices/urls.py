from django.urls import path
from .views import (
    AIScanImageView, 
    AIGenerateRecipeView, 
    AISubstituteIngredientView, 
    AIGroceryListView, 
    AINutritionalAnalysisView, 
    AIGenerateMealPlanView,
    AIGeneratePantryRecipesView
)

urlpatterns = [
    path('scan-image/', AIScanImageView.as_view(), name='ai-scan-image'),
    path('generate-recipe/', AIGenerateRecipeView.as_view(), name='ai-generate-recipe'),
    path('generate-pantry-recipes/', AIGeneratePantryRecipesView.as_view(), name='ai-generate-pantry-recipes'),
    path('substitute-ingredient/', AISubstituteIngredientView.as_view(), name='ai-substitute-ingredient'),
    path('create-grocery-list/', AIGroceryListView.as_view(), name='ai-create-grocery-list'),
    path('nutritional-analysis/', AINutritionalAnalysisView.as_view(), name='ai-nutritional-analysis'),
    path('generate-meal-plan/', AIGenerateMealPlanView.as_view(), name='ai-generate-meal-plan'),
]
