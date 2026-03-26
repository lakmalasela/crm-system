from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import BaseModel

class Organization(BaseModel):
    name = models.CharField(max_length=255)

    PLAN_CHOICES = (
        ('BASIC', 'Basic'),
        ('PRO', 'Pro'),
    )
    subscription_plan = models.CharField(max_length=10, choices=PLAN_CHOICES)


class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MANAGER', 'Manager'),
        ('STAFF', 'Staff'),
    )

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)