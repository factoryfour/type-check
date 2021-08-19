import { Cast } from './castResult';
import { result } from './result';

// eslint-disable-next-line import/prefer-default-export
export function isFromAs<T>(asT: Cast<T>): (value: unknown) => value is T {
	return (value): value is T => result.isOk(asT(value));
}
