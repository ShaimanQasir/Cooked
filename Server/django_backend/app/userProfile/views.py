from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View to retrieve and update the current user's profile.
    Uses 'me' logic to automatically identify the user from the JWT token.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Automatically get the profile for the logged-in user
        # Our signal ensures that every User has a Profile.
        return self.request.user.profile

    def update(self, request, *args, **kwargs):
        # Support partial updates (PATCH) by default
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
