
A stricter query string parser allows to ensure URIs uniqueness and better
 caching through your own cache but also public HTTP proxies for public
 endpoints.

To ensure URIs uniqueness, `strict-qs` checks:
- the order in which query strings are set
- query parameters values aren't set to their default values
- values set are reentrant
- query parameters used are existing and effective
- items collections are sorted (by value for number, alpha-numeric for strings)

As a side effect, it also cast values from strings to their target types.

You may wonder if it is not overkill to be that strict. Actually, it may
 be overkill or not depending on how you plan to use your API. For instance,
 it won't be a problem if you generate client APIs that handle that strictness
 for you, like i
 [did here](https://github.com/nfroidure/asttpl/blob/master/src/realworld.mocha.js).

## Usage

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

The returned query parameters should still be validated with
any JSONSchema validator.