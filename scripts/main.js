import { loadFromLocalStorage } from './storage.js';
import { setRecipes, updateRecipeList } from './recipes.js';
import { setListMenuList, updateListMenuList } from './menus.js';

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
}

initialize();
