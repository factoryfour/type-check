export const isUnknown = (value: unknown): value is unknown => true;

export const isNull = (value: unknown): value is null => value === null;

export const isUndefined = (value: unknown): value is undefined =>
	value === undefined;

export const isString = (value: unknown): value is string =>
	typeof value === 'string';

export const isNumber = (value: unknown): value is number =>
	typeof value === 'number';

export const isBoolean = (value: unknown): value is boolean =>
	typeof value === 'boolean';

export const isObject = (value: unknown): value is { [key: string]: unknown } =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export const isArray = (value: unknown): value is unknown[] =>
	Array.isArray(value);
