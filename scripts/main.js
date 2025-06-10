import { loadFromLocalStorage } from './storage.js';
import { setRecipes, updateRecipeList } from './recipes.js';
import { setListMenuList, updateListMenuList } from './menu.js';

function initialize() {
  const data = loadFromLocalStorage();
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

  const randomBox = document.getElementById('chef-random-checkbox');
  const sliders = document.getElementById('chef-settings-sliders');
  if (randomBox && sliders) {
    function toggle() {
      if (randomBox.checked) sliders.classList.add('disabled');
      else sliders.classList.remove('disabled');
    }
    randomBox.addEventListener('change', toggle);
    toggle();

    sliders.querySelectorAll('input[type="range"]').forEach(slider => {
      const output = document.getElementById(slider.id.replace('-slider', '-value'));
      function update() {
        if (!output) return;
        const val = parseInt(slider.value, 10);
        output.textContent = val === 50 ? 'Aléatoire' : val;
      }
      slider.addEventListener('input', update);
      update();
    });
  }
}

initialize();
