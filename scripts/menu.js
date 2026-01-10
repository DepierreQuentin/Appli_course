import { recipes, filteredRecipes, setFilteredRecipes } from './recipes.js';
import { saveRecipesToLocalStorage, saveMenusToLocalStorage } from './storage.js';
import { formatDate } from './utils.js';

export let listMenuList = [];
export function setListMenuList(data) { listMenuList = data; }
export let menuList = { name: '', date: '', startDate: null, menu: [] };
export let shoppingList = {};

let startDateGlobal = null;// sert pour éviter de passer un paramètre à updateMenuList(), variable initialisé dans createMenuList()
let menuListArray = [];
let selectedDayIndex = null;
let selectedSlotIndex = null;
let editingMenuIndex = null; // index de la liste de menu en cours d'édition
let currentMenuDetailIndex = null; // index de la liste de menu actuellement affichée dans le modal
const SLOT_KEYS = ['midi', 'soir'];

function getSlotKey(slotIndex) {
  return SLOT_KEYS[slotIndex];
}

function getRecipeById(recipeId) {
  return recipes.find(recipe => recipe.recipeId === recipeId);
}

function countMenuRecipes(menuArray) {
  return menuArray.reduce((count, day) => {
    return count + SLOT_KEYS.reduce((slotCount, slotKey) => {
      return slotCount + (day?.[slotKey] ? 1 : 0);
    }, 0);
  }, 0);
}

function getRecipeIdsFromMenu(menuArray) {
  const ids = [];
  menuArray.forEach(day => {
    SLOT_KEYS.forEach(slotKey => {
      const recipeId = day?.[slotKey];
      if (recipeId) ids.push(recipeId);
    });
  });
  return ids;
}

export const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

/*////////////////AFFICHE UNE FENETRE CONTEXTUELLE POUR CREER UN LISTE DE MENUS/////////////*/
   function addMenuList() {

    const form = `
      <form id="menu-list-form">
        <h2>Créer une liste de menu</h2>
        <input type="text" id="menu-list-name" placeholder="Nom de la liste" required>
        <label for="menu-start-date">Date de début :</label>
        <input type="date" id="menu-start-date">
        <label for="menu-end-date">Date de fin :</label>
        <input type="date" id="menu-end-date">
      </form>
    `;

    const container = document.getElementById('menu-form-container');
    container.innerHTML = form;
    container.classList.remove('hidden');

    document.getElementById('menu-list-name').value =  'Liste du ' + new Date().toLocaleDateString('fr-FR');

    // Pré-remplir la date de début avec la date du jour
    document.getElementById('menu-start-date').value = getTodayDate();

    document.getElementById('menu-start-date').addEventListener('change', handleDateChange);
    document.getElementById('menu-end-date').addEventListener('change', handleDateChange);

    document.getElementById('creerListMenu').classList.add("hidden");

    const menuContainer = document.querySelector('.list-menu-lists');
    if (menuContainer && !menuContainer.classList.contains('hidden')) {
      menuContainer.classList.add('hidden');
    }
  }
  
  /*////////////////RETOURNE LA DATE DU JOUR OU SI ARGUMENT DATE DU JOUR + JOUR A AJOUTER ////////////////*/
  function getTodayDate(daysToAdd) {
    const date = new Date();
    if (daysToAdd !== undefined && daysToAdd !== null) {
      date.setDate(date.getDate() + daysToAdd);
    }
    return formatDate(date);
  }
  
  /*////////////////CALCULE LE NB DE JOUR POUR LA LISTE DE MENU////////////////*/
  function calculateNumberOfDays(startDate, endDate) {
    // Calculer la différence en millisecondes entre les deux dates
    const timeDiff = endDate - startDate;
    // Convertir la différence en jours
    const numberOfDays = (Math.ceil(timeDiff / (1000 * 60 * 60 * 24))) + 1;
    return numberOfDays;
  }

  function handleDateChange() {
    const startVal = document.getElementById('menu-start-date').value;
    const endVal = document.getElementById('menu-end-date').value;
    if (!startVal || !endVal) return;

    const startDate = new Date(startVal);
    const endDate = new Date(endVal);
    const numberOfDays = calculateNumberOfDays(startDate, endDate);
    if (numberOfDays < 1) {
      alert("La date de fin doit être après la date de début.");
      return;
    }

    menuList.name = document.getElementById('menu-list-name').value;
    menuList.date = new Date().toLocaleDateString('fr-FR');
    createMenuList(true);
  }

   /*////////////////CREER UN LISTE DE MENU/////////////*/
