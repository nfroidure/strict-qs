import initDebug from 'debug';
import YError from 'yerror';

export const SEARCH_FLAG = '?';
export const BASE_10 = 10;

const debug = initDebug('strict-qs');

export default qsStrict;

/**
 * Parse a queryString according to the provided definitions
 * @param  {Object}  options
 * Parser options
 * @param  {Boolean}  options.allowEmptySearch
 * Avoid throwing when the search is empty
 * @param  {Boolean}  options.allowUnknownParams
 * Avoid throwing when some params are unknown
 * @param  {Boolean}  options.allowDefault
 * Avoid throwing when some params is set to its default value
 * @param  {Boolean}  options.allowUnorderedParams
 * Avoid throwing when params are not set in the same order
 *  than declarations
 * @param  {Array}   definitions
 * Swagger compatible list of defitions
 * @param  {string}  search
 * The actual query string to parse
 * @return {Object}
 * The parsed properties
 * @example
 *
 * import qs from 'strict-qs';
 *
 * const qsOptions = { allowEmptySearch: true };
 * const qsDefinition = [{
 *   name: 'pages',
 *   in: 'query',
 *   type: 'array',
 *   items: {
 *     type: 'number',
 *   },
 *   ordered: true,
 *   description: 'The pages to print',
 *}];
 *
 * qs(qsOptions, qsDefinition, '?pages=0&pages=1&pages=2');
 * // Returns:
 * // {
 * //  pages: [0, 1, 2], // eslint-disable-line
 * // }
 */
function qsStrict(options, definitions, search) {
  if (!search) {
    return {};
  }
  if (!search.startsWith(SEARCH_FLAG)) {
    throw new Error('E_MALFORMED_SEARCH', search);
  }
  if (search === SEARCH_FLAG) {
    if (options.allowEmptySearch) {
      return {};
    }
    throw new Error('E_EMPTY_SEARCH', search);
  }

  const usefulDefinitions = definitions.filter(swaggerInQueryDefinitions);
  let queryStringParts = getQueryStringParts(search.slice(1));

  if (options.allowUnorderedParams) {
    queryStringParts = definitions
      .reduce(
        (sortedParts, definition) => [
          ...sortedParts,
          ...queryStringParts.filter(
            (queryStringPart) => queryStringPart.name === definition.name,
          ),
        ],
        [],
      )
      .concat(
        queryStringParts.filter(
          (queryStringPart) =>
            !definitions.some(
              (definition) => queryStringPart.name === definition.name,
            ),
        ),
      );
  }

  const params = usefulDefinitions.reduce(
    pickupQueryParams.bind(null, options),
    {
      queryStringParams: {},
      queryStringPartsLeft: queryStringParts
        .map((queryStringPart) => {
          debug('Looking for "' + queryStringPart.name + '" definitions.');
          if (
            !usefulDefinitions.some((definition) => {
              const found = queryStringPart.name === definition.name;

              debug('Definition found.', definition);
              return found;
            })
          ) {
            if (options.allowUnknownParams) {
              return null;
            }
            throw new YError(
              'E_UNAUTHORIZED_QUERY_PARAM',
              queryStringPart.name,
            );
          }
          return queryStringPart;
        })
        .filter((identity) => identity),
    },
  ).queryStringParams;
  debug('Params computed:', params);
  return params;
}

function pickupQueryParams(
  options,
  { queryStringParams, queryStringPartsLeft },
  queryParamDefinition,
) {
  const involvedQueryStringParts = queryStringPartsLeft.reduce(
    pickQueryPartsByName.bind(null, queryParamDefinition.name),
    {
      lastIndex: -1,
      keptQueryParts: [],
    },
  ).keptQueryParts;

  debug(
    'Found ' +
      involvedQueryStringParts.length +
      ' values for ' +
      queryParamDefinition.name +
      '.',
    involvedQueryStringParts,
  );

  if (0 === involvedQueryStringParts.length && queryParamDefinition.required) {
    throw new YError('E_REQUIRED_QUERY_PARAM', queryParamDefinition.name);
  }

  queryStringParams = involvedQueryStringParts.reduce(
    (queryStringParams, queryStringPart) =>
      assignQueryStringPart(
        options,
        queryParamDefinition,
        queryStringParams,
        queryStringPart,
      ),
    queryStringParams,
  );

  return {
    queryStringParams,
    queryStringPartsLeft: queryStringPartsLeft.slice(
      involvedQueryStringParts.length,
    ),
  };
}

