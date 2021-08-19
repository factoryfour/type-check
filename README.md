# type-check

Library that provides a simple syntax for constructing type checkers of complex types.

If given the correct annotations, the compiler itself will exactly instruct you on how to correct
your code for the type checker to match.

Beware, there is no way to prevent too tight type checks. So if there is a field that is of type
`number | null`, both `asNull` and `asNumber` will be accepted, when in reality you'd want to use
`oneOf(asNull, asNumber)`, or more tersely `nullable(asNumber)`, which is just syntactic sugar for
`oneOf`.

## Conventions

### Naming

Functions of type `Cast<SomeType>` should be called `asSomeType`.

Functions with signature `(value: unknown) => value is SomeType` should be called `isSomeType`.

The `as` prefix denotes that we're returning a result, `is` prefix denotes that we are checking
the type for the TypeScript compiler.

## Usage

### `isSomeType` functions

Multiple functions are provided to help perform type checks:

```
isUnknown
isNull
isUndefined
isString
isNumber
isBoolean
isObject
isArray
```

Each of them can be used as a type guard in TypeScript code.

```typescript
if (isString(unknownData)) {
	functionThatAcceptsStrings(unknownData);
}
```

### `asSomeType` functions

These functions are combined to create the more complex type checks.

They return a `CastResult` type, which either contains the passed in value in a `value` field upon
success, or provides detailed error messages upon failure.

```
asUnknown
asNull
asUndefined
asString
asNumber
asBoolean
asObject
asArray
```

```typescript
const res = asString(unknownData);
if (result.isOk(res)) {
	functionThatAcceptsStrings(res.value);
}
```

### `isFromAs`

Utility function for creating TypeScript type guards from `asSomeType` functions.

```typescript
const asDesiredTuple = tuple(asString, asNumber);
const isDesiredTuple = isFromAs(asDesiredTuple);
if (isDesiredTuple(unknownData)) {
	functionThatAcceptsStringAndNumber(unknownData[0], unknownData[1]);
}
```

### `oneOf`

Creates type checker that ensures one of the passed in types matches.

```typescript
const asOneOf = oneOf(asString, asNumber, asBoolean);
asOneOf('foo') // ok
asOneOf(42) // ok
asOneOf(false) // ok
asOneOf(null) // err
```

### `optional` and `nullable`

Syntactic sugar.

`optional(asT)` is equivalent to `oneOf(asT, asUndefined)`.

`nullable(asT)` is equivalent to `oneOf(asT, asNull)`.

### `literal`

Checks if we're exactly matching a passed in string, number, or boolean.

```typescript
const asLiteral = literal('foo', 'bar');
asLiteral('foo') // ok
asLiteral('bar') // ok
asLiteral('baz') // err
```

### `arrayOf`

Creates type checker that checks if the passed in value is an array with
all elements of the correct type.

```typescript
const asStringArray = arrayOf(asString);
asStringArray([]) // ok
asStringArray(['foo', 'bar']) // ok
asStringArray(['foo', 42]) // err
asStringArray('foo') // err
```

### `objectOf`

Creates type checker that checks if the passed in value is an object with
all elements of the correct type.

```typescript
const asStringObject = objectOf(asString);
asStringObject({}) // ok
asStringObject({ a: 'foo', b: 'bar' }) // ok
asStringObject({ a: 'foo', b: 42 }) // err
asStringObject('foo') // err
```

### `tuple`

Creates type checker that checks if the passed in value is an array with
the correct length and all elements matching the correct types in order.

```typescript
const asMyTuple = tuple(asString, asNumber);
asMyTuple(['foo', 42]) // ok
asMyTuple(['foo', 'bar']) // err
asMyTuple(['foo', 42, 42]) // err
asMyTuple([]) // err
asMyTuple('foo') // err
```

### `tuple`

Creates type checker that checks if the passed in value is a structure
containing the right types at right keys. Extra keys are allowed.

```typescript
const asMyStructure = structure({ a: asString, b: asNumber });
asMyStructure({ a: 'foo', b: 42 }) // ok
asMyStructure({ a: 'foo', b: 'bar' }) // err
asMyStructure({ a: 'foo', b: 42, c: 42 }) // ok
asMyStructure({}) // err
asMyStructure('foo') // err
```

