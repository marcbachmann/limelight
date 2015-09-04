var _ = require('lodash')
var tokenize = require('./tokenize')
// var util = require('util')
// var natural = require('natural')

function Classifier () {
  this.sentences = []
  // natural.BayesClassifier.call(this)
}

// util.inherits(Classifier, natural.BayesClassifier)

Classifier.prototype.add = function (plugin) {
  _.each(plugin.sentences, function (sentence) {
    sentence = tokenize(sentence)
    this.sentences.push({plugin: plugin, sentence: sentence})
  }, this)
}

Classifier.prototype.getMatches = function (query) {
  var matches = []
  _.each(this.sentences, function (sentence, index) {
    if (sentence.sentence.matches(query)) {
      matches.push({
        plugin: sentence.plugin,
        query: sentence.sentence.extract(query)
      })
    }
  })
  return matches
}


module.exports = Classifier
