from rest_framework import serializers
from .models import Recipe, SavedRecipe, RecipeRating, Ingredient, RecipeIngredient
from app.userProfile.models import Cuisine, Allergy
from django.contrib.auth import get_user_model

User = get_user_model()

# --- Basic User Serializer ---
class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_picture']

# --- New: Recipe Ingredient Serializer ---
class RecipeIngredientSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='ingredient.name')

    class Meta:
        model = RecipeIngredient
        fields = ['name', 'quantity', 'unit']

# --- Recipe Serializer ---
class RecipeSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_disliked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    # Ingredients now uses a nested serializer to include quantity/unit
    ingredients = RecipeIngredientSerializer(source='ingredient_details', many=True, required=False)
    
    # We still handle on-the-fly allergens and cuisine
    allergen_info = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    cuisine_type = serializers.CharField(required=False, write_only=True)
    
    author = UserSummarySerializer(read_only=True)

    class Meta:
        model = Recipe
        fields = '__all__'
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_dislikes_count(self, obj):
        return obj.dislikes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_is_disliked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.dislikes.filter(id=request.user.id).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Allergen and Cuisine representation
        representation['allergen_info'] = [a.name for a in instance.allergen_info.all()]
        if instance.cuisine_type:
            representation['cuisine_type'] = instance.cuisine_type.name
        return representation

    def _handle_recipe_logic(self, instance, validated_data):
        """Helper to handle ingredients, allergens, and cuisine"""
        ingredients_data = self.initial_data.get('ingredients') # Use initial_data for nested custom logic
        allergens_data = validated_data.pop('allergen_info', None)
        cuisine_name = validated_data.pop('cuisine_type', None)

        # 1. Handle Ingredients with Quantities
        if ingredients_data is not None:
            # Clear existing ingredients for update
            instance.ingredient_details.all().delete()
            for item in ingredients_data:
                ing_obj, _ = Ingredient.objects.get_or_create(name=item['name'].strip().title())
                RecipeIngredient.objects.create(
                    recipe=instance,
                    ingredient=ing_obj,
                    quantity=item.get('quantity', 0),
                    unit=item.get('unit', '')
                )

        # 2. Handle Allergens
        if allergens_data is not None:
            allergen_objs = []
            for name in allergens_data:
                obj, _ = Allergy.objects.get_or_create(name=name.strip().title())
                allergen_objs.append(obj)
            instance.allergen_info.set(allergen_objs)

        # 3. Handle Cuisine
        if cuisine_name:
            cuisine_obj, _ = Cuisine.objects.get_or_create(name=cuisine_name.strip().title())
            instance.cuisine_type = cuisine_obj
            instance.save()

    def create(self, validated_data):
        # 1. Extract the complex data so Django doesn't crash during the simple create
        ingredients = self.initial_data.get('ingredients', [])
        allergens = validated_data.pop('allergen_info', [])
        cuisine_name = validated_data.pop('cuisine_type', None)
        validated_data.pop('ingredient_details', None) # Safety pop

        # 2. Create the Recipe without the complex fields
        recipe = Recipe.objects.create(**validated_data)
        
        # 3. Add the data back to a dictionary for our helper to handle
        logic_data = {
            'ingredients': ingredients,
            'allergen_info': allergens,
            'cuisine_type': cuisine_name
        }
        
        self._handle_recipe_logic(recipe, logic_data)
        return recipe

    def update(self, instance, validated_data):
        # 1. Extract the complex data
        allergens = validated_data.pop('allergen_info', None)
        cuisine_name = validated_data.pop('cuisine_type', None)
        validated_data.pop('ingredient_details', None) # Safety pop

        # 2. Run the logic helper
        logic_data = {
            'ingredients': self.initial_data.get('ingredients'), # Pull from initial_data for quantities
            'allergen_info': allergens,
            'cuisine_type': cuisine_name
        }
        self._handle_recipe_logic(instance, logic_data)

        # 3. Continue with standard update for simple fields
        return super().update(instance, validated_data)

# --- Saved Recipe Serializer ---
class SavedRecipeSerializer(serializers.ModelSerializer):
    recipe_details = RecipeSerializer(source='recipe', read_only=True)
    
    class Meta:
        model = SavedRecipe
        fields = ['id', 'user', 'recipe', 'recipe_details', 'created_at']
        read_only_fields = ('id', 'user', 'created_at')

# --- Rating Serializer ---
class RecipeRatingSerializer(serializers.ModelSerializer):
    user = UserSummarySerializer(read_only=True)

    class Meta:
        model = RecipeRating
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at')