import { validateOptions, optStr, optNum, optBool, OptionField } from '../services/options';

const schema: OptionField[] = [
  { name: 'format', label: 'Format', type: 'select', default: 'jpg', options: [{ value: 'jpg', label: 'JPG' }, { value: 'png', label: 'PNG' }] },
  { name: 'quality', label: 'Quality', type: 'number', default: 85, min: 1, max: 100 },
  { name: 'password', label: 'Password', type: 'password', required: true, maxLength: 64 },
  { name: 'label', label: 'Label', type: 'text', default: 'hi', maxLength: 5 },
  { name: 'flag', label: 'Flag', type: 'checkbox', default: false },
];

describe('validateOptions', () => {
  const pw = { password: 'secret' };
  it('fills defaults for missing fields', () => {
    const out = validateOptions(schema, pw);
    expect(out.format).toBe('jpg');
    expect(out.quality).toBe(85);
    expect(out.flag).toBe(false);
  });

  it('accepts valid select values and rejects others', () => {
    expect(validateOptions(schema, { format: 'png', password: 'x' }).format).toBe('png');
    expect(validateOptions(schema, { format: 'exe;rm', password: 'x' }).format).toBe('jpg');
  });

  it('clamps numbers into range', () => {
    expect(validateOptions(schema, { quality: 500, password: 'x' }).quality).toBe(100);
    expect(validateOptions(schema, { quality: -3, password: 'x' }).quality).toBe(1);
  });

  it('throws on missing required fields', () => {
    expect(() => validateOptions(schema, {})).toThrow(/password/i);
  });

  it('truncates over-long text', () => {
    const out = validateOptions(schema, { label: 'way too long', password: 'x' });
    expect((out.label as string).length).toBeLessThanOrEqual(5);
  });

  it('drops unknown keys', () => {
    const out = validateOptions(schema, { evil: '1', password: 'x' });
    expect('evil' in out).toBe(false);
  });

  it('coerces checkbox values to boolean (strict: boolean or "true"/"false")', () => {
    expect(validateOptions(schema, { ...pw, flag: true }).flag).toBe(true);
    expect(validateOptions(schema, { ...pw, flag: 'true' }).flag).toBe(true);
    expect(validateOptions(schema, { ...pw, flag: 'false' }).flag).toBe(false);
    expect(validateOptions(schema, { ...pw, flag: 'yes' }).flag).toBe(false); // falls back to default
  });
});

describe('option readers', () => {
  it('optStr/optNum/optBool return fallbacks for wrong types', () => {
    expect(optStr({}, 'a', 'd')).toBe('d');
    expect(optNum({ a: 'nope' }, 'a', 7)).toBe(7);
    expect(optBool({ a: 1 }, 'a', false)).toBe(false); // only real booleans pass
    expect(optBool({ a: true }, 'a', false)).toBe(true);
  });
});
