from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination

from .serializers import ContactSerializer, ContactDetailSerializer
from .models import Contact
from .services import ContactService
from utils.mixins import ActivityLogMixin
from accounts.permissions import IsAdmin, IsManagerOrAdmin, IsStaffOrManagerOrAdmin


class ContactPagination(PageNumberPagination):
    """
    Custom pagination for contacts
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ContactViewSet(ActivityLogMixin, ModelViewSet):
    """
    ViewSet for managing contacts with multi-tenant isolation
    """
    
    queryset = Contact.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = ContactSerializer
    pagination_class = ContactPagination
    
    # Filtering and searching
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]
    filterset_fields = ['company', 'role']
    search_fields = ['full_name', 'email', 'phone', 'role']
    ordering_fields = ['full_name', 'email', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """
        Use detailed serializer for retrieve operations
        """
        if self.action == 'retrieve':
            return ContactDetailSerializer
        return ContactSerializer
    
    def get_queryset(self):
        """
        Filter contacts by user's organization
        """
        return ContactService.get_all(self.request.user)
    
    def perform_create(self, serializer):
        """
        Auto-assign organization and log activity
        """
        instance = serializer.save(organization=self.request.user.organization)
        self._log_activity('CREATE', instance)
        return instance
    
    def perform_update(self, serializer):
        """
        Log update activity with field changes
        """
        old_instance = self.get_object()
        instance = serializer.save()
        
        # Track changes
        changes = {}
        for field in old_instance._meta.fields:
            field_name = field.name
            old_value = getattr(old_instance, field_name)
            new_value = getattr(instance, field_name)
            
            if old_value != new_value:
                changes[field_name] = {
                    'old': str(old_value),
                    'new': str(new_value)
                }
        
        self._log_activity('UPDATE', instance, changes)
        return instance
    
    def perform_destroy(self, instance):
        """
        Soft delete and log activity
        """
        instance.is_deleted = True
        instance.save()
        self._log_activity('DELETE', instance)
    
    def get_permissions(self):
        """
        RBAC permissions based on action
        """
        if self.action == 'destroy':
            return [IsAuthenticated(), IsAdmin()]
        
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsManagerOrAdmin()]
        
        elif self.action == 'create':
            return [IsAuthenticated(), IsManagerOrAdmin()]
        
        return [IsAuthenticated(), IsStaffOrManagerOrAdmin()]