function createMenuList(skipDuplicateCheck = false) {
  const name = document.getElementById('menu-list-name').value;

  if (!skipDuplicateCheck) {
    const duplicate = listMenuList.some(list => list.name === name);
    if (duplicate) {
      alert('Nom déjà utilisé');
      return;
    }
  }
  const startDateInput = new Date(document.getElementById('menu-start-date').value);
  const endDate = new Date(document.getElementById('menu-end-date').value);


  // Calculer le nombre de jours entre les deux dates
  const numberOfDays = calculateNumberOfDays(startDateInput, endDate);

  // Assigner la date de début à la variable globale
  startDateGlobal = new Date(startDateInput);
  

  // Initialiser chaque jour avec 2 emplacements de recettes vides (null)
  menuListArray = Array.from({ length: numberOfDays }, () => ({ midi: null, soir: null }));

  const menuListDaysContainer = document.getElementById('menu-list-jours');

  // Générer le HTML des jours et emplacements avec les dates dans un tableau
  const tableRows = Array.from({ length: numberOfDays }, (_, i) => {
    const currentDay = new Date(startDateInput);
    currentDay.setDate(startDateInput.getDate() + i); // Calculer la date du jour actuel
    const formattedDate = currentDay.toLocaleDateString('fr-FR', options); // Formater la date

    const slots = SLOT_KEYS.map((slotKey, slotIndex) => {
      const recipeId = menuListArray[i][slotKey];
      const recipe = recipeId ? getRecipeById(recipeId) : null;
      return `
      <td>
        <div class="recipe-slot" data-day="${i}" data-slot="${slotIndex}" onclick="openSlotModal(${i}, ${slotIndex})">
          ${recipe ? `<div class="recipe-card" draggable="true" ondragstart="drag(event, ${i}, ${slotIndex})">
                        <span class="delete-cross" onclick="removeFromMenu(${i}, ${slotIndex}, event)">&times;</span>
                        <h5>${recipe.name}</h5>
                      </div>`
                    : `<div class="empty-slot">Emplacement vide</div>`}
        </div>
      </td>
    `;
    }).join('');

    return `<tr><td>${formattedDate}</td>${slots}</tr>`;
  }).join('');

  menuListDaysContainer.innerHTML = `
    <table class="menu-plan-table">
      <thead>
        <tr><th>Jour</th><th>Midi</th><th>Soir</th></tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>`;

  if (document.getElementById('save-menu-list-button').classList.contains("hidden")) {
    document.getElementById('save-menu-list-button').classList.remove("hidden");
  }
  if (document.getElementById('chef-menu-button').classList.contains("hidden")) {
    document.getElementById('chef-menu-button').classList.remove("hidden");
  }
  if (document.getElementById('clear-menu-recipes-button').classList.contains("hidden")) {
    document.getElementById('clear-menu-recipes-button').classList.remove("hidden");
  }

  document.getElementById('menu-list-jours').classList.remove("hidden");//affiche la liste des menus en cours de création
  const menuContainer = document.querySelector('.list-menu-lists');
  if (menuContainer && !menuContainer.classList.contains('hidden')) {
    menuContainer.classList.add('hidden');
  }

  updateCurrentShoppingList();
}




function openSlotModal(dayIndex, slotIndex) {
  selectedDayIndex = dayIndex;
  selectedSlotIndex = slotIndex;
  setFilteredRecipes([]);
  const form = `
      <form class="recipe-search-form">
        <input type="text" class="recipe-name-search" placeholder="Nom de la recette">
        <select class="recipe-season-search">
          <option value="">Toutes les saisons</option>
          <option value="été">Été</option>
          <option value="hiver">Hiver</option>
          <option value="toute l'année">Toute l'année</option>
        </select>
        <select class="recipe-rating-search">
          <option value="">Toutes les notes</option>
          <option value="5">5 étoiles</option>
          <option value="4">4 étoiles et plus</option>
          <option value="3">3 étoiles et plus</option>
          <option value="2">2 étoiles et plus</option>
          <option value="1">1 étoile et plus</option>
        </select>
        <button type="button" onclick="searchRecipes('recipe-modal')">Rechercher</button>
      </form>
      <div class="recipe-list"></div>
    `;

  document.getElementById('recipe-modal-body').innerHTML = form;
  document.getElementById('recipe-modal').style.display = 'block';
}

