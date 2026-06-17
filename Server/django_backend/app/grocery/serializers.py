from rest_framework import serializers
from .models import GroceryItem
from app.recipe.serializers import RecipeSerializer


class GroceryItemSerializer(serializers.ModelSerializer):
    recipe_details = RecipeSerializer(source='recipe', read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = GroceryItem
        fields = [
            'id',
            'user',
            'recipe',
            'recipe_details',
            'name',
            'quantity',
            'unit',
            'is_checked',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
