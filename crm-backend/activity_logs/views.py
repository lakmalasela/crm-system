from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from utils.permissions import IsOrganizationMember, IsAdminOrReadOnly

class ActivityLogPagination(PageNumberPagination):
    """
    Custom pagination for activity logs
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing activity logs with organization-based filtering.
    Only admin users can delete activity logs.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [IsOrganizationMember, IsAdminOrReadOnly]
    pagination_class = ActivityLogPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'model_name', 'user', 'organization']
    search_fields = ['object_repr', 'user__username', 'changes']
    ordering_fields = ['created_at', 'action', 'model_name']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filter activity logs by user's organization
        """
        user = self.request.user
        if user.is_superuser:
            return ActivityLog.objects.all()
        
        organization = user.organization
        queryset = ActivityLog.objects.filter(organization=organization)
        
        # Apply additional filters from query params
        model_name = self.request.query_params.get('model_name')
        if model_name:
            queryset = queryset.filter(model_name=model_name)
            
        action_type = self.request.query_params.get('action')
        if action_type:
            queryset = queryset.filter(action=action_type)
            
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
            
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
            
        return queryset

    def destroy(self, request, *args, **kwargs):
        """
        Delete an activity log (admin only)
        """
        instance = self.get_object()
        instance.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get activity statistics for the organization
        """
        user = request.user
        organization = user.organization
        
        stats = {
            'total_activities': ActivityLog.objects.filter(organization=organization).count(),
            'create_actions': ActivityLog.objects.filter(
                organization=organization, action='CREATE'
            ).count(),
            'update_actions': ActivityLog.objects.filter(
                organization=organization, action='UPDATE'
            ).count(),
            'delete_actions': ActivityLog.objects.filter(
                organization=organization, action='DELETE'
            ).count(),
            'company_activities': ActivityLog.objects.filter(
                organization=organization, model_name='Company'
            ).count(),
            'contact_activities': ActivityLog.objects.filter(
                organization=organization, model_name='Contact'
            ).count(),
        }
        
        return Response(stats)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent activities for the organization
        """
        user = request.user
        organization = user.organization
        limit = min(int(request.query_params.get('limit', 10)), 50)
        
        recent_activities = ActivityLog.objects.filter(
            organization=organization
        ).order_by('-created_at')[:limit]
        
        serializer = self.get_serializer(recent_activities, many=True)
        return Response(serializer.data)
