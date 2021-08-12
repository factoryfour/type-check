# type-check

Library that provides a simple syntax for constructing type checkers of complex types.

If given the correct annotations, the compiler itself will exactly instruct you on how to correct
your code for the type checker to match.

Beware, there is no way to prevent too tight type checks. So if there is a field that is of type
`number | null`, both `asNull` and `asNumber` will be accepted, when in reality you'd want to use
`oneOf(asNull, asNumber)`, or more tersely `nullable(asNumber)`, which is just syntactic sugar for
`oneOf`.

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

function iWantAnApiResponse(value: ApiResponse) {
	console.log(value);
}

iWantAnApiResponse(unknownData) // compiler error

const apiResponseResult = asApiResponse(unknownData);
if (result.isOk(apiResponseResult)) {
	iWantAnApiResponse(apiResponseResult.value);
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
const customIsInnerType = (data: unknown): CastResult<InnerType> => {
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
	return result.ok(data as InnerType);
};

// Same as above, but a bit cleaner
const customIsInnerType2 = (data: unknown): CastResult<InnerType> => {
	const typedDataResult = asInnerType(data);
	if (result.isErr(typedDataResult)) {
		return typedDataResult;
	}
	const output = typedDataResult.value;
	if (Object.keys(output).length !== 1) {
		return castErr('{ a: string } without extra keys', data);
	}
	return ok(output);
};
```
