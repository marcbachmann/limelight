var mdfind = require('../../lib/find')

module.exports = {
  list: function (query, callback) {
    mdfind({
      type: 'contact',
      query: query['~query'],
      limit: 15
    }, function (err, contacts) {
      if (err) console.log(err)
      contacts = contacts.map(function(c) {
        c.icon = '/plugins/contacts/vcard.png'
        c.plugin = 'contacts'
        return c
      })
      callback(null, {name: 'Contacts', children: contacts})
    })
  },

  get: function (query, callback) {
      callback(null, {html: query})
  },

  run: function (query, callback) {

  }
}
