from django.contrib import admin
from .models import PantryItem

@admin.register(PantryItem)
class PantryItemAdmin(admin.ModelAdmin):
    list_display = ('ingredient', 'user', 'quantity', 'unit', 'expiry_date')
    list_filter = ('user', 'expiry_date')
    search_fields = ('ingredient__name', 'user__email')
