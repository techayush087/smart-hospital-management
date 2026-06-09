export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'checkbox' | 'number';
  required: boolean;
  validators?: string[];
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}
