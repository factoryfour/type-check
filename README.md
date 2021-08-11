# type-check

Library that provides a simple syntax for constructing type checkers of complex types.

If given the correct annotations, the compiler itself will exactly instruct you on how to correct
your code for the type checker to match.

Beware, there is no way to prevent too tight type checks. So if there is a field that is of type
`number | null`, both `isNull` and `isNumber` will be accepted, when in reality you'd want to use
`oneOf(isNull, isNumber)`, or more tersely `nullable(isNumber)`, which is just syntactic sugar for
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

const isApiResponse = structure<ApiResponse>({
	header: structure({
		success: isBoolean,
		tags: arrayOf(isString),
		code: tuple(isNumber, isString),
	}),
	data: arrayOf(
		structure({
			direction: literal('left', 'right'),
			angle: oneOf(isNumber, literal('unknown')),
			arguments: objectOf(isString),
			comment: optional(isString),
			user: nullable(
				structure({
					name: isString,
				}),
			),
			extra: isUnknown,
		}),
	),
});

function iWantAnApiResponse(value: ApiResponse) {
	console.log(value);
}

iWantAnApiResponse(unknownData) // compiler error

if (isApiResponse(unknownData)) {
	iWantAnApiResponse(unknownData);
}
```

Specifying the exact type (like in `structure<ApiResponse>`) allows the compiler to match all the types.

While doing the best effort, it cannot prevent too tight type checking. If you look at the checker below,
you'll notice the structure it matches is a subset of values that `ApiResponse` can match, and this will
compile perfectly fine, but not cover all cases of API responses.

```typescript
const stillIsApiResponse = structure<ApiResponse>({
	header: structure({
		success: literal(false),
		tags: tuple(isString, isString),
		code: tuple(literal(404), isString),
	}),
	data: arrayOf(
		structure({
			direction: literal('left'),
			angle: isNumber,
			arguments: structure({
				someKey: isString,
			}),
			comment: isUndefined,
			user: isNull,
			extra: isUnknown,
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

const isInnerType = structure<InnerType>({
	a: isString,
});

// Also ensures nothing else is in there
const customIsInnerType = (data: unknown): data is InnerType => {
	if (!isObject(data)) {
		return false;
	}
	if (Object.keys(data).length !== 1) {
		return false;
	}
	return isString(data.a);
};

// Same as above, but a bit cleaner
const customIsInnerType2 = (data: unknown): data is InnerType => {
	return isInnerType(data) && Object.keys(data).length === 1;
};

const isOuterType0 = structure<OuterType>({
	b: structure({
		a: isString,
	}),
});

const isOuterType1 = structure<OuterType>({
	b: isInnerType,
});

const isOuterType2 = structure<OuterType>({
	b: customIsInnerType,
});

const isOuterType3 = structure<OuterType>({
	b: customIsInnerType2,
});
```
