export function recomputeUsageCounts(recipes, menus) {
  recipes.forEach(r => r.usageCount = 0);
  menus.forEach(list => {
    list.recipes.forEach(rcp => {
      const found = recipes.find(r => r.name === rcp.name);
      if (found) found.usageCount += 1;
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
  recipes.forEach(r => {
    if (!r.ingredientNames) {
      r.ingredientNames = r.ingredients.map(i => i.name);
    }
    if (!('image' in r)) {
      r.image = '';
    }
  });
  const storedMenus = localStorage.getItem('listMenuList');
  const listMenuList = storedMenus ? JSON.parse(storedMenus) : [];
  recomputeUsageCounts(recipes, listMenuList);
  return { recipes, listMenuList };
}
