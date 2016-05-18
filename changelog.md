# 1.0.0

This is a major departure from version 0.2.0

Amazon Alexa has introduced custom slots and built-in slot types.

It is [recommended to use Custom Slot Types](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/migrating-to-the-improved-built-in-and-custom-slot-types) when constructing utterances because they're easier to define 
the sample utterances and achieve better accuracy.

As a result, the need for several utterance expansion techniques are no longer useful/needed.

There has also been a decision to stop using `{ }` syntax, as that is reserved for Amazon Slots.
Instead we use parentheses. This makes it very clear immediately what is Amazon and what is `alexa-utterances`.

### backwards incompatible changes

Removed `LITERAL` support (deprecated by Amazon)

Removed dictionary support

Removed `{-|SLOT_NAME}` custom slot support

Removed exhaustive utterances, as it's only relevant to dictionary and `LITERAL` features

Switch from `{ }` to `( )` for alexa-utterances features


# 0.2.0

Added custom slot type support.