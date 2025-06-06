import test from 'node:test';
import assert from 'node:assert/strict';
import * as Recipes from '../scripts/recipes.js';
import { setListMenuList } from '../scripts/menu.js';
import { createLocalStorageMock } from './helpers.js';

const { toggleFavorite, sortRecipes, setRecipes, setFilteredRecipes } = Recipes;

function mockDocument() {
  const recipeList = { insertAdjacentHTML() {}, innerHTML: '' };
  const activeSection = { querySelector: () => recipeList };
  return {
    querySelector: () => activeSection,
    getElementById: () => null
  };
}

test('toggleFavorite toggles value and saves', () => {
  setRecipes([{ name: 'A', favori: false, usageCount: 0 }]);
  setListMenuList([]);
  const local = createLocalStorageMock();
  globalThis.localStorage = local;
  globalThis.document = mockDocument();
  toggleFavorite(0, { stopPropagation() {} });
  assert.equal(Recipes.recipes[0].favori, true);
  const stored = JSON.parse(local.getItem('recipes'));
  assert.equal(stored[0].favori, true);
  delete globalThis.localStorage;
  delete globalThis.document;
});

test('sortRecipes sorts alphabetically', () => {
  setRecipes([
    { name: 'B', usageCount: 1, rating: 3, favori: false },
    { name: 'A', usageCount: 2, rating: 5, favori: true }
  ]);
  setFilteredRecipes([0,1]);
  setListMenuList([]);
  const recipeList = { insertAdjacentHTML() {}, innerHTML: '' };
  const activeSection = { querySelector: () => recipeList };
  globalThis.document = {
    querySelector: () => activeSection,
    getElementById: () => null
  };
  sortRecipes('alphabetical');
  delete globalThis.document;
  const indexA = recipeList.innerHTML.indexOf('>A<');
  const indexB = recipeList.innerHTML.indexOf('>B<');
  assert.ok(indexA !== -1 && indexB !== -1 && indexA < indexB);
});
