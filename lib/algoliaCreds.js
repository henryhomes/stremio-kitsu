
function btoa(str) {
  return Buffer.from(str.toString(), 'binary').toString('base64')
}

const algolia = {
	id: 'AWQO5J657S',
	key: '7618096f484ca4f346b3373ffaa669ddfb6e35b7edd230e0b39f49600db8e790restrictIndices=production_media&filters=NOT+ageRating%3AR18'
}

algolia.query = [
  ['x-algolia-agent', 'Algolia for vanilla JavaScript (lite) 3.27.1'],
  ['x-algolia-application-id', algolia.id],
  ['x-algolia-api-key', encodeURIComponent(btoa(algolia.key))]
]

const queryString = '?' + algolia.query.map(el => { return el.join('=') }).join('&')

algolia.url = 'https://' + algolia.id.toLowerCase() + '-dsn.algolia.net/1/indexes/production_media/query' + queryString

algolia.post = search => {
  return '{"params":"query=' + encodeURIComponent(search) + '&attributesToRetrieve=' + encodeURIComponent('["id","slug","kind","canonicalTitle","titles","posterImage","subtype","posterImage"]') + '&hitsPerPage=4"}'
}

algolia.headers = {
  'accept': 'application/json',
  'content-type': 'application/x-www-form-urlencoded',
  'Origin': 'https://kitsu.io',
  'Referer': 'https://kitsu.io/explore/anime',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
}

module.exports = algolia
