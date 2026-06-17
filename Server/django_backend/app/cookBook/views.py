from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from app.recipe.permissions import IsAuthorOrReadOnly
from .models import CookBook
from .serializers import CookBookReadSerializer, CookBookWriteSerializer


class CookBookListCreateView(APIView):
    """
    List all cookbooks (ReadSerializer) or create a new cookbook (WriteSerializer).
    The author is automatically set to the authenticated user and must be verified.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        cookbooks = CookBook.objects.all()
        serializer = CookBookReadSerializer(cookbooks, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Pass request context so write serializer can access request.user and its validation
        serializer = CookBookWriteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            cookbook = serializer.save()
            # Return the detailed read representation of the created cookbook
            read_serializer = CookBookReadSerializer(cookbook)
            return Response(read_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CookBookDetailView(APIView):
    """
    Retrieve, update or delete a cookbook instance.
    Only the author can update or delete.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def get_object(self, pk):
        obj = get_object_or_404(CookBook, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def get(self, request, pk):
        cookbook = self.get_object(pk)
        serializer = CookBookReadSerializer(cookbook)
        return Response(serializer.data)

    def patch(self, request, pk):
        cookbook = self.get_object(pk)
        serializer = CookBookWriteSerializer(cookbook, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_cookbook = serializer.save()
            # Return the detailed read representation
            read_serializer = CookBookReadSerializer(updated_cookbook)
            return Response(read_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        cookbook = self.get_object(pk)
        cookbook.delete()
        return Response({"message": "Cookbook deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
