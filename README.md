# alexa-utterances

generate expanded Amazon Alexa utterances from a template string

When building apps for Alexa or Echo, it's important to declare many permutations of text, in order to improve the voice recognition rate.

Manually generating these combinations is tedious. This module allows you to generate many (hundreds or even thousands) of sample utterances using just a few samples that get auto-expanded. Any number of sample utterances may be passed in the utterances array. Below are some sample utterances macros and what they will be expanded to.

### Usage

installation:
```bash
npm install alexa-utterances
```

running tests:
```bash
npm test
```

### API

```javascript
var result = utterances(template);
```

**template** a string to generate utterances from

**result** an array of strings built from the template

#### Example

In the following examples, the Alexa Skill Interactin Model is used to input the LIST_OF_MOVIES. This list will be used when the Echo interprets the utterances for the intent.

```javascript
var template = "(The best|My favorite|A great) movie is {Movie}";
var result = utterances(template);

// result: 
// [ "My best movie is {Movie}", "My favorite movie is {Movie}", "A great movie is {Movie}" ]
```

#### Slots

The slots object is a simple Name:Type mapping. The type must be one of Amazon's [built-in slot types](https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/docs/defining-the-voice-interface#h2_speech_input) or it can be a [custom slot type](#custom-slot-types).

* `AMAZON.DATE` – converts words that indicate dates (“today”, “tomorrow”, or “july”) into a date format (such as “2015-07-00T9”).
* `AMAZON.DURATION` – converts words that indicate durations (“five minutes”) into a numeric duration (“PT5M”).
* `AMAZON.FOUR_DIGIT_NUMBER` - Provides recognition for four-digit numbers, such as years.
* `AMAZON.NUMBER` – converts numeric words (“five”) into digits (such as “5”).
* `AMAZON.TIME` – converts words that indicate time (“four in the morning”, “two p m”) into a time value (“04:00”, “14:00”).
* `AMAZON.US_CITY` - provides recognition for major cities in the United States. 
  All cities with a population over 100,000 are included. You can extend the type to include more cities if necessary.
* `AMAZON.US_FIRST_NAME` - provides recognition for thousands of popular first names, based on census and social security data. 
  You can extend the type to include more names if necessary.
* `AMAZON.US_STATE` - provides recognition for US states, territories, and the District of Columbia. 
  You can extend this type to include more states if necessary.


#### Generate Multiple Versions of Static Text

This lets you define multiple ways to say a phrase, but combined into a single sample utterance using parentheses to group the phrases.

```javascript
"(what is|what's|check) the status"
=>
"what is the status"
"what's the status"
"check the status"
```

#### Auto-Generated Number Ranges

When capturing a numeric slot value, it's helpful to generate many sample utterances with different number values.

```javascript
"buy (2-5) items"
=>
"buy two items"
"buy three items"
"buy four items"
"buy five items"
```

Number ranges can also increment in steps.

```javascript
"buy (5-20 by 5) items"
=>
"buy five items"
"buy ten items"
"buy fifteen items"
"buy twenty items"
```

#### Optional Words

```javascript
"what is your (favorite |)color"
=>
"what is your color"
"what is your favorite color"
```

#### Custom Slot Types <a name="custom-slot-types"></a>

You may want to work with [Custom Slot Types](https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/docs/defining-the-voice-interface#h2_speech_input) registered in your interaction model.

To reference the slot name in the template, use the name enclosed in curly braces. For example, if you have defined in your skill a `FRUIT_TYPE` with the values `Apple`, `Orange` and `Lemon` for the slot `Fruit`, you can keep `Fruit` a curly-braced literal as follows.

```javascript
"(my|your) (favorite|least favorite) snack is {Fruit}"
=>
"my favorite snack is {Fruit}"
"your favorite snack is {Fruit}"
"my least favorite snack is {Fruit}"
"your least favorite snack is {Fruit}"
```
