import test from 'tape'
import generator from '../app/generator'

test('test suite', (s) => {
  s.test('test 1', async (t) => {
    try {
      // await blah()
      t.pass('test 1');
    } catch (e) {
      t.fail('test 1');
    }
    t.end();
  });
  s.end();
});
