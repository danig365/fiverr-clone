# backend/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)

    ROLE_CHOICES = (
        ("buyer", "Buyer"),
        ("seller", "Seller"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="buyer")
    is_seller = models.BooleanField(default=False)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.email} ({self.role})"
