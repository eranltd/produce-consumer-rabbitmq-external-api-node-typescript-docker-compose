/**
 * A generic function that validates a value using a type guard.
 * If the validation passes, it returns the value with the correct type.
 * If it fails, it throws an error with a custom message.
 *
 * @param value The value to validate (of unknown type).
 * @param typeGuard The type guard function to use for validation (e.g., `(v: any) => v is MyType`).
 * @param errorMessage The error message to throw if validation fails.
 * @returns The validated value, asserted to type T.
 */
export function validateAndAssert<T>(
    value: unknown,
    typeGuard: (v: any) => v is T,
    errorMessage: string
): T {
    if (typeGuard(value)) {
        return value;
    }
    throw new Error(errorMessage);
}