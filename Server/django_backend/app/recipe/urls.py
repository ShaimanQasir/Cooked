from django.urls import path
from .views import (
    RecipeListCreateView, RecipeDetailView, 
    SavedRecipeListCreateView, SavedRecipeDetailView,
    RatingListCreateView, RatingDetailView,
    RecipeLikeView, RecipeDislikeView, RecipeArchiveView
)

urlpatterns = [
    # Recipe Endpoints
    path('recipes/', RecipeListCreateView.as_view(), name='recipe-list'),
    path('recipes/<int:pk>/', RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/<int:pk>/like/', RecipeLikeView.as_view(), name='recipe-like'),
    path('recipes/<int:pk>/dislike/', RecipeDislikeView.as_view(), name='recipe-dislike'),
    path('recipes/<int:pk>/archive/', RecipeArchiveView.as_view(), name='recipe-archive'),
    
    # Saved Recipe Endpoints
    path('saved/', SavedRecipeListCreateView.as_view(), name='saved-list'),
    path('saved/<int:pk>/', SavedRecipeDetailView.as_view(), name='saved-detail'),
    
    # Rating Endpoints
    path('ratings/', RatingListCreateView.as_view(), name='rating-list'),
    path('ratings/<int:pk>/', RatingDetailView.as_view(), name='rating-detail'),
]
