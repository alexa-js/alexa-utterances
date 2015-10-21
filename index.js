var Combinatorics = require('js-combinatorics');
var Numbered      = require('numbered');


// Extract the schema and generate a schema JSON object
function schema (intents) {
  var schema = {"intents":[]}, intentName, intent, key;
  for (intentName in intents) {
    intent = intents[intentName];
    var intentSchema = {"intent":intent.name, "slots":[]};
    if (intent.schema) {
      if (intent.schema.slots) {
        for (key in intent.schema.slots) {
          intentSchema.slots.push( {"name":key, "type":intent.schema.slots[key]} );
        }
      }
    }
    schema.intents.push(intentSchema);
  };
  return JSON.stringify(schema,null,3);
}


// Generate a list of sample utterances
function utterances (intents, dictionary) {
  var intentName, utterances=[], intent, out="";
  for (intentName in intents) {
    intent = intents[intentName];
    if (intent.schema && intent.schema.utterances) {
      intent.schema.utterances.forEach(function(sample) {
        var list = generateUtterances(sample, intent.schema.slots, dictionary);
        list.forEach(function(utterance) {
          out+=intent.name+"\t"+(utterance.replace(/\s+/g,' '))+"\n";
        });
      });
    }
  };
  return out;
}


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

// Generate a list of utterances from a template
function generateUtterances(str, slots, dictionary) {
  var placeholders=[], utterances=[], slotmap={};
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
    placeholders.push( expandedValues );
    return "{"+(slot || placeholders.length-1)+"}";
  });
  // Generate all possible combinations using the cartesian product
  if (placeholders.length>0) {
    var variations = Combinatorics.cartesianProduct.apply(Combinatorics,placeholders).toArray();
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