/*/////////////////CREER UN LISTE DE RECETTE RANDOM ET L'AJOUTE A LA LISTE DE MENU/////////// */
function getChefMenuPrefs() {
  if (typeof document === 'undefined') return { random: true };
  const box = document.getElementById('chef-random-checkbox');
  if (!box) return { random: true };
  const val = id => document.getElementById(id)?.value || 50;
  const enabled = id => document.getElementById(id)?.checked ?? true;
  return {
    random: box.checked,
    difficulty: parseInt(enabled('chef-difficulty-enabled') ? val('chef-difficulty-slider') : 50, 10) / 100,
    rating: parseInt(enabled('chef-rating-enabled') ? val('chef-rating-slider') : 50, 10) / 100,
    usage: parseInt(enabled('chef-usage-enabled') ? val('chef-usage-slider') : 50, 10) / 100,
    type: parseInt(enabled('chef-type-enabled') ? val('chef-type-slider') : 50, 10) / 100,
    favorite: parseInt(enabled('chef-favorite-enabled') ? val('chef-favorite-slider') : 50, 10) / 100,
    season: parseInt(enabled('chef-season-enabled') ? val('chef-season-slider') : 50, 10) / 100,
    allYear: document.getElementById('chef-season-all-year')?.checked ?? true
  };
}

function bias(value, pref) {
  if (pref === 0.5) return 1;
  const diff = Math.abs(value - pref);
  return Math.max(0, 1 - diff * 2);
}

function computeWeight(recipe, prefs, maxUsage) {
  let w = 1;
  w *= bias((recipe.difficulty - 1) / 2, prefs.difficulty);
  w *= bias((recipe.rating - 1) / 4, prefs.rating);
  w *= bias(maxUsage ? recipe.usageCount / maxUsage : 0, prefs.usage);
  const typeMap = { healthy: 0, normal: 0.5, gras: 1 };
  w *= bias(typeMap[recipe.health] ?? 0.5, prefs.type);
  w *= bias(recipe.favori ? 1 : 0, prefs.favorite);
  let seasonVal = 0.5;
  if (recipe.season === 'été') seasonVal = 1;
  else if (recipe.season === 'hiver') seasonVal = 0;
  w *= bias(seasonVal, prefs.season);
  return w;
}

function weightedPick(indices, prefs) {
  const maxUsage = Math.max(1, ...indices.map(i => recipes[i].usageCount));
  const weights = indices.map(i => computeWeight(recipes[i], prefs, maxUsage));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return indices[Math.floor(Math.random() * indices.length)];
  let r = Math.random() * total;
  for (let i = 0; i < indices.length; i++) {
    r -= weights[i];
    if (r <= 0) return indices[i];
  }
  return indices[indices.length - 1];
}

function randomMenuList() {
  const prefs = getChefMenuPrefs();

  const emptySlots = [];
  menuListArray.forEach((day, dayIndex) => {
    SLOT_KEYS.forEach((slotKey, slotIndex) => {
      if (day[slotKey] === null) {
        emptySlots.push({ dayIndex, slotIndex, slotKey });
      }
    });
  });

  let recipeIndices = [];
  if (filteredRecipes.length > 0) {
    recipeIndices = [...filteredRecipes];
  } else {
    recipeIndices = recipes.map((_, index) => index);
  }

  if (!prefs.allYear) {
    recipeIndices = recipeIndices.filter(i => recipes[i].season !== "toute l'ann\u00e9e");
  }

  if (prefs.random) {
    for (let i = recipeIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recipeIndices[i], recipeIndices[j]] = [recipeIndices[j], recipeIndices[i]];
    }

    emptySlots.forEach((pos, idx) => {
      const recipeIndex = recipeIndices[idx % recipeIndices.length];
      const recipe = recipes[recipeIndex];
      menuListArray[pos.dayIndex][pos.slotKey] = recipe.recipeId;
    });
  } else {
    emptySlots.forEach(pos => {
      const recipeIndex = weightedPick(recipeIndices, prefs);
      const recipe = recipes[recipeIndex];
      menuListArray[pos.dayIndex][pos.slotKey] = recipe.recipeId;
    });
  }

  setFilteredRecipes([]);
  updateMenuList();
  updateCurrentShoppingList();
  refreshCurrentMenuDetails();

  // Fermer le modal de recherche après le remplissage aléatoire
  document.getElementById('recipe-modal').style.display = 'none';
}

