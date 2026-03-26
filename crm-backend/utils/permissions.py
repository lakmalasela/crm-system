from rest_framework.permissions import BasePermission

class IsOrganizationMember(BasePermission):
    """
    Custom permission to only allow members of an organization to access resources.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers can access everything
        if request.user.is_superuser:
            return True
            
        return True
    
    def has_object_permission(self, request, view, obj):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusers can access everything
        if request.user.is_superuser:
            return True
        
        # Check if object has organization and user belongs to it
        if hasattr(obj, 'organization'):
            return obj.organization == request.user.organization
        
        # If object doesn't have organization, check if it belongs to user
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        return False

class IsAdminOrReadOnly(BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    """
    
    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS requests for authenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user and request.user.is_authenticated
        
        # Allow POST, PUT, PATCH, DELETE only for admin users
        return (request.user and 
                request.user.is_authenticated and 
                (request.user.is_superuser or request.user.role == 'ADMIN'))

class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to the owner of the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # If object doesn't have user field, check organization
        if hasattr(obj, 'organization'):
            return obj.organization == request.user.organization
            
        return False
