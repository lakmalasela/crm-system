from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from .models import User


class AuthService:
    """
    Service layer for authentication operations
    """
    
    @staticmethod
    def login(username, password):
        """
        Authenticate user and return JWT tokens
        """
        try:
            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if not user:
                raise AuthenticationFailed('Invalid credentials')
            
            if not user.is_active:
                raise AuthenticationFailed('User account is disabled')
            
            # Check if user has organization
            if not hasattr(user, 'organization'):
                raise AuthenticationFailed('User must belong to an organization')
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return {
                'refresh_token': str(refresh),
                'access_token': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'role': user.role,
                    'organization': {
                        'id': user.organization.id,
                        'name': user.organization.name,
                        'subscription_plan': user.organization.subscription_plan
                    }
                }
            }
            
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')
        except Exception as e:
            raise AuthenticationFailed(f'Login failed: {str(e)}')
    
    @staticmethod
    def refresh_token(refresh_token):
        """
        Refresh access token using refresh token
        """
        try:
            refresh = RefreshToken(refresh_token)
            return {
                'access_token': str(refresh.access_token),
            }
        except Exception as e:
            raise AuthenticationFailed(f'Token refresh failed: {str(e)}')
    
    @staticmethod
    def logout(refresh_token):
        """
        Logout user by blacklisting refresh token
        """
        try:
            refresh = RefreshToken(refresh_token)
            refresh.blacklist()
            return {'message': 'Successfully logged out'}
        except Exception as e:
            raise AuthenticationFailed(f'Logout failed: {str(e)}')
    
    @staticmethod
    def get_user_from_token(access_token):
        """
        Get user from access token
        """
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(access_token)
            user_id = token['user_id']
            return User.objects.get(id=user_id)
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')