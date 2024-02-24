import initDebug from 'debug';
import { YError } from 'yerror';

export const SEARCH_FLAG = '?';
export const BASE_10 = 10;

const debug = initDebug('strict-qs');

type QueryPart = {
  name: string;
  value: string;
};

export type QSOptions = {
  allowEmptySearch?: boolean;
  allowUnknownParams?: boolean;
  allowDefault?: boolean;
  allowUnorderedParams?: boolean;
};
export type QSValue = string | number | boolean;
export type QSParamValue = QSValue;
export type QSParamType = 'string' | 'number' | 'boolean';

export type QSUniqueParameter = {
  name: string;
  description?: string;
  in: 'query';
  pattern?: string;
  required?: boolean;
  enum?: QSParamValue[];
  type: QSParamType;
  default?: QSParamValue;
};

export type QSArrayParameter = {
  name: string;
  description?: string;
  in: 'query';
  type: 'array';
  required?: boolean;
  ordered?: boolean;
  default?: QSParamValue[];
  items: {
    pattern?: string;
    enum?: QSParamValue[];
    type: QSParamType;
  };
};

export type QSParameter = QSUniqueParameter | QSArrayParameter;

export type QSParameterValues = {
  [name: string]: QSValue | QSValue[];
};

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

function qsStrict(
  options: QSOptions,
  definitions: QSParameter[],
  search: string,
): QSParameterValues {
  if (!search) {
    return {};
  }
  if (!search.startsWith(SEARCH_FLAG)) {
    throw new YError('E_MALFORMED_SEARCH', search);
  }
  if (search === SEARCH_FLAG) {
    if (options.allowEmptySearch) {
      return {};
    }
    throw new YError('E_EMPTY_SEARCH', search);
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
        [] as QueryPart[],
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
  options: QSOptions,
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
  name: string,
  {
    lastIndex,
    keptQueryParts,
  }: { lastIndex: number; keptQueryParts: QueryPart[] },
  queryPart: QueryPart,
  index: number,
): { lastIndex: number; keptQueryParts: QueryPart[] } {
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

function swaggerInQueryDefinitions(definition: QSParameter): boolean {
  return !definition.in || 'query' === definition.in;
}

function getQueryStringParts(queryString: string): QueryPart[] {
  return queryString
    .split('&')
    .map((queryStringChunk) => queryStringChunk.split('='))
    .map(([queryPartName, queryPartValue]) => ({
      name: queryPartName,
      value: queryPartValue,
    }));
}

function assignQueryStringPart(
  options: QSOptions,
  queryParamDefinition: QSParameter,
  queryStringParams: QSParameterValues,
  queryStringPart: QueryPart,
): QSParameterValues {
  // Supporting only a subset of JSON schema core
  // http://json-schema.org/latest/json-schema-core.html#rfc.section.4.2
  const itemDefinition = (
    'array' === queryParamDefinition.type
      ? queryParamDefinition.items
      : queryParamDefinition
  ) as QSUniqueParameter;
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
    !new RegExp(itemDefinition.pattern).test(value.toString())
  ) {
    throw new YError(
      'E_PATTERN_DOES_NOT_MATCH',
      queryParamDefinition.name,
      value,
    );
  }

  if ('array' === queryParamDefinition.type) {
    const values = (queryStringParams[queryStringPart.name] || []) as QSValue[];
    if (
      queryParamDefinition.ordered &&
      values.length &&
      values[values.length - 1] > value
    ) {
      throw new YError(
        'E_UNORDERED_QUERY_PARAMS',
        value,
        values[values.length - 1],
      );
    }
    values.push(value);
    queryStringParams[queryStringPart.name] = values;
  } else {
    queryStringParams[queryStringPart.name] = value;
  }
  return queryStringParams;
}

export function parseReentrantNumber(str: string): number {
  const value = parseFloat(str);

  if (value.toString(BASE_10) !== str) {
    throw new YError('E_NON_REENTRANT_NUMBER', str, value.toString(BASE_10));
  }

  return value;
}

export function parseBoolean(str: string): boolean {
  if ('true' === str) {
    return true;
  } else if ('false' === str) {
    return false;
  }
  throw new YError('E_BAD_BOOLEAN', str);
}

export function decodeQueryComponent(value: string): string {
  return decodeURIComponent(value.replace(/\+/g, '%20'));
}

export { qsStrict };
