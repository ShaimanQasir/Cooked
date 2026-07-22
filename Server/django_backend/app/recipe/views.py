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
        if request.user.is_authenticated:
            from django.db.models import Q
            recipes = Recipe.objects.filter(Q(is_public=True) | Q(author=request.user)).order_by('-created_at')
        else:
            recipes = Recipe.objects.filter(is_public=True).order_by('-created_at')
        serializer = RecipeSerializer(recipes, many=True, context={'request': request})
        data = serializer.data
        return Response({
            'count': len(data),
            'next': None,
            'previous': None,
            'results': data,
        })

    def post(self, request):
        serializer = RecipeSerializer(data=request.data, context={'request': request})
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
        serializer = RecipeSerializer(recipe, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        recipe = self.get_object(pk)
        serializer = RecipeSerializer(recipe, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        recipe = self.get_object(pk)
        recipe.delete()
        return Response({"message": "Recipe deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class RecipeLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        recipe = get_object_or_404(Recipe, pk=pk)
        if not recipe.is_public and recipe.author != request.user:
            return Response(
                {"error": "Private recipes cannot be liked."},
                status=status.HTTP_403_FORBIDDEN
            )
        if recipe.likes.filter(id=request.user.id).exists():
            recipe.likes.remove(request.user)
            liked = False
        else:
            recipe.likes.add(request.user)
            recipe.dislikes.remove(request.user)
            liked = True
        return Response({
            "liked": liked,
            "likes_count": recipe.likes.count(),
            "dislikes_count": recipe.dislikes.count()
        }, status=status.HTTP_200_OK)


class RecipeDislikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        recipe = get_object_or_404(Recipe, pk=pk)
        if not recipe.is_public and recipe.author != request.user:
            return Response(
                {"error": "Private recipes cannot be disliked."},
                status=status.HTTP_403_FORBIDDEN
            )
        if recipe.dislikes.filter(id=request.user.id).exists():
            recipe.dislikes.remove(request.user)
            disliked = False
        else:
            recipe.dislikes.add(request.user)
            recipe.likes.remove(request.user)
            disliked = True
        return Response({
            "disliked": disliked,
            "likes_count": recipe.likes.count(),
            "dislikes_count": recipe.dislikes.count()
        }, status=status.HTTP_200_OK)


class RecipeArchiveView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]

    def post(self, request, pk):
        recipe = get_object_or_404(Recipe, pk=pk)
        self.check_object_permissions(request, recipe)
        recipe.is_archived = not recipe.is_archived
        recipe.save()
        return Response({
            "archived": recipe.is_archived,
            "message": f"Recipe {'archived' if recipe.is_archived else 'unarchived'} successfully"
        }, status=status.HTTP_200_OK)


# --- SAVED RECIPE VIEWS ---
class SavedRecipeListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'recipe'

    def get(self, request):
        saves = SavedRecipe.objects.filter(user=request.user).order_by('-created_at')
        serializer = SavedRecipeSerializer(saves, many=True, context={'request': request})
        data = serializer.data
        return Response({
            'count': len(data),
            'next': None,
            'previous': None,
            'results': data,
        })

    def post(self, request):
        serializer = SavedRecipeSerializer(data=request.data)
        if serializer.is_valid():
            recipe = serializer.validated_data['recipe']
            if not recipe.is_public and recipe.author != request.user:
                return Response(
                    {"error": "Private recipes cannot be saved."},
                    status=status.HTTP_403_FORBIDDEN
                )
            if SavedRecipe.objects.filter(user=request.user, recipe=recipe).exists():
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
        recipe_id = request.query_params.get('recipe')
        ratings = RecipeRating.objects.filter(recipe_id=recipe_id) if recipe_id else RecipeRating.objects.all()
        serializer = RecipeRatingSerializer(ratings, many=True)
        data = serializer.data
        return Response({
            'count': len(data),
            'next': None,
            'previous': None,
            'results': data,
        })

    def post(self, request):
        serializer = RecipeRatingSerializer(data=request.data)
        if serializer.is_valid():
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
