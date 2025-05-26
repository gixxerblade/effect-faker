export class EffectFakerRegistry {
  private customFakers: Map<string, () => unknown> = new Map();

  register(name: string, fakerFn: () => unknown): void {
    this.customFakers.set(name, fakerFn);
  }

  get(name: string): (() => unknown) | undefined {
    return this.customFakers.get(name);
  }

  has(name: string): boolean {
    return this.customFakers.has(name);
  }

  list(): string[] {
    return Array.from(this.customFakers.keys());
  }
}
