'use strict';

const assert = require('assert');
const qs = require('.');

describe('strict-qs', () => {
  describe('with no definitions', () => {
    const qsDefinition = [];

    it('should work', () => {
      assert.deepEqual(
        qs(qsDefinition, ''),
        {}
      );
    });
  });

  describe('with unsupported definition type', () => {
    const qsDefinition = [{
      name: 'user',
      in: 'query',
      type: 'object',
      required: true,
      description: 'The user',
    }];

    it('should fail', () => {
      assert.throws(() => {
        qs(qsDefinition, 'user=lol');
      }, /E_UNSUPPORTED_TYPE/);
    });
  });

  describe('with ordered collections', () => {
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

    it('should work when params are ordered', () => {
      assert.deepEqual(
        qs(qsDefinition, 'pages=0&pages=1&pages=2'),
        {
          pages: [0, 1, 2], // eslint-disable-line
        }
      );
    });

    it('should fail when params are not ordered', () => {
      assert.throws(() => {
        qs(qsDefinition, 'pages=0&pages=2&pages=1');
      }, /E_UNORDERED_QUERY_PARAMS/);
    });
  });

  describe('with encoded components', () => {
    const qsDefinition = [{
      name: 'redirectURL',
      in: 'query',
      type: 'string',
    }];

    it('should work', () => {
      assert.deepEqual(
        qs(qsDefinition, 'redirectURL=' + encodeURIComponent('http://localhost/plop')),
        {
          redirectURL: 'http://localhost/plop',
        }
      );
    });
  });

  describe('with lots of different definitions', () => {
    const qsDefinition = [{
      name: 'lang',
      in: 'query',
      type: 'string',
      required: true,
      default: 'en',
      description: 'The language for the search',
    }, {
      name: 'types',
      in: 'query',
      type: 'array',
      items: {
        type: 'string',
        enum: ['open', 'closed', 'pending', 'idle', 'invalid'],
      },
      description: 'The types of the search',
    }, {
      name: 'code',
      in: 'query',
      type: 'number',
      description: 'The code id',
    }, {
      name: 'full',
      in: 'query',
      type: 'boolean',
      description: 'Wether it is a full search or not',
    }, {
      name: 'nums',
      in: 'query',
      type: 'array',
      items: {
        type: 'number',
        enum: [1, 2, 3, 4], // eslint-disable-line
      },
      description: 'The types of the search',
    }];

    it('should work with good params', () => {
      assert.deepEqual(
        qs(qsDefinition, 'lang=fr&types=open&types=closed&types=pending&code=3&full=true'),
        {
          lang: 'fr',
          types: ['open', 'closed', 'pending'],
          code: 3,
          full: true,
        }
      );
    });

    it('should work with all params', () => {
      assert.deepEqual(
        qs(qsDefinition, 'lang=fr&types=open&types=closed&types=pending&code=3&full=false&nums=4'),
        {
          lang: 'fr',
          types: ['open', 'closed', 'pending'],
          code: 3,
          full: false,
          nums: [4], // eslint-disable-line
        }
      );
    });

    it('should fail when required params are not provided', () => {
      assert.throws(() => {
        qs(qsDefinition, 'lang=fr&types=open&lang=hop&types=closed&types=pending&code=3&full=true');
      }, /E_BAD_QUERY_PARAM_POSITION/);
    });

    it('should fail when required params are not provided', () => {
      assert.throws(() => {
        qs(qsDefinition, 'types=open&types=closed&types=pending&code=3&full=true');
      }, /E_REQUIRED_QUERY_PARAM/);
    });

    it('should fail when a bad boolean is provided', () => {
      assert.throws(() => {
        qs(qsDefinition, 'lang=fr&types=open&types=closed&types=pending&code=3&full=1');
      }, /E_BAD_BOOLEAN/);
    });

    it('should fail when a bad array item is given', () => {
      assert.throws(() => {
        qs(
          qsDefinition,
          'lang=fr&types=open&types=closed&types=pending&code=3&full=true&nums=1&nums=0.0'
        );
      }, /E_NON_REENTRANT_NUMBER/);
    });

    it('should fail when an unexisting paran is set at the begin', () => {
      assert.throws(() => {
        qs(
          qsDefinition,
          'lol=9&lang=fr&types=open&types=closed&types=pending&code=3&full=true'
        );
      }, /E_UNAUTHORIZED_QUERY_PARAM/);
    });

    it('should fail when an unexisting paran is set in the middle', () => {
      assert.throws(() => {
        qs(
          qsDefinition,
          'lang=fr&types=open&types=closed&types=pendinglol=9&&code=3&full=true'
        );
      }, /E_UNAUTHORIZED_QUERY_PARAM/);
    });

    it('should fail when an unexisting param is set at the end', () => {
      assert.throws(() => {
        qs(
          qsDefinition,
          'lang=fr&types=open&types=closed&types=pending&code=3&full=true&lol=9'
        );
      }, /E_UNAUTHORIZED_QUERY_PARAM/);
    });

    it('should fail when setting a query param to the default value', () => {
      assert.throws(() => {
        qs(
          qsDefinition,
          'lang=en&types=open&types=closed&types=pending&code=3&full=true'
        );
      }, /E_CANNOT_SET_TO_DEFAULT/);
    });
  });
});
