/**
 * Items in a yard.
 * CountedCategory and UncountedCategory split on whether `totalAssets` exists.
 * Each of those splits again into a leaf or a branch that holds child categories.
 */
export abstract class CategoryNode {
  abstract readonly kind: 'leaf' | 'branch';
  abstract readonly counted: boolean;

  constructor(readonly name: string) {}

  childCategories(): readonly YardCategory[] {
    return [];
  }
}

export abstract class CountedCategory extends CategoryNode {
  readonly counted = true as const;

  constructor(
    name: string,
    readonly totalAssets: number,
  ) {
    super(name);
  }
}

export abstract class UncountedCategory extends CategoryNode {
  readonly counted = false as const;
}

export class CountedLeaf extends CountedCategory {
  readonly kind = 'leaf' as const;
}

export class UncountedLeaf extends UncountedCategory {
  readonly kind = 'leaf' as const;
}

export class CountedBranch extends CountedCategory {
  readonly kind = 'branch' as const;

  constructor(
    name: string,
    totalAssets: number,
    readonly children: YardCategory[],
  ) {
    super(name, totalAssets);
  }

  override childCategories(): readonly YardCategory[] {
    return this.children;
  }
}

export class UncountedBranch extends UncountedCategory {
  readonly kind = 'branch' as const;

  constructor(
    name: string,
    readonly children: YardCategory[],
  ) {
    super(name);
  }

  override childCategories(): readonly YardCategory[] {
    return this.children;
  }
}

export type YardCategory = CountedLeaf | UncountedLeaf | CountedBranch | UncountedBranch;

/** Parent categories and their children, in walk order. */
export function flattenCategories(nodes: readonly YardCategory[]): YardCategory[] {
  const flat: YardCategory[] = [];
  const walk = (node: YardCategory): void => {
    flat.push(node);
    node.childCategories().forEach(walk);
  };
  nodes.forEach(walk);
  return flat;
}
