import { type QSValue } from './index.js';

declare module 'yerror' {
  interface YErrorRegistry {
    /**
     * Thrown when the query string does not start with the search flag '?'.
     * @param search The malformed search string.
     */
    E_MALFORMED_SEARCH: [search: string];

    /**
     * Thrown when the query string is empty (just '?') and allowEmptySearch is false.
     * @param search The empty search string.
     */
    E_EMPTY_SEARCH: [search: string];

    /**
     * Thrown when an unknown query parameter is encountered and allowUnknownParams is false.
     * @param paramName The name of the unauthorized parameter.
     */
    E_UNAUTHORIZED_QUERY_PARAM: [paramName: string];

    /**
     * Thrown when a required query parameter is missing.
     * @param paramName The name of the missing required parameter.
     */
    E_REQUIRED_QUERY_PARAM: [paramName: string];

    /**
     * Thrown when query parameters are not in the expected order.
     * @param name The parameter name.
     * @param lastIndex The last expected index.
     * @param index The actual index where the parameter was found.
     */
    E_BAD_QUERY_PARAM_POSITION: [
      name: string,
      lastIndex: number,
      index: number,
    ];

    /**
     * Thrown when an unsupported parameter type is specified.
     * @param paramName The parameter name.
     * @param type The unsupported type.
     */
    E_UNSUPPORTED_TYPE: [paramName: string, type: string];

    /**
     * Thrown when a parameter is set to its default value and allowDefault is false.
     * @param paramName The parameter name.
     * @param value The default value that was set.
     */
    E_CANNOT_SET_TO_DEFAULT: [paramName: string, value: QSValue];

    /**
     * Thrown when a parameter value is not in the allowed enum values.
     * @param paramName The parameter name.
     * @param value The invalid value.
     */
    E_NOT_IN_ENUM: [paramName: string, value: QSValue];

    /**
     * Thrown when a parameter value does not match the required pattern.
     * @param paramName The parameter name.
     * @param value The value that failed the pattern match.
     * @param pattern The pattern that was not matched.
     */
    E_PATTERN_DOES_NOT_MATCH: [
      paramName: string,
      value: QSValue,
      pattern: string,
    ];

    /**
     * Thrown when array parameters are not in ascending order.
     * @param value The current value.
     * @param lastValue The previous value in the array.
     */
    E_UNORDERED_QUERY_PARAMS: [value: QSValue, lastValue: QSValue];

    /**
     * Thrown when a number string cannot be parsed back to the same string (non-reentrant).
     * @param str The original string.
     * @param parsed The parsed and stringified version.
     */
    E_NON_REENTRANT_NUMBER: [str: string, parsed: string];

    /**
     * Thrown when a boolean value is not 'true' or 'false'.
     * @param str The invalid boolean string.
     */
    E_BAD_BOOLEAN: [str: string];
  }
}
