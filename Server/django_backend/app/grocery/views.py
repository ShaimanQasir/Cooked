from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from app.recipe.permissions import IsAuthorOrReadOnly
from .models import GroceryItem
from .serializers import GroceryItemSerializer


class GroceryItemListCreateView(APIView):
    """
    List all grocery items for the authenticated user, or create a new grocery item.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Enforce that users can only see their own grocery items
        items = GroceryItem.objects.filter(user=request.user)
        serializer = GroceryItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Pass request context so user field defaults to request.user
        serializer = GroceryItemSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroceryItemDetailView(APIView):
    """
    Retrieve, update (PATCH), or delete a single grocery item.
    Permission is restricted to the owner of the grocery item.
    """
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]

    def get_object(self, pk):
        obj = get_object_or_404(GroceryItem, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def get(self, request, pk):
        item = self.get_object(pk)
        serializer = GroceryItemSerializer(item)
        return Response(serializer.data)

    def patch(self, request, pk):
        item = self.get_object(pk)
        serializer = GroceryItemSerializer(item, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = self.get_object(pk)
        item.delete()
        return Response({"message": "Grocery item deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
