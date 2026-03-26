# accounts/permissions.py

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView


class IsAdmin(BasePermission):
    """
    Only allows Admin users
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class IsManagerOrAdmin(BasePermission):
    """
    Allows Manager or Admin users
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'MANAGER']
        )


class IsStaffOrManagerOrAdmin(BasePermission):
    """
    Allows Staff, Manager, or Admin users
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'MANAGER', 'STAFF']
        )


class IsOrganizationMember(BasePermission):
    """
    Ensures user belongs to an organization
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'organization')
        )


class IsObjectOwner(BasePermission):
    """
    Allows access only if user owns the object (for user-specific resources)
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsSameOrganization(BasePermission):
    """
    Ensures object belongs to the same organization as the user
    """
    def has_object_permission(self, request, view, obj):
        if not hasattr(request.user, 'organization'):
            return False
        
        if hasattr(obj, 'organization'):
            return obj.organization == request.user.organization
        
        # For nested objects, check parent organization
        if hasattr(obj, 'company') and hasattr(obj.company, 'organization'):
            return obj.company.organization == request.user.organization
        
        return False


class CanCreateContact(BasePermission):
    """
    Allows Manager+ to create contacts
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'MANAGER']
        )


class CanUpdateContact(BasePermission):
    """
    Allows Manager+ to update contacts
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'MANAGER']
        )


class CanDeleteContact(BasePermission):
    """
    Allows only Admin to delete contacts
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class CanCreateCompany(BasePermission):
    """
    Allows Manager+ to create companies
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'MANAGER']
        )


class CanUpdateCompany(BasePermission):
    """
    Allows Manager+ to update companies
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'MANAGER']
        )


class CanDeleteCompany(BasePermission):
    """
    Allows only Admin to delete companies
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class IsProPlanOrHigher(BasePermission):
    """
    Allows access only for Pro plan or higher
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'organization') and
            request.user.organization.subscription_plan in ['PRO']
        )


class IsBasicPlan(BasePermission):
    """
    Restricts certain features for Basic plan
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'organization') and
            request.user.organization.subscription_plan == 'BASIC'
        )