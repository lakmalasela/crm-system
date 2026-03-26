from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'industry', 'country', 'logo', 'organization', 'created_at', 'is_deleted']
        read_only_fields = ['organization', 'created_at', 'is_deleted']