function pickQueryPartsByName(
  name,
  { lastIndex, keptQueryParts },
  queryPart,
  index,
) {
  if (queryPart.name === name) {
    const isNotFoundAtNextIndex = index !== lastIndex + 1;

    if (isNotFoundAtNextIndex) {
      throw new YError('E_BAD_QUERY_PARAM_POSITION', name, lastIndex, index);
    }
    keptQueryParts = keptQueryParts.concat(queryPart);
    lastIndex = index;
  }
  return { lastIndex, keptQueryParts };
}

function swaggerInQueryDefinitions(definition) {
  return !definition.in || 'query' === definition.in;
}

function getQueryStringParts(queryString) {
  return queryString
    .split('&')
    .map((queryStringChunk) => queryStringChunk.split('='))
    .map(([queryPartName, queryPartValue]) => ({
      name: queryPartName,
      value: queryPartValue,
    }));
}

function assignQueryStringPart(
  options,
  queryParamDefinition,
  queryStringParams,
  queryStringPart,
) {
  // Supporting only a subset of JSON schema core
  // http://json-schema.org/latest/json-schema-core.html#rfc.section.4.2
  const itemDefinition =
    'array' === queryParamDefinition.type
      ? queryParamDefinition.items
      : queryParamDefinition;
  const value =
    'string' === itemDefinition.type
      ? decodeQueryComponent(queryStringPart.value)
      : 'boolean' === itemDefinition.type
      ? parseBoolean(decodeQueryComponent(queryStringPart.value))
      : 'number' === itemDefinition.type
      ? parseReentrantNumber(decodeQueryComponent(queryStringPart.value))
      : (() => {
          throw new YError(
            'E_UNSUPPORTED_TYPE',
            queryParamDefinition.name,
            itemDefinition.type,
          );
        })();

  if (itemDefinition.default === value && !options.allowDefault) {
    throw new YError(
      'E_CANNOT_SET_TO_DEFAULT',
      queryParamDefinition.name,
      value,
    );
  }

  if (itemDefinition.enum && !itemDefinition.enum.includes(value)) {
    throw new YError('E_NOT_IN_ENUM', queryParamDefinition.name, value);
  }

  if (
    itemDefinition.pattern &&
    !new RegExp(itemDefinition.pattern).test(value)
  ) {
    throw new YError(
      'E_PATTERN_DOES_NOT_MATCH',
      queryParamDefinition.name,
      value,
    );
  }

  if ('array' === queryParamDefinition.type) {
    queryStringParams[queryStringPart.name] =
      queryStringParams[queryStringPart.name] || [];
    if (
      queryParamDefinition.ordered &&
      queryStringParams[queryStringPart.name].length &&
      queryStringParams[queryStringPart.name][
        queryStringParams[queryStringPart.name].length - 1
      ] > value
    ) {
      throw new YError(
        'E_UNORDERED_QUERY_PARAMS',
        value,
        queryStringParams[queryStringPart.name][
          queryStringParams[queryStringPart.name].length - 1
        ],
      );
    }
    queryStringParams[queryStringPart.name].push(value);
  } else {
    queryStringParams[queryStringPart.name] = value;
  }
  return queryStringParams;
}

export function parseReentrantNumber(str) {
  const value = parseFloat(str, BASE_10);

  if (value.toString(BASE_10) !== str) {
    throw new YError('E_NON_REENTRANT_NUMBER', str, value.toString(BASE_10));
  }

  return value;
}

export function parseBoolean(str) {
  if ('true' === str) {
    return true;
  } else if ('false' === str) {
    return false;
  }
  throw new YError('E_BAD_BOOLEAN', str);
}

export function decodeQueryComponent(value) {
  return decodeURIComponent(value.replace(/\+/g, '%20'));
}
