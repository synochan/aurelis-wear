from django.contrib import admin
from .models import Category, Color, Size, Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'category', 'is_new', 'is_featured', 'in_stock')
    list_filter = ('category', 'is_new', 'is_featured', 'in_stock')
    search_fields = ('name', 'description')
    inlines = [ProductImageInline]
    filter_horizontal = ('colors', 'sizes')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ('name', 'hex_value')

@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ('name',) 