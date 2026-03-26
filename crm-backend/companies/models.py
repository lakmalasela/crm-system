from django.db import models
from core.models import BaseModel

# Create your models here.
# companies/models.py

class Company(BaseModel):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    organization = models.ForeignKey('accounts.Organization', on_delete=models.CASCADE)
    logo = models.URLField(max_length=500, null=True, blank=True)