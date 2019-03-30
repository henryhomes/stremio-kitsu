
const needle = require('needle')
const toMeta = require('../lib/apiToMeta')
const noBuffer = require('../lib/noBuffer')
const redis = require('../lib/redis')
const config = require('../config')

const cache = { movie: {}, series: {} }

module.exports = (kitsuId, args, cb) => {

  const cacheMaxAge = config.cacheTTL.meta / 1000

  if (cache[args.type][args.id]) {
    cb(null, { meta: cache[args.type][args.id], cacheMaxAge })
    return
  }
  const key = 'meta-' + args.type + ' - ' + args.id
  redis.get(key, (err, redisMeta) => {

    if (!err && redisMeta) {
      cb(null, { meta: redisMeta, cacheMaxAge })
      return
    }

    needle.get(config.endpoint + '/anime/' + kitsuId + '?include=genres,episodes', { headers: config.headers }, (err, resp, body) => {
      const parsed = noBuffer((resp || {}).body || {})
      const data = parsed.data || {}
      const included = parsed.included || []
      if (data.id) {
        cache[args.type][args.id] = toMeta(args, data, included)
        setTimeout(() => { delete cache[args.type][args.id] }, config.cacheTTL.meta)
        redis.set(key, cache[args.type][args.id], config.cacheTTL.meta)
        return cb(null, { meta: cache[args.type][args.id], cacheMaxAge })
      }
      cb(new Error('Could not get meta for: ' + args.id))
    })
  })
}
