/** Reads a value captured in beforeAll. Throws when the hook did not run. */
export function loaded<T>(value: T | undefined, what: string): T {
  if (value === undefined) {
    throw new Error(`${what} was not loaded`);
  }
  return value;
}
