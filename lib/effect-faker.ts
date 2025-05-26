import type * as S from 'effect/Schema';
import { type Effect, pipe } from 'effect';
import { faker, allLocales } from '@faker-js/faker';
import { MockGenerator } from './generator';
import { EffectFakerRegistry } from './faker-registry';
import type { MockOptions, SchemaMockConfig, GeneratedMock, FieldMockConfig } from '../types/types';

export class EffectFaker {
  private generator: MockGenerator;
  private fakerRegistry: EffectFakerRegistry;
  private currentSeed: number | undefined;

  constructor() {
    this.generator = new MockGenerator();
    this.fakerRegistry = new EffectFakerRegistry();
  }

  /**
   * Create a mock generator for a specific Effect Schema
   */
  create<A>(schema: S.Schema<A>, config?: SchemaMockConfig<A>): GeneratedMock<A> {
    return {
      schema,
      mockConfig: config || {},
      generate: (options: MockOptions = {}) => {
        return this.generator.generateEffect(schema, config || {}, options);
      },
      generateSync: (options: MockOptions = {}) => {
        return this.generator.generateSync(schema, config || {}, options);
      },
    };
  }

  /**
   * Generate data directly from schema without creating reusable mock
   */
  generate<A>(
    schema: S.Schema<A>,
    options: MockOptions & { config?: SchemaMockConfig<A> } = {}
  ): Effect.Effect<A[], Error> {
    const { config, ...mockOptions } = options;
    return this.generator.generateEffect(schema, config || {}, mockOptions);
  }

  /**
   * Synchronous generation (throws on error)
   */
  generateSync<A>(
    schema: S.Schema<A>,
    options: MockOptions & { config?: SchemaMockConfig<A> } = {}
  ): A[] {
    const { config, ...mockOptions } = options;
    return this.generator.generateSync(schema, config || {}, mockOptions);
  }

  /**
   * Register custom faker functions
   */
  registerFaker(name: string, fakerFn: () => unknown): void {
    this.fakerRegistry.register(name, fakerFn);
  }

  /**
   * Set global seed for reproducible data
   */
  seed(seed: string | number): void {
    let seedValue: number;

    if (typeof seed === 'string') {
      // Create a deterministic hash from the string
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      // Ensure positive number and use as seed
      seedValue = Math.abs(hash);
    } else {
      seedValue = seed;
    }

    // Store the seed and apply it to the global faker
    this.currentSeed = seedValue;
    faker.seed([seedValue]);

    // Also set the seed on the generator to ensure consistency across locale changes
    this.generator.setSeed(seedValue);
  }

  /**
   * Get available locales
   */
  getAvailableLocales(): string[] {
    return Object.keys(allLocales);
  }
}
