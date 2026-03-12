// src/types/horizion.ts

export type Role = 'admin' | 'moderator' | 'user';

export type EntityStatus = 'active' | 'suspended_billing' | 'pending_verification' | 'archived';

export interface EntityBillingInfo {
  tax_id: string | null;
  plan: 'free' | 'pro' | 'enterprise' | 'education';
  billing_cycle: 'monthly' | 'yearly';
  payment_method: string | null;
}

export interface EntityResourceLimits {
  max_users: number;
  storage_limit_gb: number;
  api_calls_quota: number;
}

export interface EntityMetadata {
  branding: {
    icon_url: string | null;
    isologo_url: string | null;
    primary_color: string;
  };
  products: string[];
  hierarchy: {
    level: string;
    parent_id: string | null;
  };
  benefits_engine: Record<string, any>;
  [key: string]: any;
}

export interface Entity {
  id: string;
  slug: string;
  display_name: string;
  logo_url?: string;
  is_verified: boolean;
  category: string;
  cnpj?: string;
  website?: string;
  sector?: string;
  location?: string;
  status: EntityStatus;
  billing_info: EntityBillingInfo;
  resource_limits: EntityResourceLimits;
  metadata: EntityMetadata;
  created_at: string;
}

export interface MassOnboardingJob {
  id: string;
  entity_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  processed_records: number;
  error_log: any[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Interfaces mantidas (sem alterações para retrocompatibilidade)
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

export interface UserAffiliation {
  id: string;
  profile_id: string;
  entity_id: string;
  role: string;
  status: string;
  privacy_settings: Record<string, any>;
  expires_at?: string;
  created_at: string;
}