let chefCarouselIndices = [];

function renderChefCarousel() {
  const container = document.getElementById('carousel-inner');
  if (!container) return;
  container.innerHTML = chefCarouselIndices.map(i => {
    const r = recipes[i];
    const img = r.image || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    const diffIcons = Array.from({ length: r.difficulty }).map(() => '<i class="fa-solid fa-utensils"></i>').join('');
    return `
      <div class="recipe-card carousel-card" draggable="true" ondragstart="dragFromCarousel(event, ${i})" onclick="clickCarouselRecipe(${i})">
        <img src="${img}" class="recipe-image" alt="${r.name}">
        <div class="recipe-info">
          <div class="recipe-details">
            <h3 class="recipe-name">${r.name}</h3>
            <div class="recipe-rating">${'★'.repeat(r.rating)}</div>
          </div>
          <div class="recipe-tags">
            <span class="tag">${r.season}</span>
            <span class="tag">${r.health}</span>
            <span class="tag recipe-difficulty">${diffIcons}</span>
          </div>
        </div>
      </div>`;
  }).join('');
  startCarouselScroll();
  setupCarouselHover();
}

let carouselInterval = null;
function startCarouselScroll() {
  const inner = document.getElementById('carousel-inner');
  if (!inner) return;
  clearInterval(carouselInterval);
  carouselInterval = setInterval(() => {
    if (inner.scrollWidth <= inner.clientWidth) return;
    inner.scrollLeft += 1;
    if (inner.scrollLeft >= inner.scrollWidth - inner.clientWidth) inner.scrollLeft = 0;
  }, 50);
}

function stopCarouselScroll() {
  clearInterval(carouselInterval);
}

function setupCarouselHover() {
  const inner = document.getElementById('carousel-inner');
  if (!inner) return;
  inner.removeEventListener('mouseenter', stopCarouselScroll);
  inner.removeEventListener('mouseleave', startCarouselScroll);
  inner.addEventListener('mouseenter', stopCarouselScroll);
  inner.addEventListener('mouseleave', startCarouselScroll);
}

function updateChefCarousel() {
  if (typeof document === 'undefined') return;
  const prefs = getChefMenuPrefs();
  let indices = recipes.map((_, idx) => idx);
  if (!prefs.allYear) {
    indices = indices.filter(i => recipes[i].season !== "toute l'année");
  }
  chefCarouselIndices = [];
  if (prefs.random) {
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    chefCarouselIndices = indices.slice(0, 8);
  } else {
    for (let k = 0; k < 8 && indices.length > 0; k++) {
      const pick = weightedPick(indices, prefs);
      chefCarouselIndices.push(pick);
      indices = indices.filter(i => i !== pick);
    }
  }
  renderChefCarousel();
}

function dragFromCarousel(event, recipeIndex) {
  event.dataTransfer.setData('text', JSON.stringify({ recipe: recipeIndex }));
}

function clickCarouselRecipe(recipeIndex) {
  const container = document.getElementById('menu-list-jours');
  if (!container || container.classList.contains('hidden')) return;
  addRecipeToMenu(recipeIndex);
}

/*////////////////////AJOUTER UNE RECETTE AU MENU/////////////////////*/
function addRecipeToMenu(recipeIndex) {
  const actualRecipe = recipes[recipeIndex];

  if (!actualRecipe) {
    alert('Indice de recette invalide.');
    return;
  }

  if (selectedDayIndex !== null && selectedSlotIndex !== null) {
    const slotKey = getSlotKey(selectedSlotIndex);
    menuListArray[selectedDayIndex][slotKey] = actualRecipe.recipeId;
  } else {
    let added = false;
    for (let dayIndex = 0; dayIndex < menuListArray.length; dayIndex++) {
      for (let slotIndex = 0; slotIndex < SLOT_KEYS.length; slotIndex++) {
        const slotKey = getSlotKey(slotIndex);
        if (menuListArray[dayIndex][slotKey] === null) {
          menuListArray[dayIndex][slotKey] = actualRecipe.recipeId;
          added = true;
          break;
        }
      }
      if (added) break;
    }

    if (!added) {
      return;
    }
  }

  updateMenuList();
  updateCurrentShoppingList();
  refreshCurrentMenuDetails();
  const modal = document.getElementById('recipe-modal');
  if (modal && modal.style.display === 'block') {
    modal.style.display = 'none';
  }
  selectedDayIndex = null;
  selectedSlotIndex = null;
}

