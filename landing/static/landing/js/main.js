/**
 * مبیت (mobit.ir) - فروشگاه آنلاین موبایل و کالای دیجیتال
 * Master Interactive Logic: Carousel, Flash Sale Timer, Cart Drawer, Quick View Modal, Live Search, City Selector, Newsletter
 */

document.addEventListener("DOMContentLoaded", () => {
  initCountdownTimer();
  initHeroSlider();
  initProductTabs();
  initCart();
  initQuickViewModal();
  initCityModal();
  initLiveSearch();
  initMobileMenu();
  initNewsletter();
  initBackToTop();
});

/* ==========================================================================
   Helper: Convert English digits to Persian
   ========================================================================== */
function toPersianNum(val) {
  if (val === null || val === undefined) return "";
  const map = {
    0: "۰", 1: "۱", 2: "۲", 3: "۳", 4: "۴",
    5: "۵", 6: "۶", 7: "۷", 8: "۸", 9: "۹"
  };
  return String(val).replace(/[0-9]/g, (d) => map[d] || d);
}

function formatPrice(num) {
  if (!num) return "۰";
  return toPersianNum(num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

/* ==========================================================================
   1. Live Countdown Timer for Flash Deals ("شکار تخفیف مبیت")
   ========================================================================== */
function initCountdownTimer() {
  const hoursEl = document.getElementById("timerHours");
  const minutesEl = document.getElementById("timerMinutes");
  const secondsEl = document.getElementById("timerSeconds");

  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Target time: midnight tonight or 10 hours from now
  const now = new Date();
  const target = new Date();
  target.setHours(23, 59, 59, 999);

  function tick() {
    const current = new Date();
    let diff = target - current;

    if (diff <= 0) {
      diff = 12 * 3600 * 1000;
    }

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = toPersianNum(String(h).padStart(2, "0"));
    minutesEl.textContent = toPersianNum(String(m).padStart(2, "0"));
    secondsEl.textContent = toPersianNum(String(s).padStart(2, "0"));
  }

  tick();
  setInterval(tick, 1000);
}

/* ==========================================================================
   2. Hero Slider (اسلایدر اصلی مبیت)
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll(".slider-slide");
  const dots = document.querySelectorAll(".slider-dot");
  const prevBtn = document.getElementById("sliderPrevBtn");
  const nextBtn = document.getElementById("sliderNextBtn");
  const container = document.querySelector(".slider-container");

  if (!slides.length) return;

  let currentSlide = 0;
  let timer = null;

  function goToSlide(idx) {
    if (idx >= slides.length) currentSlide = 0;
    else if (idx < 0) currentSlide = slides.length - 1;
    else currentSlide = idx;

    slides.forEach((s, i) => {
      if (i === currentSlide) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });

    dots.forEach((d, i) => {
      if (i === currentSlide) {
        d.classList.remove("bg-white/50", "w-2.5");
        d.classList.add("bg-white", "w-7");
      } else {
        d.classList.remove("bg-white", "w-7");
        d.classList.add("bg-white/50", "w-2.5");
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5500);
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goToSlide(currentSlide - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goToSlide(currentSlide + 1);
      startAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => {
      goToSlide(idx);
      startAutoplay();
    });
  });

  if (container) {
    container.addEventListener("mouseenter", stopAutoplay);
    container.addEventListener("mouseleave", startAutoplay);
  }

  startAutoplay();
}

/* ==========================================================================
   3. Tabbed Products Navigation (تب‌های محصولات منتخب مبیت)
   ========================================================================== */
function initProductTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;

      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      tabPanels.forEach((panel) => {
        if (panel.id === targetId) {
          panel.classList.remove("hidden");
        } else {
          panel.classList.add("hidden");
        }
      });
    });
  });
}

/* ==========================================================================
   4. Shopping Cart Drawer & localStorage Management
   ========================================================================== */
const CART_STORAGE_KEY = "mobit_cart_v1";

function getCartItems() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCartItems(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
  updateCartUI();
}

