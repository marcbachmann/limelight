var mdfind = require('mdfind')
var _ = require('lodash')

module.exports = function find (options, callback) {
  var results = [], error = null

  if (options.type === 'app') {
    options.attributes = ['kMDItemDisplayName']
    // query = "kMDItemKind=='Application' && kMDItemDisplayName=='*" + options.query + "*'"
  } else {
    options.attributes = ['kMDItemDisplayName']
    // query = options.query
  }

  mdfind({
    query: 'kind:' + options.type + ' ' + options.query,
    attributes: options.attributes,
    directories: options.directories,
    limit: options.limit
  }).output
  .on('data', function (data) { results.push(data) })
  .on('error', function (err) { error = err })
  .on('end', function () {
    if (error) return callback(error)

    results = _.map(results, mapDefault)
    if (options.type === 'folder') results = _.filter(results, filterFolders)
    callback(error, results)
  })
}

function mapDefault (result) {
  return {name: result.kMDItemDisplayName, path: result.path}
}

function filterFolders (document) {
  return !/\/Library\//.test(document.path)
}
