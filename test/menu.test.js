import test from 'node:test';
import assert from 'node:assert/strict';
import { getTodayDate, calculateNumberOfDays } from '../scripts/menu.js';

// Helper to format a Date object as YYYY-MM-DD
function format(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test('getTodayDate without parameter returns today', () => {
  const expected = format(new Date());
  assert.equal(getTodayDate(), expected);
});

test('getTodayDate with daysToAdd returns shifted date', () => {
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + 2);
  const expected = format(expectedDate);
  assert.equal(getTodayDate(2), expected);
});

test('calculateNumberOfDays computes inclusive difference', () => {
  const start = new Date('2023-01-01');
  const end = new Date('2023-01-10');
  assert.equal(calculateNumberOfDays(start, end), 10);
});
