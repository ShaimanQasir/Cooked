from django.urls import path
from .views import GroceryItemListCreateView, GroceryItemDetailView

urlpatterns = [
    path('', GroceryItemListCreateView.as_view(), name='grocery-list'),
    path('<int:pk>/', GroceryItemDetailView.as_view(), name='grocery-detail'),
]
