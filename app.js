/**
 * ORIGEN 504 • SPECIALTY COFFEE, ROASTERS & BRUNCH
 * Interactive Menu Logic & WhatsApp Order Integration
 * Developed for Breborn.cl Showcase
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initOrderForm();
  initProductAddButtons();
  initMobileMenu();
});

// Número de demostración comercial enlazado a Breborn
const WHATSAPP_PHONE = '56956823670';

/**
 * Navegación por pestañas de la carta
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
 * Conexión de botones "Agregar" de los productos de la carta con el formulario
 */
function initProductAddButtons() {
  const cards = document.querySelectorAll('.menu-item-card');
  const bevSelect = document.getElementById('fBeverage');
  const bakSelect = document.getElementById('fBakery');
  const beanSelect = document.getElementById('fBeans');
  const orderSection = document.getElementById('pedido');
  const orderBox = document.querySelector('.order-box');

  cards.forEach((card) => {
    const addBtn = card.querySelector('.btn-add-item');
    const productName = card.getAttribute('data-product-name');

    const handleSelect = (e) => {
      e.stopPropagation();

      if (!productName) return;

      // Detectar qué tipo de producto es según el contenedor
      const parentTab = card.closest('.tab-content');
      const tabId = parentTab ? parentTab.id : '';

      if (tabId === 'tab-cafeteria' && bevSelect) {
        selectOptionOrAdd(bevSelect, productName);
      } else if (tabId === 'tab-brunch' && bakSelect) {
        selectOptionOrAdd(bakSelect, productName);
      } else if (tabId === 'tab-bakery' && bakSelect) {
        selectOptionOrAdd(bakSelect, productName);
      } else if (tabId === 'tab-grano' && beanSelect) {
        selectOptionOrAdd(beanSelect, productName);
      } else if (bevSelect) {
        selectOptionOrAdd(bevSelect, productName);
      }

      // Scroll suave al formulario de pedido
      if (orderSection) {
        orderSection.scrollIntoView({ behavior: 'smooth' });

        if (orderBox) {
          orderBox.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
          orderBox.style.borderColor = '#d9823b';
          orderBox.style.boxShadow = '0 0 45px rgba(217, 130, 59, 0.7)';
          setTimeout(() => {
            orderBox.style.boxShadow = '';
            orderBox.style.borderColor = '';
          }, 1800);
        }
      }
    };

    if (addBtn) {
      addBtn.addEventListener('click', handleSelect);
    }
    card.addEventListener('click', (e) => {
      if (e.target !== addBtn) {
        handleSelect(e);
      }
    });
  });
}

/**
 * Selecciona una opción en el <select> o la agrega dinámicamente si no existe
 */
function selectOptionOrAdd(selectElem, text) {
  let matched = false;
  for (let i = 0; i < selectElem.options.length; i++) {
    const optVal = selectElem.options[i].value;
    if (optVal.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(optVal.toLowerCase())) {
      selectElem.selectedIndex = i;
      matched = true;
      break;
    }
  }
  if (!matched) {
    const newOpt = new Option(text, text, true, true);
    selectElem.add(newOpt);
  }
}

/**
 * Procesamiento y generación de pedido a WhatsApp
 */
function initOrderForm() {
  const form = document.getElementById('cafeOrderForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const mode = document.getElementById('fMode')?.value || 'En mesa';
      const location = document.getElementById('fLocation')?.value || 'Valparaíso';
      const beverage = document.getElementById('fBeverage')?.value || 'Sin bebida';
      const bakery = document.getElementById('fBakery')?.value || 'Sin comida';
      const beans = document.getElementById('fBeans')?.value || 'Sin café en grano';
      const grind = document.getElementById('fGrind')?.value || 'En grano';
      const notes = document.getElementById('fNotes')?.value || 'Sin notas';

      const lines = [
        '¡Hola Origen 504! ☕ Quisiera hacer un pedido / reserva:',
        '',
        `📋 *Modalidad:* ${mode}`,
        `📍 *Sucursal:* ${location}`,
        `☕ *Café / Bebida:* ${beverage}`,
        `🥐 *Brunch / Pastelería:* ${bakery}`
      ];

      if (!beans.includes('Sin café en bolsa') && !beans.includes('No agregar')) {
        lines.push(`📦 *Café en Grano (250g):* ${beans}`);
        lines.push(`⚙️ *Tipo de Molienda:* ${grind}`);
      }

      lines.push(`📝 *Detalles / Mesa / Dirección:* ${notes}`);
      lines.push('');
      lines.push('¿Me confirman disponibilidad y tiempo estimado? ¡Muchas gracias!');

      const fullMessage = lines.join('\n');
      const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(fullMessage)}`;

      window.open(waUrl, '_blank');
    });
  }
}

/**
 * Menú móvil responsive
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.m-link');

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
      });
    });
  }
}
