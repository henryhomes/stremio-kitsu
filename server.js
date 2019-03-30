const { serveHTTP } = require('stremio-addon-sdk')
const addonInterface = require('./index')
const config = require('./config')

serveHTTP(addonInterface, { port: config.port })
