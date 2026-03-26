from django.db import models
from .models import Contact


class ContactService:
    """
    Service layer for Contact business logic
    """
    
    @staticmethod
    def get_all(user):
        """
        Get all contacts for user's organization (non-deleted)
        """
        return Contact.objects.filter(
            organization=user.organization,
            is_deleted=False
        ).select_related('company', 'organization')
    
    @staticmethod
    def get_by_id(user, contact_id):
        """
        Get specific contact by ID for user's organization
        """
        try:
            return Contact.objects.get(
                id=contact_id,
                organization=user.organization,
                is_deleted=False
            ).select_related('company', 'organization')
        except Contact.DoesNotExist:
            return None
    
    @staticmethod
    def create(data, user):
        """
        Create new contact for user's organization
        """
        # Auto-assign organization
        data['organization'] = user.organization
        return Contact.objects.create(**data)
    
    @staticmethod
    def update(contact, data):
        """
        Update existing contact
        """
        for field, value in data.items():
            setattr(contact, field, value)
        contact.save()
        return contact
    
    @staticmethod
    def soft_delete(contact):
        """
        Soft delete contact (mark as deleted)
        """
        contact.is_deleted = True
        contact.save()
        return contact
    
    @staticmethod
    def search(user, query):
        """
        Search contacts by name, email, or phone
        """
        return Contact.objects.filter(
            organization=user.organization,
            is_deleted=False
        ).filter(
            models.Q(full_name__icontains=query) |
            models.Q(email__icontains=query) |
            models.Q(phone__icontains=query)
        ).select_related('company')
    
    @staticmethod
    def filter_by_company(user, company_id):
        """
        Filter contacts by specific company
        """
        return Contact.objects.filter(
            organization=user.organization,
            company_id=company_id,
            is_deleted=False
        ).select_related('company', 'organization')
