from rest_framework import serializers
from .models import User, Organization
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    organization_plan = serializers.CharField(source='organization.subscription_plan', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'organization', 'organization_name', 'organization_plan', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'organization_name', 'organization_plan']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'role', 'organization']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data['role'],
            organization=validated_data['organization']
        )
        return user