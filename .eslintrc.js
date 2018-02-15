module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
        mocha: true,
    },
    plugins: [
        "jsdoc"
    ],
    rules: {
        quotes: ["error", "double"],
        indent: ["error", 4, {
            SwitchCase: 1,
            VariableDeclarator: 1,
            outerIIFEBody: 1,
            FunctionDeclaration: {
                parameters: 1,
                body: 1
            },
            FunctionExpression: {
                parameters: 1,
                body: 1
            }
        }],
        strict: "off",
        "no-underscore-dangle": "off",
        "no-unused-vars": ["error",
            {
                "args": "none"
            }
        ],
        "padded-blocks": "off",
        "no-mixed-operators": "off",
        "func-names": "off",
        "no-plusplus": "off",
        "max-len": "off",
        "no-param-reassign": "off",
        "no-bitwise": "off",
        "no-continue": "off",
        'no-restricted-syntax': [
            "error",
            "LabeledStatement",
            "WithStatement",
        ],
        'comma-dangle': ['error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'only-multiline',
            exports: 'only-multiline',
            functions: 'never',
        }],
        "no-multi-assign": "off",
        "eqeqeq": "off",
        "guard-for-in": "off",
        "no-return-assign": "off",
        "consistent-return": "off",
        "class-methods-use-this": "off",
        "no-console": "off",
        "global-require": "off",
        "no-nested-ternary": "off",
        "prefer-rest-params": "off",
        "prefer-arrow-callback": "off",
        "prefer-template": "off",
        "new-cap": "off",
        "no-shadow": "off",
        "no-prototype-builtins": "off",
        "import/no-extraneous-dependencies": "off",
        "import/no-unresolved": "off",
        "jsdoc/check-param-names": "error",
        "jsdoc/newline-after-description": "error",
        "jsdoc/require-param": "error",
        "jsdoc/require-param-type": "error",
        "jsdoc/require-returns-type": "error"
    },
    settings: {
        jsdoc: {
            "tagNamePreference": {
                "returns": "return"
            }
        }
    },
    extends: "airbnb-base",
}
