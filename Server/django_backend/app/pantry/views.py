from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import PantryItem
from .serializers import PantryItemSerializer
from app.recipe.permissions import IsAuthorOrReadOnly

class PantryItemListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_scope = 'pantry'

    def get(self, request):
        items = PantryItem.objects.filter(user=request.user)
        serializer = PantryItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PantryItemSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PantryItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    throttle_scope = 'pantry'

    def get_object(self, pk):
        obj = get_object_or_404(PantryItem, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def get(self, request, pk):
        item = self.get_object(pk)
        serializer = PantryItemSerializer(item)
        return Response(serializer.data)

    def patch(self, request, pk):
        item = self.get_object(pk)
        serializer = PantryItemSerializer(item, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = self.get_object(pk)
        item.delete()
        return Response({"message": "Pantry item deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
