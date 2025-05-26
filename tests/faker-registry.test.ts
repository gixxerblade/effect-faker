import { describe, test, expect, beforeEach } from 'bun:test';
import { EffectFakerRegistry } from '../lib/faker-registry';

describe('EffectFakerRegistry', () => {
  let registry: EffectFakerRegistry;

  beforeEach(() => {
    registry = new EffectFakerRegistry();
  });

  describe('Registration', () => {
    test('should register a custom faker function', () => {
      const customFaker = () => 'custom-value';

      registry.register('customString', customFaker);

      expect(registry.has('customString')).toBe(true);
    });

    test('should register multiple faker functions', () => {
      const faker1 = () => 'value1';
      const faker2 = () => 'value2';

      registry.register('faker1', faker1);
      registry.register('faker2', faker2);

      expect(registry.has('faker1')).toBe(true);
      expect(registry.has('faker2')).toBe(true);
    });

    test('should overwrite existing faker with same name', () => {
      const originalFaker = () => 'original';
      const newFaker = () => 'new';

      registry.register('test', originalFaker);
      registry.register('test', newFaker);

      const retrieved = registry.get('test');
      expect(retrieved).toBe(newFaker);
      expect(retrieved?.()).toBe('new');
    });
  });

  describe('Retrieval', () => {
    test('should retrieve registered faker function', () => {
      const customFaker = () => 'test-value';

      registry.register('testFaker', customFaker);
      const retrieved = registry.get('testFaker');

      expect(retrieved).toBe(customFaker);
      expect(retrieved?.()).toBe('test-value');
    });

    test('should return undefined for non-existent faker', () => {
      const result = registry.get('nonExistent');

      expect(result).toBeUndefined();
    });

    test('should return correct faker after multiple registrations', () => {
      const faker1 = () => 'value1';
      const faker2 = () => 'value2';
      const faker3 = () => 'value3';

      registry.register('faker1', faker1);
      registry.register('faker2', faker2);
      registry.register('faker3', faker3);

      expect(registry.get('faker1')).toBe(faker1);
      expect(registry.get('faker2')).toBe(faker2);
      expect(registry.get('faker3')).toBe(faker3);
    });
  });

  describe('Existence Check', () => {
    test('should return true for existing faker', () => {
      const customFaker = () => 'test';

      registry.register('exists', customFaker);

      expect(registry.has('exists')).toBe(true);
    });

    test('should return false for non-existent faker', () => {
      expect(registry.has('doesNotExist')).toBe(false);
    });

    test('should return false after registering different name', () => {
      const customFaker = () => 'test';

      registry.register('registered', customFaker);

      expect(registry.has('notRegistered')).toBe(false);
    });
  });

  describe('Listing', () => {
    test('should return empty array when no fakers registered', () => {
      const list = registry.list();

      expect(list).toEqual([]);
    });

    test('should return array with single faker name', () => {
      const customFaker = () => 'test';

      registry.register('singleFaker', customFaker);
      const list = registry.list();

      expect(list).toEqual(['singleFaker']);
    });

    test('should return array with multiple faker names', () => {
      const faker1 = () => 'value1';
      const faker2 = () => 'value2';
      const faker3 = () => 'value3';

      registry.register('faker1', faker1);
      registry.register('faker2', faker2);
      registry.register('faker3', faker3);

      const list = registry.list();

      expect(list).toHaveLength(3);
      expect(list).toContain('faker1');
      expect(list).toContain('faker2');
      expect(list).toContain('faker3');
    });

    test('should not include duplicates after overwriting', () => {
      const faker1 = () => 'original';
      const faker2 = () => 'new';

      registry.register('test', faker1);
      registry.register('test', faker2);
      registry.register('other', () => 'other');

      const list = registry.list();

      expect(list).toHaveLength(2);
      expect(list).toContain('test');
      expect(list).toContain('other');
    });
  });

  describe('Complex Faker Functions', () => {
    test('should handle faker functions that return objects', () => {
      const objectFaker = () => ({ name: 'John', age: 30 });

      registry.register('objectFaker', objectFaker);
      const retrieved = registry.get('objectFaker');

      expect(retrieved?.()).toEqual({ name: 'John', age: 30 });
    });

    test('should handle faker functions that return arrays', () => {
      const arrayFaker = () => ['item1', 'item2', 'item3'];

      registry.register('arrayFaker', arrayFaker);
      const retrieved = registry.get('arrayFaker');

      expect(retrieved?.()).toEqual(['item1', 'item2', 'item3']);
    });

    test('should handle faker functions that return numbers', () => {
      const numberFaker = () => Math.floor(Math.random() * 100);

      registry.register('numberFaker', numberFaker);
      const retrieved = registry.get('numberFaker');

      const result = retrieved?.();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(100);
    });

    test('should handle faker functions that return booleans', () => {
      const booleanFaker = () => true;

      registry.register('booleanFaker', booleanFaker);
      const retrieved = registry.get('booleanFaker');

      expect(retrieved?.()).toBe(true);
    });

    test('should handle faker functions with closures', () => {
      let counter = 0;
      const counterFaker = () => ++counter;

      registry.register('counterFaker', counterFaker);
      const retrieved = registry.get('counterFaker');

      expect(retrieved?.()).toBe(1);
      expect(retrieved?.()).toBe(2);
      expect(retrieved?.()).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string as faker name', () => {
      const emptyNameFaker = () => 'empty';

      registry.register('', emptyNameFaker);

      expect(registry.has('')).toBe(true);
      expect(registry.get('')).toBe(emptyNameFaker);
      expect(registry.list()).toContain('');
    });

    test('should handle special characters in faker names', () => {
      const specialFaker = () => 'special';
      const specialName = 'faker-with_special.chars@123';

      registry.register(specialName, specialFaker);

      expect(registry.has(specialName)).toBe(true);
      expect(registry.get(specialName)).toBe(specialFaker);
      expect(registry.list()).toContain(specialName);
    });

    test('should handle very long faker names', () => {
      const longName = 'a'.repeat(1000);
      const longNameFaker = () => 'long';

      registry.register(longName, longNameFaker);

      expect(registry.has(longName)).toBe(true);
      expect(registry.get(longName)).toBe(longNameFaker);
    });

    test('should handle faker functions that throw errors', () => {
      const errorFaker = () => {
        throw new Error('Test error');
      };

      registry.register('errorFaker', errorFaker);
      const retrieved = registry.get('errorFaker');

      expect(retrieved).toBe(errorFaker);
      expect(() => retrieved?.()).toThrow('Test error');
    });

    test('should handle faker functions that return undefined', () => {
      const undefinedFaker = () => undefined;

      registry.register('undefinedFaker', undefinedFaker);
      const retrieved = registry.get('undefinedFaker');

      expect(retrieved?.()).toBeUndefined();
    });

    test('should handle faker functions that return null', () => {
      const nullFaker = () => null;

      registry.register('nullFaker', nullFaker);
      const retrieved = registry.get('nullFaker');

      expect(retrieved?.()).toBeNull();
    });
  });

  describe('Performance', () => {
    test('should handle large number of registrations efficiently', () => {
      const startTime = Date.now();

      // Register 1000 fakers
      for (let i = 0; i < 1000; i++) {
        registry.register(`faker${i}`, () => `value${i}`);
      }

      const registrationTime = Date.now() - startTime;

      // Verify all were registered
      expect(registry.list()).toHaveLength(1000);

      // Test retrieval performance
      const retrievalStartTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        const faker = registry.get(`faker${i}`);
        expect(faker?.()).toBe(`value${i}`);
      }
      const retrievalTime = Date.now() - retrievalStartTime;

      // These should be reasonably fast (less than 1 second each)
      expect(registrationTime).toBeLessThan(1000);
      expect(retrievalTime).toBeLessThan(1000);
    });
  });
});
