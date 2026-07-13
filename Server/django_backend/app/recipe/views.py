from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import Recipe, SavedRecipe, RecipeRating
from .serializers import (
    RecipeSerializer, SavedRecipeSerializer, RecipeRatingSerializer
)
from .permissions import IsAuthorOrReadOnly

# --- RECIPE VIEWS ---
class RecipeListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    throttle_scope = 'recipe'
    def get(self, request):
        recipes = Recipe.objects.all()
        serializer = RecipeSerializer(recipes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RecipeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecipeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    throttle_scope = 'recipe'
    def get_object(self, pk):
        obj = get_object_or_404(Recipe, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def get(self, request, pk):
        recipe = self.get_object(pk)
        serializer = RecipeSerializer(recipe)
        return Response(serializer.data)

    def patch(self, request, pk):
        recipe = self.get_object(pk)
        serializer = RecipeSerializer(recipe, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        recipe = self.get_object(pk)
        recipe.delete()
        return Response({"message": "Recipe deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# --- SAVED RECIPE VIEWS ---
class SavedRecipeListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'recipe'
    def get(self, request):
        # Filter: Only show the logged-in user's saved recipes
        saves = SavedRecipe.objects.filter(user=request.user)
        serializer = SavedRecipeSerializer(saves, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SavedRecipeSerializer(data=request.data)
        if serializer.is_valid():
            # Check if already saved to prevent DB errors
            if SavedRecipe.objects.filter(user=request.user, recipe=serializer.validated_data['recipe']).exists():
                return Response({"error": "Recipe already saved"}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SavedRecipeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    throttle_scope = 'recipe'
    def get_object(self, pk):
        obj = get_object_or_404(SavedRecipe, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def delete(self, request, pk):
        save = self.get_object(pk)
        save.delete()
        return Response({"message": "Recipe unsaved"}, status=status.HTTP_204_NO_CONTENT)


# --- RATING VIEWS ---
class RatingListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    throttle_scope = 'recipe'
    def get(self, request):
        ratings = RecipeRating.objects.all()
        serializer = RecipeRatingSerializer(ratings, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RecipeRatingSerializer(data=request.data)
        if serializer.is_valid():
            # Check if user already rated this recipe
            existing = RecipeRating.objects.filter(user=request.user, recipe=serializer.validated_data['recipe']).first()
            if existing:
                return Response({"error": "You have already rated this recipe. Use PATCH to update it."}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RatingDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    throttle_scope = 'recipe'
    def get_object(self, pk):
        obj = get_object_or_404(RecipeRating, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def patch(self, request, pk):
        rating = self.get_object(pk)
        serializer = RecipeRatingSerializer(rating, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        rating = self.get_object(pk)
        rating.delete()
        return Response({"message": "Rating deleted"}, status=status.HTTP_204_NO_CONTENT)
