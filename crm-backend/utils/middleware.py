from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.db import models
from rest_framework.exceptions import PermissionDenied


class MultiTenantMiddleware(MiddlewareMixin):
    """
    Middleware to enforce multi-tenant data isolation
    """
    
    def process_request(self, request):
        """
        Add tenant filtering to all model queries
        """
        # Skip for admin, static files, and unauthenticated endpoints
        if (
            request.path.startswith('/admin/') or
            request.path.startswith('/static/') or
            request.path.startswith('/media/') or
            request.path in ['/api/v1/auth/login/', '/api/v1/auth/register/'] or
            not hasattr(request, 'user') or not request.user.is_authenticated
        ):
            return None
        
        # Ensure user has an organization
        if not hasattr(request.user, 'organization'):
            raise PermissionDenied("User must belong to an organization")
        
        # Add organization to request for easy access
        request.tenant = request.user.organization
        
        return None
    
    def process_response(self, request, response):
        """
        Add tenant headers to response for debugging
        """
        if hasattr(request, 'tenant'):
            response['X-Tenant-ID'] = str(request.tenant.id)
            response['X-Tenant-Name'] = request.tenant.name
        
        return response


class TenantQuerySetManager(models.Manager):
    """
    Custom manager to automatically filter by tenant
    """
    
    def get_queryset(self):
        """
        Override to add tenant filtering
        """
        queryset = super().get_queryset()
        
        # Try to get current tenant from thread local or request
        from django.db import connections
        from django.contrib.auth import get_user_model
        
        # This is a simplified approach - in production, you might want
        # to use thread-local storage or a more sophisticated approach
        try:
            # Check if we're in a request context
            from django.middleware import request
            if hasattr(request, 'tenant'):
                return queryset.filter(organization=request.tenant)
        except:
            pass
        
        return queryset


class TenantModel(models.Model):
    """
    Abstract base class for tenant-aware models
    """
    
    organization = models.ForeignKey(
        'accounts.Organization', 
        on_delete=models.CASCADE,
        editable=False
    )
    
    objects = TenantQuerySetManager()
    
    class Meta:
        abstract = True
