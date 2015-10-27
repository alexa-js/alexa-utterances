# alexa-utterances

generate expanded Amazon Alexa utterances from a template string

When building apps for Alexa or Echo, it's important to declare many permutations of text, in order to improve the voice recognition rate.

Manually generating these combinations is tedious. This module allows you to generate many (hundreds or even thousands) of sample utterances using just a few samples that get auto-expanded. Any number of sample utterances may be passed in the utterances array. Below are some sample utterances macros and what they will be expanded to.

### usage

installation:
```
npm install alexa-utterances
```

running tests:
```
npm test
```

### API

```javascript
var result = utterances(template, slots, dictionary, exhaustiveUtterances);
```

**template** a string to generate utterances from

**slots** a hash of slots to fill for the given utterance

**dictionary** a hash of lookup values to expand

**exhaustiveUtterances** if true, builds a full cartesian product of all shortcut values and slot sample values; if false, builds a smaller list of utterances that has the full cartesian product of all shortcut values, with slot sample values filled in; default = false

**result** an array of strings built from the template



#### example

```javascript
var dictionary = { adjustments: [ 'dim', 'brighten' ] };
var slots = { Adjustment: 'LITERAL' };
var template = '{adjustments|Adjustment} the light';

var result = utterances(template, slots, dictionary);

// result: 
// [ '{dim|Adjustment} the light', '{brighten|Adjustment} the light' ]
```

#### slots

The slots object is a simple Name:Type mapping. The type must be one of Amazon's supported slot types: LITERAL, NUMBER, DATE, TIME, DURATION


#### Using a Dictionary

Several intents may use the same list of possible values, so you want to define them in one place, not in each intent schema. Use the app's dictionary.

```javascript
var dictionary = { "colors": [ "red", "green", "blue" ] };
...
"I like {colors|COLOR}"
```

#### Multiple Options mapped to a Slot
```javascript
"my favorite color is {red|green|blue|NAME}"
=>
"my favorite color is {red|NAME}"
"my favorite color is {green|NAME}"
"my favorite color is {blue|NAME}"
```

#### Generate Multiple Versions of Static Text

This lets you define multiple ways to say a phrase, but combined into a single sample utterance

```javascript
"{what is the|what's the|check the} status"
=>
"what is the status"
"what's the status"
"check the status"
```

#### Auto-Generated Number Ranges

When capturing a numeric slot value, it's helpful to generate many sample utterances with different number values

```javascript
"buy {2-5|NUMBER} items"
=>
"buy {two|NUMBER} items"
"buy {three|NUMBER} items"
"buy {four|NUMBER} items"
"buy {five|NUMBER} items"
```

Number ranges can also increment in steps

```javascript
"buy {5-20 by 5|NUMBER} items"
=>
"buy {five|NUMBER} items"
"buy {ten|NUMBER} items"
"buy {fifteen|NUMBER} items"
"buy {twenty|NUMBER} items"
```

#### Optional Words

```javascript
"what is your {favorite |}color"
=>
"what is your color"
"what is your favorite color"
```
