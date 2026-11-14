/**
 * MAGNA’S COFFEE • SPECIALTY COFFEE & BAKERY
 * Interactive Engine: Live Cart, Multi-category Filter & WhatsApp Checkout
 * Developed for Magna's Coffee by Breborn.cl
 */

// Teléfono oficial de Magna's Coffee (+56 9 5164 4492)
const WHATSAPP_PHONE = '56951644492';

// Estado global del carrito y pedido
const AppState = {
  cart: [],
  selectedMode: 'Servir en el Local (Mesa)',
  selectedLocation: 'Magna\'s Coffee (Las Palmas 2620 L8, Los Pinos, Quilpué)',
  customerNotes: ''
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModeChips();
  initAddToCartButtons();
  initCartDrawer();
  initMobileMenu();
  loadCartFromStorage();
});

/**
 * 1. Pestañas de la Carta (Barra, Brunch, Bakery, Grano)
 */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });
}

/**
 * 2. Selector de Modalidad (Mesa, Retiro, Delivery estilo Interactive Cart)
 */
function initModeChips() {
  const heroChips = document.querySelectorAll('.mode-chip');
  const drawerModeBtns = document.querySelectorAll('.cart-mode-btn');

  heroChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      heroChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const mode = chip.getAttribute('data-mode');
      AppState.selectedMode = mode;
      syncCartModeButtons(mode);
    });
  });

  drawerModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      drawerModeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-cart-mode');
      AppState.selectedMode = mode;
      syncHeroModeChips(mode);
    });
  });
}

function syncCartModeButtons(mode) {
  const drawerModeBtns = document.querySelectorAll('.cart-mode-btn');
  drawerModeBtns.forEach((btn) => {
    const m = btn.getAttribute('data-cart-mode');
    if (mode.includes('Mesa') && m.includes('Mesa')) {
      btn.classList.add('active');
    } else if (mode.includes('Llevar') && m.includes('Retiro')) {
      btn.classList.add('active');
    } else if (mode.includes('Delivery') && m.includes('Delivery')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function syncHeroModeChips(mode) {
  const heroChips = document.querySelectorAll('.mode-chip');
  heroChips.forEach((chip) => {
    const m = chip.getAttribute('data-mode');
    if (mode.includes('Mesa') && m.includes('Mesa')) {
      chip.classList.add('active');
    } else if (mode.includes('Retiro') && m.includes('Llevar')) {
      chip.classList.add('active');
    } else if (mode.includes('Delivery') && m.includes('Delivery')) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

/**
 * 3. Botones de "Agregar al Pedido" en las tarjetas de productos y tendedero viral
 */
function initAddToCartButtons() {
  const addButtons = document.querySelectorAll('.btn-add-cart');

  addButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      if (!card) return;

      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const price = parseInt(card.getAttribute('data-price'), 10) || 0;
      const cat = card.getAttribute('data-cat') || 'general';

      // Verificar si es café en grano y capturar molienda seleccionada
      let meta = '';
      if (cat === 'grano') {
        const grindSelect = card.querySelector('.bean-grind-select');
        if (grindSelect) {
          meta = `Molienda: ${grindSelect.value}`;
        }
      }

      addItemToCart({
        id: meta ? `${id}-${grindSelectValueToKey(meta)}` : id,
        productId: id,
        name: name,
        price: price,
        meta: meta,
        quantity: 1
      });

      // Animación visual de confirmación en el botón
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>✓ ¡Agregado!</span>';
      btn.style.background = 'var(--gold-primary)';
      btn.style.color = 'var(--bg-darker)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 1100);
    });
  });

  // Botones del tendedero colgante (Showcase viral Pinterest)
  const hangButtons = document.querySelectorAll('.btn-quick-hang-add');
  hangButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'), 10) || 0;

      addItemToCart({
        id: id,
        productId: id,
        name: name,
        price: price,
        meta: 'Selección Vitrina',
        quantity: 1
      });

      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ ¡Listo!';
      btn.style.background = 'var(--gold-primary)';
      btn.style.color = 'var(--bg-darker)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 1100);
    });
  });
}

function grindSelectValueToKey(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * 4. Lógica de Carrito de Compras (Agregar, Modificar Cantidad, Renderizar)
 */
function addItemToCart(item) {
  const existing = AppState.cart.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    AppState.cart.push(item);
  }
  updateCartUI();
  saveCartToStorage();

  // Mostrar el drawer temporalmente o animar sticky bar
  showStickyBar();
}

function updateItemQuantity(itemId, delta) {
  const item = AppState.cart.find((i) => i.id === itemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    AppState.cart = AppState.cart.filter((i) => i.id !== itemId);
  }
  updateCartUI();
  saveCartToStorage();
}

