from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('subtotal',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'payment_status', 'total_price', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('user__username', 'user__email')
    inlines = [OrderItemInline]
    readonly_fields = ('items_total', 'total_with_shipping')
    
    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'status', 'created_at', 'updated_at')
        }),
        ('Payment Details', {
            'fields': ('payment_method', 'payment_status')
        }),
        ('Shipping Information', {
            'fields': ('shipping_address', 'billing_address', 'shipping_price')
        }),
        ('Financial Summary', {
            'fields': ('items_total', 'shipping_price', 'total_price', 'total_with_shipping')
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price', 'subtotal')
    list_filter = ('order__status', 'product')
    search_fields = ('order__id', 'product__name')
    readonly_fields = ('subtotal',) 