var Combinatorics = require('js-combinatorics');
var Numbered      = require('numbered');


// Util functions for generating schema and utterances
// ===================================================
// Convert a number range like 5-10 into an array of english words
function expandNumberRange(start, end, by) {
  by = by || 1; //incrementing by 0 is a bad idea
  var converted = [];
  for (var i=start; i<=end; i+=by) {
    converted.push( Numbered.stringify(i).replace(/-/g,' ') );
  }
  return converted;
}

// Recognize shortcuts in utterance definitions and swap them out with the actual values
function expandShortcuts(str, slots, dictionary) {
  // If the string is found in the dictionary, just provide the matching values
  if (typeof dictionary=="object" && typeof dictionary[str]!="undefined") {
    return dictionary[str];
  }
  // Numbered ranges, ex: 5-100 by 5
  var match = str.match(/(\d+)\s*-\s*(\d+)(\s+by\s+(\d+))?/);
  if (match) {
    return expandNumberRange(+match[1],+match[2],+match[4]);
  }
  return [str];
}

var slotIndexes = [];
function expandSlotValues (variations, slotSampleValues) {
  var i;

  var slot;
  for (slot in slotSampleValues) {

    var sampleValues = slotSampleValues[slot];

    var idx = -1;
    if (typeof slotIndexes[slot] !== "undefined") {
      idx = slotIndexes[slot];
    }

    var newVariations = [];

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
      var mod = variations.length;
      var xtraidx = 0;
      while (variations.length < sampleValues.length) {
        variations.push (variations[xtraidx]);
        xtraidx = (xtraidx + 1) % mod;
      }
    }

    variations.forEach (function (variation, j) {
      var newVariation = [];
      variation.forEach (function (value, k) {
        if (value == "slot-" + slot) {
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
function generateUtterances(str, slots, dictionary, exhaustiveUtterances) {
  var placeholders=[], utterances=[], slotmap={}, slotValues=[];
  // First extract sample placeholders values from the string
  str = str.replace(/\{([^\}]+)\}/g, function(match,p1) {
    var expandedValues=[], slot, values = p1.split("|");
    // If the last of the values is a SLOT name, we need to keep the name in the utterances
    if (values && values.length && values.length>1 && slots && typeof slots[values[values.length-1]]!="undefined") {
      slot = values.pop();
    }
    values.forEach(function(val,i) {
      Array.prototype.push.apply(expandedValues,expandShortcuts(val,slots,dictionary));
    });
    if (slot) {
      slotmap[slot] = placeholders.length;
    }

    // if we're dealing with minimal utterances, we will delay the expansion of the
    // values for the slots; all the non-slot expansions need to be fully expanded
    // in the cartesian product
    if (!exhaustiveUtterances && slot)
    {
      placeholders.push( [ "slot-" + slot ] );
      slotValues[slot] = expandedValues;
    }
    else
    {
      placeholders.push( expandedValues );
    }

    return "{"+(slot || placeholders.length-1)+"}";
  });
  // Generate all possible combinations using the cartesian product
  if (placeholders.length>0) {
    var variations = Combinatorics.cartesianProduct.apply(Combinatorics,placeholders).toArray();

    if (!exhaustiveUtterances)
    {
      variations = expandSlotValues (variations, slotValues);
    }

    // Substitute each combination back into the original string
    variations.forEach(function(values) {
      // Replace numeric placeholders
      var utterance = str.replace(/\{(\d+)\}/g,function(match,p1){ 
        return values[p1]; 
      });
      // Replace slot placeholders
      utterance = utterance.replace(/\{(.*?)\}/g,function(match,p1){ 
        return "{"+values[slotmap[p1]]+"|"+p1+"}";
      });
      utterances.push( utterance );
    });
  }
  else {
    return [str];
  }
  return utterances;
}


module.exports = generateUtterances;
