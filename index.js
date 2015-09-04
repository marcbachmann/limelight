var app = require('app')
var Application = require('./server/application')
var application = new Application()

app.on('ready', launch)
app.on('before-quit', exit)

function launch () {
  application.start(function (err, server) {
    if (err) throw err
    console.log('App started with server on url %s', server.url)
  })
}

function exit () {
  application.stop(function (err){
    if (err) throw err
  })
}
