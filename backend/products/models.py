from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from cloudinary.models import CloudinaryField

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"

class Color(models.Model):
    name = models.CharField(max_length=50)
    hex_value = models.CharField(max_length=7)  # Format: #RRGGBB
    
    def __str__(self):
        return self.name

class Size(models.Model):
    SIZE_TYPE_CHOICES = [
        ('clothing', 'Clothing Size'),
        ('shoes', 'Shoe Size'),
    ]
    name = models.CharField(max_length=20)
    size_type = models.CharField(max_length=20, choices=SIZE_TYPE_CHOICES, default='clothing')
    
    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    categories = models.ManyToManyField(Category, related_name='products')
    colors = models.ManyToManyField(Color, related_name='products')
    sizes = models.ManyToManyField(Size, related_name='products')
    is_new = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    discount_percentage = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    in_stock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = CloudinaryField('image', folder='products')
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Image for {self.product.name}" 