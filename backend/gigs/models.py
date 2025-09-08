from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import MinValueValidator
import uuid


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:60]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:110]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Gig(models.Model):
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="gigs",
        limit_choices_to={"is_seller": True},
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(5.00)]
    )
    delivery_time = models.PositiveIntegerField(
        default=3, validators=[MinValueValidator(1)]
    )
    revisions = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gigs",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="gigs")
    thumbnail = models.ImageField(upload_to="gigs/thumbnails/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["slug", "seller"])]

    def __str__(self):
        return f"{self.title} by {self.seller}"

    def _generate_unique_slug(self):
        base = slugify(self.title) or "gig"
        slug = base[:250]
        Model = self.__class__
        # if slug exists, append short uuid until unique
        while Model.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base[:240]}-{uuid.uuid4().hex[:6]}"
        return slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)


class GigImage(models.Model):
    gig = models.ForeignKey(Gig, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="gigs/images/")
    alt_text = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.gig_id}"