### `result`, `castOk`, `castErr`, `castErrChain`

Finally, you probably want to do something with the result from `asSomeType`.

#### `castOk`, `result.ok`

Creates a success result.

#### `castErr`, `castErrChain`, `result.err`, `result.errMsg`

Creates an error response, whereby the former 2 are convenience methods for creating `CastError`
with a simpler syntax.

When creating `asSomeType` functions, beware that passing them into one of the combiners will
disregard the `errorMessage`, so make sure your `path`, `expected` and `received` fields fully
describe the issue that happened if you decide to construct errors using `result.err`.

#### `result.isOk(dataResult)`, `result.isErr(dataResult)`

Checks if the passed in `Result` is a success or error. It serves as a type guard in TypeScript.

#### `result.unwrap(dataResult)`

If success, returns the contents of `dataResult.value`.
Otherwise, throws an error if the passed in data is an error.

#### `result.unwrapOr(dataResult, defaultValue)`

If success, returns the contents of `dataResult.value`.
Otherwise, returns the `defaultValue`.

#### `result.then(dataResult, callback)`

If error, propagates it.

If success, calls `callback(dataResult.value)`, which needs to return a Result itself.

#### `result.orElse(dataResult, callback)`

If success, propagates it.

If error, calls `callback(dataResult)`, which needs to return a Result itself.

#### `result.all(dataArray, fn)`

Performs `fn` on every item of `dataArray`. On first error, it returns an error.

If all succeed, returns an array with the correct items.

#### `result.collect(dataResultArray, optionalErrorReducer)`

Turns an array of results into a result containing an array.

Error is returned if any item is an error. If that is the case, errors are combined
using the passed in reducer. If none is passed, the first error is returned.

### `result.pipe(dataResult)`

Allows simple piping syntax for errors, to prevent infinite nesting for chains,
and noisy early returns.

Returns a structure with 5 functions:

* `finish()` - returns the result at the end of the pipe.
* `unwrap()` - does the same as `result.unwrap(dataResult)`.
* `unwrapOr(defaultValue)` - does the same as `result.unwrapOr(dataResult, defaultValue)`.
* `then(f)` - does the same as `result.pipe(result.then(dataResult, f))`.
* `orElse(f)` - does the same as `result.pipe(result.orElse(dataResult, f))`.

## Approaches to using checkers

Let's say we have a type with a numeric field `rating`

```typescript
const asMyType = structure({
	rating: asNumber,
});
const isMyType = isFromAs(asMyType);
```

We want to check if the rating is greater than `5`.

The simplest approach is to throw errors if we receive an error.

```typescript
// Throw on error
const isGoodRatingThatThrows = (unknownValue: unknown): boolean =>
	result.unwrap(asMyType(unknownValue)).rating > 5;
// Defaults to rating 0 on error
const isGoodRatingThatDefaultsTo0 = (unknownValue: unknown): boolean =>
	result.unwrapOr(asMyType(unknownValue), { rating: 0 }).rating > 5;
```

You could pipe operations using the result types.

```typescript
const isGoodRatingThatReturnsResult = (unknownValue: unknown): Result<boolean> =>
	result
		.pipe(asMyType(unknownValue))
		.then((value) => result.ok(value.rating > 5))
		.finish();

const isGoodRatingThatIsFalseOnFailure = (unknownValue: unknown): boolean =>
	result
		.pipe(asMyType(unknownValue))
		.then((value) => result.ok(value.rating > 5))
		.unwrapOr(false);
```

Pipe syntax can be confusing, so imperative code can be a lot clearer to many people:

```typescript
// This does the same as the pipe with the same name
const isGoodRatingThatReturnsResult = (unknownValue: unknown): Result<boolean> => {
	const valueResult = asMyType(unknownValue);
	if (result.isErr(valueResult)) {
		return valueResult;
	}
	return result.ok(valueResult.value.rating > 5);
};

// This does the same as the pipe with the same name
const isGoodRatingThatIsFalseOnFailure = (unknownValue: unknown): boolean => {
	const valueResult = asMyType(unknownValue);
	if (result.isErr(valueResult)) {
		return false;
	}
	return valueResult.value.rating > 5;
};
```

If you don't care what the error cause was, you can just use the typeguard syntax.

