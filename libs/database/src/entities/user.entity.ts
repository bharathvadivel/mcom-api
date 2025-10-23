export class User {
  id!: string;
  tenantId?: string;
  email!: string;
  passwordHash!: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  emailVerified!: boolean;
  phoneVerified!: boolean;
  status!: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  passwordChangedAt!: Date;
  metadata!: Record<string, any>;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  tenant?: any;
  roles!: any[];
  sessions!: any[];
}