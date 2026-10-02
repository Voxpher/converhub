// Client mirror of the server's per-tool option schema (server/src/services/options.ts).
// Shapes must stay in sync; the server re-validates everything.

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
