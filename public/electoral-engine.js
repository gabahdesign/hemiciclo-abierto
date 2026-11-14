/** Pure electoral calculations. Population data and voting results are inputs, never inferred. */
const integer = (n, label) => {
  if (!Number.isSafeInteger(n) || n < 0) throw new TypeError(`${label}: se requiere un entero no negativo seguro`);
  return n;
};

/**
 * Applies D'Hondt to one constituency. Votes are integers; blank votes enter valid
 * ballots and hence the 3% denominator, but cannot receive a seat. Ceuta/Melilla
 * are decided by plurality, without the provincial threshold.
 * Equal quotients are ranked by total list votes. If those are also equal, a
 * deterministic input order is used only for the simulation and the unresolved
 * lot is exposed in `ties`; an official draw is never claimed.
 */
export function allocateConstituency({ candidates, seats, blank = 0, singleMember = false }) {
  integer(seats, 'escaños'); integer(blank, 'votos en blanco');
  if (!Array.isArray(candidates)) throw new TypeError('Faltan candidaturas');
  if (singleMember && seats !== 1) throw new RangeError('Una circunscripción uninominal requiere un escaño');
  const ids = new Set();
  const rows = candidates.map((c, index) => {
    if (typeof c.id !== 'string' || !c.id || ids.has(c.id)) throw new TypeError('Identificador de candidatura ausente o repetido');
    ids.add(c.id); integer(c.votes, 'votos');
    return { ...c, order: index, seats: 0 };
  });
  const valid = rows.reduce((sum, row) => sum + row.votes, blank);
  integer(valid, 'votos válidos');
  const eligible = rows.filter(c => c.votes > 0 && (singleMember || BigInt(c.votes) * 100n >= BigInt(valid) * 3n));
  const ties = [], tieSequence = new Map();
  for (let seat = 0; seat < seats && eligible.length; seat++) {
    eligible.sort((a, b) => {
      const left = BigInt(a.votes) * BigInt(b.seats + 1);
      const right = BigInt(b.votes) * BigInt(a.seats + 1);
      if (left !== right) return left > right ? -1 : 1;
      if (a.votes !== b.votes) return b.votes - a.votes;
      return a.order - b.order;
    });
    const first = eligible[0];
    const tied = eligible.filter(c => BigInt(first.votes) * BigInt(c.seats + 1) === BigInt(c.votes) * BigInt(first.seats + 1) && first.votes === c.votes).sort((a, b) => a.order - b.order);
    let winner = first;
    if (tied.length > 1) {
      const key = JSON.stringify(tied.map(c => c.id).sort());
      const previous = tieSequence.get(key) || 0;
      winner = tied[previous % tied.length];
      tieSequence.set(key, previous + 1);
      ties.push({ seat: seat + 1, candidates: tied.map(c => c.id), simulatedWinner: winner.id, resolution: 'input-order-not-official-draw' });
    }
    winner.seats++;
  }
  return { valid, allocated: rows.reduce((n, row) => n + row.seats, 0), ties, candidates: rows.map(({ order, ...row }) => row) };
}

/** Largest remainder allocation of 348 seats over 50 provinces by population,
 * plus one seat each for Ceuta and Melilla. Remainder ties are deterministic
 * (larger population, then constituency name) and reported as a modelling rule. */
export function allocatePopulationSeats(populations) {
  if (!populations || typeof populations !== 'object' || !('CEUTA' in populations) || !('MELILLA' in populations)) throw new TypeError('Faltan Ceuta o Melilla');
  const entries = Object.entries(populations);
  if (entries.length !== 52) throw new RangeError('Se necesitan las 52 circunscripciones');
  for (const [name, population] of entries) { integer(population, `población de ${name}`); if (!population) throw new RangeError(`Población ausente: ${name}`); }
  const provinces = entries.filter(([name]) => name !== 'CEUTA' && name !== 'MELILLA');
  const total = provinces.reduce((sum, [, value]) => sum + BigInt(value), 0n);
  const quotas = provinces.map(([name, population]) => {
    const numerator = BigInt(population) * 348n;
    return { name, population, seats: Number(numerator / total), remainder: numerator % total };
  });
  let remaining = 348 - quotas.reduce((sum, q) => sum + q.seats, 0);
  quotas.sort((a, b) => a.remainder === b.remainder ? b.population - a.population || a.name.localeCompare(b.name, 'es') : a.remainder > b.remainder ? -1 : 1);
  for (let i = 0; i < remaining; i++) quotas[i].seats++;
  return Object.fromEntries([...quotas.map(q => [q.name, q.seats]), ['CEUTA', 1], ['MELILLA', 1]]);
}

/** Allocate all constituencies independently; absent vote inputs remain unassigned. */
export function simulateProvinces({ seatsByProvince, candidatesByProvince, blankByProvince = {} }) {
  const constituencies = {}, totals = {}, missing = [], ties = [];
  let assigned = 0;
  for (const [province, seats] of Object.entries(seatsByProvince)) {
    integer(seats, `escaños de ${province}`);
    const candidates = candidatesByProvince[province];
    if (!candidates || !candidates.some(c => c.votes > 0)) { missing.push(province); continue; }
    const result = allocateConstituency({ candidates, seats, blank: blankByProvince[province] || 0, singleMember: province === 'CEUTA' || province === 'MELILLA' });
    constituencies[province] = result;
    assigned += result.allocated;
    ties.push(...result.ties.map(t => ({ ...t, province })));
    for (const row of result.candidates) if (row.seats) {
      const group = row.group || row.id;
      totals[group] = (totals[group] || 0) + row.seats;
    }
  }
  return { constituencies, totals, assigned, missing, ties };
}
