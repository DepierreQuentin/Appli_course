import { collection, doc, getDocs, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db } from './firebase.js';

const SLOT_KEYS = ['midi', 'soir'];

export function createRecipeId(recipe) {
  const base = `${recipe.name || ''}|${recipe.creationDate || ''}`;
  let hash = 5381;
  for (let i = 0; i < base.length; i += 1) {
    hash = ((hash << 5) + hash) + base.charCodeAt(i);
  }
  return `recipe_${(hash >>> 0).toString(36)}`;
}

function recipeSignature(recipe) {
  return `${recipe.name || ''}|${recipe.creationDate || ''}|${JSON.stringify(recipe.ingredients || [])}`;
}

function ensureRecipeDefaults(recipe) {
  if (!recipe.creationDate) {
    recipe.creationDate = new Date().toISOString();
  }
  if (!recipe.recipeId) {
    recipe.recipeId = createRecipeId(recipe);
  }
  if (!('image' in recipe)) {
    recipe.image = '';
  }
  if (!('usageCount' in recipe)) {
    recipe.usageCount = 0;
  }
  return recipe;
}

export function recomputeUsageCounts(recipes, menus) {
  recipes.forEach(r => {
    r.usageCount = 0;
  });
  const recipeById = new Map(recipes.map(r => [r.recipeId, r]));
  menus.forEach(list => {
    (list.menu || []).forEach(day => {
      SLOT_KEYS.forEach(slotKey => {
        const recipeId = day?.[slotKey];
        if (!recipeId) return;
        const found = recipeById.get(recipeId);
        if (found) found.usageCount += 1;
      });
    });
  });
}

export async function saveRecipesToLocalStorage(recipes, menus) {
  recomputeUsageCounts(recipes, menus);
  try {
    await Promise.all(recipes.map(recipe => setDoc(doc(db, 'recipes', recipe.recipeId), recipe)));
  } catch (error) {
    console.warn('Impossible de sauvegarder les recettes sur Firestore.', error);
  }
}

export async function saveMenusToLocalStorage(menus, recipes) {
  recomputeUsageCounts(recipes, menus);
  try {
    await Promise.all(menus.map(menu => {
      const menuId = menu.menuId || createMenuId(menu);
      return setDoc(doc(db, 'menus', menuId), { ...menu, menuId });
    }));
  } catch (error) {
    console.warn('Impossible de sauvegarder les menus sur Firestore.', error);
  }
}

export async function loadFromLocalStorage() {
  let recipesSnapshot;
  let menusSnapshot;
  try {
    recipesSnapshot = await getDocs(collection(db, 'recipes'));
    menusSnapshot = await getDocs(collection(db, 'menus'));
  } catch (error) {
    console.warn('Impossible de charger les données depuis Firestore.', error);
    return { recipes: [], listMenuList: [] };
  }
  const recipes = recipesSnapshot.docs.map(docSnap => ensureRecipeDefaults({ ...docSnap.data() }));
  recipes.forEach(ensureRecipeDefaults);
  const signatureToId = new Map(recipes.map(r => [recipeSignature(r), r.recipeId]));
  const listMenuList = menusSnapshot.docs.map(docSnap => ({ ...docSnap.data() }));
  listMenuList.forEach(list => {
    if (!Array.isArray(list.menu)) {
      list.menu = [];
    }
    list.menu = list.menu.map(day => {
      const updatedDay = { ...day };
      SLOT_KEYS.forEach(slotKey => {
        const slot = updatedDay[slotKey];
        if (!slot) {
          updatedDay[slotKey] = null;
          return;
        }
        if (typeof slot === 'string') {
          return;
        }
        if (typeof slot === 'object') {
          const signature = recipeSignature(slot);
          let recipeId = signatureToId.get(signature);
          if (!recipeId) {
            const newRecipe = ensureRecipeDefaults({ ...slot });
            recipeId = newRecipe.recipeId;
            recipes.push(newRecipe);
            signatureToId.set(signature, recipeId);
          }
          updatedDay[slotKey] = recipeId;
        }
      });
      return updatedDay;
    });
    if ('recipes' in list) {
      delete list.recipes;
    }
  });
  recomputeUsageCounts(recipes, listMenuList);
  return { recipes, listMenuList };
}

function createMenuId(menu) {
  const base = `${menu.name || ''}|${menu.startDate || ''}`;
  let hash = 5381;
  for (let i = 0; i < base.length; i += 1) {
    hash = ((hash << 5) + hash) + base.charCodeAt(i);
  }
  return `menu_${(hash >>> 0).toString(36)}`;
}
