from rest_framework import serializers
from .models import Contact
from companies.models import Company


class ContactSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Contact
        fields = [
            'id', 'company', 'company_name', 'full_name', 'email', 
            'phone', 'role', 'organization', 'created_at', 'is_deleted'
        ]
        read_only_fields = ['organization', 'created_at', 'is_deleted']
    
    def validate_email(self, value):
        """
        Validate email format and uniqueness within company
        """
        # Email format validation is handled by EmailField
        
        # Check uniqueness within the same company
        company = self.initial_data.get('company')
        if company:
            if Contact.objects.filter(
                company_id=company, 
                email=value
            ).exclude(pk=self.instance.pk if self.instance else None).exists():
                raise serializers.ValidationError(
                    'A contact with this email already exists in this company.'
                )
        
        return value
    
    def validate_phone(self, value):
        """
        Validate phone number format
        """
        if value and not value.isdigit():
            raise serializers.ValidationError(
                'Phone number must contain only digits.'
            )
        
        if value and len(value) < 8:
            raise serializers.ValidationError(
                'Phone number must be at least 8 digits long.'
            )
        
        if value and len(value) > 15:
            raise serializers.ValidationError(
                'Phone number must not exceed 15 digits.'
            )
        
        return value
    
    def create(self, validated_data):
        """
        Automatically set organization from authenticated user
        """
        request = self.context.get('request')
        if request and hasattr(request.user, 'organization'):
            validated_data['organization'] = request.user.organization
        
        return super().create(validated_data)


class ContactDetailSerializer(ContactSerializer):
    """
    Detailed serializer for contact view operations
    """
    company_details = serializers.SerializerMethodField()
    
    class Meta(ContactSerializer.Meta):
        fields = ContactSerializer.Meta.fields + ['company_details']
    
    def get_company_details(self, obj):
        """
        Get detailed company information
        """
        return {
            'id': obj.company.id,
            'name': obj.company.name,
            'industry': obj.company.industry,
            'country': obj.company.country
        }
