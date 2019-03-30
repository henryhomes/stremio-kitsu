const redis = require('redis').createClient({
  host: 'redis-15278.c81.us-east-1-2.ec2.cloud.redislabs.com',
  port: 15278,
  password: process.env.REDIS_PASS
})

redis.on('error', err => { console.error('Redis error', err) })

module.exports = {
	get: (key, cb) => {
	  redis.get(key, (err, redisRes) => {

	    if (!err && redisRes) {
	      let redisData
	      try {
	        redisData = JSON.parse(redisRes)
	      } catch(e) {
	        console.log('Redis error')
	        console.error(e)
	      }
	      if (redisData)
	        cb(null, redisData)
	      else
	      	cb(new Error('No redis result'))
	    } else
	    	cb(err || new Error('Unknown Redis Error'))
	  })
	},
	set: (key, data, ttl) => {
		redis.setex(key, ttl / 1000, JSON.stringify(data))
	}
}
