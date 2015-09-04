var mdfind = require('../../lib/find')

module.exports = {
  list: function (query, callback) {
    mdfind({
      type: 'folder',
      query: query,
      limit: 15
    }, function (err, docs) {
      if (err) return callback(err)
      docs = docs.map(function (d) {
        q.query
        d.description = d.path.replace('/Users/marcbachmann', '~')
        return d
      })
      callback(null, {name: 'Open in Sublime', children: docs})
    })
  },

  get: function (query, callback) {

  },

  run: function (query, callback) {

  }
}
