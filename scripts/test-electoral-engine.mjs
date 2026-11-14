import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { allocateConstituency, allocatePopulationSeats, simulateProvinces } from '../public/electoral-engine.js';

test('D’Hondt assigns quotients by constituency, not national percentage', () => {
  const result = allocateConstituency({ seats: 5, candidates: [{ id: 'A', votes: 100 }, { id: 'B', votes: 80 }, { id: 'C', votes: 30 }] });
  assert.deepEqual(Object.fromEntries(result.candidates.map(c => [c.id, c.seats])), { A: 3, B: 2, C: 0 });
  assert.equal(result.allocated, 5);
});

test('valid blank ballots count toward exactly 3% threshold', () => {
  assert.equal(allocateConstituency({ seats: 1, blank: 97, candidates: [{ id: 'A', votes: 3 }] }).allocated, 1);
  assert.equal(allocateConstituency({ seats: 1, blank: 98, candidates: [{ id: 'A', votes: 2 }] }).allocated, 0);
});

test('equal quotients use larger list total, true ties signal lottery', () => {
  const quotientTie = allocateConstituency({ seats: 2, candidates: [{ id: 'A', votes: 100 }, { id: 'B', votes: 50 }] });
  assert.deepEqual(quotientTie.candidates.map(c => c.seats), [2, 0]);
  assert.equal(quotientTie.ties.length, 0);
  const exactTie = allocateConstituency({ seats: 1, candidates: [{ id: 'A', votes: 5 }, { id: 'B', votes: 5 }] });
  assert.equal(exactTie.ties.length, 1);
  assert.deepEqual(exactTie.ties[0].candidates, ['A', 'B']);
  assert.equal(exactTie.ties[0].resolution, 'input-order-not-official-draw');
  const successive = allocateConstituency({ seats: 3, candidates: [{ id: 'A', votes: 5 }, { id: 'B', votes: 5 }] });
  assert.deepEqual(successive.ties.map(t => t.simulatedWinner), ['A', 'B']);
});

test('unreported provinces remain unassigned and duplicate candidate IDs fail', () => {
  const res = simulateProvinces({ seatsByProvince: { MADRID: 2, CEUTA: 1 }, candidatesByProvince: { MADRID: [{ id: 'a', group: 'X', votes: 25 }] } });
  assert.equal(res.assigned, 2);
  assert.deepEqual(res.missing, ['CEUTA']);
  assert.equal(res.totals.X, 2);
  assert.throws(() => allocateConstituency({ seats: 1, candidates: [{ id: 'a', votes: 1 }, { id: 'a', votes: 1 }] }));
  assert.throws(() => allocateConstituency({ seats: 1, candidates: [{ id: 'x', votes: -1 }] }));
});

test('official 2025 population supports reproducible 350-seat alternative', async () => {
  const { populations } = JSON.parse(await readFile(new URL('../public/population-2025.json', import.meta.url)));
  const current = JSON.parse(await readFile(new URL('../public/seats.json', import.meta.url)));
  assert.deepEqual(Object.keys(populations).sort(), Object.keys(current).sort());
  const result = allocatePopulationSeats(populations);
  assert.equal(Object.values(result).reduce((a, b) => a + b, 0), 350);
  assert.equal(result.CEUTA, 1); assert.equal(result.MELILLA, 1);
  assert.ok(result.MADRID > result.SORIA);
});
