import { describe, test, expect } from '@jest/globals';
import { qsStrict, type QSParameter } from './index.js';
import { YError } from 'yerror';

describe('strict-qs', () => {
  describe('with no search', () => {
    const qsDefinition = [];

    test('should work', () => {
      expect(qsStrict({}, qsDefinition, '')).toEqual({});
    });
  });

  describe('with bad search', () => {
    const qsDefinition = [];

    test('should fail', () => {
      try {
        qsStrict({}, qsDefinition, '?');
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_EMPTY_SEARCH (?): E_EMPTY_SEARCH]`,
        );
      }
    });

    test('should work when allowed', () => {
      expect(qsStrict({ allowEmptySearch: true }, qsDefinition, '?')).toEqual(
        {},
      );
    });

    test('should fail', () => {
      try {
        qsStrict({}, qsDefinition, 'lol');
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_MALFORMED_SEARCH (lol): E_MALFORMED_SEARCH]`,
        );
      }
    });
  });

  describe('with unsupported definition type', () => {
    const qsDefinition = [
      {
        name: 'user',
        in: 'query',
        type: 'object',
        required: true,
        description: 'The user',
      } as unknown as QSParameter,
    ];

    test('should fail', () => {
      try {
        qsStrict({}, qsDefinition, '?user=lol');
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_UNSUPPORTED_TYPE (user, object): E_UNSUPPORTED_TYPE]`,
        );
      }
    });
  });

  describe('with ordered collections', () => {
    const qsDefinition: QSParameter[] = [
      {
        name: 'pages',
        in: 'query',
        type: 'array',
        items: {
          type: 'number',
        },
        ordered: true,
        description: 'The pages to print',
      },
    ];

    test('should work when params are ordered', () => {
      expect(qsStrict({}, qsDefinition, '?pages=0&pages=1&pages=2')).toEqual({
        pages: [0, 1, 2],
      });
    });

    test('should fail when params are not ordered', () => {
      try {
        qsStrict({}, qsDefinition, '?pages=0&pages=2&pages=1');
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_UNORDERED_QUERY_PARAMS (1, 2): E_UNORDERED_QUERY_PARAMS]`,
        );
      }
    });
  });

  describe('with encoded components', () => {
    const qsDefinition: QSParameter[] = [
      {
        name: 'redirectURL',
        in: 'query',
        type: 'string',
      },
    ];

    test('should work', () => {
      expect(
        qsStrict(
          {},
          qsDefinition,
          '?redirectURL=' + encodeURIComponent('http://localhost/plop'),
        ),
      ).toEqual({
        redirectURL: 'http://localhost/plop',
      });
    });
  });

  describe('with axios components', () => {
    const qsDefinition: QSParameter[] = [
      {
        name: 'query',
        in: 'query',
        type: 'string',
      },
    ];

    test('should work', () => {
      expect(qsStrict({}, qsDefinition, '?query=a+b+c')).toEqual({
        query: 'a b c',
      });
    });
  });

  describe('with lots of different definitions', () => {
    const qsDefinition: QSParameter[] = [
      {
        name: 'lang',
        in: 'query',
        type: 'string',
        required: true,
        default: 'en',
        enum: ['fr', 'en', 'de'],
        description: 'The language for the search',
      },
      {
        name: 'types',
        in: 'query',
        type: 'array',
        items: {
          type: 'string',
          enum: ['open', 'closed', 'pending', 'idle', 'invalid'],
        },
        description: 'The types of the search',
      },
      {
        name: 'code',
        in: 'query',
        type: 'number',
        pattern: '^[0-9]+$',
        description: 'The code id',
      },
      {
        name: 'full',
        in: 'query',
        type: 'boolean',
        description: 'Wether it is a full search or not',
      },
      {
        name: 'nums',
        in: 'query',
        type: 'array',
        items: {
          type: 'number',
          enum: [1, 2, 3, 4],
        },
        description: 'The types of the search',
      },
    ];

    test('should work with good params', () => {
      expect(
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=true',
        ),
      ).toEqual({
        lang: 'fr',
        types: ['open', 'closed', 'pending'],
        code: 3,
        full: true,
      });
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lang=cn&types=open&types=closed&types=pending&code=3&full=true',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_NOT_IN_ENUM (lang, cn): E_NOT_IN_ENUM]`,
        );
      }
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3.4&full=true',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_PATTERN_DOES_NOT_MATCH (code, 3.4): E_PATTERN_DOES_NOT_MATCH]`,
        );
      }
    });

    test('should work with all params', () => {
      expect(
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=false&nums=4',
        ),
      ).toEqual({
        lang: 'fr',
        types: ['open', 'closed', 'pending'],
        code: 3,
        full: false,
        nums: [4],
      });
    });

    test('should fail when required params are not in order', () => {
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&lang=hop&types=closed&types=pending&code=3&full=true',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_BAD_QUERY_PARAM_POSITION (lang, 0, 2): E_BAD_QUERY_PARAM_POSITION]`,
        );
      }
    });

    test('should work when required params are not in order with option allowUnorderedParams', () => {
      expect(
        qsStrict(
          { allowUnorderedParams: true },
          qsDefinition,
          '?lang=fr&types=open&lang=fr&types=closed&types=pending&code=3&full=true',
        ),
      ).toEqual({
        lang: 'fr',
        types: ['open', 'closed', 'pending'],
        code: 3,
        full: true,
      });
    });

    test('should work when required params are not in order with option allowUnorderedParams and allowUnknownParams', () => {
      expect(
        qsStrict(
          { allowUnorderedParams: true, allowUnknownParams: true },
          qsDefinition,
          '?lang=fr&types=open&pippip=yeah&lang=fr&types=closed&types=pending&code=3&full=true',
        ),
      ).toEqual({
        lang: 'fr',
        types: ['open', 'closed', 'pending'],
        code: 3,
        full: true,
      });
    });

    test('should fail when required params are not provided', () => {
      try {
        qsStrict(
          {},
          qsDefinition,
          '?types=open&types=closed&types=pending&code=3&full=true',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_REQUIRED_QUERY_PARAM (lang): E_REQUIRED_QUERY_PARAM]`,
        );
      }
    });

    test('should fail when a bad boolean is provided', () => {
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=1',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_BAD_BOOLEAN (1): E_BAD_BOOLEAN]`,
        );
      }
    });

    test('should fail when a bad array item is given', () => {
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=true&nums=1&nums=0.0',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_NON_REENTRANT_NUMBER (0.0, 0): E_NON_REENTRANT_NUMBER]`,
        );
      }
    });

    test('should work whith an unexisting param and the allowUnknownParams option', () => {
      expect(
        qsStrict(
          { allowUnknownParams: true },
          qsDefinition,
          '?lol=9&lang=fr&types=open&types=closed&types=pending&code=3&full=true',
        ),
      ).toEqual({
        code: 3,
        full: true,
        lang: 'fr',
        types: ['open', 'closed', 'pending'],
      });
    });

    test('should fail when an unexisting param is set at the begin', () => {
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lol=9&lang=fr&types=open&types=closed&types=pending&code=3&full=true',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_UNAUTHORIZED_QUERY_PARAM (lol): E_UNAUTHORIZED_QUERY_PARAM]`,
        );
      }
    });

    test('should fail when an unexisting param is set in the middle', () => {
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pendinglol=9&&code=3&full=true',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_UNAUTHORIZED_QUERY_PARAM (): E_UNAUTHORIZED_QUERY_PARAM]`,
        );
      }
    });

    test('should fail when an unexisting param is set at the end', () => {
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=true&lol=9',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_UNAUTHORIZED_QUERY_PARAM (lol): E_UNAUTHORIZED_QUERY_PARAM]`,
        );
      }
    });

    test('should fail when setting a query param to the default value', () => {
      try {
        qsStrict(
          {},
          qsDefinition,
          '?lang=en&types=open&types=closed&types=pending&code=3&full=true',
        );
        throw new YError('E_UNEXPECTED_SUCCESS');
      } catch (err) {
        expect(err).toMatchInlineSnapshot(
          `[YError: E_CANNOT_SET_TO_DEFAULT (lang, en): E_CANNOT_SET_TO_DEFAULT]`,
        );
      }
    });
    test('should work when setting a query param to the default value and allowDefault option', () => {
      expect(
        qsStrict(
          { allowDefault: true },
          qsDefinition,
          '?lang=en&types=open&types=closed&types=pending&code=3&full=true',
        ),
      ).toEqual({
        code: 3,
        full: true,
        lang: 'en',
        types: ['open', 'closed', 'pending'],
      });
    });
  });
});
