import test from 'node:test';
import assert from 'node:assert/strict';
import { getTodayDate, calculateNumberOfDays } from '../scripts/menu.js';
import { formatDate } from '../scripts/utils.js';

test('getTodayDate without parameter returns today', () => {
  const expected = formatDate(new Date());
  assert.equal(getTodayDate(), expected);
});

test('getTodayDate with daysToAdd returns shifted date', () => {
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() + 2);
  const expected = formatDate(expectedDate);
  assert.equal(getTodayDate(2), expected);
});

test('calculateNumberOfDays computes inclusive difference', () => {
  const start = new Date('2023-01-01');
  const end = new Date('2023-01-10');
  assert.equal(calculateNumberOfDays(start, end), 10);
});

test('getTodayDate handles negative offsets', () => {
  const expectedDate = new Date();
  expectedDate.setDate(expectedDate.getDate() - 1);
  const expected = formatDate(expectedDate);
  assert.equal(getTodayDate(-1), expected);
});

test('calculateNumberOfDays returns 1 when dates are equal', () => {
  const date = new Date('2023-05-01');
  assert.equal(calculateNumberOfDays(date, date), 1);
});

test('calculateNumberOfDays handles end before start', () => {
  const start = new Date('2023-05-10');
  const end = new Date('2023-05-05');
  assert.equal(calculateNumberOfDays(start, end), -4);
});
