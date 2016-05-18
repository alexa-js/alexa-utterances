var utterances = require('../');
var test       = require('tap').test;


test('basic usage', function (t) {
  var template = 'do the thing';
  var result = utterances(template);
  t.deepEqual(result, [ 'do the thing' ]);
  t.end();
});


test('optional terms', function (t) {
  var template = 'do (it |)';

  var result = utterances(template);
  t.deepEqual(result, [ 'do it ', 'do ' ]);
  t.end();
});


test('multiple versions of static text', function (t) {
  var template = 'The (best|worst|popular) color is {Color}';

  var result = utterances(template);
  t.deepEqual(result, [ 'The best color is {Color}', 'The worst color is {Color}', 'The popular color is {Color}' ]);
  t.end();
});


test('optional multiple versions of static text', function (t) {
  var template = 'choice (A|B|)';

  var result = utterances(template);
  t.deepEqual(result, [ 'choice A', 'choice B', 'choice ' ]);
  t.end();
});


test('preserve Amazon Alexa slots', function (t) {
  var template = 'My favorite color is {Color}';

  var result = utterances(template);
  t.deepEqual(result, [ 'My favorite color is {Color}' ]);
  t.end();
});


test('number range expansion', function (t) {
  var template = 'set power to (1-3)';

  var result = utterances(template);
  t.deepEqual(result, [ "set power to one",
    "set power to two",
    "set power to three"
  ]);
  t.end();
});


test('number range expansion with optional by clause', function (t) {
  var template = 'set brightness to (5-15 by 5)';

  var result = utterances(template);
  t.deepEqual(result, [ "set brightness to five",
    "set brightness to ten",
    "set brightness to fifteen"
  ]);
  t.end();
});
