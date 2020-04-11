module.exports = {
    env: {
        es6: true,
        node: true,
        jasmine: true
    },
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        'no-underscore-dangle': 0,
        indent: ['error', 4, { SwitchCase: 1 }],
        quotes: ['error', 'single'],
        'quote-props': ['error', 'as-needed'],
        semi: ['error', 'always'],
        'no-undef': ['error'],
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'array-bracket-spacing': ['error', 'never'],
        'comma-spacing': ['error', {  before: false,  after: true }],
        'space-infix-ops': 'error',
        'space-before-function-paren': ['error', 'never'],
        'no-extra-semi': 'error',
        curly: ['error', 'multi-line', 'consistent'],
        yoda: 'error',
        "no-console": "warn",
        'no-cond-assign': 'warn',
        'no-label-var': 'error',
        'no-shadow': ['error', {    builtinGlobals: false,    hoist: 'functions',    allow: [] }],
        'array-bracket-newline': ['error', 'consistent'],
        'comma-dangle': ['error', 'never'],
        'brace-style': ['error', '1tbs', {    allowSingleLine: true }],
        'block-spacing': 'error',
        'computed-property-spacing': ['error', 'never'],
        'eol-last': ['error', 'always'],
        'key-spacing': ['error', {    beforeColon: false,    afterColon: true }],
        'keyword-spacing': ['error', {    before: true,    after: true }],
        'no-mixed-operators': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-nested-ternary': 'error',
        'no-trailing-spaces': 'error',
        'no-unneeded-ternary': 'error',
        'spaced-comment': ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],
        'no-unexpected-multiline': ['error'],
        'object-property-newline': ['error', {allowAllPropertiesOnSameLine:true}],
        'arrow-parens': ['error','as-needed']
    }
};
