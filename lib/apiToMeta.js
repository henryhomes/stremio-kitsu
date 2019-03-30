const config = require('../config')

module.exports = (args, obj, included) => {
  const id = 'kitsu:' + obj.id
  const attr = obj.attributes || {}
  const startYear = attr.startDate ? attr.startDate.split('-')[0] : null
  const endYear = attr.endDate ? attr.endDate.split('-')[0] : null
  const type = attr.subtype == 'movie' ? 'movie' : 'series'
  const releaseInfo = type == 'movie' ? startYear : startYear && endYear && startYear != endYear ? startYear + '-' + endYear : startYear + '-'
  const meta = {
    id,
    name: (attr.titles || {}).en || attr.canonicalTitle,
    poster: (attr.poster || {}).small || 'https://media.kitsu.io/anime/poster_images/' + obj.id + '/small.jpg',
    background: (attr.coverImage || {}).original,
    description: attr.synopsis,
    logo: (attr.coverImage || {}).tiny,
    trailers: attr.youtubeVideoId ? [ { source: attr.youtubeVideoId, type: "Trailer" } ] : undefined,
    genres: (((obj.relationships || {}).genres || {}).data || []).map(genre => { return config.genres[genre.id] }),
    imdbRating: attr.averageRating ? attr.averageRating / 10 : 0,
    runtime: attr.episodeLength ? attr.episodeLength + ' min' : null,
    type,
    releaseInfo,
  }
  const episodeRel = new Date(attr.startDate).getTime()
  if (type == 'series') {
    const videos = []
    if (included && included.length) {
      let epNr = 1
      included.forEach(ep => {
        if (ep.type == 'episodes') {
          const epAttr = (ep.attributes || {})
          epNr = epAttr.number || epNr
          videos.push({
            id: id + ':' + epNr,
            name: epAttr.canonicalTitle || ('Episode #' + epNr),
            season: 1,
            episode: epNr,
            publishedAt: new Date(episodeRel + epNr)
          })
          epNr++
        }
      })
    }
    if (!videos.length && attr.episodeCount) {
      const totalEps = attr.episodeCount
      for (let i = 1; i <= totalEps; i++) {
        videos.push({
          id: id + ':' + i,
          name: 'Episode #' + i,
          season: 1,
          episode: i,
          publishedAt: new Date(episodeRel + i)
        })
      }
    }
    meta.videos = videos
  } else if (type == 'movie' && args.type == 'series') {
    // create 1 episode for the stream
    meta.type = 'series'
    meta.videos = [
      {
        id: id + ':1',
        title: 'Movie',
        season: 1,
        episode: 1,
        publishedAt: new Date(episodeRel)
      }
    ]
  }
  return meta
}
