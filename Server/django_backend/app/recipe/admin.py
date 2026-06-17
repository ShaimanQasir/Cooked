from django.contrib import admin
from .models import Recipe, SavedRecipe, RecipeRating, RecipeIngredient

class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'cuisine_type', 'difficulty', 'created_at')
    list_filter = ('difficulty', 'cuisine_type', 'is_public')
    search_fields = ('title', 'description', 'author__email')
    inlines = [RecipeIngredientInline]

admin.site.register(SavedRecipe)
admin.site.register(RecipeRating)
