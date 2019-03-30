module.exports = (args, obj) => {
  const type = obj.subtype == 'movie' ? 'movie' : obj.subtype == 'TV' ? 'series' : false
  return type == args.type
}
