from rest_framework import serializers
from .models import PantryItem
from app.userProfile.models import Ingredient

class PantryItemSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient = serializers.PrimaryKeyRelatedField(queryset=Ingredient.objects.all(), write_only=True, required=False)
    name = serializers.CharField(write_only=True, required=False) # For creating by name

    class Meta:
        model = PantryItem
        fields = [
            'id', 'ingredient', 'ingredient_name', 'name', 
            'quantity', 'unit', 'expiry_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        name = validated_data.pop('name', None)
        ingredient = validated_data.get('ingredient')
        
        if not ingredient and name:
            ingredient, _ = Ingredient.objects.get_or_create(name=name.strip().title())
            validated_data['ingredient'] = ingredient
        elif not ingredient:
             raise serializers.ValidationError("Either 'ingredient' (ID) or 'name' must be provided.")

        user = self.context['request'].user
        return PantryItem.objects.create(user=user, **validated_data)
