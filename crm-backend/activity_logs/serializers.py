from rest_framework import serializers
from .models import ActivityLog
from accounts.serializers import UserSerializer

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'action', 'model_name', 'object_id', 
            'object_repr', 'organization', 'changes', 'ip_address', 
            'user_agent', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

class ActivityLogCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = [
            'action', 'model_name', 'object_id', 'object_repr', 
            'organization', 'changes', 'ip_address', 'user_agent'
        ]
