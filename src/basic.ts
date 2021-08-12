import { ok } from './result';
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
	return ok(value);
}

export function asNull(value: unknown): CastResult<null> {
	if (isNull(value)) {
		return ok(value);
	}
	return castErr('Value is not of type null', '', 'null', value);
}

export function asUndefined(value: unknown): CastResult<undefined> {
	if (isUndefined(value)) {
		return ok(value);
	}
	return castErr('Value is not of type undefined', '', 'undefined', value);
}

export function asString(value: unknown): CastResult<string> {
	if (isString(value)) {
		return ok(value);
	}
	return castErr('Value is not of type string', '', 'string', value);
}

export function asNumber(value: unknown): CastResult<number> {
	if (isNumber(value)) {
		return ok(value);
	}
	return castErr('Value is not of type number', '', 'number', value);
}

export function asBoolean(value: unknown): CastResult<boolean> {
	if (isBoolean(value)) {
		return ok(value);
	}
	return castErr('Value is not of type boolean', '', 'boolean', value);
}

export function asObject(
	value: unknown,
): CastResult<{ [key: string]: unknown }> {
	if (isObject(value)) {
		return ok(value);
	}
	return castErr('Value is not of type object', '', 'object', value);
}

export function asArray(value: unknown): CastResult<unknown[]> {
	if (isArray(value)) {
		return ok(value);
	}
	return castErr('Value is not of type array', '', 'array', value);
}
