import { recipes, filteredRecipes, setFilteredRecipes } from './recipes.js';
import { saveRecipesToLocalStorage, saveMenusToLocalStorage } from './storage.js';

export let listMenuList = [];
export function setListMenuList(data) { listMenuList = data; }
export let menuList = { name: '', date: '', recipes: [], startDate: null, menu: [] };
export let shoppingList = {};

let startDateGlobal = null;// sert pour éviter de passer un paramètre à updateMenuList(), variable initialisé dans createMenuList()
let menuListArray = [];
let selectedDayIndex = null;
let selectedSlotIndex = null;
let editingMenuIndex = null; // index de la liste de menu en cours d'édition
let currentMenuDetailIndex = null; // index de la liste de menu actuellement affichée dans le modal

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
    const today = new Date(); // Date du jour
    const newDate = new Date(today); // Créer une copie de la date du jour

    // Ajouter des jours si daysToAdd est défini, sinon ne rien ajouter
    if (daysToAdd !== undefined && daysToAdd !== null) {
        newDate.setDate(today.getDate() + daysToAdd);
    }
    // Formater la date au format YYYY-MM-DD
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Mois entre 01 et 12
    const day = String(newDate.getDate()).padStart(2, '0'); // Jour entre 01 et 31
    
    return `${year}-${month}-${day}`;
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
  menuListArray = Array.from({ length: numberOfDays }, () => [null, null]);

  const menuListDaysContainer = document.getElementById('menu-list-jours');

  // Générer le HTML des jours et emplacements avec les dates dans un tableau
  const tableRows = Array.from({ length: numberOfDays }, (_, i) => {
    const currentDay = new Date(startDateInput);
    currentDay.setDate(startDateInput.getDate() + i); // Calculer la date du jour actuel
    const formattedDate = currentDay.toLocaleDateString('fr-FR', options); // Formater la date

    const slots = menuListArray[i].map((recipe, slotIndex) => `
      <td>
        <div class="recipe-slot" data-day="${i}" data-slot="${slotIndex}" onclick="openSlotModal(${i}, ${slotIndex})">
          ${recipe ? `<div class="recipe-card" draggable="true" ondragstart="drag(event, ${i}, ${slotIndex})">
                        <span class="delete-cross" onclick="removeFromMenu(${i}, ${slotIndex}, event)">&times;</span>
                        <h5>${recipe.name}</h5>
                      </div>`
                    : `<div class="empty-slot">Emplacement vide</div>`}
        </div>
      </td>
    `).join('');

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
    day.forEach((slot, slotIndex) => {
      if (slot === null) {
        emptySlots.push({ dayIndex, slotIndex });
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
      menuListArray[pos.dayIndex][pos.slotIndex] = recipe;
      menuList.recipes.push(recipe);
    });
  } else {
    emptySlots.forEach(pos => {
      const recipeIndex = weightedPick(recipeIndices, prefs);
      const recipe = recipes[recipeIndex];
      menuListArray[pos.dayIndex][pos.slotIndex] = recipe;
      menuList.recipes.push(recipe);
    });
  }

  setFilteredRecipes([]);
  updateMenuList();
  updateCurrentShoppingList();
  refreshCurrentMenuDetails();

  // Fermer le modal de recherche après le remplissage aléatoire
  document.getElementById('recipe-modal').style.display = 'none';
}

/*////////////////////AJOUTER UNE RECETTE AU MENU/////////////////////*/
function addRecipeToMenu(recipeIndex) {
  const actualRecipe = recipes[recipeIndex];

  if (!actualRecipe) {
    alert('Indice de recette invalide.');
    return;
  }

  if (selectedDayIndex !== null && selectedSlotIndex !== null) {
    const previous = menuListArray[selectedDayIndex][selectedSlotIndex];
    if (previous) {
      const idx = menuList.recipes.findIndex(r => r.name === previous.name);
      if (idx !== -1) menuList.recipes.splice(idx, 1);
    }
    menuListArray[selectedDayIndex][selectedSlotIndex] = actualRecipe;
    menuList.recipes.push(actualRecipe);
  } else {
    let added = false;
    for (let dayIndex = 0; dayIndex < menuListArray.length; dayIndex++) {
      for (let slotIndex = 0; slotIndex < menuListArray[dayIndex].length; slotIndex++) {
        if (menuListArray[dayIndex][slotIndex] === null) {
          menuListArray[dayIndex][slotIndex] = actualRecipe;
          added = true;
          break;
        }
      }
      if (added) break;
    }

    if (!added) {
      alert('Tous les emplacements de menu sont occupés.');
      document.getElementById('recipe-modal').style.display = 'none';
      return;
    }
    menuList.recipes.push(actualRecipe);
  }

  updateMenuList();
  updateCurrentShoppingList();
  refreshCurrentMenuDetails();
  document.getElementById('recipe-modal').style.display = 'none';
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

    const slots = day.map((recipe, slotIndex) => `
      <td>
        <div class="recipe-slot" data-day="${dayIndex}" data-slot="${slotIndex}" ondragover="allowDrop(event)" ondrop="drop(event, ${dayIndex}, ${slotIndex})" onclick="openSlotModal(${dayIndex}, ${slotIndex})">
          ${recipe ? `<div class="recipe-card" draggable="true" ondragstart="drag(event, ${dayIndex}, ${slotIndex})">
                        <span class="delete-cross" onclick="removeFromMenu(${dayIndex}, ${slotIndex}, event)">&times;</span>
                        <h5>${recipe.name}</h5>
                      </div>`
                    : `<div class="empty-slot">Emplacement vide</div>`}
        </div>
      </td>
    `).join('');

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
  // Si on modifie une liste existante, annuler l'impact de l'ancienne liste
  if (editingMenuIndex !== null) {
    const oldIndexes = listMenuList[editingMenuIndex].recipes.map(
      value => recipes.includes(value) ? recipes.indexOf(value) : -1
    ).filter(index => index !== -1);
    oldIndexes.forEach(i => {
      recipes[i].usageCount -= 1;
    });
  }

  /*////AJOUTER +1 A L'UTILISATION DES RECETTE CONTENU DANS MENU LIST*////
  const commonIndexes = menuList.recipes.map
  (value => recipes.includes(value) ? recipes.indexOf(value) : -1)
  .filter(index => index !== -1);

  commonIndexes.forEach(index => {
    recipes[index].usageCount += 1;
  });


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
 
  //réinitialiser l'objet globale menuList pour pouvoir recréer une liste, attention à faire en dernier pour que la liste de shopping puisse se remplir
  menuList = { name: '', date: '', recipes: [], startDate: null, menu: [] };// Crée une nouvelle instance d'objet

  // fin de l'édition
  editingMenuIndex = null;


}

/*////////////////////METS A JOUR L'AFFICHAGE DE LA LISTE DES LISTES DE MENUS /////////////////*/
function updateListMenuList (){
  
  //const activeSection = document.querySelector('.tab-content.active');// Trouver la section active
  const menuList = document.querySelector('.list-menu-lists');// Trouver le conteneur de la liste des recettes avec la classe 'recipe-list'  dans la section active

  menuList.innerHTML = listMenuList.map((menuList, index) => `
    <div class="recipe-card" onclick="showMenuListDetails(${index})">
      <h3>${menuList.name}</h3>
      <p>Créé le: ${menuList.date}</p>
      <p>Nombre de recette: ${menuList.recipes.length}</p>
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
      const lunch = day[0] ? day[0].name : '';
      const dinner = day[1] ? day[1].name : '';
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
    <p>Nombre de recettes: ${menuListLocal.recipes.length}</p>
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
  listMenuList[index].recipes.forEach(recipe => {
    const base = recipes.find(r => r.name === recipe.name);
    if (!base) return; // si la recette n'existe plus
    base.ingredients.forEach(ingredient => {
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
  menuList.recipes.forEach(recipe => {
    const base = recipes.find(r => r.name === recipe.name);
    if (!base) return;
    base.ingredients.forEach(ingredient => {
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
  const recipeToRemove = menuListArray[dayIndex][slotIndex];

    // Supprimer la recette de menuList
    const recipeIndex = menuList.recipes.findIndex(r => r.name === recipeToRemove.name);
   
    if (recipeIndex !== -1) {
      menuList.recipes.splice(recipeIndex, 1); // Supprimer la recette du menuList
    }

  // Mettre l'emplacement à null pour indiquer qu'il est vide
  menuListArray[dayIndex][slotIndex] = null;

  // Mettre à jour l'interface pour refléter le changement
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
  const { dayIndex, slotIndex } = data;

  // Swap les recettes entre les deux emplacements
  const temp = menuListArray[dayIndex][slotIndex];
  menuListArray[dayIndex][slotIndex] = menuListArray[targetDayIndex][targetSlotIndex];
  menuListArray[targetDayIndex][targetSlotIndex] = temp;

  updateMenuList();
}

function updateMenusWithRecipe(oldName, newRecipe) {
  listMenuList.forEach(list => {
    list.recipes = list.recipes.map(r =>
      r.name === oldName ? (newRecipe ? JSON.parse(JSON.stringify(newRecipe)) : null) : r
    ).filter(Boolean);
    if (list.menu) {
      list.menu = list.menu.map(day => day.map(slot => {
        if (slot && slot.name === oldName) {
          return newRecipe ? JSON.parse(JSON.stringify(newRecipe)) : null;
        }
        return slot;
      }));
    }
  });

  menuList.recipes = menuList.recipes.map(r =>
    r.name === oldName ? (newRecipe ? newRecipe : null) : r
  ).filter(Boolean);
  menuListArray = menuListArray.map(day => day.map(slot => {
    if (slot && slot.name === oldName) {
      return newRecipe ? newRecipe : null;
    }
    return slot;
  }));

  // Mettre à jour l'affichage et la liste d'ingrédients si nécessaire
  updateMenuList();
  updateListMenuList();
  updateCurrentShoppingList();
  refreshCurrentMenuDetails();
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
  drag,
  allowDrop,
  drop,
  updateMenusWithRecipe
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
  window.drag = drag;
  window.allowDrop = allowDrop;
  window.drop = drop;
  window.generatePDF = generatePDF;
  window.randomMenuList = randomMenuList;
}

// Affiche les listes de menus enregistrées lors du chargement
// N'exécute la mise à jour que si un environnement DOM est présent
if (typeof document !== 'undefined') {
  updateListMenuList();
}



  
  