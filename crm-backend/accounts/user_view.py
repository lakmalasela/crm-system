from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class UserView(APIView):
    """
    Get current user information
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from accounts.serializers import UserSerializer
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
