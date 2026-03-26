from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer
from .services import AuthService

class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "User created"})


class LoginView(APIView):

    def post(self, request):
        data = AuthService.login(
            request.data.get("username"),
            request.data.get("password")
        )
        return Response(data)


class RefreshTokenView(APIView):
    """
    Refresh JWT access token
    """
    
    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        
        if not refresh_token:
            return Response({
                "success": False,
                "error": "Refresh token is required",
                "status_code": 400
            }, status=400)
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            return Response({
                "success": True,
                "data": {
                    "access_token": access_token,
                    "refresh_token": refresh_token
                },
                "message": "Token refreshed successfully"
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": "Invalid or expired refresh token",
                "status_code": 401
            }, status=401)


class LogoutView(APIView):
    """
    Logout user by blacklisting refresh token
    """
    
    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        
        if not refresh_token:
            return Response({
                "success": False,
                "error": "Refresh token is required",
                "status_code": 400
            }, status=400)
        
        try:
            refresh = RefreshToken(refresh_token)
            refresh.blacklist()
            
            return Response({
                "success": True,
                "message": "Logout successful"
            })
            
        except Exception as e:
            return Response({
                "success": False,
                "error": "Invalid or expired refresh token",
                "status_code": 401
            }, status=401)