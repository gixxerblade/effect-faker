# Effect Faker

Generate composable and realistic mock data from TypeScript types using Effect Schema templates with locale support.

## Features

- 🎯 **Type-safe mock data generation** from Effect Schema definitions
- 🌍 **Multi-locale support** with 70+ locales from faker.js
- 🔧 **Flexible configuration** with custom faker methods and transformations
- 🎲 **Reproducible data** with seed support
- ⚡ **Effect integration** with both sync and async generation
- 🧠 **Smart field detection** for automatic realistic data

## Installation

```bash
bun install
```

## Quick Start

```typescript
import * as S from 'effect/Schema';
import { EffectFaker } from './effectFaker';

// Define your schema
const UserSchema = S.Struct({
  id: S.Number,
  name: S.String,
  email: S.String,
  phone: S.String,
  city: S.String,
});

const effectFaker = new EffectFaker();

// Generate mock data
const users = effectFaker.generateSync(UserSchema, { count: 5 });
console.log(users);
```

## Locale Support

Effect Faker supports 70+ locales for generating localized data:

### Basic Locale Usage

```typescript
// Generate data in French
const frenchUsers = effectFaker.generateSync(UserSchema, { 
  count: 3, 
  locale: 'fr' 
});

// Generate data in German
const germanUsers = effectFaker.generateSync(UserSchema, { 
  count: 3, 
  locale: 'de' 
});

// Generate data in Japanese
const japaneseUsers = effectFaker.generateSync(UserSchema, { 
  count: 3, 
  locale: 'ja' 
});
```

### Available Locales

```typescript
// Get list of all available locales
const locales = effectFaker.getAvailableLocales();
console.log(`Available locales: ${locales.length}`);
console.log('Examples:', locales.slice(0, 10));
```

Popular locales include:
- `en` - English (default)
- `fr` - French
- `de` - German
- `es` - Spanish
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `ko` - Korean
- `zh_CN` - Chinese (Simplified)
- `ar` - Arabic
- And many more...

### Locale with Custom Configuration

```typescript
const customUsers = effectFaker.generateSync(UserSchema, {
  count: 2,
  locale: 'es', // Spanish locale
  config: {
    name: 'person.fullName()',
    email: 'internet.email()',
    phone: 'phone.number()',
  }
});
```

## Advanced Usage

### Custom Field Configuration

```typescript
const ProductSchema = S.Struct({
  id: S.Number,
  name: S.String,
  price: S.Number,
  description: S.String,
  inStock: S.Boolean,
});

const products = effectFaker.generateSync(ProductSchema, {
  count: 3,
  locale: 'en',
  config: {
    name: 'commerce.productName()',
    price: 'commerce.price()',
    description: 'commerce.productDescription()',
    inStock: () => Math.random() > 0.3, // Custom function
  }
});
```

### Using with Effect

```typescript
import { Effect } from 'effect';

const generateUsersEffect = effectFaker.generate(UserSchema, { 
  count: 10,
  locale: 'fr'
});

// Run the effect
Effect.runPromise(generateUsersEffect).then(users => {
  console.log('Generated users:', users);
});
```

### Reproducible Data with Seeds

Effect Faker supports both numeric and string seeds with proper deterministic hashing:

```typescript
// Numeric seed
effectFaker.seed(12345);

const users1 = effectFaker.generateSync(UserSchema, { 
  count: 3,
  locale: 'de'
});

effectFaker.seed(12345); // Same seed
const users2 = effectFaker.generateSync(UserSchema, { 
  count: 3,
  locale: 'de'
});

// users1 and users2 will be identical

// String seed (creates deterministic hash)
effectFaker.seed('my-project-seed');
const seededUsers = effectFaker.generateSync(UserSchema, { count: 2 });

effectFaker.seed('my-project-seed'); // Same string seed
const identicalUsers = effectFaker.generateSync(UserSchema, { count: 2 });
// seededUsers and identicalUsers will be identical

effectFaker.seed('different-seed'); // Different string
const differentUsers = effectFaker.generateSync(UserSchema, { count: 2 });
// differentUsers will be different from the above
```

### Reusable Mock Generators

```typescript
const userMock = effectFaker.create(UserSchema, {
  name: 'person.fullName()',
  email: 'internet.email()',
});

// Generate with different locales
const englishUsers = userMock.generateSync({ count: 5, locale: 'en' });
const frenchUsers = userMock.generateSync({ count: 5, locale: 'fr' });
const germanUsers = userMock.generateSync({ count: 5, locale: 'de' });
```

## Smart Field Detection

Effect Faker automatically detects field names and generates appropriate data:

- `email` → realistic email addresses
- `name`, `firstName`, `lastName` → person names
- `phone` → phone numbers
- `address` → street addresses
- `city` → city names
- `country` → country names
- `url` → valid URLs
- `title` → sentences
- `description` → paragraphs
- `age` → numbers between 18-80
- `price` → currency amounts

All smart detection respects the selected locale!

## API Reference

### EffectFaker

#### Methods

- `generateSync<A>(schema, options)` - Synchronously generate mock data
- `generate<A>(schema, options)` - Generate mock data as Effect
- `create<A>(schema, config)` - Create reusable mock generator
- `seed(seed)` - Set seed for reproducible data
- `getAvailableLocales()` - Get list of available locales
- `registerFaker(name, fn)` - Register custom faker function

#### Options

```typescript
interface MockOptions {
  count?: number;           // Number of items to generate (default: 1)
  seed?: number;           // Seed for reproducible data
  locale?: string | LocaleDefinition | Faker; // Locale for data generation
}
```

## Examples

Run the locale example:

```bash
bun run example-locale.ts
```

This will demonstrate data generation in multiple locales with the same schema.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
