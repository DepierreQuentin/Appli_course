import test from 'node:test';
import assert from 'node:assert/strict';
import { recomputeUsageCounts, saveRecipesToLocalStorage, saveMenusToLocalStorage, loadFromLocalStorage } from '../scripts/storage.js';
import { createLocalStorageMock } from './helpers.js';

test('recomputeUsageCounts updates counts based on menus', () => {
  const recipes = [
    { recipeId: 'r1', name: 'R1', usageCount: 0 },
    { recipeId: 'r2', name: 'R2', usageCount: 0 }
  ];
  const menus = [
    { menu: [{ midi: 'r1', soir: 'r2' }] },
    { menu: [{ midi: 'r1', soir: null }] }
  ];
  recomputeUsageCounts(recipes, menus);
  assert.equal(recipes[0].usageCount, 2);
  assert.equal(recipes[1].usageCount, 1);
});

test('recomputeUsageCounts resets counts when no menus', () => {
  const recipes = [
    { recipeId: 'r1', name: 'R1', usageCount: 5 }
  ];
  recomputeUsageCounts(recipes, []);
  assert.equal(recipes[0].usageCount, 0);
});

test('saveRecipesToLocalStorage stores recipes with updated counts', () => {
  const recipes = [
    { recipeId: 'r1', name: 'R1', usageCount: 0 },
    { recipeId: 'r2', name: 'R2', usageCount: 0 }
  ];
  const menus = [
    { menu: [{ midi: 'r1', soir: 'r2' }] },
    { menu: [{ midi: 'r1', soir: null }] }
  ];
  const local = createLocalStorageMock();
  globalThis.localStorage = local;
  saveRecipesToLocalStorage(recipes, menus);
  const stored = JSON.parse(local.getItem('recipes'));
  assert.equal(stored[0].usageCount, 2);
  assert.equal(stored[1].usageCount, 1);
  delete globalThis.localStorage;
});

test('saveMenusToLocalStorage stores menus and updates recipe counts', () => {
  const recipes = [
    { recipeId: 'r1', name: 'R1', usageCount: 0 },
    { recipeId: 'r2', name: 'R2', usageCount: 0 }
  ];
  const menus = [
    { menu: [{ midi: 'r1', soir: 'r2' }] },
    { menu: [{ midi: 'r1', soir: null }] }
  ];
  const local = createLocalStorageMock();
  globalThis.localStorage = local;
  saveMenusToLocalStorage(menus, recipes);
  const stored = JSON.parse(local.getItem('listMenuList'));
  assert.equal(stored.length, 2);
  assert.equal(recipes[0].usageCount, 2);
  assert.equal(recipes[1].usageCount, 1);
  delete globalThis.localStorage;
});

test('loadFromLocalStorage normalizes recipe ids and counts', () => {
  const local = createLocalStorageMock();
  const recipes = [
    { name: 'R1', ingredients: [{ name: 'Ing1' }], creationDate: '2024-01-01', usageCount: 0 }
  ];
  const menus = [ {
    recipes: [{ name: 'R1' }],
    menu: [{ midi: { name: 'R1', ingredients: [{ name: 'Ing1' }], creationDate: '2024-01-01' }, soir: null }]
  } ];
  local.setItem('recipes', JSON.stringify(recipes));
  local.setItem('listMenuList', JSON.stringify(menus));
  globalThis.localStorage = local;
  const data = loadFromLocalStorage();
  assert.ok(data.recipes[0].recipeId);
  assert.equal(data.listMenuList[0].menu[0].midi, data.recipes[0].recipeId);
  assert.equal(data.recipes[0].usageCount, 1);
  delete globalThis.localStorage;
});
