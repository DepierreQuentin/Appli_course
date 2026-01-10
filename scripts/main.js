import { loadFromLocalStorage } from './storage.js';
import { setRecipes, updateRecipeList } from './recipes.js';
import { setListMenuList, updateListMenuList, updateChefCarousel } from './menu.js';

async function initialize() {
  const data = await loadFromLocalStorage();
  setRecipes(data.recipes);
  setListMenuList(data.listMenuList);

  document.querySelectorAll('.tab-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = e.target.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      document.getElementById(tabId).classList.add('active');
    });
  });

  const modal = document.getElementById('recipe-modal');
  const span = document.getElementsByClassName('close')[0];
  span.onclick = () => { modal.style.display = 'none'; };
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  updateRecipeList();
  updateListMenuList();
  updateChefCarousel();

  const randomBox = document.getElementById('chef-random-checkbox');
  const sliders = document.getElementById('chef-settings-sliders');
  if (randomBox && sliders) {
    function toggle() {
      if (randomBox.checked) sliders.classList.add('disabled');
      else sliders.classList.remove('disabled');
      updateChefCarousel();
    }
    randomBox.addEventListener('change', toggle);
    toggle();

    // enable/disable sliders based on per-slider switches
    sliders.querySelectorAll('input[type="checkbox"][id$="-enabled"]').forEach(cb => {
      const slider = document.getElementById(cb.id.replace('-enabled', '-slider'));
      if (!slider) return;
      function toggleSlider() {
        slider.disabled = !cb.checked;
        updateChefCarousel();
      }
      cb.addEventListener('change', toggleSlider);
      toggleSlider();
    });

    const phrases = ['l\xE9g\xE8rement plus', 'un peu plus', 'plus', 'beaucoup plus'];

    sliders.querySelectorAll('input[type="range"]').forEach(slider => {
      const output = document.getElementById(slider.id.replace('-slider', '-value'));
      const left = slider.parentElement.querySelector('.slider-label-left')?.textContent.trim() || '';
      const right = slider.parentElement.querySelector('.slider-label-right')?.textContent.trim() || '';
      function update() {
        if (!output) return;
        const val = parseInt(slider.value, 10);
        const diff = Math.abs(val - 50) / 10;
        if (diff === 0) {
          output.textContent = '50/50';
        } else {
          const label = val < 50 ? left : right;
          if (diff >= 5) {
            output.textContent = label;
          } else {
            output.textContent = `${phrases[diff - 1]} ${label}`;
          }
        }
      }
      slider.addEventListener('input', () => { update(); updateChefCarousel(); });
      update();
    });
  }

  const prev = document.getElementById('carousel-prev');
  const next = document.getElementById('carousel-next');
  const inner = document.getElementById('carousel-inner');
  if (prev && next && inner) {
    prev.addEventListener('click', () => {
      inner.scrollLeft -= 160;
    });
    next.addEventListener('click', () => {
      inner.scrollLeft += 160;
    });
  }
}

initialize();
