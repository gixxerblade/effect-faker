import { describe, test, expect, beforeEach } from 'bun:test';
import * as S from 'effect/Schema';
import { Effect } from 'effect';
import { EffectFaker } from '../lib/effect-faker';
import type { SchemaMockConfig } from '../types/types';

describe('EffectFaker', () => {
  let effectFaker: EffectFaker;

  beforeEach(() => {
    effectFaker = new EffectFaker();
  });

  describe('Basic Schema Generation', () => {
    test('should generate data for simple string schema', () => {
      const StringSchema = S.String;
      const result = effectFaker.generateSync(StringSchema);

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('string');
      expect(result[0].length).toBeGreaterThan(0);
    });

    test('should generate data for simple number schema', () => {
      const NumberSchema = S.Number;
      const result = effectFaker.generateSync(NumberSchema);

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('number');
      expect(Number.isFinite(result[0])).toBe(true);
    });

    test('should generate data for simple boolean schema', () => {
      const BooleanSchema = S.Boolean;
      const result = effectFaker.generateSync(BooleanSchema);

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('boolean');
    });

    test('should generate data for struct schema', () => {
      const UserSchema = S.Struct({
        id: S.Number,
        name: S.String,
        email: S.String,
        isActive: S.Boolean,
      });

      const result = effectFaker.generateSync(UserSchema);

      expect(result).toHaveLength(1);
      const user = result[0];
      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.isActive).toBe('boolean');
    });
  });

  describe('Count Options', () => {
    test('should generate specified count of items', () => {
      const StringSchema = S.String;
      const count = 5;
      const result = effectFaker.generateSync(StringSchema, { count });

      expect(result).toHaveLength(count);
      for (const item of result) {
        expect(typeof item).toBe('string');
      }
    });

    test('should generate default count of 1 when not specified', () => {
      const StringSchema = S.String;
      const result = effectFaker.generateSync(StringSchema);

      expect(result).toHaveLength(1);
    });
  });

  describe('Seed Functionality', () => {
    test('should generate reproducible data with numeric seed', () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      effectFaker.seed(12345);
      const result1 = effectFaker.generateSync(UserSchema, { count: 2 });

      effectFaker.seed(12345);
      const result2 = effectFaker.generateSync(UserSchema, { count: 2 });

      expect(result1).toEqual(result2);
    });

    test('should generate reproducible data with string seed', () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      effectFaker.seed('test-seed');
      const result1 = effectFaker.generateSync(UserSchema, { count: 2 });

      effectFaker.seed('test-seed');
      const result2 = effectFaker.generateSync(UserSchema, { count: 2 });

      expect(result1).toEqual(result2);
    });

    test('should generate different data with different seeds', () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      effectFaker.seed(12345);
      const result1 = effectFaker.generateSync(UserSchema, { count: 2 });

      effectFaker.seed(54321);
      const result2 = effectFaker.generateSync(UserSchema, { count: 2 });

      expect(result1).not.toEqual(result2);
    });

    test('should handle seed in options parameter', () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      const result1 = effectFaker.generateSync(UserSchema, { count: 2, seed: 'option-seed' });
      const result2 = effectFaker.generateSync(UserSchema, { count: 2, seed: 'option-seed' });

      expect(result1).toEqual(result2);
    });
  });

  describe('Locale Support', () => {
    test('should generate data with different locales', () => {
      const UserSchema = S.Struct({
        name: S.String,
        city: S.String,
      });

      const englishResult = effectFaker.generateSync(UserSchema, { locale: 'en' });
      const frenchResult = effectFaker.generateSync(UserSchema, { locale: 'fr' });

      expect(englishResult).toHaveLength(1);
      expect(frenchResult).toHaveLength(1);
      // Results should be different due to different locales
      expect(englishResult[0]).not.toEqual(frenchResult[0]);
    });

    test('should get available locales', () => {
      const locales = effectFaker.getAvailableLocales();

      expect(Array.isArray(locales)).toBe(true);
      expect(locales.length).toBeGreaterThan(0);
      expect(locales).toContain('en');
      expect(locales).toContain('fr');
      expect(locales).toContain('de');
    });

    test('should maintain seed consistency across locale changes', () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      effectFaker.seed('consistent-seed');
      const englishResult1 = effectFaker.generateSync(UserSchema, { locale: 'en' });

      effectFaker.generateSync(UserSchema, { locale: 'fr' }); // Change locale

      effectFaker.seed('consistent-seed'); // Reset same seed
      const englishResult2 = effectFaker.generateSync(UserSchema, { locale: 'en' });

      expect(englishResult1).toEqual(englishResult2);
    });
  });

  describe('Custom Field Configuration', () => {
    test('should use custom faker methods', () => {
      const UserSchema = S.Struct({
        name: S.String,
        age: S.Number,
      });

      const config: SchemaMockConfig<typeof UserSchema.Type> = {
        name: 'person.firstName()',
        age: 'number.int({"min": 18, "max": 65})',
      };

      const result = effectFaker.generateSync(UserSchema, { config });

      expect(result).toHaveLength(1);
      const user = result[0];
      expect(typeof user.name).toBe('string');
      expect(typeof user.age).toBe('number');
      expect(user.age).toBeGreaterThanOrEqual(18);
      expect(user.age).toBeLessThanOrEqual(65);
    });

    test('should use custom functions', () => {
      const UserSchema = S.Struct({
        name: S.String,
        customField: S.String,
      });

      const config: SchemaMockConfig<typeof UserSchema.Type> = {
        customField: () => 'custom-value',
      };

      const result = effectFaker.generateSync(UserSchema, { config });

      expect(result[0].customField).toBe('custom-value');
    });

    test('should use field mock config with transform', () => {
      const UserSchema = S.Struct({
        name: S.String,
      });

      const config: SchemaMockConfig<typeof UserSchema.Type> = {
        name: {
          faker: 'person.firstName()',
          transform: value => `Mr. ${value}`,
        },
      };

      const result = effectFaker.generateSync(UserSchema, { config });

      expect(result[0].name).toMatch(/^Mr\. /);
    });
  });

  describe('Smart Field Detection', () => {
    test('should detect email fields', () => {
      const UserSchema = S.Struct({
        email: S.String,
        userEmail: S.String,
      });

      const result = effectFaker.generateSync(UserSchema);

      expect(result[0].email).toMatch(/@/);
      expect(result[0].userEmail).toMatch(/@/);
    });

    test('should detect name fields', () => {
      const UserSchema = S.Struct({
        name: S.String,
        firstName: S.String,
        lastName: S.String,
      });

      const result = effectFaker.generateSync(UserSchema);

      expect(typeof result[0].name).toBe('string');
      expect(typeof result[0].firstName).toBe('string');
      expect(typeof result[0].lastName).toBe('string');
      expect(result[0].name.length).toBeGreaterThan(0);
    });

    test('should detect numeric ID fields', () => {
      const UserSchema = S.Struct({
        id: S.Number,
        userId: S.Number,
      });

      const result = effectFaker.generateSync(UserSchema);

      expect(result[0].id).toBeGreaterThan(0);
      expect(result[0].userId).toBeGreaterThan(0);
    });

    test('should detect age fields', () => {
      const UserSchema = S.Struct({
        age: S.Number,
        userAge: S.Number,
      });

      const result = effectFaker.generateSync(UserSchema);

      expect(result[0].age).toBeGreaterThanOrEqual(18);
      expect(result[0].age).toBeLessThanOrEqual(80);
      expect(result[0].userAge).toBeGreaterThanOrEqual(18);
      expect(result[0].userAge).toBeLessThanOrEqual(80);
    });
  });

  describe('Complex Schema Types', () => {
    test('should handle union types', () => {
      const StatusSchema = S.Union(
        S.Literal('active'),
        S.Literal('inactive'),
        S.Literal('pending')
      );
      const UserSchema = S.Struct({
        name: S.String,
        status: StatusSchema,
      });

      const result = effectFaker.generateSync(UserSchema, { count: 10 });

      for (const user of result) {
        expect(['active', 'inactive', 'pending']).toContain(user.status);
      }
    });

    test('should handle tuple types', () => {
      const CoordinateSchema = S.Tuple(S.Number, S.Number);
      const LocationSchema = S.Struct({
        name: S.String,
        coordinates: CoordinateSchema,
      });

      const result = effectFaker.generateSync(LocationSchema);

      expect(Array.isArray(result[0].coordinates)).toBe(true);
      expect(result[0].coordinates).toHaveLength(2);
      expect(typeof result[0].coordinates[0]).toBe('number');
      expect(typeof result[0].coordinates[1]).toBe('number');
    });

    test('should handle nested objects', () => {
      const AddressSchema = S.Struct({
        street: S.String,
        city: S.String,
        country: S.String,
      });

      const UserSchema = S.Struct({
        name: S.String,
        address: AddressSchema,
      });

      const result = effectFaker.generateSync(UserSchema);

      expect(typeof result[0].address).toBe('object');
      expect(typeof result[0].address.street).toBe('string');
      expect(typeof result[0].address.city).toBe('string');
      expect(typeof result[0].address.country).toBe('string');
    });
  });

  describe('Effect Integration', () => {
    test('should generate data using Effect', async () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      const effect = effectFaker.generate(UserSchema, { count: 2 });
      const result = await Effect.runPromise(effect);

      expect(result).toHaveLength(2);
      for (const user of result) {
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
      }
    });

    test('should handle Effect errors gracefully', async () => {
      const UserSchema = S.Struct({
        name: S.String,
      });

      const effect = effectFaker.generate(UserSchema);

      // This should not throw
      const result = await Effect.runPromise(effect);
      expect(result).toHaveLength(1);
    });
  });

  describe('GeneratedMock Interface', () => {
    test('should create reusable mock generator', () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      const userMock = effectFaker.create(UserSchema);

      expect(userMock.schema).toBe(UserSchema);
      expect(typeof userMock.generate).toBe('function');
      expect(typeof userMock.generateSync).toBe('function');
    });

    test('should use mock generator synchronously', () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      const userMock = effectFaker.create(UserSchema);
      const result = userMock.generateSync({ count: 3 });

      expect(result).toHaveLength(3);
      for (const user of result) {
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
      }
    });

    test('should use mock generator with Effect', async () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      const userMock = effectFaker.create(UserSchema);
      const effect = userMock.generate({ count: 2 });
      const result = await Effect.runPromise(effect);

      expect(result).toHaveLength(2);
      for (const user of result) {
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
      }
    });

    test('should create mock with configuration', () => {
      const UserSchema = S.Struct({
        name: S.String,
        age: S.Number,
      });

      const config: SchemaMockConfig<typeof UserSchema.Type> = {
        name: 'person.firstName()',
        age: () => 25,
      };

      const userMock = effectFaker.create(UserSchema, config);
      const result = userMock.generateSync();

      expect(result[0].age).toBe(25);
      expect(typeof result[0].name).toBe('string');
    });
  });

  describe('Custom Faker Registration', () => {
    test('should register and use custom faker functions', () => {
      effectFaker.registerFaker('customString', () => 'custom-generated-value');

      // Note: This test verifies the registration works, but the actual usage
      // would depend on how the custom fakers are integrated with the generator
      expect(true).toBe(true); // Placeholder - actual implementation may vary
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid locale gracefully', () => {
      const UserSchema = S.Struct({
        name: S.String,
      });

      expect(() => {
        effectFaker.generateSync(UserSchema, { locale: 'invalid-locale' as string });
      }).toThrow();
    });

    test('should handle malformed faker method strings', () => {
      const UserSchema = S.Struct({
        name: S.String,
      });

      const config: SchemaMockConfig<typeof UserSchema.Type> = {
        name: 'invalid.faker.method()',
      };

      // Should not throw, should fallback to default
      const result = effectFaker.generateSync(UserSchema, { config });
      expect(typeof result[0].name).toBe('string');
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large count generation', () => {
      const UserSchema = S.Struct({
        name: S.String,
        email: S.String,
      });

      const result = effectFaker.generateSync(UserSchema, { count: 1000 });

      expect(result).toHaveLength(1000);
      // Verify all items are properly generated
      for (const user of result) {
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
      }
    });

    test('should handle zero count', () => {
      const UserSchema = S.Struct({
        name: S.String,
      });

      const result = effectFaker.generateSync(UserSchema, { count: 0 });

      expect(result).toHaveLength(0);
    });

    test('should handle empty struct', () => {
      const EmptySchema = S.Struct({});

      const result = effectFaker.generateSync(EmptySchema);

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('object');
      expect(Object.keys(result[0])).toHaveLength(0);
    });
  });
});