/*////////////////METS A JOUR LA LISTE DE MENU EN COURS DE CREATION//////////////*/
function updateMenuList() {
  const menuListDaysContainer = document.getElementById('menu-list-jours');
  const start = startDateGlobal;  // Utiliser la variable globale startDate

  // Vérifier que startDate est défini
  if (!start) {
    console.error("La date de début n'est pas définie.");
    return;
  }

  // Mettez à jour chaque jour et chaque emplacement en fonction de l'état actuel de menuList
  const tableRows = menuListArray.map((day, dayIndex) => {
    const currentDay = new Date(start);
    currentDay.setDate(start.getDate() + dayIndex); // Calculer la date du jour actuel
    const formattedDate = currentDay.toLocaleDateString('fr-FR', options); // Formater la date

    const slots = SLOT_KEYS.map((slotKey, slotIndex) => {
      const recipeId = day[slotKey];
      const recipe = recipeId ? getRecipeById(recipeId) : null;
      return `
      <td>
        <div class="recipe-slot" data-day="${dayIndex}" data-slot="${slotIndex}" ondragover="allowDrop(event)" ondrop="drop(event, ${dayIndex}, ${slotIndex})" onclick="openSlotModal(${dayIndex}, ${slotIndex})">
          ${recipe ? `<div class="recipe-card" draggable="true" ondragstart="drag(event, ${dayIndex}, ${slotIndex})">
                        <span class="delete-cross" onclick="removeFromMenu(${dayIndex}, ${slotIndex}, event)">&times;</span>
                        <h5>${recipe.name}</h5>
                      </div>`
                    : `<div class="empty-slot">Emplacement vide</div>`}
        </div>
      </td>
    `;
    }).join('');

    return `<tr><td>${formattedDate}</td>${slots}</tr>`;
  }).join('');

  menuListDaysContainer.innerHTML = `
    <table class="menu-plan-table">
      <thead>
        <tr><th>Jour</th><th>Midi</th><th>Soir</th></tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>`;

  
  

}



function saveMenuList (){
  const nameInput = document.getElementById('menu-list-name');
  if (nameInput) {
    menuList.name = nameInput.value;
  }
  const duplicate = listMenuList.some((list, idx) => list.name === menuList.name && idx !== editingMenuIndex);
  if (duplicate) {
    alert('Nom déjà utilisé');
    return;
  }
  // Sauvegarde la planification et la date de début avec la liste
  menuList.startDate = startDateGlobal ? startDateGlobal.toISOString() : null;
  menuList.menu = JSON.parse(JSON.stringify(menuListArray));

  if (editingMenuIndex !== null) {
    listMenuList[editingMenuIndex] = menuList;
  } else {
    listMenuList.push(menuList);//insère un tableau la liste de menu dans listMenuList
  }

  

  updateListMenuList ();
  saveMenusToLocalStorage(listMenuList, recipes);
  saveRecipesToLocalStorage(recipes, listMenuList);

  updateChefCarousel();
 
  //réinitialiser l'objet globale menuList pour pouvoir recréer une liste, attention à faire en dernier pour que la liste de shopping puisse se remplir
  menuList = { name: '', date: '', startDate: null, menu: [] };// Crée une nouvelle instance d'objet

  // fin de l'édition
  editingMenuIndex = null;


}

