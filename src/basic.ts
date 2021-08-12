import { result } from './result';
import { castErr, CastResult } from './castResult';

export function isUnknown(value: unknown): value is unknown {
	return true;
}

export function isNull(value: unknown): value is null {
	return value === null;
}

export function isUndefined(value: unknown): value is undefined {
	return value === undefined;
}

export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
	return typeof value === 'number';
}

export function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

export function isObject(value: unknown): value is { [key: string]: unknown } {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

export function asUnknown(value: unknown): CastResult<unknown> {
	return result.ok(value);
}

export function asNull(value: unknown): CastResult<null> {
	if (isNull(value)) {
		return result.ok(value);
	}
	return castErr('null', value);
}

export function asUndefined(value: unknown): CastResult<undefined> {
	if (isUndefined(value)) {
		return result.ok(value);
	}
	return castErr('undefined', value);
}

export function asString(value: unknown): CastResult<string> {
	if (isString(value)) {
		return result.ok(value);
	}
	return castErr('string', value);
}

export function asNumber(value: unknown): CastResult<number> {
	if (isNumber(value)) {
		return result.ok(value);
	}
	return castErr('number', value);
}

export function asBoolean(value: unknown): CastResult<boolean> {
	if (isBoolean(value)) {
		return result.ok(value);
	}
	return castErr('boolean', value);
}

export function asObject(
	value: unknown,
): CastResult<{ [key: string]: unknown }> {
	if (isObject(value)) {
		return result.ok(value);
	}
	return castErr('object', value);
}

export function asArray(value: unknown): CastResult<unknown[]> {
	if (isArray(value)) {
		return result.ok(value);
	}
	return castErr('array', value);
}
