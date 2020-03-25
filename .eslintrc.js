module.exports = {
	root: true,
	extends: ['eslint:recommended'],
	plugins: [],
	env: { browser: true, node: true, es6: true },
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
		impliedStrict: true,
	},
	rules: {
		'no-console': 'off',
		'no-shadow': 'off',
	},
	settings: {},
};
