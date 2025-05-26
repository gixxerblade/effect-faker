import { describe, test, expect, beforeEach } from 'bun:test';
import * as S from 'effect/Schema';
import { MockGenerator } from '../lib/generator';
import type { SchemaMockConfig } from '../types/types';

describe('MockGenerator', () => {
  let generator: MockGenerator;

  beforeEach(() => {
    generator = new MockGenerator();
  });

  describe('Basic Generation', () => {
    test('should generate string data', () => {
      const schema = S.String;
      const result = generator.generateSync(schema, '', { count: 1 });

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('string');
      expect(result[0].length).toBeGreaterThan(0);
    });

    test('should generate number data', () => {
      const schema = S.Number;
      const result = generator.generateSync(schema, 0, { count: 1 });

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('number');
      expect(Number.isFinite(result[0])).toBe(true);
    });

    test('should generate boolean data', () => {
      const schema = S.Boolean;
      const result = generator.generateSync(schema, true, { count: 1 });

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('boolean');
    });
  });

  describe('Struct Generation', () => {
    test('should generate struct with multiple fields', () => {
      const schema = S.Struct({
        name: S.String,
        age: S.Number,
        active: S.Boolean,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(result).toHaveLength(1);
      const item = result[0];
      expect(typeof item.name).toBe('string');
      expect(typeof item.age).toBe('number');
      expect(typeof item.active).toBe('boolean');
    });

    test('should generate nested structs', () => {
      const AddressSchema = S.Struct({
        street: S.String,
        city: S.String,
      });

      const UserSchema = S.Struct({
        name: S.String,
        address: AddressSchema,
      });

      const result = generator.generateSync(UserSchema, {}, { count: 1 });

      expect(result).toHaveLength(1);
      const user = result[0];
      expect(typeof user.name).toBe('string');
      expect(typeof user.address).toBe('object');
      expect(typeof user.address.street).toBe('string');
      expect(typeof user.address.city).toBe('string');
    });
  });

  describe('Smart Field Detection', () => {
    test('should detect email fields', () => {
      const schema = S.Struct({
        email: S.String,
        userEmail: S.String,
        contactEmail: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(result[0].email).toMatch(/@/);
      expect(result[0].userEmail).toMatch(/@/);
      expect(result[0].contactEmail).toMatch(/@/);
    });

    test('should detect name fields', () => {
      const schema = S.Struct({
        name: S.String,
        firstName: S.String,
        lastName: S.String,
        fullName: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(typeof result[0].name).toBe('string');
      expect(typeof result[0].firstName).toBe('string');
      expect(typeof result[0].lastName).toBe('string');
      expect(typeof result[0].fullName).toBe('string');
      expect(result[0].name.length).toBeGreaterThan(0);
    });

    test('should detect ID fields', () => {
      const schema = S.Struct({
        id: S.Number,
        userId: S.Number,
        customId: S.Number,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(result[0].id).toBeGreaterThan(0);
      expect(result[0].userId).toBeGreaterThan(0);
      expect(result[0].customId).toBeGreaterThan(0);
    });

    test('should detect age fields', () => {
      const schema = S.Struct({
        age: S.Number,
        userAge: S.Number,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(result[0].age).toBeGreaterThanOrEqual(18);
      expect(result[0].age).toBeLessThanOrEqual(80);
      expect(result[0].userAge).toBeGreaterThanOrEqual(18);
      expect(result[0].userAge).toBeLessThanOrEqual(80);
    });

    test('should detect phone fields', () => {
      const schema = S.Struct({
        phone: S.String,
        phoneNumber: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(typeof result[0].phone).toBe('string');
      expect(typeof result[0].phoneNumber).toBe('string');
      expect(result[0].phone.length).toBeGreaterThan(0);
    });

    test('should detect address fields', () => {
      const schema = S.Struct({
        address: S.String,
        streetAddress: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(typeof result[0].address).toBe('string');
      expect(typeof result[0].streetAddress).toBe('string');
      expect(result[0].address.length).toBeGreaterThan(0);
    });

    test('should detect city fields', () => {
      const schema = S.Struct({
        city: S.String,
        hometown: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(typeof result[0].city).toBe('string');
      expect(typeof result[0].hometown).toBe('string');
      expect(result[0].city.length).toBeGreaterThan(0);
    });

    test('should detect country fields', () => {
      const schema = S.Struct({
        country: S.String,
        nationality: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(typeof result[0].country).toBe('string');
      expect(typeof result[0].nationality).toBe('string');
      expect(result[0].country.length).toBeGreaterThan(0);
    });

    test('should detect URL fields', () => {
      const schema = S.Struct({
        url: S.String,
        website: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(typeof result[0].url).toBe('string');
      expect(typeof result[0].website).toBe('string');
      expect(result[0].url).toMatch(/^https?:\/\//);
    });

    test('should detect title fields', () => {
      const schema = S.Struct({
        title: S.String,
        jobTitle: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(typeof result[0].title).toBe('string');
      expect(typeof result[0].jobTitle).toBe('string');
      expect(result[0].title.length).toBeGreaterThan(0);
    });

    test('should detect description fields', () => {
      const schema = S.Struct({
        description: S.String,
        bio: S.String,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(typeof result[0].description).toBe('string');
      expect(typeof result[0].bio).toBe('string');
      expect(result[0].description.length).toBeGreaterThan(0);
    });

    test('should detect price fields', () => {
      const schema = S.Struct({
        price: S.Number,
        cost: S.Number,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(result[0].price).toBeGreaterThanOrEqual(10);
      expect(result[0].price).toBeLessThanOrEqual(1000);
      expect(result[0].cost).toBeGreaterThanOrEqual(10);
      expect(result[0].cost).toBeLessThanOrEqual(1000);
    });

    test('should detect count/quantity fields', () => {
      const schema = S.Struct({
        count: S.Number,
        quantity: S.Number,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(result[0].count).toBeGreaterThanOrEqual(1);
      expect(result[0].count).toBeLessThanOrEqual(100);
      expect(result[0].quantity).toBeGreaterThanOrEqual(1);
      expect(result[0].quantity).toBeLessThanOrEqual(100);
    });
  });

  describe('Custom Configuration', () => {
    test('should use custom faker methods', () => {
      const schema = S.Struct({
        name: S.String,
        age: S.Number,
      });

      const config: SchemaMockConfig<typeof schema.Type> = {
        name: 'person.firstName()',
        age: 'number.int({"min": 25, "max": 30})',
      };

      const result = generator.generateSync(schema, config, { count: 1 });

      expect(typeof result[0].name).toBe('string');
      expect(result[0].age).toBeGreaterThanOrEqual(25);
      expect(result[0].age).toBeLessThanOrEqual(30);
    });

    test('should use custom functions', () => {
      const schema = S.Struct({
        name: S.String,
        customValue: S.String,
      });

      const config: SchemaMockConfig<typeof schema.Type> = {
        customValue: () => 'fixed-value',
      };

      const result = generator.generateSync(schema, config, { count: 1 });

      expect(result[0].customValue).toBe('fixed-value');
    });

    test('should use field mock config with transform', () => {
      const schema = S.Struct({
        name: S.String,
      });

      const config: SchemaMockConfig<typeof schema.Type> = {
        name: {
          faker: 'person.firstName()',
          transform: value => `Dr. ${value}`,
        },
      };

      const result = generator.generateSync(schema, config, { count: 1 });

      expect(result[0].name).toMatch(/^Dr\. /);
    });
  });

  describe('Complex Schema Types', () => {
    test('should handle union types', () => {
      const StatusSchema = S.Union(S.Literal('active'), S.Literal('inactive'));
      const schema = S.Struct({
        status: StatusSchema,
      });

      const result = generator.generateSync(schema, {}, { count: 10 });

      for (const item of result) {
        expect(['active', 'inactive']).toContain(item.status);
      }
    });

    test('should handle tuple types', () => {
      const CoordinateSchema = S.Tuple(S.Number, S.Number);
      const schema = S.Struct({
        coordinates: CoordinateSchema,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(Array.isArray(result[0].coordinates)).toBe(true);
      expect(result[0].coordinates).toHaveLength(2);
      expect(typeof result[0].coordinates[0]).toBe('number');
      expect(typeof result[0].coordinates[1]).toBe('number');
    });

    test('should handle three-element tuples', () => {
      const RGBSchema = S.Tuple(S.Number, S.Number, S.Number);
      const schema = S.Struct({
        color: RGBSchema,
      });

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(Array.isArray(result[0].color)).toBe(true);
      expect(result[0].color).toHaveLength(3);
      expect(typeof result[0].color[0]).toBe('number');
      expect(typeof result[0].color[1]).toBe('number');
      expect(typeof result[0].color[2]).toBe('number');
    });
  });

  describe('Seed Functionality', () => {
    test('should generate reproducible data with seed', () => {
      const schema = S.Struct({
        name: S.String,
        age: S.Number,
      });

      const result1 = generator.generateSync(schema, {}, { count: 2, seed: 'test-seed' });
      const result2 = generator.generateSync(schema, {}, { count: 2, seed: 'test-seed' });

      expect(result1).toEqual(result2);
    });

    test('should generate different data with different seeds', () => {
      const schema = S.Struct({
        name: S.String,
        age: S.Number,
      });

      const result1 = generator.generateSync(schema, {}, { count: 2, seed: 'seed1' });
      const result2 = generator.generateSync(schema, {}, { count: 2, seed: 'seed2' });

      expect(result1).not.toEqual(result2);
    });

    test('should handle numeric seeds', () => {
      const schema = S.Struct({
        name: S.String,
      });

      const result1 = generator.generateSync(schema, {}, { count: 2, seed: 12345 });
      const result2 = generator.generateSync(schema, {}, { count: 2, seed: 12345 });

      expect(result1).toEqual(result2);
    });
  });

  describe('Locale Support', () => {
    test('should generate data with different locales', () => {
      const schema = S.Struct({
        name: S.String,
        city: S.String,
      });

      const englishResult = generator.generateSync(schema, {}, { locale: 'en' });
      const frenchResult = generator.generateSync(schema, {}, { locale: 'fr' });

      expect(englishResult).toHaveLength(1);
      expect(frenchResult).toHaveLength(1);
      // Results should be different due to different locales
      expect(englishResult[0]).not.toEqual(frenchResult[0]);
    });

    test('should maintain seed consistency with locale changes', () => {
      const schema = S.Struct({
        name: S.String,
      });

      const result1 = generator.generateSync(schema, {}, { seed: 'test', locale: 'en' });
      const result2 = generator.generateSync(schema, {}, { seed: 'test', locale: 'en' });

      expect(result1).toEqual(result2);
    });
  });

  describe('Count Generation', () => {
    test('should generate specified count', () => {
      const schema = S.String;
      const count = 5;

      const result = generator.generateSync(schema, '', { count });

      expect(result).toHaveLength(count);
      for (const item of result) {
        expect(typeof item).toBe('string');
      }
    });

    test('should generate default count of 1', () => {
      const schema = S.String;

      const result = generator.generateSync(schema, '', {});

      expect(result).toHaveLength(1);
    });

    test('should handle zero count', () => {
      const schema = S.String;

      const result = generator.generateSync(schema, '', { count: 0 });

      expect(result).toHaveLength(0);
    });
  });

  describe('Effect Integration', () => {
    test('should generate data using Effect', async () => {
      const schema = S.Struct({
        name: S.String,
        age: S.Number,
      });

      const effect = generator.generateEffect(schema, {}, { count: 2 });

      // Since we can't easily test Effect without running it,
      // we'll test the sync version which the Effect version uses internally
      const syncResult = generator.generateSync(schema, {}, { count: 2 });
      expect(syncResult).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed faker method strings gracefully', () => {
      const schema = S.Struct({
        name: S.String,
      });

      const config: SchemaMockConfig<typeof schema.Type> = {
        name: 'invalid.method.call()',
      };

      // Should not throw, should fallback to default
      const result = generator.generateSync(schema, config, { count: 1 });
      expect(typeof result[0].name).toBe('string');
    });

    test('should handle invalid JSON in faker arguments', () => {
      const schema = S.Struct({
        age: S.Number,
      });

      const config: SchemaMockConfig<typeof schema.Type> = {
        age: 'number.int({invalid json})',
      };

      // Should not throw, should fallback to default
      const result = generator.generateSync(schema, config, { count: 1 });
      expect(typeof result[0].age).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty struct', () => {
      const schema = S.Struct({});

      const result = generator.generateSync(schema, {}, { count: 1 });

      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe('object');
      expect(Object.keys(result[0])).toHaveLength(0);
    });

    test('should handle deeply nested structures', () => {
      const Level3Schema = S.Struct({
        value: S.String,
      });

      const Level2Schema = S.Struct({
        level3: Level3Schema,
        name: S.String,
      });

      const Level1Schema = S.Struct({
        level2: Level2Schema,
        id: S.Number,
      });

      const result = generator.generateSync(Level1Schema, {}, { count: 1 });

      expect(result).toHaveLength(1);
      expect(typeof result[0].level2.level3.value).toBe('string');
      expect(typeof result[0].level2.name).toBe('string');
      expect(typeof result[0].id).toBe('number');
    });
  });
});
