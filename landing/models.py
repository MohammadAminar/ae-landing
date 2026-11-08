from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام دسته‌بندی")
    name_en = models.CharField(max_length=100, blank=True, verbose_name="نام انگلیسی")
    slug = models.SlugField(max_length=100, unique=True, allow_unicode=True, verbose_name="نامک (Slug)")
    icon = models.CharField(max_length=50, default="📱", verbose_name="آیکون (ایموجی یا کد آیکون)")
    icon_url = models.URLField(max_length=500, blank=True, verbose_name="آدرس آیکون وب‌پی (CDN)")
    subtitle = models.CharField(max_length=150, blank=True, verbose_name="توضیح کوتاه زیر عنوان")
    color_class = models.CharField(
        max_length=50,
        default="blue",
        choices=[
            ("blue", "آبی مبیت"),
            ("orange", "نارنجی/مرجانی"),
            ("purple", "بنفش"),
            ("emerald", "سبز زمردی"),
            ("rose", "قرمز شگفت‌انگیز"),
            ("amber", "کهربایی"),
            ("cyan", "فیروزه‌ای"),
        ],
        verbose_name="تم رنگی کارت",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="ترتیب نمایش")

    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class Product(models.Model):
    title = models.CharField(max_length=255, verbose_name="عنوان فارسی محصول")
    title_en = models.CharField(max_length=255, blank=True, verbose_name="عنوان انگلیسی")
    slug = models.SlugField(max_length=255, unique=True, allow_unicode=True, verbose_name="نامک (Slug)")
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
        verbose_name="دسته‌بندی",
    )
    brand = models.CharField(max_length=100, verbose_name="برند کالا")
    price = models.BigIntegerField(verbose_name="قیمت اصلی (تومان)")
    discount_price = models.BigIntegerField(null=True, blank=True, verbose_name="قیمت با تخفیف (تومان)")
    stock = models.PositiveIntegerField(default=15, verbose_name="تعداد در انبار")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.8, verbose_name="امتیاز (از ۵)")
    reviews_count = models.PositiveIntegerField(default=18, verbose_name="تعداد دیدگاه‌ها")
    warranty = models.CharField(max_length=150, default="گارانتی ۱۸ ماهه معتبر شرکتی + ضمانت طلایی مبیت", verbose_name="گارانتی")
    icon_placeholder = models.CharField(max_length=50, default="📱", verbose_name="ایموجی پیش‌نمایش")
    image = models.FileField(upload_to="products/", null=True, blank=True, verbose_name="فایل تصویر")
    image_url = models.URLField(max_length=500, blank=True, verbose_name="آدرس اینترنتی تصویر کالا")
    badge = models.CharField(max_length=80, blank=True, verbose_name="برچسب کارت (مثلاً پرفروش مبیت، ارسال فوری)")
    colors = models.CharField(max_length=150, blank=True, default="مشکی,آبی,نقره‌ای", verbose_name="رنگ‌های موجود (با ویرگول)")
    specs = models.TextField(
        blank=True,
        help_text="هر مشخصه را در یک سطر جدید وارد کنید (با علامت - یا بولت)",
        verbose_name="مشخصات کلیدی",
    )

    # تب‌ها و جایگاه‌های نمایش
    fast_delivery = models.BooleanField(default=True, verbose_name="ارسال سریع امروز")
    is_deal = models.BooleanField(default=False, verbose_name="شکار تخفیف و پیشنهاد شگفت‌انگیز مبیت")
    is_featured = models.BooleanField(default=False, verbose_name="پرفروش‌ترین‌های مبیت")
    is_viewed = models.BooleanField(default=False, verbose_name="پربازدیدترین کالاها")
    is_new = models.BooleanField(default=False, verbose_name="جدیدترین کالاها")
    is_gaming = models.BooleanField(default=False, verbose_name="منتخب گیمرها")
    is_accessory = models.BooleanField(default=False, verbose_name="لوازم جانبی پرطرفدار")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    class Meta:
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"
        ordering = ["-id"]

    def __str__(self):
        return f"{self.title} ({self.brand})"

    @property
    def discount_percent(self):
        if self.discount_price and self.price > self.discount_price:
            percent = (1 - (self.discount_price / self.price)) * 100
            return int(round(percent))
        return 0

    @property
    def current_price(self):
        return self.discount_price if self.discount_price else self.price

    @property
    def specs_list(self):
        if not self.specs:
            return []
        lines = [line.strip().lstrip("-•* ") for line in self.specs.splitlines() if line.strip()]
        return lines

    @property
    def colors_list(self):
        if not self.colors:
            return []
        return [c.strip() for c in self.colors.split(",") if c.strip()]


