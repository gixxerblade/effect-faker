import type * as S from 'effect/Schema';
import type * as AST from 'effect/SchemaAST';
import { Effect } from 'effect';
import { faker, Faker, allLocales, type LocaleDefinition } from '@faker-js/faker';
import type {
  MockOptions,
  SchemaMockConfig,
  FieldMockConfig,
  GeneratedAST,
  GenerateASTConfig,
} from '../types/types';

export class MockGenerator {
  private currentFaker: Faker = faker;
  private currentSeed: number | undefined;

  generateEffect<A>(
    schema: S.Schema<A>,
    config: SchemaMockConfig<A>,
    options: MockOptions
  ): Effect.Effect<A[], Error> {
    return Effect.try(() => this.generateSync(schema, config, options));
  }

  generateSync<A>(schema: S.Schema<A>, config: SchemaMockConfig<A>, options?: MockOptions): A[] {
    const count = options?.count ?? 1;

    if (options?.locale) {
      this.setupLocale(options.locale);
    }

    if (options?.seed) {
      this.setupSeed(options.seed);
    }

    const results: A[] = [];
    for (let i = 0; i < count; i++) {
      const mockData = this.generateFromAST(schema.ast, config, '');
      results.push(mockData as A);
    }

    return results;
  }

  private generateFromAST(ast: AST.AST, config: GenerateASTConfig, path: string): unknown {
    switch (ast._tag) {
      case 'StringKeyword':
        return this.generateString(path, config[this.getFieldName(path)]);

      case 'NumberKeyword':
        return this.generateNumber(path, config[this.getFieldName(path)]);

      case 'BooleanKeyword':
        return this.generateBoolean(path, config[this.getFieldName(path)]);

      case 'TypeLiteral':
        return this.generateObject(ast, config, path);

      case 'Union':
        return this.generateUnion(ast, config, path);

      case 'TupleType':
        return this.generateTuple(ast, config, path);

      case 'Refinement':
        // Generate from the base type, ignoring refinements for mock data
        return this.generateFromAST(ast.from, config, path);

      case 'Transformation':
        // Generate from the source type
        return this.generateFromAST(ast.from, config, path);

      case 'Declaration':
        // Handle branded types, dates, etc.
        return this.generateDeclaration(ast, config, path);

      default:
        // Fallback to string for unknown types
        return this.currentFaker.lorem.word();
    }
  }

  private generateObject<T>(
    ast: AST.TypeLiteral,
    config: GenerateASTConfig,
    basePath: string
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const prop of ast.propertySignatures) {
      const fieldName = typeof prop.name === 'string' ? prop.name : String(prop.name);
      const fieldPath = basePath ? `${basePath}.${fieldName}` : fieldName;

      result[fieldName] = this.generateFromAST(prop.type, config, fieldPath);
    }

