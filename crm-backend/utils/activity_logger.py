"""
Utility functions for automatic activity logging
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from activity_logs.models import ActivityLog

User = get_user_model()

class ActivityLogger:
    """
    Utility class for logging activities
    """
    
    @staticmethod
    def log_create(user, instance, model_name, request=None):
        """Log a CREATE action"""
        return ActivityLog.log_action(
            user=user,
            action='CREATE',
            model_name=model_name,
            object_id=instance.id,
            object_repr=str(instance),
            organization=getattr(user, 'organization', None),
            request=request
        )
    
    @staticmethod
    def log_update(user, instance, model_name, changes=None, request=None):
        """Log an UPDATE action"""
        return ActivityLog.log_action(
            user=user,
            action='UPDATE',
            model_name=model_name,
            object_id=instance.id,
            object_repr=str(instance),
            organization=getattr(user, 'organization', None),
            changes=changes,
            request=request
        )
    
    @staticmethod
    def log_delete(user, instance, model_name, request=None):
        """Log a DELETE action"""
        return ActivityLog.log_action(
            user=user,
            action='DELETE',
            model_name=model_name,
            object_id=instance.id,
            object_repr=str(instance),
            organization=getattr(user, 'organization', None),
            request=request
        )

def get_field_changes(old_instance, new_instance):
    """
    Get field changes between two model instances
    """
    changes = {}
    for field in old_instance._meta.fields:
        field_name = field.name
        old_value = getattr(old_instance, field_name)
        new_value = getattr(new_instance, field_name)
        
        if old_value != new_value:
            changes[field_name] = {
                'old': str(old_value) if old_value is not None else None,
                'new': str(new_value) if new_value is not None else None
            }
    
    return changes

class ActivityLogMixin:
    """
    Mixin for models that need automatic activity logging
    """
    
    def save(self, *args, **kwargs):
        """
        Override save to log UPDATE actions
        """
        user = kwargs.pop('user', None)
        request = kwargs.pop('request', None)
        
        if self.pk:
            # This is an update
            old_instance = self.__class__.objects.get(pk=self.pk)
            changes = get_field_changes(old_instance, self)
            
            if changes and user:
                ActivityLogger.log_update(
                    user=user,
                    instance=self,
                    model_name=self.__class__.__name__,
                    changes=changes,
                    request=request
                )
        else:
            # This is a create
            if user:
                ActivityLogger.log_create(
                    user=user,
                    instance=self,
                    model_name=self.__class__.__name__,
                    request=request
                )
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """
        Override delete to log DELETE actions
        """
        user = kwargs.pop('user', None)
        request = kwargs.pop('request', None)
        
        if user:
            ActivityLogger.log_delete(
                user=user,
                instance=self,
                model_name=self.__class__.__name__,
                request=request
            )
        
        super().delete(*args, **kwargs)
