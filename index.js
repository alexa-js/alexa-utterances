var Combinatorics = require('js-combinatorics');
var Numbered      = require('numbered');


// Util functions for generating schema and utterances
// ===================================================
// Convert a number range like 5-10 into an array of english words
function expandNumberRange(start, end, by) {
  var i, converted = [];
  by = by || 1; //incrementing by 0 is a bad idea
  
  for (i=start; i<=end; i+=by) {
    converted.push( Numbered.stringify(i).replace(/-/g, ' ') );
  }
  return converted;
}

// Recognize shortcuts in utterance definitions and swap them out with the actual values
function expandShortcuts(str) {
  // Numbered ranges, ex: 5-100 by 5
  var match = str.match(/(\d+)\s*-\s*(\d+)(\s+by\s+(\d+))?/);
  if (match) {
    return expandNumberRange(+match[1],+match[2],+match[4]);
  }
  return [str];
}

var slotIndexes = [];
function expandSlotValues (variations, slotSampleValues) {
  var i, slot, sampleValues, idx, newVariations, mod, xtraidx;

  for (slot in slotSampleValues) {

    sampleValues = slotSampleValues[slot];

    idx = -1;
    if (typeof slotIndexes[slot] !== 'undefined') {
      idx = slotIndexes[slot];
    }

    newVariations = [];

    // make sure we have enough variations that we can get through the sample values
    // at least once for each alexa-app utterance...  this isn't strictly as
    // minimalistic as it could be.
    //
    // our *real* objective is to make sure that each sampleValue gets used once per
    // intent, but each intent spans multiple utterances; it would require heavy
    // restructuring of the way the utterances are constructed to keep track of
    // whether every slot was given each sample value once within an Intent's set
    // of utterances.  So we take the easier route, which generates more utterances
    // in the output (but still many less than we would get if we did the full
    // cartesian product).
    if (variations.length < sampleValues.length) {
      mod = variations.length;
      xtraidx = 0;
      while (variations.length < sampleValues.length) {
        variations.push (variations[xtraidx]);
        xtraidx = (xtraidx + 1) % mod;
      }
    }

    variations.forEach (function (variation, j) {
      var newVariation = [];
      variation.forEach (function (value, k) {
        if (value == 'slot-' + slot) {
          idx = (idx + 1) % sampleValues.length;
          slotIndexes[slot] = idx;

          value = sampleValues[idx];
        }

        newVariation.push (value);
      });
      newVariations.push (newVariation);
    });

    variations = newVariations;
  }

  return variations;
}

// Generate a list of utterances from a template
module.exports = function generateUtterances(str) {
  var placeholders=[], utterances=[], slotmap={}, slotValues=[];

  // First extract sample placeholders values from the string
  str = str.replace(/\(([^\)]+)\)/g, function(match, p1) {
    var expandedValues=[], values = p1.split('|');

    values.forEach(function(val, i) {
      Array.prototype.push.apply(expandedValues, expandShortcuts(val));
    });
    
    placeholders.push(expandedValues);
    return '(' + (placeholders.length - 1) + ')';
  });

  // Generate all possible combinations using the cartesian product
  if (placeholders.length > 0) {
    var variations = Combinatorics.cartesianProduct.apply(Combinatorics, placeholders).toArray();

    variations = expandSlotValues(variations, slotValues);

    // Substitute each combination back into the original string
    variations.forEach(function(values) {
      // Replace numeric placeholders
      var utterance = str.replace(/\((\d+)\)/g, function(match, p1) { 
        return values[p1]; 
      });
      // Replace slot placeholders
      utterance = utterance.replace(/\((.*?)\)/g, function(match, p1) { 
        return '{' + p1 + '}';
      });
      utterances.push(utterance);
    });
  }
  else {
    return [ str ];
  }
  return utterances;
}
