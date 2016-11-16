import test from 'ava-spec'

test('test suite', (t) => {
  try {
    t.pass('test 1');
  } catch (e) {
    t.fail('test 1');
  }
});
