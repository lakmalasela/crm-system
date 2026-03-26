from django.db import models
from django.contrib.auth import get_user_model
from core.models import BaseModel

User = get_user_model()

# Create your models here.
# activity_logs/models.py

class ActivityLog(BaseModel):
    ACTION_CHOICES = (
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    )
    
    MODEL_CHOICES = (
        ('Company', 'Company'),
        ('Contact', 'Contact'),
        ('User', 'User'),
        ('Organization', 'Organization'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=50, choices=MODEL_CHOICES)
    object_id = models.IntegerField()
    object_repr = models.CharField(max_length=255, help_text="String representation of the object", default="")
    organization = models.ForeignKey('accounts.Organization', on_delete=models.CASCADE, null=True, blank=True)
    
    # Additional fields for detailed tracking
    changes = models.JSONField(default=dict, blank=True, help_text="Field changes for UPDATE actions")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['organization', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} {self.action} {self.model_name} #{self.object_id} at {self.created_at}"

    @classmethod
    def log_action(cls, user, action, model_name, object_id, object_repr, organization, changes=None, request=None):
        """
        Create an activity log entry
        """
        log_data = {
            'user': user,
            'action': action,
            'model_name': model_name,
            'object_id': object_id,
            'object_repr': str(object_repr),
            'organization': organization,
            'changes': changes or {}
        }
        
        if request:
            log_data['ip_address'] = cls._get_client_ip(request)
            log_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return cls.objects.create(**log_data)

    @staticmethod
    def _get_client_ip(request):
        """
        Get client IP address from request
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip