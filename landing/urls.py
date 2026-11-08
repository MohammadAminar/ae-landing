from django.urls import path
from . import views

app_name = "landing"

urlpatterns = [
    path("", views.landing_page, name="home"),
    path("newsletter/subscribe/", views.newsletter_subscribe, name="newsletter_subscribe"),
    path("api/search/", views.search_api, name="search_api"),
    path("api/product/<int:product_id>/", views.product_detail_api, name="product_detail_api"),
]
