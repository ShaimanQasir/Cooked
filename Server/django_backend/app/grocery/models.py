from django.db import models
from django.conf import settings
from app.recipe.models import Recipe


class GroceryItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grocery_items'
    )
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='grocery_items'
    )
    list_name = models.CharField(max_length=200, default='Custom Items', blank=True)
    name = models.CharField(max_length=200, null=False, blank=False)
    quantity = models.CharField(max_length=100, blank=True, null=True, default='')
    unit = models.CharField(max_length=50, blank=True)
    is_checked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} in {self.list_name} for {self.user.username}"

# --- Redis Cache Invalidation Signals ---
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from utils.cache_service import invalidate_grocery_caches

@receiver([post_save, post_delete], sender=GroceryItem)
def clear_grocery_cache_on_change(sender, instance, **kwargs):
    invalidate_grocery_caches(user_id=instance.user_id if instance else None)

