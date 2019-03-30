
module.exports = {
	logo: 'https://res-1.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco/v1483996064/bry24vyez4pkm83sojkl.png',
	endpoint: 'https://kitsu.io/api/edge',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36',
		'Accept': 'application/vnd.api+json',
		'Content-Type': 'application/vnd.api+json'
	},
	cacheTTL: {
		meta: 259200000, // 3 days
		search: 604800000 // 7 days
	},
	port: process.env.PORT || 8554
}