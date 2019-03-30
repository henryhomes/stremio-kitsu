const needle = require('needle')
const noBuffer = require('../lib/noBuffer')
const filterResults = require('../lib/filterResults')
const algolia = require('../lib/algoliaCreds')
const redis = require('../lib/redis')
const config = require('../config')

const cache = { movie: {}, series: {} }

function suggestToMeta(args, obj) {
  const type = obj.subtype == 'movie' ? 'movie' : 'series'
  const meta = {
    id: 'kitsu:' + obj.id,
    name: obj.canonicalTitle,
    poster: 'https://media.kitsu.io/anime/poster_images/' + obj.id + '/small.jpg',
    type
  }
  return meta
}

module.exports = (kitsuSearch, args, cb) => {

  const cacheMaxAge = config.cacheTTL.search / 1000

  if (cache[args.type][kitsuSearch]) {
    cb(null, { metas: cache[args.type][kitsuSearch], cacheMaxAge })
    return
  }

  const key = 'search-' + args.type + '-' + kitsuSearch

  redis.get(key, (err, redisMetas) => {

    if (!err && redisMetas) {
      cb(null, { metas: redisMetas, cacheMaxAge })
      return
    }

    needle.post(algolia.url, algolia.post(kitsuSearch), { headers: algolia.headers }, (err, resp, body) => {
      const data = noBuffer(body || {}).hits || []
      if (data.length) {
        cache[args.type][kitsuSearch] = data.filter(filterResults.bind(null, args)).map(suggestToMeta.bind(null, args))
        setTimeout(() => { delete cache[args.type][kitsuSearch] }, config.cacheTTL.search)
        redis.set(key, cache[args.type][kitsuSearch], config.cacheTTL.search)
        return cb(null, { metas: cache[args.type][kitsuSearch], cacheMaxAge })
      }
      // we intentionally avoid an error here
      // so empty responses are cached by cloudflare
      cb(null, { metas: [], cacheMaxAge })
    })
  })
}
