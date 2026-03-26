# companies/services.py

from .models import Company

class CompanyService:

    @staticmethod
    def get_all(user):
        return Company.objects.filter(
            organization=user.organization,
            is_deleted=False
        )

    @staticmethod
    def create(data, user):
        return Company.objects.create(
            **data,
            organization=user.organization
        )