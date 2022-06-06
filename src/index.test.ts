import assert from 'assert';
import { qsStrict } from './index.js';
import type { QSParameter } from './index.js';

describe('strict-qs', () => {
  describe('with no search', () => {
    const qsDefinition = [];

    test('should work', () => {
      assert.deepEqual(qsStrict({}, qsDefinition, ''), {});
    });
  });

  describe('with bad search', () => {
    const qsDefinition = [];

    test('should fail', () => {
      assert.throws(() => {
        qsStrict({}, qsDefinition, '?');
      }, /E_EMPTY_SEARCH/);
    });

    test('should work when allowed', () => {
      assert.deepEqual(
        qsStrict({ allowEmptySearch: true }, qsDefinition, '?'),
        {},
      );
    });

    test('should fail', () => {
      assert.throws(() => {
        qsStrict({}, qsDefinition, 'lol');
      }, /E_MALFORMED_SEARCH/);
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
      assert.throws(() => {
        qsStrict({}, qsDefinition, '?user=lol');
      }, /E_UNSUPPORTED_TYPE/);
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
      assert.deepEqual(qsStrict({}, qsDefinition, '?pages=0&pages=1&pages=2'), {
        pages: [0, 1, 2], // eslint-disable-line
      });
    });

    test('should fail when params are not ordered', () => {
      assert.throws(() => {
        qsStrict({}, qsDefinition, '?pages=0&pages=2&pages=1');
      }, /E_UNORDERED_QUERY_PARAMS/);
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
      assert.deepEqual(
        qsStrict(
          {},
          qsDefinition,
          '?redirectURL=' + encodeURIComponent('http://localhost/plop'),
        ),
        {
          redirectURL: 'http://localhost/plop',
        },
      );
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
      assert.deepEqual(qsStrict({}, qsDefinition, '?query=a+b+c'), {
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
          enum: [1, 2, 3, 4], // eslint-disable-line
        },
        description: 'The types of the search',
      },
    ];

    test('should work with good params', () => {
      assert.deepEqual(
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=true',
        ),
        {
          lang: 'fr',
          types: ['open', 'closed', 'pending'],
          code: 3,
          full: true,
        },
      );
      assert.throws(
        qsStrict.bind(
          null,
          {},
          qsDefinition,
          '?lang=cn&types=open&types=closed&types=pending&code=3&full=true',
        ),
        /E_NOT_IN_ENUM/,
      );
      assert.throws(
        qsStrict.bind(
          null,
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3.4&full=true',
        ),
        /E_PATTERN_DOES_NOT_MATCH/,
      );
    });

    test('should work with all params', () => {
      assert.deepEqual(
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=false&nums=4',
        ),
        {
          lang: 'fr',
          types: ['open', 'closed', 'pending'],
          code: 3,
          full: false,
          nums: [4], // eslint-disable-line
        },
      );
    });

    test('should fail when required params are not in order', () => {
      assert.throws(() => {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&lang=hop&types=closed&types=pending&code=3&full=true',
        );
      }, /E_BAD_QUERY_PARAM_POSITION/);
    });

    test('should work when required params are not in order with option allowUnorderedParams', () => {
      assert.deepEqual(
        qsStrict(
          { allowUnorderedParams: true },
          qsDefinition,
          '?lang=fr&types=open&lang=fr&types=closed&types=pending&code=3&full=true',
        ),
        {
          lang: 'fr',
          types: ['open', 'closed', 'pending'],
          code: 3,
          full: true,
        },
      );
    });

    test('should work when required params are not in order with option allowUnorderedParams and allowUnknownParams', () => {
      assert.deepEqual(
        qsStrict(
          { allowUnorderedParams: true, allowUnknownParams: true },
          qsDefinition,
          '?lang=fr&types=open&pippip=yeah&lang=fr&types=closed&types=pending&code=3&full=true',
        ),
        {
          lang: 'fr',
          types: ['open', 'closed', 'pending'],
          code: 3,
          full: true,
        },
      );
    });

    test('should fail when required params are not provided', () => {
      assert.throws(() => {
        qsStrict(
          {},
          qsDefinition,
          '?types=open&types=closed&types=pending&code=3&full=true',
        );
      }, /E_REQUIRED_QUERY_PARAM/);
    });

    test('should fail when a bad boolean is provided', () => {
      assert.throws(() => {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=1',
        );
      }, /E_BAD_BOOLEAN/);
    });

    test('should fail when a bad array item is given', () => {
      assert.throws(() => {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=true&nums=1&nums=0.0',
        );
      }, /E_NON_REENTRANT_NUMBER/);
    });

    test('should work whith an unexisting param and the allowUnknownParams option', () => {
      assert.deepEqual(
        qsStrict(
          { allowUnknownParams: true },
          qsDefinition,
          '?lol=9&lang=fr&types=open&types=closed&types=pending&code=3&full=true',
        ),
        {
          code: 3,
          full: true,
          lang: 'fr',
          types: ['open', 'closed', 'pending'],
        },
      );
    });

    test('should fail when an unexisting param is set at the begin', () => {
      assert.throws(() => {
        qsStrict(
          {},
          qsDefinition,
          '?lol=9&lang=fr&types=open&types=closed&types=pending&code=3&full=true',
        );
      }, /E_UNAUTHORIZED_QUERY_PARAM/);
    });

    test('should fail when an unexisting param is set in the middle', () => {
      assert.throws(() => {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pendinglol=9&&code=3&full=true',
        );
      }, /E_UNAUTHORIZED_QUERY_PARAM/);
    });

    test('should fail when an unexisting param is set at the end', () => {
      assert.throws(() => {
        qsStrict(
          {},
          qsDefinition,
          '?lang=fr&types=open&types=closed&types=pending&code=3&full=true&lol=9',
        );
      }, /E_UNAUTHORIZED_QUERY_PARAM/);
    });

    test('should fail when setting a query param to the default value', () => {
      assert.throws(() => {
        qsStrict(
          {},
          qsDefinition,
          '?lang=en&types=open&types=closed&types=pending&code=3&full=true',
        );
      }, /E_CANNOT_SET_TO_DEFAULT/);
    });
    test('should work when setting a query param to the default value and allowDefault option', () => {
      assert.deepEqual(
        qsStrict(
          { allowDefault: true },
          qsDefinition,
          '?lang=en&types=open&types=closed&types=pending&code=3&full=true',
        ),
        {
          code: 3,
          full: true,
          lang: 'en',
          types: ['open', 'closed', 'pending'],
        },
      );
    });
  });
});
