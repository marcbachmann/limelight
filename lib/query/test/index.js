var assert = require('assert')
var _ = require('lodash')
var tokenize = require('../tokenize')

// Matches
// =======
function matches (string, matches, mismatches) {
  _.each(matches, function (val) {
    var res = tokenize(string).matches(val)
    assert(res === true, 'Expected "' + val + '" to match against "' + string + '"')
  })

  _.each(mismatches, function (val) {
    var res = tokenize(string).matches(val)
    assert(res === false, 'Expected "' + val + '" not to match against "' + string + '"')
  })
}

// without query
var s1 = 'dark mode'
var s1matches = ['dark mode', 'Dark Mode']
var s1mismatches = ['toggle dark mode']
matches(s1, s1matches, s1mismatches)

// single query
var s1 = "what's the weather in ~query(Zürich)"
var s1matches = [
  "what's the weather in Zürich",
  "what's the weather in San Francisco",
  "what's the weather in Zürich, CH"
]

var s1mismatches = [
  'What is the weather in Zürich'
]

matches(s1, s1matches, s1mismatches)

// multi query
var s2 = 'show me the weather of ~query(Zürich) of ~date(today)'
var s2matches = [
  'show me the weather of Berlin of today'
]

var s2mismatches = [
  'show me the weather of Berlin'
]

matches(s2, s2matches, s2mismatches)


// Extraction
// ==========
