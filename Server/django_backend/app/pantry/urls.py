from django.urls import path
from .views import PantryItemListCreateView, PantryItemDetailView

urlpatterns = [
    path('', PantryItemListCreateView.as_view(), name='pantry-list'),
    path('<int:pk>/', PantryItemDetailView.as_view(), name='pantry-detail'),
]
