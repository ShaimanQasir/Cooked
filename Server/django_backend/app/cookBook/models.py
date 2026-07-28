from django.db import models
from django.conf import settings
from app.recipe.models import Recipe

# Create your models here.
class CookBook(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    image = models.ImageField(upload_to='cookbook_images/', null=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cookbooks')
    
    recipes = models.ManyToManyField(Recipe, through='CookBookRecipes', related_name='cookbooks') 


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    @property
    def recipes_count(self):
        return self.recipes.count()

# --- Centralized Cloudinary Auto Cleanup Signal Binding ---
# Automatically destroys old cookbook cover images on update and deletion
from utils.cloudinary_service import register_cloudinary_signals
register_cloudinary_signals(CookBook, 'image')


class CookBookRecipes(models.Model):
    cookbook = models.ForeignKey(CookBook, on_delete=models.CASCADE, related_name='cookbook_recipes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='recipe_cookbooks')
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.recipe.title} in {self.cookbook.name}"
    
    class Meta:
        unique_together = ('cookbook', 'recipe')

# --- Redis Cache Invalidation Signals ---
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from utils.cache_service import invalidate_cookbook_caches

@receiver([post_save, post_delete], sender=CookBook)
def clear_cookbook_cache_on_change(sender, instance, **kwargs):
    invalidate_cookbook_caches()

@receiver([post_save, post_delete], sender=CookBookRecipes)
def clear_cookbook_recipes_cache_on_change(sender, instance, **kwargs):
    invalidate_cookbook_caches()

