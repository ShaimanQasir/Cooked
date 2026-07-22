from rest_framework import serializers
from .models import (
    UserProfile, DietaryPreference, Allergy, 
    Ingredient, Cuisine, Equipment, HealthGoal
)

# --- Auxiliary Serializers (For Reading Data) ---

class DietaryPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietaryPreference
        fields = ['id', 'name']

class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ['id', 'name']

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name']

class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = ['id', 'name']

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = ['id', 'name']

class HealthGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthGoal
        fields = ['id', 'name']

# --- Main UserProfile Serializer ---

class UserProfileSerializer(serializers.ModelSerializer):
    # Change these to ListFields so they accept arrays of Strings from the frontend
    dietary_preferences = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    allergies = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    disliked_ingredients = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    preferred_cuisines = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    kitchen_equipment = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    health_goals = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)

    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'onboarding_step', 'is_onboarding_complete','language', 'primary_region', 'country', 'measurement_system',
            'referral_source', 'dietary_preferences', 'allergies',
            'disliked_ingredients', 'cooking_frequency', 'skill_level',
            'preferred_cooking_time', 'household_size', 'preferred_cuisines',
            'kitchen_equipment', 'meal_planning_preference', 'notifications_enabled',
            'health_goals', 'activity_level', 'weight_goal', 'current_weight',
            'target_weight', 'current_height', 'date_of_birth', 'gender',
            'progress_percentage', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def _handle_many_to_many_names(self, instance, field_name, model_class, names_list):
        """Helper to get_or_create records by name and link them to the instance"""
        if names_list is not None:
            objs = []
            for name in names_list:
                # Clean the name: strip whitespace and capitalize properly
                clean_name = name.strip().title()
                if clean_name:
                    obj, _ = model_class.objects.get_or_create(name=clean_name)
                    objs.append(obj)
            
            # Set the many-to-many relationship
            getattr(instance, field_name).set(objs)

    def update(self, instance, validated_data):
        # 1. Extract the many-to-many data before standard update
        m2m_fields = {
            'dietary_preferences': DietaryPreference,
            'allergies': Allergy,
            'disliked_ingredients': Ingredient,
            'preferred_cuisines': Cuisine,
            'kitchen_equipment': Equipment,
            'health_goals': HealthGoal,
        }
        
        # Dictionary to store the extracted lists
        extracted_data = {}
        for field in m2m_fields.keys():
            if field in validated_data:
                extracted_data[field] = validated_data.pop(field)

        # 2. Update the standard fields (phone, weight, etc.)
        instance = super().update(instance, validated_data)

        # 3. Handle the many-to-many on-the-fly creation
        for field, model in m2m_fields.items():
            if field in extracted_data:
                self._handle_many_to_many_names(
                    instance, field, model, extracted_data[field]
                )

        return instance

    def to_representation(self, instance):
        """
        Convert Many-to-Many managers to simple lists of strings (names) 
        for the GET response.
        """
        representation = super().to_representation(instance)
        
        # These fields are ManyRelatedManagers, we need to call .all() 
        # and extract the names for the frontend.
        m2m_fields = [
            'dietary_preferences', 'allergies', 'disliked_ingredients',
            'preferred_cuisines', 'kitchen_equipment', 'health_goals'
        ]
        
        for field in m2m_fields:
            manager = getattr(instance, field)
            representation[field] = [obj.name for obj in manager.all()]
            
        return representation
