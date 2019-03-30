const namedQueue = require('named-queue')
const { addonBuilder }  = require('stremio-addon-sdk')
const package = require('./package')
const apiFilters = require('./api/apiFilters')
const apiMeta = require('./api/apiMeta')
const apiSearch = require('./api/apiSearch')
const suggestSearch = require('./api/suggestSearch')
const config = require('./config')

apiFilters(filters => { config.genres = filters })

const manifest = {
    id: 'org.kitsu.api',
    version: package.version,
    logo: config.logo,
    name: 'Kitsu API',
    description: 'Kitsu API for Anime in Stremio',
    resources: ['meta'],
    types: ['movie', 'series'],
    idPrefixes: ['kitsu:'],
    catalogs: [
      {
        id: 'kitsu-search-movie',
        type: 'movie',
        extra: [ { name: 'search', isRequired: true } ]
      }, {
        id: 'kitsu-search-series',
        type: 'series',
        extra: [ { name: 'search', isRequired: true } ]
      }
    ]
}

const addon = new addonBuilder(manifest)

const queue = new namedQueue((args, cb) => {
  const id = args.id.replace('kitsu:', '').split(':')[0]
  const query = args.extra.search
  const deepSearch = args.extra.deepSearch
  if (query) {
    if (deepSearch) return apiSearch(query, args, cb)
    else return suggestSearch(query, args, cb)
  } else if (id) return apiMeta(id, args, cb)
  else cb(new Error('Invalid Catalog Request: ' + JSON.stringify(args)))
}, Infinity)

addon.defineMetaHandler(args => {
  return new Promise((resolve, reject) => {
    queue.push(args, (err, resp) => {
      if (resp) resolve(resp)
      else reject(err)
    })
  })
})

addon.defineCatalogHandler(args => {
  return new Promise((resolve, reject) => {
    queue.push(args, (err, resp) => {
      if (resp) resolve(resp)
      else reject(err)
    })
  })
})

module.exports = addon.getInterface()
