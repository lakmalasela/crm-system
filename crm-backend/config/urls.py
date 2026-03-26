"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from companies.views import CompanyViewSet
from contacts.views import ContactViewSet
from accounts.views import LoginView, RegisterView, RefreshTokenView, LogoutView
from accounts.user_view import UserView
from utils.file_upload import FileUploadView

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'contacts', ContactViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/login/', LoginView.as_view()),
    path('api/v1/auth/register/', RegisterView.as_view()),
    path('api/v1/auth/refresh/', RefreshTokenView.as_view()),
    path('api/v1/auth/logout/', LogoutView.as_view()),
    path('api/v1/auth/user/', UserView.as_view()),
    path('api/v1/upload/', FileUploadView.as_view()),
    path('api/v1/', include(router.urls)),
    path('api/v1/', include('activity_logs.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
