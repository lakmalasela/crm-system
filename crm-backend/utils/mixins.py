from django.db import models
from activity_logs.models import ActivityLog


class ActivityLogMixin:
    """
    Mixin to automatically log CRUD operations
    """
    
    def perform_create(self, serializer):
        """
        Log CREATE action
        """
        instance = serializer.save()
        self._log_activity('CREATE', instance)
        return instance
    
    def perform_update(self, serializer):
        """
        Log UPDATE action with field changes
        """
        # Get old instance before update
        old_instance = self.get_object()
        
        # Save the updated instance
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
        Log DELETE action
        """
        self._log_activity('DELETE', instance)
        super().perform_destroy(instance)
    
    def _log_activity(self, action, instance, changes=None):
        """
        Helper method to create activity log
        """
        model_name = instance.__class__.__name__
        ActivityLog.log_action(
            user=self.request.user,
            action=action,
            model_name=model_name,
            object_id=instance.id,
            object_repr=str(instance),
            organization=self.request.user.organization,
            changes=changes,
            request=self.request
        )
