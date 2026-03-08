export type StarRole = 'sirius' | 'canopus' | 'arcturus' | 'vega' | 'altair' | 'polaris' | 'sun';

export interface CustomFieldDefinition {
  id: string;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'number' | 'date';
  created_at: string;
}

export interface HorizionUser {
  id: string;
  horizion_id: string;
  full_name: string;
  email: string;
  role: StarRole;
  avatar_url?: string | null;
  is_active: boolean;
  cep?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  custom_data: Record<string, string | number | boolean>;
  created_at: string;
}