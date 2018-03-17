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
