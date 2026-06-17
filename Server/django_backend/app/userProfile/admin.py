from django.contrib import admin
from .models import (
    UserProfile, DietaryPreference, Allergy, 
    Ingredient, Cuisine, Equipment, HealthGoal
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'onboarding_step', 'is_onboarding_complete', 'created_at')
    list_filter = ('is_onboarding_complete', 'onboarding_step')
    search_fields = ('user__email',)

admin.site.register(DietaryPreference)
admin.site.register(Allergy)
admin.site.register(Ingredient)
admin.site.register(Cuisine)
admin.site.register(Equipment)
admin.site.register(HealthGoal)