/*////////////////////METS A JOUR L'AFFICHAGE DE LA LISTE DES LISTES DE MENUS /////////////////*/
function updateListMenuList (){
  
  //const activeSection = document.querySelector('.tab-content.active');// Trouver la section active
  const menuList = document.querySelector('.list-menu-lists');// Trouver le conteneur de la liste des recettes avec la classe 'recipe-list'  dans la section active

  menuList.innerHTML = listMenuList.map((menuList, index) => `
    <div class="menu-list-card" onclick="showMenuListDetails(${index})">
      <div class="menu-list-header">
        <h3>${menuList.name}</h3>
        <span class="menu-list-date">${menuList.date}</span>
      </div>
      <div class="menu-list-recipes">${countMenuRecipes(menuList.menu || [])} recettes</div>
    </div>
  `).join('');

  if(menuList.classList.contains('hidden')){
    menuList.classList.remove('hidden');
  }


  //Ajoute la classe hidden
  if(!document.getElementById('menu-list-jours').classList.contains("hidden")){
    document.getElementById('menu-list-jours').classList.add("hidden");
  }
  if(!document.getElementById('save-menu-list-button').classList.contains("hidden")){
    document.getElementById('save-menu-list-button').classList.add("hidden");
  }
  if(!document.getElementById('chef-menu-button').classList.contains("hidden")){
    document.getElementById('chef-menu-button').classList.add("hidden");
  }
  if(!document.getElementById('clear-menu-recipes-button').classList.contains("hidden")){
    document.getElementById('clear-menu-recipes-button').classList.add("hidden");
  }
  const formContainer = document.getElementById('menu-form-container');
  if(formContainer && !formContainer.classList.contains('hidden')){
    formContainer.classList.add('hidden');
    formContainer.innerHTML = '';
  }
  if(document.getElementById('creerListMenu').classList.contains("hidden")){
    document.getElementById('creerListMenu').classList.remove("hidden");
  }

  //Retire la classe hidden
  
  
}

/*////////////////AFFICHE UNE FENETRE CONTEXTUELLE AVEC LE DETAIL DE LA LISTE DE RECETTE/////////////*/
function showMenuListDetails(index) {
  currentMenuDetailIndex = index;
  const menuListLocal = listMenuList[index];
  const modal = document.getElementById('recipe-modal');
  const modalBody = document.getElementById('recipe-modal-body');
  formattingShoppingList(index);

  let tableRows = '';
  if (menuListLocal.menu && menuListLocal.startDate) {
    const start = new Date(menuListLocal.startDate);
    tableRows = menuListLocal.menu.map((day, dayIndex) => {
      const current = new Date(start);
      current.setDate(start.getDate() + dayIndex);
      const formattedDate = current.toLocaleDateString('fr-FR', options);
      const lunch = day.midi ? (getRecipeById(day.midi)?.name || '') : '';
      const dinner = day.soir ? (getRecipeById(day.soir)?.name || '') : '';
      return `<tr><td>${formattedDate}</td><td>${lunch}</td><td>${dinner}</td></tr>`;
    }).join('');
  }

  const shoppingCategories = Object.entries(shoppingList);
  let shoppingRows = '';
  for (let i = 0; i < shoppingCategories.length; i += 3) {
    const cells = shoppingCategories.slice(i, i + 3).map(([category, items]) => {
      const itemsHtml = Object.entries(items).map(([name, { quantity, unit }]) =>
        `<tr><td class="quantity-cell">${quantity} ${unit}</td><td>${name}</td></tr>`
      ).join('');
      return `<td><div class="category-title">${category}</div><table class="category-items">${itemsHtml}</table></td>`;
    });
    while (cells.length < 3) {
      cells.push('<td></td>');
    }
    shoppingRows += `<tr>${cells.join('')}</tr>`;
  }

  modalBody.innerHTML = `
    <h2>${menuListLocal.name}</h2>
    <p>Date de création: ${menuListLocal.date}</p>
    <p>Nombre de recettes: ${countMenuRecipes(menuListLocal.menu || [])}</p>
    <table class="menu-plan-table">
      <thead><tr><th>Date</th><th>Midi</th><th>Soir</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <table class="shopping-list-table">
      <tbody>${shoppingRows}</tbody>
    </table>
    <button onclick="generatePDF(${index})">Télécharger la liste de courses</button>
    <button onclick="editMenuList(${index})">Modifier</button>
    <button onclick="deleteMenuList(${index})">Supprimer</button>
  `;
  modal.style.display = 'block';
}

