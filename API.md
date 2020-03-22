# API
<a name="qsStrict"></a>

## qsStrict(options, definitions, search) ⇒ <code>Object</code>
Parse a queryString according to the provided definitions

**Kind**: global function  
**Returns**: <code>Object</code> - The parsed properties  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Parser options |
| options.allowEmptySearch | <code>Boolean</code> | Avoid throwing when the search is empty |
| options.allowUnknownParams | <code>Boolean</code> | Avoid throwing when some params are unknown |
| options.allowDefault | <code>Boolean</code> | Avoid throwing when some params is set to its default value |
| options.allowUnorderedParams | <code>Boolean</code> | Avoid throwing when params are not set in the same order  than declarations |
| definitions | <code>Array</code> | Swagger compatible list of defitions |
| search | <code>string</code> | The actual query string to parse |

**Example**  
```js
import qs from 'strict-qs';

const qsOptions = { allowEmptySearch: true };
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

qs(qsOptions, qsDefinition, '?pages=0&pages=1&pages=2');
// Returns:
// {
//  pages: [0, 1, 2], // eslint-disable-line
// }
```
