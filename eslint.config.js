import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                document: 'readonly',
                window: 'readonly',
                globalThis: 'readonly',
                fetch: 'readonly',
                console: 'readonly',
                URL: 'readonly',
                Event: 'readonly',
                CustomEvent: 'readonly',
                HTMLElement: 'readonly',
                HTMLSelectElement: 'readonly',
                location: 'readonly',
                navigator: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
            },
        },
        rules: {
            'max-len': [
		'warn',
		{
		  code: 72,
		  ignoreUrls: true,
		  ignoreStrings: false,
		  ignoreTemplateLiterals: false
		}
	    ],
            'indent': ['warn', 4, { SwitchCase: 1 }],
            'semi': ['warn', 'always'],
            'quotes': [
		'warn', 'single', { avoidEscape: true }
	    ],
            'comma-dangle': ['warn', 'always-multiline'],
            'no-unused-vars': [
		'warn', { argsIgnorePattern: '^_' }
	    ],
            'no-console': 'off',
            'eol-last': ['warn', 'always'],
        },
    },
    {
        files: ['tests/**'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                assert: 'readonly',
                expect: 'readonly',
            },
        },
    },
    {
        files: ['tests/helpers/**'],
        rules: {
            'no-unused-vars': ['warn', { args: 'none' }],
        },
    },
];
