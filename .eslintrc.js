module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:@typescript-eslint/recommended',
		'airbnb-base',
		'airbnb-base/rules/strict',
		'plugin:prettier/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
	],
	plugins: ['import'],
	rules: {
		'import/extensions': 'off',
		'no-restricted-syntax': 'off',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['error'],
		'no-use-before-define': 'off',
		'@typescript-eslint/no-use-before-define': ['error'],
	},
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts'],
		},
		'import/resolver': {
			node: {
				extensions: ['.ts'],
				moduleDirectory: ['node_modules', 'src/'],
			},
			typescript: {},
		},
	},
	overrides: [
		{
			files: ['**/*.test.ts'],
			env: {
				jest: true,
			},
		},
	],
};
