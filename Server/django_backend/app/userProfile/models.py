from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

# --- Auxiliary Models (Normalization) ---

class DietaryPreference(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Allergy(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name_plural = "Allergies"

    def __str__(self):
        return self.name

class Ingredient(models.Model):
    """Unified Ingredient model used across Profile and Recipes"""
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Cuisine(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Equipment(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name_plural = "Equipment"

    def __str__(self):
        return self.name

class HealthGoal(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# --- Choice Enums ---

class UserProfile(models.Model):
    class CookingFrequency(models.TextChoices):
        DAILY = 'DAILY', 'Daily'
        FEW_TIMES_WEEK = 'FEW_TIMES_WEEK', 'A few times a week'
        WEEKENDS = 'WEEKENDS', 'Only on weekends'
        RARELY = 'RARELY', 'Rarely'

    class SkillLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        PRO = 'PRO', 'Professional'

    class CookingTime(models.TextChoices):
        UNDER_15 = 'UNDER_15', 'Under 15 mins'
        UNDER_30 = 'UNDER_30', 'Under 30 mins'
        UNDER_60 = 'UNDER_60', 'Under 60 mins'
        ANY_TIME = 'ANY_TIME', 'I have plenty of time'

    class HouseholdSize(models.TextChoices):
        SOLO = 'SOLO', 'Just me'
        COUPLE = 'COUPLE', 'Two people'
        SMALL_FAMILY = 'SMALL_FAMILY', '3-4 people'
        LARGE_FAMILY = 'LARGE_FAMILY', '5+ people'

    class MealPlanning(models.TextChoices):
        DAILY = 'DAILY', 'Daily'
        WEEKLY = 'WEEKLY', 'Weekly'
        FLEXIBLE = 'FLEXIBLE', 'I am flexible'

    class ActivityLevel(models.TextChoices):
        SEDENTARY = 'SEDENTARY', 'Sedentary (Little to no exercise)'
        LIGHT = 'LIGHT', 'Lightly Active'
        MODERATE = 'MODERATE', 'Moderately Active'
        VERY_ACTIVE = 'VERY_ACTIVE', 'Very Active'
        EXTREME = 'EXTREME', 'Extra Active'

    class WeightGoal(models.TextChoices):
        LOSE = 'LOSE', 'Lose Weight'
        MAINTAIN = 'MAINTAIN', 'Maintain Weight'
        GAIN = 'GAIN', 'Gain Weight'

    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'
        PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY', 'Prefer not to say'

    class MeasurementSystem(models.TextChoices):
        METRIC = 'METRIC', 'Metric (kg, cm)'
        IMPERIAL = 'IMPERIAL', 'Imperial (lb, ft/in)'

    # --- Core Fields ---
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='profile'
    )
    onboarding_step = models.PositiveSmallIntegerField(default=1)
    is_onboarding_complete = models.BooleanField(default=False)

    # Step 1: Basic Details (Additional to User model)
    
    
    # Step 2: Language & Region
    language = models.CharField(max_length=50, default='English')
    primary_region = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    measurement_system = models.CharField(
        max_length=10, 
        choices=MeasurementSystem.choices, 
        default=MeasurementSystem.METRIC
    )

    # Step 3: Referral
    referral_source = models.CharField(max_length=100, blank=True)

    # Step 4: Dietary Profile
    dietary_preferences = models.ManyToManyField(DietaryPreference, blank=True)

    # Step 5: Allergies
    allergies = models.ManyToManyField(Allergy, blank=True)

    # Step 6: Disliked Ingredients
    disliked_ingredients = models.ManyToManyField(Ingredient, blank=True)

    # Step 7-10: Lifestyle & Cooking
    cooking_frequency = models.CharField(
        max_length=20, choices=CookingFrequency.choices, blank=True
    )
    skill_level = models.CharField(
        max_length=20, choices=SkillLevel.choices, blank=True
    )
    preferred_cooking_time = models.CharField(
        max_length=20, choices=CookingTime.choices, blank=True
    )
    household_size = models.CharField(
        max_length=20, choices=HouseholdSize.choices, blank=True
    )

    # Step 11: Cuisines
    preferred_cuisines = models.ManyToManyField(Cuisine, blank=True)

    # Step 12: Equipment
    kitchen_equipment = models.ManyToManyField(Equipment, blank=True)

    # Step 13: Meal Planning
    meal_planning_preference = models.CharField(
        max_length=20, choices=MealPlanning.choices, blank=True
    )

    # Step 14: Notifications
    notifications_enabled = models.BooleanField(default=True)

    # Step 15-22: Health & Physical (For AI calculations)
    health_goals = models.ManyToManyField(HealthGoal, blank=True)
    activity_level = models.CharField(
        max_length=20, choices=ActivityLevel.choices, blank=True
    )
    weight_goal = models.CharField(
        max_length=20, choices=WeightGoal.choices, blank=True
    )
    
    current_weight = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="In kg or lb based on measurement_system"
    )
    target_weight = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    current_height = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="In cm or inches"
    )
    
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=20, choices=Gender.choices, blank=True
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.email}"

    @property
    def progress_percentage(self):
        return (self.onboarding_step / 22) * 100

