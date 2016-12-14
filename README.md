# strict-qs
> A stricter query string parser

[![NPM version](https://badge.fury.io/js/strict-qs.png)](https://npmjs.org/package/strict-qs) [![Build status](https://secure.travis-ci.org/nfroidure/strict-qs.png)](https://travis-ci.org/nfroidure/strict-qs) [![Dependency Status](https://david-dm.org/nfroidure/strict-qs.png)](https://david-dm.org/nfroidure/strict-qs) [![devDependency Status](https://david-dm.org/nfroidure/strict-qs/dev-status.png)](https://david-dm.org/nfroidure/strict-qs#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/nfroidure/strict-qs/badge.png?branch=master)](https://coveralls.io/r/nfroidure/strict-qs?branch=master) [![Code Climate](https://codeclimate.com/github/nfroidure/strict-qs.png)](https://codeclimate.com/github/nfroidure/strict-qs)

A stricter query string parser allows to ensure URIs uniqueness and better
 caching through your own cache but also public HTTP proxies for public
 endpoints.

To ensure URIs uniqueness, `strict-qs` checks:
- the order in which query strings are set
- query parameters values aren't set to their default values
- values set are reentrant
- query params used are existing and effective
- collections items are sorted (by value for number, alpha-numeric for strings)

As a side effect, it also cast values from strings to their target types.

```js
const qs = require('strict-qs');
// The definition formatting is swagger compatible but only for a subset i
// personally use. PRs are welcome for broader support
const qsDefinition = [{
  name: 'lang',
  in: 'query',
  type: 'string',
  required: true,
  description: 'The language for the search'
}, {
  name: 'types',
  in: 'query',
  type: 'array',
  items: {
    type: 'string',
    enum: ['open', 'closed', 'pending', 'idle', 'invalid'],
  },
  description: 'The types of the search'
}, {
  name: 'code',
  in: 'query',
  type: 'integer',
  description: 'The code id'
}];

qs(
  qsDefinition,
  '?lang=fr&types=open&types=closed&types=pending&code=3'
);
// Returns
{
  lang: 'fr',
  types: ['open', 'closed', 'pending'],
  code: 3
}

qs(
  qsDefinition,
  '?code=3&lang=fr&types=open&types=closed&types=pending'
);
// throws an error since the order is bad
new Error('E_BAD_QUERY_PARAM', 'types')
```

The returned query params should still be validated with any JSONSchema
 validator.

## API

### qsStrict(definitions, queryString) ⇒ <code>Object</code>
Parse a queryString according to the provided definitions

**Kind**: global function  
**Returns**: <code>Object</code> - The parsed properties  

| Param | Type | Description |
| --- | --- | --- |
| definitions | <code>Array</code> | Swagger compatible list of defitions |
| queryString | <code>string</code> | The actual query string to parse |

**Example**  
```js
import qs from 'strict-qs';

const qsDefinition = [{
  name: 'pages',
  in: 'query',
  type: 'array',
  items: {
    type: 'number',
  },
  ordered: true,
  description: 'The pages to print',
}];

qs(qsDefinition, 'pages=0&pages=1&pages=2');
// Returns:
// {
//  pages: [0, 1, 2], // eslint-disable-line
// }
```
