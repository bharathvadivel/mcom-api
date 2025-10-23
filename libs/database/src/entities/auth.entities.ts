export class Role {
  id!: string;
  name!: string;
  description?: string;
  isSystem!: boolean;
  permissions!: string[];
  createdAt!: Date;
  updatedAt!: Date;
  userRoles!: any[];
}

export class Permission {
  id!: string;
  name!: string;
  description?: string;
  resource!: string;
  action!: string;
  createdAt!: Date;
}

export class UserRole {
  id!: string;
  userId!: string;
  roleId!: string;
  tenantId?: string;
  grantedBy?: string;
  grantedAt!: Date;
  expiresAt?: Date;
  user!: any;
  role!: any;
  tenant?: any;
}