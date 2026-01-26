import importSort from 'eslint-plugin-simple-import-sort';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tsEslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default tsEslint.config({
    files: ['**/*.ts'],
    plugins: {
        '@typescript-eslint': tsPlugin,
        'simple-import-sort': importSort,
        prettier: prettierPlugin,
    },
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
    },
    rules: {
        ...tsPlugin.configs.recommended.rules,
        ...prettierConfig.rules,

        'jsx-a11y/href-no-hash': ['off'],
        'spaced-comment': ['error', 'always'],
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
        'max-len': [
            'warn',
            {
                code: 72,
                tabWidth: 4,
                ignoreComments: true,
                ignoreTrailingComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true,
            },
        ],

        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
                fixStyle: 'separate-type-imports',
                disallowTypeAnnotations: false,
            },
        ],

        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'error',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_',
            },
        ],
    },
});
