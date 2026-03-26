from django.db import models
from django.core.validators import RegexValidator, validate_email
from django.core.exceptions import ValidationError
from core.models import BaseModel

# Create your models here.
# contacts/models.py

class Contact(BaseModel):
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(
        max_length=15, 
        null=True, 
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d{8,15}$',
                message='Phone number must contain only digits and be 8-15 characters long.'
            )
        ]
    )
    role = models.CharField(max_length=100, null=True, blank=True)
    organization = models.ForeignKey('accounts.Organization', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('company', 'email')
        constraints = [
            models.UniqueConstraint(
                fields=['company', 'email'], 
                name='unique_company_email'
            )
        ]

    def clean(self):
        # Validate email format
        try:
            validate_email(self.email)
        except ValidationError:
            raise ValidationError({'email': 'Enter a valid email address.'})

        # Check email uniqueness within the same company
        if Contact.objects.filter(
            company=self.company, 
            email=self.email
        ).exclude(pk=self.pk).exists():
            raise ValidationError({
                'email': 'A contact with this email already exists in this company.'
            })

    def __str__(self):
        return f"{self.full_name} - {self.company.name}"