function updateCartUI() {
  const items = getCartItems();
  const badgeEl = document.getElementById("cartBadge");
  const drawerList = document.getElementById("cartItemsList");
  const totalPriceEl = document.getElementById("cartTotalPrice");
  const countEl = document.getElementById("drawerItemCount");

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Update Badge
  if (badgeEl) {
    if (totalQuantity > 0) {
      badgeEl.textContent = toPersianNum(totalQuantity);
      badgeEl.classList.remove("hidden");
    } else {
      badgeEl.classList.add("hidden");
    }
  }

  // Update Count
  if (countEl) {
    countEl.textContent = `${toPersianNum(totalQuantity)} کالا در سبد`;
  }

  // Update Total Price
  if (totalPriceEl) {
    totalPriceEl.textContent = formatPrice(totalPrice);
  }

  // Render Items List inside Drawer
  if (drawerList) {
    if (items.length === 0) {
      drawerList.innerHTML = `
        <div class="py-16 text-center text-slate-400">
          <div class="text-4xl mb-3">🛍️</div>
          <p class="text-sm font-semibold text-slate-700">سبد خرید شما در حال حاضر خالی است.</p>
          <p class="text-xs mt-1 text-slate-400">کالاهای دلخواه خود را به سبد خرید اضافه کنید.</p>
        </div>
      `;
      return;
    }

    let html = "";
    items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      html += `
        <div class="py-3.5 flex items-center justify-between gap-3 group">
          <div class="w-14 h-14 bg-slate-50 rounded-xl p-1 border border-slate-200 flex-shrink-0 flex items-center justify-center">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.title}" class="w-full h-full object-contain">`
                : `<span class="text-2xl">📱</span>`
            }
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-xs font-bold text-slate-800 line-clamp-1 leading-snug" title="${item.title}">${item.title}</h4>
            <div class="text-[10px] text-slate-400 mt-0.5">${item.brand || ""}</div>
            <div class="text-xs font-black text-[#034694] mt-1">
              ${formatPrice(itemTotal)} <span class="text-[9px] font-normal text-slate-500">تومان</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <button class="cart-qty-btn px-2 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold" data-id="${item.id}" data-action="increase">+</button>
              <span class="px-2 text-xs font-bold text-slate-800">${toPersianNum(item.quantity)}</span>
              <button class="cart-qty-btn px-2 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold" data-id="${item.id}" data-action="decrease">-</button>
            </div>
            <button class="cart-remove-btn p-1.5 text-slate-400 hover:text-red-600 transition" data-id="${item.id}" title="حذف کالا">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      `;
    });

    drawerList.innerHTML = html;

    // Attach listeners for +, -, remove inside drawer
    drawerList.querySelectorAll(".cart-qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        modifyCartItemQuantity(id, action === "increase" ? 1 : -1);
      });
    });

    drawerList.querySelectorAll(".cart-remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        removeCartItem(id);
      });
    });
  }
}

function modifyCartItemQuantity(id, delta) {
  let items = getCartItems();
  const existing = items.find((item) => String(item.id) === String(id));
  if (!existing) return;

  existing.quantity = (existing.quantity || 1) + delta;
  if (existing.quantity <= 0) {
    items = items.filter((item) => String(item.id) !== String(id));
  }
  saveCartItems(items);
}

function removeCartItem(id) {
  let items = getCartItems();
  items = items.filter((item) => String(item.id) !== String(id));
  saveCartItems(items);
  showToast("کالا از سبد خرید شما حذف گردید.", "info");
}

function addToCart(item) {
  let items = getCartItems();
  const existing = items.find((i) => String(i.id) === String(item.id));
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    items.push({
      id: item.id,
      title: item.title,
      price: parseInt(item.price, 10) || 0,
      image: item.image || "",
      brand: item.brand || "",
      quantity: 1,
    });
  }
  saveCartItems(items);
  showToast(`«${item.title.substring(0, 32)}...» به سبد خرید اضافه شد.`, "success");
}

function initCart() {
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const drawerOverlay = document.getElementById("cartDrawerOverlay");
  const drawer = document.getElementById("cartDrawer");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function openCart() {
    if (!drawerOverlay || !drawer) return;
    drawerOverlay.classList.remove("opacity-0", "pointer-events-none");
    drawerOverlay.classList.add("opacity-100");
    drawer.classList.remove("-translate-x-full");
    drawer.classList.add("translate-x-0");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    if (!drawerOverlay || !drawer) return;
    drawerOverlay.classList.remove("opacity-100");
    drawerOverlay.classList.add("opacity-0", "pointer-events-none");
    drawer.classList.remove("translate-x-0");
    drawer.classList.add("-translate-x-full");
    document.body.style.overflow = "";
  }

  if (openCartBtn) openCartBtn.addEventListener("click", openCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);

  if (drawerOverlay) {
    drawerOverlay.addEventListener("click", (e) => {
      if (e.target === drawerOverlay) closeCart();
    });
  }

  // Global handler for 'Add to Cart' buttons on page
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart-btn");
    if (!btn) return;

    const item = {
      id: btn.dataset.id,
      title: btn.dataset.title,
      price: btn.dataset.price,
      image: btn.dataset.image,
      brand: btn.dataset.brand,
    };
    addToCart(item);
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const items = getCartItems();
      if (items.length === 0) {
        showToast("سبد خرید شما خالی است!", "error");
        return;
      }
      showToast("سفارش شما با موفقیت ثبت شد. انتقال به درگاه پرداخت مبیت...", "success");
      setTimeout(() => {
        closeCart();
      }, 1500);
    });
  }

  // Initial render on page load
  updateCartUI();
}

/* ==========================================================================
   5. Quick View Product Modal (پیش‌نمایش سریع کالا)
   ========================================================================== */
function initQuickViewModal() {
  const modal = document.getElementById("quickViewModal");
  const dialog = document.getElementById("quickViewDialog");
  const closeBtn = document.getElementById("closeQuickViewBtn");
  const contentEl = document.getElementById("quickViewContent");

  if (!modal || !contentEl) return;

  function openModal() {
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.classList.add("opacity-100");
    dialog.classList.remove("scale-95");
    dialog.classList.add("scale-100");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0", "pointer-events-none");
    dialog.classList.remove("scale-100");
    dialog.classList.add("scale-95");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".quick-view-btn");
    if (!btn) return;

    const productId = btn.dataset.productId;
    if (!productId) return;

    contentEl.innerHTML = `
      <div class="py-12 text-center text-slate-400">
        <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-xs font-semibold">در حال بارگذاری اطلاعات کالا از سرور مبیت...</p>
      </div>
    `;
    openModal();

    fetch(`/api/product/${productId}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status !== "success" || !data.product) {
          contentEl.innerHTML = `<p class="text-center text-red-500 text-xs py-8">اطلاعات کالا یافت نشد.</p>`;
          return;
        }

        const p = data.product;
        const specsHtml = p.specs && p.specs.length
          ? `<ul class="space-y-1.5 text-xs text-slate-600 my-3">
              ${p.specs.slice(0, 4).map((s) => `<li class="flex items-start gap-1.5"><span class="text-blue-600 font-bold">•</span> ${s}</li>`).join("")}
            </ul>`
          : "";

        const colorsHtml = p.colors && p.colors.length
          ? `<div class="flex items-center gap-2 my-3">
              <span class="text-xs text-slate-500 font-bold">رنگ‌بندی:</span>
              <div class="flex items-center gap-1.5">
                ${p.colors.map((c) => `<span class="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium">${c}</span>`).join("")}
              </div>
            </div>`
          : "";

        contentEl.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div class="md:col-span-5 flex items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              ${
                p.image_url
                  ? `<img src="${p.image_url}" alt="${p.title}" class="max-h-60 object-contain">`
                  : `<span class="text-7xl">📱</span>`
              }
            </div>
            <div class="md:col-span-7 space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span class="font-bold text-[#034694]">${p.brand} | ${p.category}</span>
                <span class="text-amber-500 font-bold">★ ${toPersianNum(p.rating)} (${toPersianNum(p.reviews_count)} نظر)</span>
              </div>
              <h2 class="text-base font-black text-slate-900 leading-snug">${p.title}</h2>
              ${p.title_en ? `<p class="text-xs text-slate-400 font-sans">${p.title_en}</p>` : ""}
              
              <div class="text-xs text-slate-500 flex items-center gap-1.5 py-1">
                <span>🛡️</span>
                <span>${p.warranty}</span>
              </div>

              ${colorsHtml}
              ${specsHtml}

              <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  ${p.discount_price ? `<span class="text-xs text-slate-400 line-through block">${toPersianNum(p.price)} تومان</span>` : ""}
                  <div class="text-lg font-black text-[#034694]">
                    ${p.discount_price ? toPersianNum(p.discount_price) : toPersianNum(p.price)}
                    <span class="text-xs font-normal text-slate-500">تومان</span>
                  </div>
                </div>
                <button 
                  class="add-to-cart-btn px-6 py-2.5 bg-[#034694] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
                  data-id="${p.id}"
                  data-title="${p.title}"
                  data-price="${(p.discount_price || p.price).replace(/,/g, "")}"
                  data-image="${p.image_url}"
                  data-brand="${p.brand}"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  <span>افزودن به سبد خرید</span>
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .catch((err) => {
        contentEl.innerHTML = `<p class="text-center text-red-500 text-xs py-8">خطا در برقراری ارتباط با سرور.</p>`;
      });
  });
}