class Banner(models.Model):
    BANNER_TYPES = (
        ("slider", "اسلایدر بزرگ بالای صفحه (Hero Slider)"),
        ("hero_side", "بنر کناری اسلایدر"),
        ("mid_banner", "بنر میانی دوتایی"),
        ("quad_banner", "بنر چهارگانه شبکه‌ای"),
    )

    title = models.CharField(max_length=200, verbose_name="عنوان اصلی بنر")
    subtitle = models.CharField(max_length=255, blank=True, verbose_name="زیرعنوان یا توضیح بنر")
    badge = models.CharField(max_length=80, blank=True, verbose_name="برچسب بالای بنر")
    button_text = models.CharField(max_length=60, default="مشاهده و خرید", verbose_name="متن دکمه")
    button_url = models.CharField(max_length=255, default="#", verbose_name="لینک دکمه")
    banner_type = models.CharField(max_length=30, choices=BANNER_TYPES, default="slider", verbose_name="نوع بنر")
    icon = models.CharField(max_length=50, default="📱", verbose_name="ایموجی یا نماد")
    image_desktop_url = models.URLField(max_length=500, blank=True, verbose_name="آدرس تصویر دسکتاپ (CDN)")
    image_mobile_url = models.URLField(max_length=500, blank=True, verbose_name="آدرس تصویر موبایل (CDN)")
    gradient = models.CharField(
        max_length=120,
        default="from-slate-900 to-blue-950",
        verbose_name="کلاس‌های گرادینت پس‌زمینه",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="ترتیب نمایش")
    is_active = models.BooleanField(default=True, verbose_name="فعال باشد؟")

    class Meta:
        verbose_name = "بنر و اسلایدر"
        verbose_name_plural = "بنرها و اسلایدرها"
        ordering = ["order", "id"]

    def __str__(self):
        return f"[{self.get_banner_type_display()}] {self.title}"


class Article(models.Model):
    title = models.CharField(max_length=255, verbose_name="عنوان مقاله")
    slug = models.SlugField(max_length=255, unique=True, allow_unicode=True, verbose_name="نامک (Slug)")
    excerpt = models.TextField(verbose_name="خلاصه مقاله")
    author = models.CharField(max_length=100, default="تحریریه مجله مبیت", verbose_name="نویسنده")
    read_time = models.CharField(max_length=50, default="۵ دقیقه مطالعه", verbose_name="زمان مطالعه")
    icon = models.CharField(max_length=50, default="📰", verbose_name="ایموجی یا نماد")
    category_name = models.CharField(max_length=80, default="راهنمای خرید", verbose_name="دسته‌بندی مقاله")
    image_url = models.URLField(max_length=500, blank=True, verbose_name="آدرس تصویر مقاله")
    image = models.FileField(upload_to="articles/", null=True, blank=True, verbose_name="تصویر مقاله")
    created_at = models.DateField(auto_now_add=True, verbose_name="تاریخ انتشار")

    class Meta:
        verbose_name = "مقاله و راهنمای خرید"
        verbose_name_plural = "مقالات مجله مبیت (Mobit Mag)"
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return self.title


class Newsletter(models.Model):
    contact = models.CharField(max_length=150, unique=True, verbose_name="شماره تماس یا ایمیل")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ عضویت")

    class Meta:
        verbose_name = "عضو خبرنامه"
        verbose_name_plural = "اعضای خبرنامه مبیت"
        ordering = ["-created_at"]

    def __str__(self):
        return self.contact
