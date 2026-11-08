from datetime import date, datetime
from django import template
from django.contrib.humanize.templatetags.humanize import intcomma

register = template.Library()

PERSIAN_DIGITS_MAP = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")

PERSIAN_MONTH_NAMES = [
    "",
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
]


def gregorian_to_jalali(gy, gm, gd):
    """
    الگوریتم دقیق و بدون وابستگی تبدیل تاریخ میلادی به هجری خورشیدی (جلالی).
    """
    g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    if gy > 1600:
        jy = 979
        gy -= 1600
    else:
        jy = 0
        gy -= 621
    gy2 = gy if gm > 2 else gy - 1
    days = 365 * gy + (gy2 + 3) // 4 - (gy2 + 99) // 100 + (gy2 + 399) // 400 - 80 + gd + g_d_m[gm - 1]
    jy += 33 * (days // 12053)
    days %= 12053
    jy += 4 * (days // 1461)
    days %= 1461
    if days > 365:
        jy += (days - 1) // 365
        days = (days - 1) % 365
    if days < 186:
        jm = 1 + (days // 31)
        jd = 1 + (days % 31)
    else:
        jm = 7 + ((days - 186) // 30)
        jd = 1 + ((days - 186) % 30)
    return jy, jm, jd


@register.filter(name="persian_digits")
def persian_digits(value):
    """
    تبدیل تمام ارقام انگلیسی درون رشته یا عدد به ارقام فارسی.
    """
    if value is None:
        return ""
    return str(value).translate(PERSIAN_DIGITS_MAP)


@register.filter(name="persian_intcomma")
def persian_intcomma(value):
    """
    سه‌رقم‌سه‌رقم جدا کردن عدد و تبدیل ارقام به فارسی (مثلاً ۱۴,۵۶۰,۰۰۰).
    """
    if value is None or value == "":
        return ""
    try:
        formatted = intcomma(value, False)
        return str(formatted).translate(PERSIAN_DIGITS_MAP)
    except (ValueError, TypeError):
        return str(value).translate(PERSIAN_DIGITS_MAP)


@register.filter(name="jalali_date")
def jalali_date(value, mode="numeric"):
    """
    تبدیل شی date یا datetime به تاریخ شمسی با ارقام فارسی.
    mode='numeric': ۱۴۰۳/۰۸/۱۶
    mode='text': ۱۶ آبان ۱۴۰۳
    """
    if not value:
        return ""
    if isinstance(value, datetime):
        d = value.date()
    elif isinstance(value, date):
        d = value
    else:
        return str(value)

    jy, jm, jd = gregorian_to_jalali(d.year, d.month, d.day)

    if mode == "text":
        month_name = PERSIAN_MONTH_NAMES[jm] if 1 <= jm <= 12 else str(jm)
        res = f"{jd} {month_name} {jy}"
    else:
        res = f"{jy}/{jm:02d}/{jd:02d}"

    return res.translate(PERSIAN_DIGITS_MAP)


@register.simple_tag
def current_jalali_year():
    """
    سال جاری خورشیدی به ارقام فارسی برای نمایش پویا در فوتر سایت.
    """
    today = date.today()
    jy, _, _ = gregorian_to_jalali(today.year, today.month, today.day)
    return str(jy).translate(PERSIAN_DIGITS_MAP)


@register.simple_tag
def current_gregorian_year():
    """
    سال جاری میلادی.
    """
    return str(date.today().year)
