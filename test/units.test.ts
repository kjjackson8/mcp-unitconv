import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert, dimensionOf, supportedUnits } from '../src/units.ts';

test('length: km to m', () => {
  const r = convert(1, 'km', 'm');
  assert.equal(r.value, 1000);
  assert.equal(r.dimension, 'length');
});

test('length: in to ft', () => {
  const r = convert(24, 'in', 'ft');
  assert.ok(Math.abs(r.value - 2) < 1e-9);
});

test('mass: kg to lb', () => {
  const r = convert(1, 'kg', 'lb');
  assert.ok(Math.abs(r.value - 2.2046226218) < 1e-9);
});

test('time: h to s', () => {
  const r = convert(2, 'h', 's');
  assert.equal(r.value, 7200);
});

test('temperature: C to F', () => {
  const r = convert(100, 'C', 'F');
  assert.equal(r.value, 212);
  assert.equal(r.dimension, 'temperature');
});

test('temperature: F to K', () => {
  const r = convert(32, 'F', 'K');
  assert.ok(Math.abs(r.value - 273.15) < 1e-9);
});

test('same unit round-trips to the same value', () => {
  const r = convert(42, 'm', 'm');
  assert.equal(r.value, 42);
});

test('rejects dimension mismatch', () => {
  assert.throws(() => convert(1, 'km', 'kg'));
});

test('rejects unknown source unit', () => {
  assert.throws(() => convert(1, 'furlong', 'm'));
});

test('rejects unknown target unit', () => {
  assert.throws(() => convert(1, 'm', 'furlong'));
});

test('rejects non-finite value', () => {
  assert.throws(() => convert(Infinity, 'm', 'km'));
  assert.throws(() => convert(NaN, 'm', 'km'));
});

test('dimensionOf finds the right dimension', () => {
  assert.equal(dimensionOf('kg'), 'mass');
  assert.equal(dimensionOf('ms'), 'time');
  assert.equal(dimensionOf('nope'), null);
});

test('supportedUnits includes every unit family plus temperature', () => {
  const units = supportedUnits();
  for (const u of ['m', 'km', 'kg', 'lb', 's', 'h', 'C', 'F', 'K']) {
    assert.ok(units.includes(u), `missing ${u}`);
  }
});