function formattingShoppingList(index){
  shoppingList = {};
  const recipeIds = getRecipeIdsFromMenu(listMenuList[index].menu || []);
  recipeIds.forEach(recipeId => {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return;
    recipe.ingredients.forEach(ingredient => {
      const { quantity, unit, name, category } = ingredient;
      if (!shoppingList[category]) {
        shoppingList[category] = {};
      }
      if (shoppingList[category][name]) {
        shoppingList[category][name].quantity += parseFloat(quantity) || 1;
      } else {
        shoppingList[category][name] = {
          quantity: parseFloat(quantity) || 1,
          unit: unit || ''
        };
      }
    });
  });
}

// Met à jour la liste d'ingrédients pour la liste de menu en cours d'édition
function updateCurrentShoppingList(){
  shoppingList = {};
  const recipeIds = getRecipeIdsFromMenu(menuListArray);
  recipeIds.forEach(recipeId => {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return;
    recipe.ingredients.forEach(ingredient => {
      const { quantity, unit, name, category } = ingredient;
      if (!shoppingList[category]) {
        shoppingList[category] = {};
      }
      if (shoppingList[category][name]) {
        shoppingList[category][name].quantity += parseFloat(quantity) || 1;
      } else {
        shoppingList[category][name] = {
          quantity: parseFloat(quantity) || 1,
          unit: unit || ''
        };
      }
    });
  });
}

// Met à jour le modal si une liste de menu y est actuellement affichée
function refreshCurrentMenuDetails() {
  const modal = document.getElementById('recipe-modal');
  if (currentMenuDetailIndex !== null && modal.style.display === 'block') {
    showMenuListDetails(currentMenuDetailIndex);
  }
}

function generatePDF(index) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const fileName = listMenuList[index].name;
  doc.setFontSize(18);
  doc.text(fileName, 14, 22);
  const tableData = [];
  Object.entries(shoppingList).forEach(([category, items]) => {
    tableData.push([{ content: category, colSpan: 3, styles: { halign: 'left', fontStyle: 'bold' } }]);
    Object.entries(items).forEach(([name, {quantity, unit}]) => {
      tableData.push([`${quantity} ${unit}`, name]);
    });
  });
  doc.autoTable({
    head: [['Quantité', 'Ingrédient']],
    body: tableData,
    startY: 30
  });
  doc.save(fileName + '.pdf');
}

function editMenuList (index){
  editingMenuIndex = index;
  const menuToEdit = listMenuList[index];

  // Copie l'objet sélectionné dans la variable globale
  menuList = JSON.parse(JSON.stringify(menuToEdit));
  menuListArray = JSON.parse(JSON.stringify(menuToEdit.menu));
  startDateGlobal = menuToEdit.startDate ? new Date(menuToEdit.startDate) : null;

  updateCurrentShoppingList();

  updateMenuList();

  document.getElementById('menu-list-jours').classList.remove('hidden');
  document.getElementById('save-menu-list-button').classList.remove('hidden');
  document.getElementById('chef-menu-button').classList.remove('hidden');
  document.getElementById('clear-menu-recipes-button').classList.remove('hidden');
  if(!document.getElementById('creerListMenu').classList.contains('hidden')){
    document.getElementById('creerListMenu').classList.add('hidden');
  }
  const menuContainer = document.querySelector('.list-menu-lists');
  if (menuContainer && !menuContainer.classList.contains('hidden')) {
    menuContainer.classList.add('hidden');
  }

  document.getElementById('recipe-modal').style.display = 'none';
}

function deleteMenuList (index){
  if (confirm('Êtes-vous sûr de vouloir supprimer cette liste de menus ?')) {

    /*////ENLEVER 1 A L'UTILISATION DES RECETTE CONTENU DANS LIST MENU LIST*////
  const commonIndexes = listMenuList[index].recipes.map
  (value => recipes.includes(value) ? recipes.indexOf(value) : -1)
  .filter(index => index !== -1);

  commonIndexes.forEach(index => {
    recipes[index].usageCount -= 1;
  });

    listMenuList.splice(index, 1);
    shoppingList = {};
    updateListMenuList();
    saveMenusToLocalStorage(listMenuList, recipes);
    saveRecipesToLocalStorage(recipes, listMenuList);
    document.getElementById('recipe-modal').style.display = 'none';
  }

}


