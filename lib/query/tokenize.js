var _ = require('lodash')
// var natural = require('natural')
// var tokenizer = new natural.TreebankWordTokenizer()

var MULTIQUERY = /(~|@)([a-zA-Z]*)\(([^\(\)]*)\)/g
var SINGLEQUERY = /(~|@)([a-zA-Z]*)\(([^\(\)]*)\)/
var SPLITQUERY = /[~|@][a-zA-Z]*\([^\(\)]*\)/

module.exports = function (string) {
  string = string.trim()
  var sentence = { definition: tokenize(string) }
  return _.extend(sentence, {
    template: string,
    matches: matches(sentence),
    extract: extract(sentence)
  })
}

function tokenize (string) {
  var def = {
    beginning: string,

    // strings is an array of words that aren't tokens
    strings: string.split(SPLITQUERY),

    // tokens are strings that get extracted based
    // on a template definition
    tokens: []
  }
  _.each(string.match(MULTIQUERY), function (query, index) {
    if (index === 0) {
      var beg = string.split(query)[0]
      def.beginning = beg
    }
    var match = query.match(SINGLEQUERY)
    if (match[1] === '~') def.tokens.push({ name: match[2], type: 'query', placeholder: match[3], raw: query })
    else def.tokens.push({ name: match[2], type: match[2], placeholder: match[3], raw: query })
  })
  return def
}

function extract (s) {
  var noTokens = _.isEmpty(s.definition.tokens)
  return function (query) {
    if (noTokens) return {}
    var definition = _.cloneDeep(s.definition)
    return extractQuery({}, definition, query)
  }
}

// this is a sentence
// this is a ~query(sentence)
// ~query(this is) a sentence

// returns an object if the sentence is a match
// it should return false if there is none
function extractQuery (obj, definition, query) {
  if (!definition.tokens[0]) return obj
  var currentString = definition.strings.shift()

  // If the current string is not empty,
  // we trim down the query and iterate
  // otherwise we'll extract the text as query
  if (currentString && currentString.trim()) {
    query = query.replace(currentString, '').trim()
    return extractQuery(obj, definition, query)
  }

  var token = definition.tokens.shift()
  var nextString = definition.strings[0]
  var end = query.length
  if (nextString) end = query.indexOf(nextString)

  var key = (token.type === 'query') ? '~' + token.name : '@' + token.name
  obj[key] = query.substring(0, end)
  query = query.substring(end)

  return extractQuery(obj, definition, query)
}

function matches (s) {
  return function (query) {
    if (!s.definition.beginning === undefined) return false
    return query.indexOf(s.definition.beginning) === 0
  }
}
