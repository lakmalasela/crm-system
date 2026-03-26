from django.shortcuts import render

# Create your views here.
# companies/views.py

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .serializers import CompanySerializer
from .services import CompanyService
from .models import Company
from accounts.permissions import IsAdmin, IsManagerOrAdmin

class CompanyViewSet(ModelViewSet):
    queryset = Company.objects.filter(is_deleted=False).order_by('-created_at')
    serializer_class = CompanySerializer
# MULTI-TENANT FILTER
    def get_queryset(self):
        return CompanyService.get_all(self.request.user)

# AUTO ASSIGN ORGANIZATION
    def perform_create(self, serializer):
        serializer.save(organization=self.request.user.organization)

# SOFT DELETE
    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()

    #RBAC PERMISSIONS
    def get_permissions(self):

        if self.action == 'destroy':
            return [IsAuthenticated(), IsAdmin()]

        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsManagerOrAdmin()]

        elif self.action == 'create':
            return [IsAuthenticated(), IsManagerOrAdmin()]

        return [IsAuthenticated()]