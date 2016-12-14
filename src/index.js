'use strict';

const YError = require('yerror');
const BASE_10 = 10;

module.exports = qsStrict;

/**
 * Parse a queryString according to the provided definitions
 * @param  {Array}  definitions Swagger compatible list of defitions
 * @param  {string} queryString The actual query string to parse
 * @return {Object}             The parsed properties
 * @example
 *
 * import qs from 'strict-qs';
 *
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
 * qs(qsDefinition, 'pages=0&pages=1&pages=2');
 * // Returns:
 * // {
 * //  pages: [0, 1, 2], // eslint-disable-line
 * // }
 */
function qsStrict(definitions, queryString) {
  const usefulDefinitions = definitions
  .filter(swaggerInQueryDefinitions);

  return usefulDefinitions
  .reduce(pickupQueryParams, {
    queryStringParams: {},
    queryStringPartsLeft: '' === queryString ? [] : getQueryStringParts(queryString)
    .map((queryStringPart) => {
      if(
        !usefulDefinitions
        .some(definition => queryStringPart.name === definition.name)
      ) {
        throw new YError('E_UNAUTHORIZED_QUERY_PARAM', queryStringPart.name);
      }
      return queryStringPart;
    }),
  })
  .queryStringParams;
}

function pickupQueryParams({
  queryStringParams, queryStringPartsLeft,
}, queryParamDefinition, index) {
  const involvedQueryStringParts = queryStringPartsLeft
  .reduce(pickQueryPartsByName.bind(null, queryParamDefinition.name), {
    lastIndex: -1,
    keptQueryParts: [],
  }).keptQueryParts;

  if(0 === involvedQueryStringParts.length && queryParamDefinition.required) {
    throw new YError('E_REQUIRED_QUERY_PARAM', queryParamDefinition.name);
  }

  queryStringParams = involvedQueryStringParts.reduce(
    (queryStringParams, queryStringPart) =>
      assignQueryStringPart(queryParamDefinition, queryStringParams, queryStringPart),
    queryStringParams
  );

  return {
    queryStringParams,
    queryStringPartsLeft: queryStringPartsLeft.slice(involvedQueryStringParts.length),
  };
}

function pickQueryPartsByName(name, { lastIndex, keptQueryParts }, queryPart, index) {
  if(queryPart.name === name) {
    const isNotFoundAtNextIndex = index !== lastIndex + 1;

    if(isNotFoundAtNextIndex) {
      throw new YError('E_BAD_QUERY_PARAM_POSITION', name, lastIndex, index);
    }
    keptQueryParts = keptQueryParts.concat(queryPart);
    lastIndex = index;
  }
  return { lastIndex, keptQueryParts };
}

function swaggerInQueryDefinitions(definition) {
  return (!definition.in) || 'query' === definition.in;
}

function getQueryStringParts(queryString) {
  return queryString.split('&')
  .map(queryStringChunk => queryStringChunk.split('='))
  .map(([queryPartName, queryPartValue]) => ({ name: queryPartName, value: queryPartValue }));
}

function assignQueryStringPart(queryParamDefinition, queryStringParams, queryStringPart) {
  // Supporting only a subset of JSON schema core
  // http://json-schema.org/latest/json-schema-core.html#rfc.section.4.2
  const itemDefinition = 'array' === queryParamDefinition.type ?
    queryParamDefinition.items :
    queryParamDefinition;
  const value = 'string' === itemDefinition.type ?
    queryStringPart.value :
    'boolean' === itemDefinition.type ?
    parseBoolean(queryStringPart.value) :
    'number' === itemDefinition.type ?
    parseReentrantNumber(queryStringPart.value) :
    (() => {
      throw new YError('E_UNSUPPORTED_TYPE', queryParamDefinition.name, itemDefinition.type);
    })();

  if(itemDefinition.default === value) {
    throw new YError('E_CANNOT_SET_TO_DEFAULT', queryParamDefinition.name, value);
  }

  if('array' === queryParamDefinition.type) {
    queryStringParams[queryStringPart.name] = queryStringParams[queryStringPart.name] || [];
    if(
      queryParamDefinition.ordered && queryStringParams[queryStringPart.name].length &&
      queryStringParams[queryStringPart.name][
        queryStringParams[queryStringPart.name].length - 1
      ] > value
    ) {
      throw new YError(
        'E_UNORDERED_QUERY_PARAMS',
        value,
        queryStringParams[queryStringPart.name][queryStringParams[queryStringPart.name].length - 1]
      );
    }
    queryStringParams[queryStringPart.name].push(value);
  } else {
    queryStringParams[queryStringPart.name] = value;
  }
  return queryStringParams;
}

function parseReentrantNumber(str) {
  const value = parseFloat(str, BASE_10);

  if(value.toString(BASE_10) !== str) {
    throw new YError('E_NON_REENTRANT_NUMBER', str, value.toString(BASE_10));
  }

  return value;
}

function parseBoolean(str) {
  if('true' === str) {
    return true;
  } else if('false' === str) {
    return false;
  }
  throw new YError('E_BAD_BOOLEAN', str);
}
