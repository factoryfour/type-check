export type { Ok, Err, Result } from './src/result';

export {
	ok,
	err,
	errMsg,
	isOk,
	isErr,
	unwrap,
	reduce,
	mapAndIgnoreErrors,
	mapUnlessError,
} from './src/result';

export type { CastError, CastResult } from './src/castResult';

export { castErr, castErrChain } from './src/castResult';

export {
	isUnknown,
	isNull,
	isUndefined,
	isString,
	isNumber,
	isBoolean,
	isObject,
	isArray,
	asUnknown,
	asNull,
	asUndefined,
	asString,
	asNumber,
	asBoolean,
	asObject,
	asArray,
} from './src/basic';

export {
	oneOf,
	literal,
	optional,
	nullable,
	arrayOf,
	objectOf,
} from './src/combiners';

export { structure, tuple } from './src/structure';
