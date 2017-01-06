/* eslint-disable func-names, no-invalid-this, no-shadow, id-length */
import Document, {
  transformValueToType, // eslint-disable-line
  getPaths, // eslint-disable-line
  typeToValue, // eslint-disable-line
} from '../dist/documents.js';
import test from 'ava-spec';
import to from 'to-js';
import { benchmark } from './utils';
import faker from 'faker';
test.beforeEach((t) => {
  t.context.document = new Document();
});

test('typeToValue', benchmark((t) => {
  return [
    'string',
    'object',
    'structure',
    'number',
    'integer',
    'double',
    'long',
    'float',
    'array',
    'boolean',
    'bool',
    'null',
    'undefined',
  ].reduce((prev, next) => {
    prev['_' + next] = () => typeToValue(next);
    return prev;
  }, {});
}));

test.todo('build');

test.todo('runData');

test.todo('buildDocument');

test.todo('initializeDocument');

test.todo('buildObject');

test.todo('buildValue');

test.todo('postProcess');

test.todo('transformValueToType');

test.todo('getPaths');

test.todo('typeToValue');
