# Stremio Kitsu Add-on

Do NOT install this add-on directly in Stremio, it was not made for that purpose.

The purpose of this add-on is to be used in other add-ons in order to provide a good source of anime metadata in Stremio.

How can this add-on help other anime add-ons? It's simple, just like Stremio's Cinemeta which creates movie / series pages based on IMDB ID, this add-on creates anime pages based on Kitsu ID.

Why not install it directly in Stremio then? This add-on can't be used exactly like Cinemeta because other add-ons depend on it and it's not installed by default for users, so other add-ons need to use it internally.


## Getting Metadata

**Because many anime websites don't differentiate between movies and series, you can also request movies with type "series" and the API will return the movie with 1 episode.**

You can request metadata from this add-on based on a Kitsu ID, for example:

```javascript
const needle = require('needle')

const kitsuEndpoint = 'https://addon.stremio-kitsu.cf'

const type = 'series' // can be movie or series
const id = 419 // kitsu id for mushishi

const url = kitsuEndpoint + '/meta/' + type + '/kitsu:' + id + '.json'

needle.get(url, (err, resp, body) => {
  if ((body || {}).meta)
    console.log(body.meta)
  else
    console.error(new Error('Could not get meta from kitsu api for: ' + id))
})
```

If you use `idPrefixes: ['kitsu:']` in your add-on manifest, you can also proxy the metadata directly:

```javascript
const needle = require('needle')

const kitsuEndpoint = 'https://addon.stremio-kitsu.cf'

addon.defineMetaHandler(args => {
  return new Promise((resolve, reject) => {
  	const url = kitsuEndpoint + '/meta/' + args.type + '/' + args.id + '.json'
    needle.get(url, (err, resp, body) => {
      if ((body || {}).meta)
        resolve(body)
      else
        reject(new Error('Could not get meta from kitsu api for: '+args.id))
    })
  })
})
```


## Matching anime to Kitsu ID

**Do not use this endpoint to replace your own add-on's search, it was not built for that, it returns few but very relevant results.**

Maybe you have anime metadata, but it doesn't provide a Kitsu ID. Then you can match your anime by title and type using search:

```javascript
const needle = require('needle')

const kitsuEndpoint = 'https://addon.stremio-kitsu.cf'

const animeMeta = {
	title: 'Mushishi',
	type: 'series'
}

const url = kitsuEndpoint + '/catalog/' + animeMeta.type + '/kitsu-search-' + animeMeta.type + '/search=' + encodeURIComponent(animeMeta.title) + '.json'

needle.get(url, (err, resp, body) => {
	// presuming the first result is the correct one
	const meta = ((body || {}).metas || [])[0]
	if (meta)
		console.log(meta)
	else
		console.error(new Error('No results from Kitsu for the title: ' + animeMeta.title))
})
```

Matching multiple items to Kitsu metadata:

```javascript
const needle = require('needle')
const async = require('async')

const kitsuEndpoint = 'https://addon.stremio-kitsu.cf'

function matchMetas(animeMetas) {
	return new Promise((resolve, reject) => {

		const results = []

		// create a queue worker with a concurrency of 1
		const metaQueue = async.queue((task, cb) => {
			const url = kitsuEndpoint + '/catalog/' + task.type + '/kitsu-search-' + task.type + '/search=' + encodeURIComponent(task.title) + '.json'
			needle.get(url, (err, resp, body) => {
				// presuming the first result is the correct one
				const meta = ((body || {}).metas || [])[0]
				if (meta)
					results.push(meta)
				else
					console.error(new Error('No results from Kitsu for the title: ' + task.title))
				cb()
			})
		}, 1)

		// what you want it to do after the queue ends
		metaQueue.drain = () => { resolve(results) }

		// add our requests to the queue
		animeMetas.forEach(meta => { metaQueue.push(meta) })

	})
}

matchMetas([
	{
		title: 'Mushishi',
		type: 'series'
	},
	{
		title: 'Spirited Away',
		type: 'movie'
	}
]).then(results => {
	console.log('Our results:')
	console.log(results)
})
```
