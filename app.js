var io = require('socket.io'),
	connect = require('connect');


var app = connect().use(connect.static('public')).listen(3000);
var node = io.listen(app);

// store player data
var pl_data = [];

var storeData = function(pl_name, pl_gold, pl_labor, pl_cook, pl_craftsmen, pl_ox, pl_horse, pl_zebra, pl_elephant) {
	if(pl_data.length < 6) {
		pl_data.push({name: pl_name, gold: pl_gold, labor: pl_labor, cook: pl_cook, craftsmen: pl_craftsmen, oxen: pl_ox, horse: pl_horse, zebra: pl_zebra, elephant: pl_elephant});
	}
}

// retirements data
var bought = [];

var storeRetirement = function(data) {

	bought.push({name: data.name, no: data.ret_no});

};

node.sockets.on('connection', function(client) {

	// check for maximum player
	var chk_user = pl_data.length;

	client.emit('check user', chk_user);

	// join player to the game
	client.on('join', function(data) {

		console.log(data);
		client.set('nickname', data.pl_name);
		storeData(data.pl_name, data.pl_gold, data.pl_labor, data.pl_cook, data.pl_craftsmen, data.pl_ox, data.pl_horse, data.pl_zebra, data.pl_elephant);
		console.log(data.pl_name + ' is joined!');
		client.broadcast.emit('message', data.pl_name);

		pl_data.forEach(function(datas){
			if(datas.name !== data.pl_name) {
				client.emit('player_list', datas);
				console.log(data.pl_name);
			}
		});

		client.broadcast.emit('player_list2', data);

	});

	// when a job is done
	client.on('job done', function(data) {
		client.broadcast.emit('pl_stats', {name: data.n, golds: data.g, labor: data.l, cook: data.c, craftsmen: data.cr, oxen: data.ox, horse: data.hr, zebra: data.zb, elephant:data.el});
	});

	// show retirements that are already purchased
	bought.forEach(function(data) {
		client.emit('show_retirement', {name: data.name, ret_no: data.no});
	});
	// when buy a retirement
	client.on('buy', function(data) {

		storeRetirement(data);

		client.broadcast.emit('bought', {name: data.name, ret_no: data.ret_no});

		console.log(bought);
	});
	
});