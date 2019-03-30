
// currently not used, suggest search is better

const needle = require('needle')
const toMeta = require('../lib/apiToMeta')
const noBuffer = require('../lib/noBuffer')
const config = require('../config')

const cache = { movie: {}, series: {} }

module.exports = (kitsuSearch, args, cb) => {

  const cacheMaxAge = config.cacheTTL.search / 1000

  if (cache[args.type][kitsuSearch]) {
    cb(null, { metas: cache[args.type][kitsuSearch], cacheMaxAge })
    return
  }
  needle.get(config.endpoint + '/anime?filter[text]=' + encodeURIComponent(kitsuSearch) + '&include=genres&filter[subtype]=' + (args.type == 'movie' ? 'movie' : 'TV') + '&page[limit]=1', { headers: config.headers }, (err, resp, body) => {
    const data = noBuffer((resp || {}).body || {}).data || []
    if (data.length) {
      cache[args.type][kitsuSearch] = data.map(toMeta.bind(null, args))
      setTimeout(() => { delete cache[args.type][kitsuSearch] }, config.cacheTTL.search)
      return cb(null, { metas: cache[args.type][kitsuSearch], cacheMaxAge })
    }
    cb(new Error('Could not get meta for: ' + args.id))
  })
}
