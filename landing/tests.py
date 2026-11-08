from django.test import TestCase, Client
from django.urls import reverse
from landing.models import Category, Product, Banner, Article, Newsletter


class MobitLandingPageTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(
            name="گوشی موبایل",
            name_en="MobilePhone",
            slug="mobilephone",
            icon="📱",
            subtitle="سامسونگ، شیائومی، اپل",
        )
        self.product = Product.objects.create(
            title="ساعت هوشمند آنر مدل Honor Choice Watch 2i",
            title_en="Honor Choice Watch 2i Smart Watch",
            slug="honor-choice-watch-2i-test",
            category=self.category,
            brand="آنر",
            price=7931000,
            discount_price=6990000,
            is_deal=True,
            is_featured=True,
            specs="صفحه نمایش ۱.۹۵ اینچ\nمکالمه بلوتوثی",
        )
        self.banner = Banner.objects.create(
            title="شکار تخفیف مبیت",
            banner_type="slider",
            is_active=True,
        )
        self.article = Article.objects.create(
            title="راهنمای خرید بهترین گوشی‌های مبیت",
            slug="mobit-buyers-guide-test",
            excerpt="بررسی جامع گوشی‌های برتر بازار",
        )

    def test_landing_page_status_and_content(self):
        response = self.client.get(reverse("landing:home"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "landing/index.html")
        self.assertTemplateUsed(response, "landing/base.html")
        self.assertContains(response, "مبیت")
        self.assertContains(response, "ساعت هوشمند آنر مدل Honor Choice Watch 2i")
        self.assertContains(response, "شکار تخفیف مبیت")
        self.assertContains(response, "راهنمای خرید بهترین گوشی‌های مبیت")

    def test_newsletter_subscription(self):
        url = reverse("landing:newsletter_subscribe")
        response = self.client.post(url, {"contact": "09123456789"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertTrue(Newsletter.objects.filter(contact="09123456789").exists())

    def test_search_api(self):
        url = reverse("landing:search_api")
        response = self.client.get(f"{url}?q=آنر")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data["results"]), 0)
        self.assertIn("ساعت هوشمند آنر", data["results"][0]["title"])

    def test_product_detail_api(self):
        url = reverse("landing:product_detail_api", args=[self.product.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["product"]["brand"], "آنر")
        self.assertEqual(data["product"]["title_en"], "Honor Choice Watch 2i Smart Watch")