function formatCLP(amount) {
  return '$' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function updateCartUI() {
  const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 1. Actualizar Nav Badge
  const navBadge = document.getElementById('cartCountBadge');
  const navTotal = document.getElementById('cartTotalText');
  if (navBadge) navBadge.textContent = totalCount;
  if (navTotal) navTotal.textContent = formatCLP(totalPrice);

  // 2. Actualizar Drawer Badge & Totals
  const headerBadge = document.getElementById('cartHeaderBadge');
  const subtotalVal = document.getElementById('cartSubtotalValue');
  const totalVal = document.getElementById('cartTotalValue');
  if (headerBadge) headerBadge.textContent = `${totalCount} ${totalCount === 1 ? 'ítem' : 'ítems'}`;
  if (subtotalVal) subtotalVal.textContent = formatCLP(totalPrice);
  if (totalVal) totalVal.textContent = formatCLP(totalPrice);

  // 3. Actualizar Sticky Bar
  const stickyCount = document.getElementById('stickyCartCount');
  const stickyTotal = document.getElementById('stickyCartTotal');
  if (stickyCount) stickyCount.textContent = `${totalCount} ${totalCount === 1 ? 'producto' : 'productos'}`;
  if (stickyTotal) stickyTotal.textContent = `${formatCLP(totalPrice)} CLP`;

  const stickyBar = document.getElementById('stickyCartBar');
  if (stickyBar) {
    if (totalCount > 0) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  }

  // 4. Renderizar Lista de Ítems en el Drawer
  renderCartItemsList();
}

function renderCartItemsList() {
  const listContainer = document.getElementById('cartItemsList');
  if (!listContainer) return;

  if (AppState.cart.length === 0) {
    listContainer.innerHTML = `
      <div class="cart-empty-state">
        <span class="empty-icon">☕</span>
        <h4>Tu pedido está vacío</h4>
        <p>Explora la carta y agrega tus cafés, brunch o café en grano favoritos.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = AppState.cart
    .map((item) => {
      const itemSubtotal = item.price * item.quantity;
      return `
        <div class="cart-item-row" data-id="${item.id}">
          <div class="cart-item-info">
            <h5 class="cart-item-name">${item.name}</h5>
            ${item.meta ? `<span class="cart-item-meta">📌 ${item.meta}</span>` : ''}
            <span class="cart-item-price">${formatCLP(item.price)} c/u</span>
          </div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn btn-minus" data-id="${item.id}" aria-label="Disminuir">−</button>
            <span class="cart-qty-text">${item.quantity}</span>
            <button class="cart-qty-btn btn-plus" data-id="${item.id}" aria-label="Aumentar">＋</button>
          </div>
          <div class="cart-item-subtotal">
            ${formatCLP(itemSubtotal)}
          </div>
        </div>
      `;
    })
    .join('');

  // Vincular eventos de botones + y -
  listContainer.querySelectorAll('.btn-minus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      updateItemQuantity(id, -1);
    });
  });

  listContainer.querySelectorAll('.btn-plus').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      updateItemQuantity(id, 1);
    });
  });
}

/**
 * 5. Control del Drawer del Carrito (Abrir, Cerrar, Checkout WhatsApp)
 */
function initCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const navTrigger = document.getElementById('cartNavBtn');
  const stickyTrigger = document.getElementById('stickyCartTrigger');
  const closeBtn = document.getElementById('cartDrawerClose');
  const overlay = document.getElementById('cartDrawerOverlay');
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  const locationSelect = document.getElementById('cartLocationSelect');
  const notesInput = document.getElementById('cartCustomerNotes');

  const openDrawer = () => {
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeDrawer = () => {
    if (drawer) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (navTrigger) navTrigger.addEventListener('click', openDrawer);
  if (stickyTrigger) stickyTrigger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  if (locationSelect) {
    locationSelect.addEventListener('change', (e) => {
      AppState.selectedLocation = e.target.value;
    });
  }

  if (notesInput) {
    notesInput.addEventListener('input', (e) => {
      AppState.customerNotes = e.target.value;
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      handleWhatsAppCheckout();
    });
  }
}

function showStickyBar() {
  const stickyBar = document.getElementById('stickyCartBar');
  if (stickyBar && AppState.cart.length > 0) {
    stickyBar.classList.add('visible');
  }
}

/**
 * 6. Generación del Mensaje y Conexión Directa con WhatsApp
 */
function handleWhatsAppCheckout() {
  if (AppState.cart.length === 0) {
    alert('Tu pedido está vacío. Por favor agrega productos desde la carta.');
    return;
  }

  const total = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const locationElem = document.getElementById('cartLocationSelect');
  const location = locationElem ? locationElem.value : AppState.selectedLocation;
  const notesElem = document.getElementById('cartCustomerNotes');
  const notes = notesElem ? notesElem.value.trim() : '';

  const lines = [
    '¡Hola Magna\'s Coffee! ☕ Quisiera enviar el siguiente pedido desde su carta web:',
    '',
    `📋 *Modalidad:* ${AppState.selectedMode}`,
    `📍 *Ubicación:* ${location}`
  ];

  if (notes) {
    lines.push(`📝 *Detalles / Mesa / Dirección:* ${notes}`);
  }

  lines.push('');
  lines.push('🛒 *Detalle del Pedido:*');

  AppState.cart.forEach((item) => {
    const itemSubtotal = item.price * item.quantity;
    const metaStr = item.meta ? ` [${item.meta}]` : '';
    lines.push(`• ${item.quantity}x ${item.name}${metaStr} — ${formatCLP(itemSubtotal)}`);
  });

  lines.push('');
  lines.push(`💰 *Total a Pagar:* ${formatCLP(total)} CLP`);
  lines.push('');
  lines.push('¿Me confirman para proceder? ¡Muchas gracias!');

  const fullText = lines.join('\n');
  const encodedText = encodeURIComponent(fullText);

  // Intentar abrir por la app de escritorio o wa.me según el entorno
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
  window.open(waUrl, '_blank');
}

/**
 * 7. Almacenamiento Local (Persistencia de carrito)
 */
function saveCartToStorage() {
  try {
    localStorage.setItem('magnascoffee_cart', JSON.stringify(AppState.cart));
  } catch (e) {
    // Silencioso
  }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('magnascoffee_cart');
    if (saved) {
      AppState.cart = JSON.parse(saved);
      updateCartUI();
    }
  } catch (e) {
    // Silencioso
  }
}

/**
 * 8. Menú Móvil
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });

    mobileNav.querySelectorAll('.m-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });
  }
}