```typescript
// This does the same as the pipe with the same name
const isGoodRatingThatIsFalseOnFailure = (unknownValue: unknown): boolean => {
	if (!isMyType(unknownValue)) {
		return false;
	}
	return unknownValue.rating > 5;
};
```

## Examples

Below is a structure that should cover all key functionality.

```typescript
type ApiResponse = {
	header: {
		success: boolean;
		tags: string[];
		code: [number, string];
	};
	data: {
		direction: 'left' | 'right';
		angle: number | 'unknown';
		arguments: { [key: string]: string };
		comment?: string;
		user: {
			name: string;
		} | null;
		extra?: unknown;
	}[];
};

const asApiResponse = structure<ApiResponse>({
	header: structure({
		success: asBoolean,
		tags: arrayOf(asString),
		code: tuple(asNumber, asString),
	}),
	data: arrayOf(
		structure({
			direction: literal('left', 'right'),
			angle: oneOf(asNumber, literal('unknown')),
			arguments: objectOf(asString),
			comment: optional(asString),
			user: nullable(
				structure({
					name: asString,
				}),
			),
			extra: asUnknown,
		}),
	),
});

const isApiResponse = isFromAs(asApiResponse);

function iWantAnApiResponse(value: ApiResponse) {
	console.log(value);
}

iWantAnApiResponse(unknownData) // compiler error

const apiResponseResult = asApiResponse(unknownData);
if (result.isOk(apiResponseResult)) {
	iWantAnApiResponse(apiResponseResult.value);
}

if (isApiResponse(unknownData)) {
	iWantAnApiResponse(unknownData);
}
```

Error messages provide exact information where things went wrong.

```typescript
const valueWithBadHeader = {
    header: {
        success: true,
        tags: ['a', 'b', 3],
        code: [200, 'success'],
    },
    data: [],
};
expect(asApiResponse(valueWithBadHeader)).toStrictEqual({
    ok: false,
    errorMessage: "Value at 'header.tags.2' is not of type 'string'",
    path: ['header', 'tags', 2],
    expected: 'string',
    received: 3,
});
```

Specifying the exact type (like in `structure<ApiResponse>`) allows the compiler to match all the types.

While doing the best effort, it cannot prevent too tight type checking. If you look at the checker below,
you'll notice the structure it matches is a subset of values that `ApiResponse` can match, and this will
compile perfectly fine, but not cover all cases of API responses.

```typescript
const stillAsApiResponse = structure<ApiResponse>({
	header: structure({
		success: literal(false),
		tags: tuple(asString, asString),
		code: tuple(literal(404), asString),
	}),
	data: arrayOf(
		structure({
			direction: literal('left'),
			angle: asNumber,
			arguments: structure({
				someKey: asString,
			}),
			comment: asUndefined,
			user: asNull,
			extra: asUnknown,
		}),
	),
});
```

Any type checking function can be passed in. The checker doesn't need to be built out of functions from
the library. Code below will work.

```typescript
type InnerType = {
	a: string;
};

type OuterType = {
	b: InnerType;
};

const asInnerType = structure<InnerType>({
	a: asString,
});

// Also ensures nothing else is in there
const customAsInnerType: Cast<InnerType> = (data) => {
	const dataObjResult = asObject(data);
	if (result.isErr(dataObjResult)) {
		return dataObjResult;
	}
	if (Object.keys(dataObjResult.value).length !== 1) {
		return castErr('{ a: string } without extra keys', data);
	}
	const aFieldResult = asString(dataObjResult.value.a);
	if (result.isErr(aFieldResult)) {
		return castErrChain(aFieldResult, 'a');
	}
	return castOk(data as InnerType);
};

// Same as above, but a bit cleaner
const customAsInnerType2: Cast<InnerType> = (data) =>
	result
		.pipe(asInnerType(data))
		.then((output) => {
			if (Object.keys(output).length !== 1) {
				return castErr('{ a: string } without extra keys', data);
			}
			return castOk(output);
		})
		.finish();

const asOuterType1 = structure<OuterType>({
	b: asInnerType,
});

const asOuterType2 = structure<OuterType>({
	b: customAsInnerType,
});

const asOuterType3 = structure<OuterType>({
	b: customAsInnerType2,
});
```
