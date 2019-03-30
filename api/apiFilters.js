const needle = require('needle')
const config = require('../config')
const noBuffer = require('../lib/noBuffer')

module.exports = (cb) => {
  const genres = {}
  needle.get(config.endpoint + '/genres', { headers: config.headers }, (err, resp, body) => {
    const data = noBuffer(body || {}).data || []
    data.forEach(genre => {
      genres[genre.id] = (genre.attributes || {}).name
    })
    cb(genres)
  })
}