/* ==========================================================================
   6. City Selection Modal
   ========================================================================== */
function initCityModal() {
  const openBtn = document.getElementById("openCityModalBtn");
  const closeBtn = document.getElementById("closeCityModalBtn");
  const modal = document.getElementById("cityModal");
  const cityLabel = document.getElementById("currentCityLabel");

  if (!modal) return;

  function openModal() {
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.classList.add("opacity-100");
  }

  function closeModal() {
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0", "pointer-events-none");
  }

  if (openBtn) openBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  modal.querySelectorAll(".city-opt-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const city = btn.dataset.city;
      if (cityLabel) cityLabel.textContent = `ارسال به ${city}`;
      closeModal();
      showToast(`مقصد تحویل به «${city}» تنظیم شد.`, "success");
    });
  });
}

/* ==========================================================================
   7. Live Instant Search with Debounce & Dropdown
   ========================================================================== */
function initLiveSearch() {
  const mainInput = document.getElementById("mainSearchInput");
  const mobileInput = document.getElementById("mobileSearchInput");
  const dropdown = document.getElementById("searchDropdown");
  const resultsList = document.getElementById("searchResultsList");
  const closeBtn = document.getElementById("closeSearchBtn");

  let debounceTimer = null;

  function doSearch(query) {
    if (!query || query.trim().length < 2) {
      if (dropdown) dropdown.classList.add("hidden");
      return;
    }

    if (resultsList) {
      resultsList.innerHTML = `
        <div class="p-4 text-center text-xs text-slate-400">
          در حال جستجو در مبیت...
        </div>
      `;
      dropdown.classList.remove("hidden");
    }

    fetch(`/api/search/?q=${encodeURIComponent(query.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.results || data.results.length === 0) {
          resultsList.innerHTML = `
            <div class="p-6 text-center text-xs text-slate-500">
              هیچ کالایی متناسب با «<strong>${query}</strong>» پیدا نشد.
            </div>
          `;
          return;
        }

        let html = "";
        data.results.forEach((item) => {
          html += `
            <div class="p-3 hover:bg-blue-50/60 cursor-pointer flex items-center justify-between gap-3 transition group search-item-row" data-id="${item.id}">
              <div class="w-12 h-12 bg-slate-50 rounded-xl p-1 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                ${
                  item.image_url
                    ? `<img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-contain">`
                    : `<span class="text-xl">📱</span>`
                }
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#034694] transition">${item.title}</h4>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span>${item.brand}</span>
                  <span>•</span>
                  <span>${item.category}</span>
                </div>
              </div>
              <div class="text-left flex-shrink-0">
                ${item.discount_price ? `<span class="text-[10px] text-slate-400 line-through block">${toPersianNum(item.price)}</span>` : ""}
                <div class="text-xs font-black text-[#034694]">
                  ${item.discount_price ? toPersianNum(item.discount_price) : toPersianNum(item.price)}
                  <span class="text-[9px] font-normal text-slate-500">تومان</span>
                </div>
              </div>
            </div>
          `;
        });

        resultsList.innerHTML = html;

        // Clicking search item opens quick view
        resultsList.querySelectorAll(".search-item-row").forEach((row) => {
          row.addEventListener("click", () => {
            const id = row.dataset.id;
            dropdown.classList.add("hidden");
            const quickBtn = document.querySelector(`.quick-view-btn[data-product-id="${id}"]`);
            if (quickBtn) {
              quickBtn.click();
            } else {
              // Trigger quick view directly
              const dummy = document.createElement("button");
              dummy.className = "quick-view-btn";
              dummy.dataset.productId = id;
              document.body.appendChild(dummy);
              dummy.click();
              dummy.remove();
            }
          });
        });
      })
      .catch((err) => {
        if (resultsList) {
          resultsList.innerHTML = `<div class="p-4 text-center text-xs text-red-500">خطا در بارگذاری نتایج.</div>`;
        }
      });
  }

  function handleInput(e) {
    clearTimeout(debounceTimer);
    const q = e.target.value;
    debounceTimer = setTimeout(() => {
      doSearch(q);
    }, 280);
  }

  if (mainInput) mainInput.addEventListener("input", handleInput);
  if (mobileInput) mobileInput.addEventListener("input", handleInput);

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (dropdown) dropdown.classList.add("hidden");
    });
  }

  // Keyboard shortcut Ctrl + K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (mainInput) {
        mainInput.focus();
        mainInput.select();
      }
    }
    if (e.key === "Escape") {
      if (dropdown) dropdown.classList.add("hidden");
    }
  });

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (dropdown && !dropdown.contains(e.target) && !mainInput.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
}

/* ==========================================================================
   8. Mobile Drawer Menu
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const drawer = document.getElementById("mobileDrawer");
  const closeBtn = document.getElementById("closeMobileDrawerBtn");

  if (!menuBtn || !drawer) return;

  menuBtn.addEventListener("click", () => {
    drawer.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  function closeMenu() {
    drawer.classList.add("hidden");
    document.body.style.overflow = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) closeMenu();
  });
}

/* ==========================================================================
   9. Newsletter AJAX Subscription
   ========================================================================== */
function initNewsletter() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input[name='contact']");
    const contact = input ? input.value.trim() : "";

    if (!contact) {
      showToast("لطفاً شماره موبایل یا ایمیل خود را وارد فرمایید.", "error");
      return;
    }

    const csrfInput = form.querySelector("input[name='csrfmiddlewaretoken']");
    const csrfToken = csrfInput ? csrfInput.value : "";

    const formData = new FormData();
    formData.append("contact", contact);
    formData.append("csrfmiddlewaretoken", csrfToken);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          showToast(data.message, "success");
          form.reset();
        } else {
          showToast(data.message || "خطایی رخ داد.", "error");
        }
      })
      .catch((err) => {
        showToast("خطا در برقراری ارتباط با سرور.", "error");
      });
  });
}

/* ==========================================================================
   10. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById("backToTopBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* ==========================================================================
   11. Toast Notification System
   ========================================================================== */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  const bgColors = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-[#034694] text-white",
  };
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  toast.className = `toast ${bgColors[type] || bgColors.info} px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold`;
  toast.innerHTML = `
    <span class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-black">${icons[type] || icons.info}</span>
    <span class="flex-1 leading-relaxed">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-30px)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// Expose showToast globally for inline HTML clicks
window.showToast = showToast;
