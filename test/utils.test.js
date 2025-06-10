import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from '../scripts/utils.js';

test('formatDate returns YYYY-MM-DD string', () => {
  const date = new Date('2023-05-04');
  assert.equal(formatDate(date), '2023-05-04');
});

