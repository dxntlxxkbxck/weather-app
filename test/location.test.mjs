import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocation } from '../location.js';

test('normalizes a city query and rejects an empty or invalid value', () => {
    assert.equal(normalizeLocation('  Санкт-Петербург  '), 'Санкт-Петербург');
    assert.equal(normalizeLocation(''), null);
    assert.equal(normalizeLocation('Москва123'), null);
});
