# GraphQL Partials

Experimental transformer implementing support for partials in GraphQL Schemas.

**OUT OF DATE:** As of [graphql/graphql-spec#373](https://github.com/graphql/graphql-spec/pull/373)

This module's sole purpose is as an experimental implementation of the concepts brought up in [graphql/graphql-js#703](https://github.com/graphql/graphql-js/issues/703#issuecomment-315776310). It's not intended as a long term solution by itself, but as an experiment with a possible future extension of the GraphQL Schema itself.

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/Flet/semistandard)

## Usage

### Command line

```bash
npm install -g @hdsydsvenskan/graphql-partials
```

Then run it to output the transformed schema:

```bash
graphql-partials <path-to-schema-with-partials.graphql>
```

### npm script build step

```bash
npm install --save-dev @hdsydsvenskan/graphql-partials
```

Then:

```
"scripts": {
  "build": "graphql-partials schema-partials.graphql > schema.graphql"
}
```

### Programmatic use

```bash
npm install --save @hdsydsvenskan/graphql-partials
```

```javascript
const renderSchemaWithPartials = require('@hdsydsvenskan/graphql-partials');

const schemaWithoutPartials = renderSchemaWithPartials('partial abc { ... } type xyz using abc { ... }');
```

## Experimental GraphQL Schema syntax

This transformer provides a way to import field definitions from a defined `partial` to an `interface` and/or `type`, thus complementing `interface`:s by providing a mechanism to reduce repition of fields while not messing with any existing semantics.

This model is similar to what eg. PHP does with [traits](http://php.net/manual/en/language.oop5.traits.php), but as GraphQL Schema's `interface` and `type` are more similar than `interface` and `class` in PHP, the `using` keyword here applies to both `interface` and `type`, allowing field definitions to be imported into both of them.

### Syntax

#### Entity: `partial`

This transformer introduced a new experimental entity with the name `partial`. This entity defines a set of fields, similar to what an `interface` does, and it's sole purpose is to be referenced by the new `using` keyword.

#### Keyword: `using`

Similar to how a `type` can reference an `interface` using the `implements` keyword both a `type` and an `interface` can reference a `partial` through the experimental keyword `using` that this transformer introduces. Like `implements` it accepts a comma separated list if one wants to apply multiple partials to the same definition.

The transformer makes no checks whether multiple partials conflicts with each other or whether any partial and the definition of the interface/type itself conflicts with each other. The only check it makes is whether a partial of the stated name actually exists and then it prepends the field definitions of that partial to the field definitions of the interface/type itself.
