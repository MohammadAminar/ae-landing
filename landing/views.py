from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db.models import Q
from .models import Category, Product, Banner, Article, Newsletter


def landing_page(request):
    categories = Category.objects.all()
    hero_sliders = Banner.objects.filter(banner_type="slider", is_active=True)
    hero_side_banners = Banner.objects.filter(banner_type="hero_side", is_active=True)[:2]
    mid_banners = Banner.objects.filter(banner_type="mid_banner", is_active=True)[:2]
    quad_banners = Banner.objects.filter(banner_type="quad_banner", is_active=True)[:2]

    flash_deals = Product.objects.filter(is_deal=True)[:8]
    featured_products = Product.objects.filter(is_featured=True)[:8]
    viewed_products = Product.objects.filter(is_viewed=True)[:8]
    new_products = Product.objects.filter(is_new=True)[:8]
    gaming_products = Product.objects.filter(is_gaming=True)[:8]
    accessory_products = Product.objects.filter(is_accessory=True)[:8]

    articles = Article.objects.all()[:3]

    context = {
        "categories": categories,
        "hero_sliders": hero_sliders,
        "hero_side_banners": hero_side_banners,
        "mid_banners": mid_banners,
        "quad_banners": quad_banners,
        "flash_deals": flash_deals,
        "featured_products": featured_products,
        "viewed_products": viewed_products,
        "new_products": new_products,
        "gaming_products": gaming_products,
        "accessory_products": accessory_products,
        "articles": articles,
    }
    return render(request, "landing/index.html", context)


@require_POST
def newsletter_subscribe(request):
    contact = request.POST.get("contact", "").strip()
    if not contact:
        return JsonResponse(
            {"status": "error", "message": "لطفاً ایمیل یا شماره موبایل خود را وارد نمایید."},
            status=400,
        )

    newsletter, created = Newsletter.objects.get_or_create(contact=contact)
    if created:
        message = "تبریک! شماره شما برای دریافت کد تخفیف ویژه خرید اول در مبیت ثبت شد."
    else:
        message = "این شماره یا ایمیل قبلاً در باشگاه مشتریان مبیت ثبت شده است."

    return JsonResponse({"status": "success", "message": message})


def search_api(request):
    query = request.GET.get("q", "").strip()
    if not query or len(query) < 2:
        return JsonResponse({"results": []})

    products = Product.objects.filter(
        Q(title__icontains=query)
        | Q(title_en__icontains=query)
        | Q(brand__icontains=query)
        | Q(specs__icontains=query)
    )[:8]

    results = []
    for p in products:
        results.append({
            "id": p.id,
            "title": p.title,
            "title_en": p.title_en,
            "brand": p.brand,
            "price": f"{p.price:,}",
            "discount_price": f"{p.discount_price:,}" if p.discount_price else None,
            "discount_percent": p.discount_percent,
            "icon": p.icon_placeholder,
            "image_url": p.image_url if p.image_url else "",
            "category": p.category.name,
            "warranty": p.warranty,
            "rating": str(p.rating),
            "badge": p.badge,
            "colors": p.colors_list,
            "specs": p.specs_list,
        })

    return JsonResponse({"results": results})


def product_detail_api(request, product_id):
    try:
        p = Product.objects.get(id=product_id)
        data = {
            "id": p.id,
            "title": p.title,
            "title_en": p.title_en,
            "brand": p.brand,
            "category": p.category.name,
            "price": f"{p.price:,}",
            "discount_price": f"{p.discount_price:,}" if p.discount_price else None,
            "discount_percent": p.discount_percent,
            "image_url": p.image_url if p.image_url else "",
            "warranty": p.warranty,
            "rating": str(p.rating),
            "reviews_count": p.reviews_count,
            "badge": p.badge,
            "colors": p.colors_list,
            "specs": p.specs_list,
            "stock": p.stock,
            "fast_delivery": p.fast_delivery,
        }
        return JsonResponse({"status": "success", "product": data})
    except Product.DoesNotExist:
        return JsonResponse({"status": "error", "message": "محصول یافت نشد"}, status=404)
