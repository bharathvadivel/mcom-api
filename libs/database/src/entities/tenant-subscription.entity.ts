// TypeORM imports will be added when dependencies are available

export class TenantSubscription {
  id!: string;
  tenantId!: string;
  plan!: string;
  status!: string;
  startedAt!: Date;
  endsAt?: Date;
  trialEndsAt?: Date;
  billingCycle!: string;
  pricePerCycle?: number;
  currency!: string;
  metadata!: Record<string, any>;
  createdAt!: Date;
  updatedAt!: Date;
  tenant!: any;
}