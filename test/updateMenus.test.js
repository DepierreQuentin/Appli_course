import test from 'node:test';
import assert from 'node:assert/strict';
import { updateMenusWithRecipe, setListMenuList, listMenuList } from '../scripts/menu.js';

// Utility to deep clone objects
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

test('updateMenusWithRecipe leaves menus intact when recipe still exists', () => {
  const initial = [{ menu: [{ midi: 'r1', soir: null }] }];
  setListMenuList(clone(initial));

  updateMenusWithRecipe('r1', true);

  assert.equal(listMenuList[0].menu[0].midi, 'r1');
});

test('updateMenusWithRecipe removes recipe when null', () => {
  const initial = [{ menu: [{ midi: 'r1', soir: null }] }];
  setListMenuList(clone(initial));

  updateMenusWithRecipe('r1', false);

  assert.equal(listMenuList[0].menu[0].midi, null);
});
