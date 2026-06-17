from django.contrib import admin
from .models import CookBook, CookBookRecipes

class CookBookRecipesInline(admin.TabularInline):
    model = CookBookRecipes
    extra = 1

@admin.register(CookBook)
class CookBookAdmin(admin.ModelAdmin):
    list_display = ('name', 'author', 'recipes_count', 'created_at')
    search_fields = ('name', 'author__email')
    inlines = [CookBookRecipesInline]

@admin.register(CookBookRecipes)
class CookBookRecipesAdmin(admin.ModelAdmin):
    list_display = ('cookbook', 'recipe', 'order', 'added_at')
    list_filter = ('cookbook', 'recipe')
