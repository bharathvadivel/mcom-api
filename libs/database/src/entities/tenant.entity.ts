export class Tenant {
  id!: string;
  subdomain!: string;
  customDomain?: string;
  name!: string;
  description?: string;
  logoUrl?: string;
  status!: 'active' | 'suspended' | 'terminated';
  plan!: 'starter' | 'professional' | 'enterprise';
  settings!: Record<string, any>;
  metadata!: Record<string, any>;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  users!: any[];
  subscriptions!: any[];
}