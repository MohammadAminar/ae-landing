from django.contrib import admin
from .models import Category, Product, Banner, Article, Newsletter


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "name_en", "slug", "icon", "color_class", "order")
    list_editable = ("order", "color_class")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "name_en", "subtitle")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "brand",
        "category",
        "price",
        "discount_price",
        "stock",
        "is_deal",
        "is_featured",
        "is_viewed",
        "is_new",
        "is_gaming",
        "is_accessory",
        "fast_delivery",
    )
    list_filter = (
        "category",
        "brand",
        "is_deal",
        "is_featured",
        "is_viewed",
        "is_new",
        "is_gaming",
        "is_accessory",
        "fast_delivery",
    )
    list_editable = ("price", "discount_price", "stock", "is_deal", "is_featured", "is_viewed")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "title_en", "brand", "specs")


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ("title", "banner_type", "badge", "order", "is_active")
    list_filter = ("banner_type", "is_active")
    list_editable = ("order", "is_active")
    search_fields = ("title", "subtitle")


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "category_name", "author", "read_time", "created_at")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "excerpt", "category_name")


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ("contact", "created_at")
    search_fields = ("contact",)
