from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
import boto3
from django.conf import settings
import uuid
import os

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            print(f"Request data: {request.data}")
            print(f"Request FILES: {request.FILES}")
            
            file = request.FILES.get('file')
            folder = request.data.get('folder', 'uploads')

            if not file:
                return Response({
                    'success': False,
                    'error': 'No file provided'
                }, status=400)

            print(f"File received: {file.name}, size: {file.size}, type: {file.content_type}")
            print(f"Folder: {folder}")
            print(f"AWS Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
            print(f"AWS Region: {settings.AWS_S3_REGION_NAME}")

            # Generate unique filename
            file_extension = os.path.splitext(file.name)[1]
            unique_filename = f"{folder}/{uuid.uuid4()}{file_extension}"

            print(f"Unique filename: {unique_filename}")

            # Upload to S3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )

            print("Uploading to S3...")

            s3_client.upload_fileobj(
                file,
                settings.AWS_STORAGE_BUCKET_NAME,
                unique_filename,
                ExtraArgs={
                    'ContentType': file.content_type
                }
            )

            print("Upload successful!")

            # Generate file URL
            file_url = f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{unique_filename}"

            print(f"File URL: {file_url}")

            return Response({
                'success': True,
                'file_url': file_url,
                'data': {
                    'file_url': file_url,
                    'filename': unique_filename,
                    'original_name': file.name,
                    'size': file.size,
                    'content_type': file.content_type
                }
            })

        except Exception as e:
            print(f"Upload error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)

    def delete(self, request):
        try:
            file_url = request.data.get('file_url')
            
            if not file_url:
                return Response({
                    'success': False,
                    'error': 'No file URL provided'
                }, status=400)

            # Extract filename from URL
            filename = file_url.split('/')[-1]
            folder = file_url.split('/')[-2]
            unique_filename = f"{folder}/{filename}"

            # Delete from S3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )

            s3_client.delete_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=unique_filename
            )

            return Response({
                'success': True,
                'message': 'File deleted successfully'
            })

        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)
