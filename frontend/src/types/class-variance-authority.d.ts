declare module 'class-variance-authority' {
  export function cva(
    base: string,
    config?: {
      variants?: Record<string, Record<string, string>>;
      defaultVariants?: Record<string, string>;
    }
  ): (props?: Record<string, string>) => string;
  
  export type VariantProps<T> = T extends (...args: any[]) => any 
    ? Parameters<T>[0] extends { variants?: infer V }
      ? V extends Record<string, any>
        ? {
            [K in keyof V]?: V[K] extends Record<string, any> ? keyof V[K] : never;
          }
        : never
      : never
    : never;
}

