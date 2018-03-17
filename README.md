[//]: # ( )
[//]: # (This file is automatically generated by a `metapak`)
[//]: # (module. Do not change it elsewhere, changes would)
[//]: # (be overridden.)
[//]: # ( )
# strict-qs
> A stricter Query String parser

[![NPM version](https://badge.fury.io/js/strict-qs.svg)](https://npmjs.org/package/strict-qs)
[![Build status](https://secure.travis-ci.org/nfroidure/strict-qs.svg)](https://travis-ci.org/nfroidure/strict-qs)
[![Dependency Status](https://david-dm.org/nfroidure/strict-qs.svg)](https://david-dm.org/nfroidure/strict-qs)
[![devDependency Status](https://david-dm.org/nfroidure/strict-qs/dev-status.svg)](https://david-dm.org/nfroidure/strict-qs#info=devDependencies)
[![Coverage Status](https://coveralls.io/repos/nfroidure/strict-qs/badge.svg?branch=master)](https://coveralls.io/r/nfroidure/strict-qs?branch=master)
[![Code Climate](https://codeclimate.com/github/nfroidure/strict-qs.svg)](https://codeclimate.com/github/nfroidure/strict-qs)
[![Dependency Status](https://dependencyci.com/github/nfroidure/strict-qs/badge)](https://dependencyci.com/github/nfroidure/strict-qs)


[//]: # (::contents:start)

A stricter query string parser allows to ensure URIs uniqueness and better
 caching through your own cache but also public HTTP proxies for public
 endpoints.

To ensure URIs uniqueness, `strict-qs` checks:
- the order in which query strings are set,
- query parameters values aren't set to their default values,
- values set are reentrant (ie: `1.10` will be refused, its
 canonical form `1.1` will be required),
- query parameters used are existing and effective,
- items collections are sorted (by value for number, alpha-numeric for strings).

As a side effect, it also cast values from strings to
 their target types.

You may wonder if it is not overkill to be that strict.
 On every projects I worked on, I never been sad to have
 built too strict systems. The inverse is not true ;).

Also, it may be less pain to handle such strictness if
 you generate client APIs that handle that strictness for
 you, which is recommended. You can see an example of such
 client [here](https://github.com/sencrop/sencrop-js-api-client).

## Usage

```js
import qs from 'strict-qs';

// The definition formatting is swagger compatible
// but only for the subset I use. PRs are welcome
// for broader support
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

The returned query parameters should still be validated with
 any JSON Schema validator. You can see how it is done in
 [swagger-http-router](https://github.com/nfroidure/swagger-http-router)
 for instance.

[//]: # (::contents:end)

# API
<a name="qsStrict"></a>

## qsStrict(definitions, search) ⇒ <code>Object</code>
Parse a queryString according to the provided definitions

**Kind**: global function  
**Returns**: <code>Object</code> - The parsed properties  

| Param | Type | Description |
| --- | --- | --- |
| definitions | <code>Array</code> | Swagger compatible list of defitions |
| search | <code>string</code> | The actual query string to parse |

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

qs(qsDefinition, '?pages=0&pages=1&pages=2');
// Returns:
// {
//  pages: [0, 1, 2], // eslint-disable-line
// }
```

# License
[MIT](https://github.com/nfroidure/strict-qs/blob/master/LICENSE)
