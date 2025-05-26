import type * as S from 'effect/Schema';
import type { Effect } from 'effect';
import type { LocaleDefinition, Faker } from '@faker-js/faker';

export interface MockOptions {
  count?: number;
  seed?: string | number;
  locale?: string | LocaleDefinition | Faker;
}

export interface FieldMockConfig {
  faker?: string;
  value?: unknown;
  transform?: (value: unknown) => unknown;
  constraints?: Record<string, unknown>;
}

export type GeneratedAST = FieldMockConfig | string | (() => unknown) | undefined;
export type GenerateASTConfig = Record<string, GeneratedAST>;

export type SchemaMockConfig<A> = {
  [K in keyof A]?: FieldMockConfig | string | (() => A[K]);
};

export interface GeneratedMock<A> {
  schema: S.Schema<A>;
  mockConfig: SchemaMockConfig<A>;
  generate: (options?: MockOptions) => Effect.Effect<A[], Error>;
  generateSync: (options?: MockOptions) => A[];
}
