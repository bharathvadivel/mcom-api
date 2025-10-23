/**
 * Transform pipe for data transformation
 */
export class TransformPipe {
  constructor(private readonly transformFn: (value: any) => any) {}

  transform(value: any): any {
    return this.transformFn(value);
  }
}

/**
 * Common transformation functions
 */
export const transformToUpperCase = (value: string): string => {
  return typeof value === 'string' ? value.toUpperCase() : value;
};

export const transformToLowerCase = (value: string): string => {
  return typeof value === 'string' ? value.toLowerCase() : value;
};

export const transformTrimString = (value: string): string => {
  return typeof value === 'string' ? value.trim() : value;
};