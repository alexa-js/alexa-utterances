var utterances = require('../');
var test       = require('tap').test;


test('basic usage', function (t) {
  var dictionary = {};
  var slots = {};
  var template = 'do the thing';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ 'do the thing' ]);
  t.end();
});


test('optional terms', function (t) {
  var dictionary = {};
  var slots = {};
  var template = 'do {it |}';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ 'do it ', 'do ' ]);
  t.end();
});


test('dictionary expansion', function (t) {
  var dictionary = { adjustments: [ 'dim', 'brighten' ] };
  var slots = { Adjustment: 'LITERAL' };
  var template = '{adjustments|Adjustment} the light';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ '{dim|Adjustment} the light',
    '{brighten|Adjustment} the light'
  ]);
  t.end();
});


test('number range expansion', function (t) {
  var dictionary = {};
  var slots = { Brightness: 'NUMBER' };
  var template = 'set brightness to {1-3|Brightness}';

  var result = utterances(template, slots, dictionary);
  t.deepEqual(result, [ "set brightness to {one|Brightness}",
    "set brightness to {two|Brightness}",
    "set brightness to {three|Brightness}"
  ]);
  t.end();
});
