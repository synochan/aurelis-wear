from django.db import models
from django.conf import settings
from products.models import Product, Color, Size

class Cart(models.Model):
    """
    Shopping cart model - each user can have only one active cart
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
        ordering = ['-updated_at']
        # Ensure each user has exactly one cart
        constraints = [
            models.UniqueConstraint(
                fields=['user'], 
                name='unique_user_cart'
            )
        ]
    
    def __str__(self):
        return f"Cart for {self.user.username}"
    
    @property
    def total(self):
        """Calculate the total price of all items in the cart"""
        return sum(item.subtotal for item in self.items.all())
    
    @property
    def item_count(self):
        """Calculate the total number of items in the cart"""
        return sum(item.quantity for item in self.items.all())

class CartItem(models.Model):
    """
    Individual item in a shopping cart
    """
    cart = models.ForeignKey(
        Cart, 
        related_name='items', 
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product, 
        related_name='cart_items', 
        on_delete=models.CASCADE
    )
    color = models.ForeignKey(
        Color, 
        related_name='cart_items', 
        on_delete=models.CASCADE
    )
    size = models.ForeignKey(
        Size, 
        related_name='cart_items', 
        on_delete=models.CASCADE
    )
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        ordering = ['-added_at']
        # Ensure each product+color+size combination is unique per cart
        constraints = [
            models.UniqueConstraint(
                fields=['cart', 'product', 'color', 'size'],
                name='unique_product_in_cart'
            )
        ]
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name} ({self.color.name}, {self.size.name})"
    
    @property
    def subtotal(self):
        """Calculate the total price for this item (price * quantity)"""
        return self.product.price * self.quantity 