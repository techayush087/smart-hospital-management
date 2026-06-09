import { FormFieldConfig } from '../../../core/models';

export const APPOINTMENT_FORM_CONFIG: FormFieldConfig[] = [
  { key: 'reason', label: 'Reason for Visit', type: 'textarea', required: true },
  {
    key: 'consultationType',
    label: 'Consultation Type',
    type: 'select',
    required: true,
    options: [
      { label: 'In Person', value: 'in-person' },
      { label: 'Virtual', value: 'virtual' },
    ],
  },
  { key: 'insuranceId', label: 'Insurance ID', type: 'text', required: false },
  {
    key: 'urgency',
    label: 'Urgency Level',
    type: 'select',
    required: true,
    options: [
      { label: 'Routine', value: 'routine' },
      { label: 'Urgent', value: 'urgent' },
    ],
  },
];
