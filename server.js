var connect = require('connect'),
	app = connect().use(connect.static('public')).listen(3000),
	socket = require('./app')(app);