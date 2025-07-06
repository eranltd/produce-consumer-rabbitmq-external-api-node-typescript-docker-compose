/**
 * Recursively trims all string values in an object or an array of objects.
 * This function mutates the original object/array.
 * @param data The object or array to process.
 */
export function trimAllStringValues<T>(data: T): T {
	if (Array.isArray(data)) {
		data.forEach(trimAllStringValues);
	} else if (data && typeof data === 'object') {
		for (const key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				const value = (data as any)[key];
				if (typeof value === 'string') {
					(data as any)[key] = value.trim();
				} else if (typeof value === 'object') {
					trimAllStringValues(value);
				}
			}
		}
	}
	return data;
}