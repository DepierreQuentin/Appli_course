import test from 'node:test';
import assert from 'node:assert/strict';
import { updateMenusWithRecipe, setListMenuList, listMenuList, menuList } from '../scripts/menu.js';

// Utility to deep clone objects
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

test('updateMenusWithRecipe replaces recipe across menus', () => {
  const initial = [{ recipes: [{ name: 'Old' }], menu: [[{ name: 'Old' }]] }];
  setListMenuList(clone(initial));
  menuList.recipes = [{ name: 'Old' }];
  menuList.menu = [[{ name: 'Old' }]];

  const newRecipe = { name: 'New' };
  updateMenusWithRecipe('Old', newRecipe);

  assert.equal(listMenuList[0].recipes[0].name, 'New');
  assert.equal(listMenuList[0].menu[0][0].name, 'New');
  assert.equal(menuList.recipes[0].name, 'New');
});

test('updateMenusWithRecipe removes recipe when null', () => {
  const initial = [{ recipes: [{ name: 'Old' }], menu: [[{ name: 'Old' }, null]] }];
  setListMenuList(clone(initial));
  menuList.recipes = [{ name: 'Old' }];
  menuList.menu = [[{ name: 'Old' }]];

  updateMenusWithRecipe('Old', null);

  assert.equal(listMenuList[0].recipes.length, 0);
  assert.equal(listMenuList[0].menu[0][0], null);
  assert.equal(menuList.recipes.length, 0);
});