function removeFromMenu(dayIndex, slotIndex, event) {

  if (event) {
    event.stopPropagation();
  }

// Trouver la recette à supprimer dans menuList
  const slotKey = getSlotKey(slotIndex);
  menuListArray[dayIndex][slotKey] = null;

  // Mettre à jour l'interface pour refléter le changement
  updateMenuList();
  updateCurrentShoppingList();
  refreshCurrentMenuDetails();
}

function clearMenuRecipes() {
  menuListArray = menuListArray.map(() => ({ midi: null, soir: null }));
  updateMenuList();
  updateCurrentShoppingList();
  refreshCurrentMenuDetails();
}
/*////////////////DRAG AND DROP //////////////////////*/
function drag(event, dayIndex, slotIndex) {
  event.dataTransfer.setData('text', JSON.stringify({ dayIndex, slotIndex }));
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, targetDayIndex, targetSlotIndex) {
  event.preventDefault();
  const data = JSON.parse(event.dataTransfer.getData('text'));
  const targetSlotKey = getSlotKey(targetSlotIndex);
  if (data.recipe !== undefined) {
    const recipe = recipes[data.recipe];
    menuListArray[targetDayIndex][targetSlotKey] = recipe.recipeId;
  } else {
    const { dayIndex, slotIndex } = data;
    const sourceSlotKey = getSlotKey(slotIndex);
    const temp = menuListArray[dayIndex][sourceSlotKey];
    menuListArray[dayIndex][sourceSlotKey] = menuListArray[targetDayIndex][targetSlotKey];
    menuListArray[targetDayIndex][targetSlotKey] = temp;
  }

  updateMenuList();
  updateCurrentShoppingList();
  refreshCurrentMenuDetails();
}

function updateMenusWithRecipe(recipeId, exists) {
  if (!recipeId) return;
  if (!exists) {
    listMenuList.forEach(list => {
      if (!list.menu) return;
      list.menu = list.menu.map(day => {
        const updatedDay = { ...day };
        SLOT_KEYS.forEach(slotKey => {
          if (updatedDay[slotKey] === recipeId) {
            updatedDay[slotKey] = null;
          }
        });
        return updatedDay;
      });
    });

    menuListArray = menuListArray.map(day => {
      const updatedDay = { ...day };
      SLOT_KEYS.forEach(slotKey => {
        if (updatedDay[slotKey] === recipeId) {
          updatedDay[slotKey] = null;
        }
      });
      return updatedDay;
    });
  }

  // Mettre à jour l'affichage et la liste d'ingrédients si nécessaire
  if (typeof document !== 'undefined') {
    updateMenuList();
    updateListMenuList();
    updateCurrentShoppingList();
    refreshCurrentMenuDetails();
  }
}

export {
  addMenuList,
  getTodayDate,
  calculateNumberOfDays,
  createMenuList,
  openSlotModal,
  randomMenuList,
  addRecipeToMenu,
  updateMenuList,
  saveMenuList,
  updateListMenuList,
  showMenuListDetails,
  editMenuList,
  deleteMenuList,
  removeFromMenu,
  clearMenuRecipes,
  drag,
  allowDrop,
  drop,
  updateMenusWithRecipe,
  updateChefCarousel,
  dragFromCarousel,
  clickCarouselRecipe
};

if (typeof window !== 'undefined') {
  window.addMenuList = addMenuList;
  window.openSlotModal = openSlotModal;
  window.saveMenuList = saveMenuList;
  window.showMenuListDetails = showMenuListDetails;
  window.editMenuList = editMenuList;
  window.deleteMenuList = deleteMenuList;
  window.addRecipeToMenu = addRecipeToMenu;
  window.removeFromMenu = removeFromMenu;
  window.clearMenuRecipes = clearMenuRecipes;
  window.drag = drag;
  window.allowDrop = allowDrop;
  window.drop = drop;
  window.generatePDF = generatePDF;
  window.randomMenuList = randomMenuList;
  window.updateChefCarousel = updateChefCarousel;
  window.dragFromCarousel = dragFromCarousel;
  window.clickCarouselRecipe = clickCarouselRecipe;
}

// Affiche les listes de menus enregistrées lors du chargement
// N'exécute la mise à jour que si un environnement DOM est présent
if (typeof document !== 'undefined') {
  updateListMenuList();
}



  
  
