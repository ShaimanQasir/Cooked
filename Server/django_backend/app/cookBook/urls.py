from django.urls import path
from .views import CookBookListCreateView, CookBookDetailView

urlpatterns = [
    path('', CookBookListCreateView.as_view(), name='cookbook-list'),
    path('<int:pk>/', CookBookDetailView.as_view(), name='cookbook-detail'),
]
