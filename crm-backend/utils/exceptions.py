from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from rest_framework.exceptions import ValidationError, AuthenticationFailed, PermissionDenied
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for consistent API responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If there's no response, handle the exception
    if response is None:
        if isinstance(exc, Http404):
            response = Response({
                'error': 'Not Found',
                'message': 'The requested resource was not found.',
                'status_code': status.HTTP_404_NOT_FOUND
            }, status=status.HTTP_404_NOT_FOUND)
        
        elif isinstance(exc, ValidationError):
            response = Response({
                'error': 'Validation Error',
                'message': 'Invalid data provided.',
                'details': exc.detail if hasattr(exc, 'detail') else str(exc),
                'status_code': status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
        
        elif isinstance(exc, AuthenticationFailed):
            response = Response({
                'error': 'Authentication Failed',
                'message': 'Authentication credentials were not provided or are invalid.',
                'status_code': status.HTTP_401_UNAUTHORIZED
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        elif isinstance(exc, PermissionDenied):
            response = Response({
                'error': 'Permission Denied',
                'message': 'You do not have permission to perform this action.',
                'status_code': status.HTTP_403_FORBIDDEN
            }, status=status.HTTP_403_FORBIDDEN)
        
        else:
            # Log unexpected errors
            logger.error(f'Unexpected error: {exc}', exc_info=True)
            response = Response({
                'error': 'Internal Server Error',
                'message': 'An unexpected error occurred. Please try again later.',
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Customize existing response format
    if response is not None:
        custom_response_data = {
            'success': False,
            'error': response.data.get('detail', 'Error occurred'),
            'status_code': response.status_code,
        }
        
        # Add validation details for validation errors
        if isinstance(exc, ValidationError) and hasattr(exc, 'detail'):
            custom_response_data['validation_errors'] = exc.detail
        
        # Add timestamp and request info
        custom_response_data['timestamp'] = context['request'].META.get('HTTP_X_REQUEST_TIME', '')
        custom_response_data['path'] = context['request'].path
        
        response.data = custom_response_data
    
    return response


class APIResponse:
    """
    Standardized API response format
    """
    
    @staticmethod
    def success(data=None, message='Success', status_code=status.HTTP_200_OK):
        """
        Success response
        """
        response_data = {
            'success': True,
            'message': message,
            'data': data,
            'status_code': status_code
        }
        return Response(response_data, status=status_code)
    
    @staticmethod
    def created(data=None, message='Resource created successfully'):
        """
        Created response (201)
        """
        return APIResponse.success(data, message, status.HTTP_201_CREATED)
    
    @staticmethod
    def no_content(message='Resource deleted successfully'):
        """
        No content response (204)
        """
        response_data = {
            'success': True,
            'message': message,
            'status_code': status.HTTP_204_NO_CONTENT
        }
        return Response(response_data, status=status.HTTP_204_NO_CONTENT)
    
    @staticmethod
    def error(message='Error occurred', details=None, status_code=status.HTTP_400_BAD_REQUEST):
        """
        Error response
        """
        response_data = {
            'success': False,
            'error': message,
            'status_code': status_code
        }
        
        if details:
            response_data['details'] = details
        
        return Response(response_data, status=status_code)
    
    @staticmethod
    def paginated(data, paginator, message='Data retrieved successfully'):
        """
        Paginated response
        """
        response_data = {
            'success': True,
            'message': message,
            'data': data,
            'pagination': {
                'count': paginator.count,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'total_pages': paginator.num_pages,
                'current_page': paginator.page.number,
                'page_size': paginator.page_size,
            },
            'status_code': status.HTTP_200_OK
        }
        return Response(response_data, status=status.HTTP_200_OK)