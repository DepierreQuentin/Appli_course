import test from 'node:test';
import assert from 'node:assert/strict';
import { recomputeUsageCounts } from '../scripts/storage.js';

test('recomputeUsageCounts updates counts based on menus', () => {
  const recipes = [
    { name: 'R1', usageCount: 0 },
    { name: 'R2', usageCount: 0 }
  ];
  const menus = [
    { recipes: [{ name: 'R1' }, { name: 'R2' }] },
    { recipes: [{ name: 'R1' }] }
  ];
  recomputeUsageCounts(recipes, menus);
  assert.equal(recipes[0].usageCount, 2);
  assert.equal(recipes[1].usageCount, 1);
});

test('recomputeUsageCounts resets counts when no menus', () => {
  const recipes = [
    { name: 'R1', usageCount: 5 }
  ];
  recomputeUsageCounts(recipes, []);
  assert.equal(recipes[0].usageCount, 0);
});
