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

export function saveRecipesToLocalStorage(recipes, menus) {
  recomputeUsageCounts(recipes, menus);
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

export function saveMenusToLocalStorage(menus, recipes) {
  recomputeUsageCounts(recipes, menus);
  localStorage.setItem('listMenuList', JSON.stringify(menus));
}

export function loadFromLocalStorage() {
  const storedRecipes = localStorage.getItem('recipes');
  const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
  recipes.forEach(ensureRecipeDefaults);
  const signatureToId = new Map(recipes.map(r => [recipeSignature(r), r.recipeId]));
  const storedMenus = localStorage.getItem('listMenuList');
  const listMenuList = storedMenus ? JSON.parse(storedMenus) : [];
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
