// Per-tool option schemas. Each tool declares the options its UI shows and its
// processor accepts. validateOptions() sanitises raw client input: unknown keys
// are dropped, selects are whitelisted, numbers clamped, strings length-capped.

export type OptionFieldType =
  | 'select'
  | 'number'
  | 'text'
  | 'password'
  | 'textarea'
  | 'checkbox';

export interface OptionChoice {
  value: string;
  label: string;
}

export interface OptionField {
  name: string;
  label: string;
  type: OptionFieldType;
  default?: string | number | boolean;
  options?: OptionChoice[];
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  required?: boolean;
  help?: string;
  placeholder?: string;
}

const MAX_TEXT = 500;
const MAX_TEXTAREA = 20000;

export function validateOptions(
  fields: OptionField[],
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    const value = raw[field.name];
    switch (field.type) {
      case 'select': {
        const allowed = (field.options ?? []).map((o) => o.value);
        if (typeof value === 'string' && allowed.includes(value)) {
          out[field.name] = value;
        } else if (typeof field.default === 'string') {
          out[field.name] = field.default;
        }
        break;
      }
      case 'number': {
        const n = typeof value === 'number' ? value : Number(value);
        if (Number.isFinite(n)) {
          let v = n;
          if (typeof field.min === 'number') v = Math.max(field.min, v);
          if (typeof field.max === 'number') v = Math.min(field.max, v);
          out[field.name] = v;
        } else if (typeof field.default === 'number') {
          out[field.name] = field.default;
        }
        break;
      }
      case 'checkbox': {
        if (typeof value === 'boolean') out[field.name] = value;
        else if (value === 'true' || value === 'false') out[field.name] = value === 'true';
        else if (typeof field.default === 'boolean') out[field.name] = field.default;
        break;
      }
      case 'password':
      case 'text': {
        if (typeof value === 'string' && value.length > 0) {
          out[field.name] = value.slice(0, field.maxLength ?? MAX_TEXT);
        } else if (typeof field.default === 'string') {
          out[field.name] = field.default;
        } else if (field.required) {
          throw new Error(`Option "${field.label}" is required.`);
        }
        break;
      }
      case 'textarea': {
        if (typeof value === 'string' && value.length > 0) {
          out[field.name] = value.slice(0, field.maxLength ?? MAX_TEXTAREA);
        } else if (typeof field.default === 'string') {
          out[field.name] = field.default;
        } else if (field.required) {
          throw new Error(`Option "${field.label}" is required.`);
        }
        break;
      }
    }
  }
  return out;
}

/** Typed helpers for processors to read sanitised options. */
export function optStr(opts: Record<string, unknown>, name: string, fallback = ''): string {
  const v = opts[name];
  return typeof v === 'string' ? v : fallback;
}

export function optNum(opts: Record<string, unknown>, name: string, fallback: number): number {
  const v = opts[name];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function optBool(opts: Record<string, unknown>, name: string, fallback = false): boolean {
  const v = opts[name];
  return typeof v === 'boolean' ? v : fallback;
}