    return result;
  }

  private generateUnion(
    ast: AST.Union,
    config: Record<string, GeneratedAST>,
    path: string
  ): unknown {
    // For unions, pick a random type
    const randomType = ast.types[Math.floor(Math.random() * ast.types.length)];

    // Handle literal types directly
    if (randomType._tag === 'Literal') {
      return randomType.literal;
    }

    return this.generateFromAST(randomType, config, path);
  }

  private generateTuple(
    ast: AST.TupleType,
    config: Record<string, GeneratedAST>,
    path: string
  ): unknown[] {
    return ast.elements.map((element, index) =>
      this.generateFromAST(element.type, config, `${path}[${index}]`)
    );
  }

  private generateDeclaration(
    ast: AST.Declaration,
    config: GenerateASTConfig,
    path: string
  ): unknown {
    // Handle special Effect Schema types
    const typeName =
      ast.typeParameters.length > 0
        ? `${ast._tag}<${ast.typeParameters.map(() => 'unknown').join(', ')}>`
        : ast._tag;

    switch (typeName) {
      case 'Date':
        return this.generateDate(
          path,
          config[this.getFieldName(path)] as FieldMockConfig | string | (() => unknown) | undefined
        );
      case 'UUID':
        return this.currentFaker.string.uuid();
      case 'ULID':
        return this.currentFaker.string.alphanumeric(26);
      case 'Email':
        return this.currentFaker.internet.email();
      case 'URL':
        return this.currentFaker.internet.url();
      default:
        // For branded types, generate the underlying type
        if (ast.typeParameters.length > 0) {
          return this.generateFromAST(ast.typeParameters[0], config, path);
        }
        return this.currentFaker.lorem.word();
    }
  }

  private generateString(
    path: string,
    fieldConfig?: FieldMockConfig | string | (() => unknown)
  ): string {
    if (typeof fieldConfig === 'function') {
      return String(fieldConfig());
    }

    if (typeof fieldConfig === 'string') {
      return String(this.executeFakerMethod(fieldConfig));
    }

    if (fieldConfig?.faker) {
      const result = this.executeFakerMethod(fieldConfig.faker);
      return fieldConfig.transform ? String(fieldConfig.transform(result)) : String(result);
    }

    // Smart field detection
    const fieldName = this.getFieldName(path).toLowerCase();
    if (fieldName.includes('email')) return this.currentFaker.internet.email();
    if (fieldName.includes('name')) return this.currentFaker.person.fullName();
    if (fieldName.includes('phone')) return this.currentFaker.phone.number();
    if (fieldName.includes('address')) return this.currentFaker.location.streetAddress();
    if (fieldName.includes('city')) return this.currentFaker.location.city();
    if (fieldName.includes('country')) return this.currentFaker.location.country();
    if (fieldName.includes('url')) return this.currentFaker.internet.url();
    if (fieldName.includes('title')) return this.currentFaker.lorem.sentence();
    if (fieldName.includes('description')) return this.currentFaker.lorem.paragraph();

    return this.currentFaker.lorem.word();
  }

  private generateNumber(
    path: string,
    fieldConfig?: FieldMockConfig | string | (() => unknown)
  ): number {
    if (typeof fieldConfig === 'function') {
      return Number(fieldConfig());
    }

    if (typeof fieldConfig === 'string') {
      return Number(this.executeFakerMethod(fieldConfig));
    }

    if (fieldConfig?.faker) {
      const result = this.executeFakerMethod(fieldConfig.faker);
      return fieldConfig.transform ? Number(fieldConfig.transform(result)) : Number(result);
    }

    // Smart field detection
    const fieldName = this.getFieldName(path).toLowerCase();
    if (fieldName === 'id') return this.currentFaker.number.int({ min: 1, max: 100000 });
    if (fieldName.includes('age')) return this.currentFaker.number.int({ min: 18, max: 80 });
    if (fieldName.includes('price') || fieldName.includes('cost'))
      return this.currentFaker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
    if (fieldName.includes('count') || fieldName.includes('quantity')) {
      return this.currentFaker.number.int({ min: 1, max: 100 });
    }

    return this.currentFaker.number.int();
  }

  private generateBoolean(
    path: string,
    fieldConfig?: FieldMockConfig | string | (() => unknown)
  ): boolean {
    if (typeof fieldConfig === 'function') {
      return Boolean(fieldConfig());
    }

    if (typeof fieldConfig === 'string') {
      return Boolean(this.executeFakerMethod(fieldConfig));
    }

    if (fieldConfig?.faker) {
      const result = this.executeFakerMethod(fieldConfig.faker);
      return fieldConfig.transform ? Boolean(fieldConfig.transform(result)) : Boolean(result);
    }

    return this.currentFaker.datatype.boolean();
  }

  private generateDate(
    path: string,
    fieldConfig?: FieldMockConfig | string | (() => unknown)
  ): Date {
    if (typeof fieldConfig === 'function') {
      return new Date(fieldConfig() as string | number | Date);
    }

    if (typeof fieldConfig === 'string') {
      return new Date(this.executeFakerMethod(fieldConfig) as string | number | Date);
    }

    if (fieldConfig?.faker) {
      const result = this.executeFakerMethod(fieldConfig.faker);
      return fieldConfig.transform
        ? new Date(fieldConfig.transform(result) as string | number | Date)
        : new Date(result as string | number | Date);
    }

    // Smart field detection
    const fieldName = this.getFieldName(path).toLowerCase();
    if (fieldName.includes('created') || fieldName.includes('birth'))
      return this.currentFaker.date.past();
    if (fieldName.includes('updated') || fieldName.includes('modified'))
      return this.currentFaker.date.recent();
    if (fieldName.includes('expire') || fieldName.includes('due'))
      return this.currentFaker.date.future();

    return this.currentFaker.date.recent();
  }

  private executeFakerMethod(fakerPath: string) {
    // Parse faker method calls like "number.int({min: 1, max: 100})"
    const match = fakerPath.match(/^([a-zA-Z.]+)(?:\((.+)\))?$/);
    if (!match) return this.currentFaker.lorem.word();

    const [, path, argsStr] = match;
    const pathParts = path.split('.');

    let fakerFn: unknown = this.currentFaker;
    for (const part of pathParts) {
      fakerFn = (fakerFn as Record<string, unknown>)[part];
      if (!fakerFn) return this.currentFaker.lorem.word();
    }

    if (typeof fakerFn !== 'function') return this.currentFaker.lorem.word();

    if (argsStr) {
      try {
        // Simple JSON parsing for arguments
        const args = JSON.parse(argsStr);
        return (fakerFn as (...args: unknown[]) => unknown)(args);
      } catch {
        return (fakerFn as () => unknown)();
      }
    }

    return (fakerFn as () => unknown)();
  }

  private getFieldName(path: string): string {
    return path.split('.').pop() || path;
  }

  setSeed(seedValue: number): void {
    this.currentSeed = seedValue;
    this.currentFaker.seed([seedValue]);
  }

  private setupSeed(seed: string | number): void {
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

    // Store the seed and apply it
    this.currentSeed = seedValue;
    this.currentFaker.seed([seedValue]);
  }

  private setupLocale(locale: string | LocaleDefinition | Faker): void {
    if (typeof locale === 'string') {
      // Handle string locale names like 'en', 'fr', 'de', etc.
      const localeDefinition = allLocales[locale as keyof typeof allLocales];
      if (localeDefinition) {
        this.currentFaker = new Faker({ locale: localeDefinition });
      } else {
        throw new Error(
          `Locale '${locale}' not found. Available locales: ${Object.keys(allLocales).join(', ')}`
        );
      }
    } else if (locale && typeof locale === 'object' && 'seed' in locale) {
      // Handle Faker instance (check for a method that exists on Faker)
      this.currentFaker = locale as Faker;
    } else {
      // Handle LocaleDefinition
      this.currentFaker = new Faker({ locale: locale as LocaleDefinition });
    }

    // Reapply the stored seed to the new faker instance
    if (this.currentSeed !== undefined) {
      this.currentFaker.seed([this.currentSeed]);
    }
  }
}
