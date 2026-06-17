from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from app.recipe.models import Recipe
from app.recipe.serializers import RecipeSerializer, UserSummarySerializer
from .models import CookBook, CookBookRecipes

User = get_user_model()


# =====================================================================
# READ SERIALIZERS (Nested, detailed representations)
# =====================================================================

class CookBookRecipeReadSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for recipes inside a cookbook, including
    fields from the custom Many-to-Many through table (e.g. order, date added).
    """
    recipe = RecipeSerializer(read_only=True)

    class Meta:
        model = CookBookRecipes
        fields = ['recipe', 'order', 'added_at', 'updated_at']


class CookBookReadSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for displaying a cookbook, featuring nested
    author information, a full list of recipes with ordering, and the total count.
    """
    author = UserSummarySerializer(read_only=True)
    recipes = CookBookRecipeReadSerializer(source='cookbook_recipes', many=True, read_only=True)
    recipes_count = serializers.ReadOnlyField()

    class Meta:
        model = CookBook
        fields = [
            'id',
            'name',
            'description',
            'image',
            'author',
            'recipes',
            'recipes_count',
            'created_at',
            'updated_at',
        ]


# =====================================================================
# WRITE SERIALIZERS (Input validation, M2M management, transactions)
# =====================================================================

class CookBookRecipeWriteSerializer(serializers.Serializer):
    """
    Write serializer for intermediate Recipe mappings.
    Supports passing either 'recipe' (standard DRF pattern) or 'recipe_id' (common frontend pattern).
    """
    recipe = serializers.PrimaryKeyRelatedField(
        queryset=Recipe.objects.all(),
        required=False
    )
    recipe_id = serializers.PrimaryKeyRelatedField(
        queryset=Recipe.objects.all(),
        required=False,
        write_only=True
    )
    order = serializers.IntegerField(default=0, required=False)

    def validate(self, data):
        # Allow both 'recipe' and 'recipe_id' inputs for flexibility
        recipe = data.get('recipe') or data.get('recipe_id')
        if not recipe:
            raise serializers.ValidationError("Either 'recipe' or 'recipe_id' must be provided.")
        data['recipe'] = recipe
        data.pop('recipe_id', None)  # Clean up alias
        return data


class CookBookWriteSerializer(serializers.ModelSerializer):
    """
    Writable serializer for creating and updating cookbooks.
    Handles user verification, default author assignment, and transactional updates
    to the custom Many-to-Many through table.
    """
    recipes = CookBookRecipeWriteSerializer(many=True, required=False, write_only=True)
    author = UserSummarySerializer(read_only=True)

    class Meta:
        model = CookBook
        fields = [
            'id',
            'name',
            'description',
            'image',
            'author',
            'recipes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def validate(self, attrs):
        # 1. Determine the author (either from the request context or direct data)
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            user = request.user
        else:
            user = attrs.get('author')

        # 2. Enforce verified author business logic
        if user:
            if not getattr(user, 'is_verified', False):
                raise serializers.ValidationError({"author": "Author must be a verified user."})
            attrs['author'] = user
        else:
            # If creating a new instance and no user context is available
            if not self.instance:
                raise serializers.ValidationError({"author": "Author is required."})

        return attrs

    def create(self, validated_data):
        recipes_data = validated_data.pop('recipes', [])

        # Wrap in an atomic database transaction to prevent partial data writes
        with transaction.atomic():
            cookbook = CookBook.objects.create(**validated_data)

            # Create the many-to-many through relationships
            for index, recipe_item in enumerate(recipes_data):
                recipe = recipe_item['recipe']
                # Default order to position in array if not provided
                order = recipe_item.get('order', index)

                CookBookRecipes.objects.get_or_create(
                    cookbook=cookbook,
                    recipe=recipe,
                    defaults={'order': order}
                )

            return cookbook

    def update(self, instance, validated_data):
        recipes_data = validated_data.pop('recipes', None)

        # Wrap in an atomic database transaction
        with transaction.atomic():
            cookbook = super().update(instance, validated_data)

            if recipes_data is not None:
                # 1. Clear existing cookbook-recipe relations
                cookbook.cookbook_recipes.all().delete()

                # 2. Re-create new relations according to the payload
                for index, recipe_item in enumerate(recipes_data):
                    recipe = recipe_item['recipe']
                    order = recipe_item.get('order', index)

                    CookBookRecipes.objects.get_or_create(
                        cookbook=cookbook,
                        recipe=recipe,
                        defaults={'order': order}
                    )

            return cookbook
