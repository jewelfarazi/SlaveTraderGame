$(document).ready(function() {

	// Players primary resources
	var player = {

		pl_name : false,
		pl_gold : 65,
		pl_laborer : 2,
		pl_cook : 3,
		pl_craftsmen : 5,
		pl_animals: {
			pl_ox : 1,
			pl_horse : 2,
			pl_zebra : 3,
			pl_elephant : 4
		}

	};

	// get user name from url
	function getParam( name )
	{
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	 	var regexS = "[\\?&]"+name+"=([^&#]*)";
	 	var regex = new RegExp( regexS );
	 	var results = regex.exec( window.location.href );
	 	if( results == null )
	  		return "";
		else
	 	return results[1];
	}

	//var nickname = '';
	//nickname = getParam( 'player' );

	// setting up the default values for player
	$('.l_count h1').html(player.pl_laborer);
	$('.c_count h1').html(player.pl_cook);
	$('.cr_count h1').html(player.pl_craftsmen);
	$('.g_count h1').html(player.pl_gold);
	$('h6.a_oxen').html(player.pl_animals.pl_ox);
	$('h6.a_horse').html(player.pl_animals.pl_horse);
	$('h6.a_zebra').html(player.pl_animals.pl_zebra);
	$('h6.a_elephant').html(player.pl_animals.pl_elephant);


	// socket.io connection
	var server = io.connect('http://localhost');
	
	// joining to the game
	server.on('check user', function(data) {

		if(parseInt(data) < 6) {
			nickname = prompt("What is your nickname?");
			if(nickname !== '' && nickname !== null) {
				$('#welcome').html('Welcome ' + nickname + '!');
				player.pl_name = nickname;

			server.emit('join', {pl_name: nickname, pl_gold: player.pl_gold, pl_labor: player.pl_laborer, pl_cook: player.pl_cook, pl_craftsmen:player.pl_craftsmen, pl_ox: player.pl_animals.pl_ox, pl_horse: player.pl_animals.pl_horse, pl_zebra: player.pl_animals.pl_zebra, pl_elephant: player.pl_animals.pl_elephant});
			} else {
				alert('You don\'t have a name!');
			} 
			
		} else {
			alert('Game is full!');
		}
		
	});
	
	// list of joined player
	server.on('player_list', function(data) {
		$('.players_box').append('<div class="player"><h3>'+data.name+'</h3><ul><li><span id="'+data.name+'_l">'+data.labor+'</span> Laborers</li><li><span id="'+data.name+'_c">'+data.cook+'</span> Cooks</li><li><span id="'+data.name+'_cr">'+data.craftsmen+'</span> Craftsmen</li><li><span id="'+data.name+'_hr">'+data.horse+'</span> Horses</li></ul><div class="pl_gold"><h5><span id="'+data.name+'_g">'+data.gold+'</span></h5></div></div>');
		console.log(data);
	});
	// after joining the game
	server.on('player_list2', function(data) {
		$('.players_box').append('<div class="player"><h3>'+data.pl_name+'</h3><ul><li><span id="'+data.pl_name+'_l">'+data.pl_labor+'</span> Laborers</li><li><span id="'+data.pl_name+'_c">'+data.pl_cook+'</span> Cooks</li><li><span id="'+data.pl_name+'_cr">'+data.pl_craftsmen+'</span> Craftsmen</li><li><span id="'+data.pl_name+'_hr">'+data.pl_horse+'</span> Horses</li></ul><div class="pl_gold"><h5><span id="'+data.pl_name+'_g">'+data.pl_gold+'</span></h5></div></div>');
		console.log(data);
	});

	server.on('pl_stats', function(data) {
		console.log(data);
		$('#'+data.name+'_l').html(data.labor);
		$('#'+data.name+'_c').html(data.cook);
		$('#'+data.name+'_cr').html(data.craftsmen);
		//$('#'+data.name+'_ox').html(data.oxen);
		$('#'+data.name+'_hr').html(data.horse);
		//$('#'+data.name+'_zb').html(data.zebra);
		//$('#'+data.name+'_el').html(data.oxen);
		$('#'+data.name+'_g').html(data.golds);
	});

	// varibales for opening two job each day turn
	var a = 99;
	var b = 100;
	// Finish turn 
	$('#day_finish').click(function(){

		if($('#jobs').hasClass('dayoff')) {
			notif('Please wait for the next day!');
		} else {
			a -= 2;
			b -= 2;

			$('#job-list li').eq(b).removeClass('hide');
			$('#job-list li').eq(a).removeClass('hide');

			$('#jobs').addClass('dayoff');
		}

		return false;
	});

	function notif(text) {
		$('.notification').html('<p>'+text+'</p>');
		$('.notification').slideDown(function() {
			$(this).delay(2000).slideUp(function() {
				$(this).hide();
			});
		});
	}

	// job functions
	$('#jobs li').bind('click', function() {

		if($('#jobs').hasClass('dayoff')) {
			notif('Please wait for the next day!');
		} else {
			var job_done = $(this).find('img').attr('alt');
			//alert(job_done);
			switch(job_done) {
				case "Job 2":
					if(player.pl_laborer >= 1) {
						player.pl_laborer -= 1;
						player.pl_gold += 7;
						$('.l_count h1').html(player.pl_laborer);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 3":
					// Requires 3 Slaves
					var slv3 = player.pl_laborer + player.pl_cook + player.pl_craftsmen;
					
					if(slv3 >= 3) {
						//player.pl_laborer -= 1;
						player.pl_gold += 10;
						$('.l_count h1').html(player.pl_laborer);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 4":
					if(player.pl_cook >= 3 && player.pl_laborer >= 1) {
						player.pl_cook -= 3;
						player.pl_laborer -= 1;
						player.pl_gold += 17;
						$('.c_count h1').html(player.pl_cook);
						$('.l_count h1').html(player.pl_laborer);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 5":
					if(player.pl_cook >= 5) {
						player.pl_cook -= 5;
						player.pl_gold += 25;
						$('.l_count h1').html(player.pl_cook);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 6":
					if(player.pl_cook >= 2 && player.pl_laborer >= 2) {
						player.pl_cook -= 2;
						player.pl_laborer -= 2;
						player.pl_gold += 16;
						$('.c_count h1').html(player.pl_cook);
						$('.l_count h1').html(player.pl_laborer);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 7":
					if(player.pl_laborer >= 3) {
						player.pl_laborer -= 3;
						player.pl_gold += 10;
						$('.l_count h1').html(player.pl_laborer);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 8":
					// Requires 3 Slaves
					var slv3 = player.pl_laborer + player.pl_cook + player.pl_craftsmen;
					
					if(slv3 >= 3) {
						player.pl_laborer -= 3;
						player.pl_gold += 10;
						$('.l_count h1').html(player.pl_laborer);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 9":
					// Requires 3 Slaves
					var slv3 = player.pl_laborer + player.pl_cook + player.pl_craftsmen;
					
					if(slv3 >= 3) {
						player.pl_laborer -= 3;
						player.pl_gold += 12;
						$('.l_count h1').html(player.pl_laborer);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 10":
					if(player.pl_animals.pl_ox >= 1 && player.pl_laborer >= 5 && player.pl_cook >= 1) {
						player.pl_animals.pl_ox -= 1;
						player.pl_laborer -= 5;
						player.pl_cook -= 1;
						player.pl_gold += 28;
						$('.a_oxen h6').html(player.pl_animals.pl_ox);
						$('.l_count h1').html(player.pl_laborer);
						$('.c_count h1').html(player.pl_cook);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 11":
					// need extra functionality
					break;
				case "Job 12":
					if(player.pl_animals.pl_zebra >= 1) {
						player.pl_animals.pl_zebra -= 1;
						player.pl_gold += 10;
						$('.a_zebra h6').html(player.pl_animals.pl_zebra);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 13":
					// requires 5 slaves [more functionality]
					break;
				case "Job 14":
					// requires 1 slaves [more functionality]
					break;
				case "Job 15":
					if(player.pl_cook >= 4) {
						player.pl_cook -= 4;
						player.pl_gold += 17;
						$('.c_count h1').html(player.pl_cook);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 16":
					if(player.pl_craftsmen >= 1) {
						player.pl_craftsmen -= 1;
						player.pl_gold += 6;
						$('.cr_count h1').html(player.pl_craftsmen);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 17":
					if(player.pl_laborer >= 3 && player.pl_craftsmen >= 3 && player.pl_cook >= 1) {
						player.pl_laborer -= 3;
						player.pl_craftsmen -= 3;
						player.pl_cook -= 1;
						player.pl_gold += 28;
						$('.l_count h1').html(player.pl_laborer);
						$('.cr_count h1').html(player.pl_craftsmen);
						$('.c_count h1').html(player.pl_cook);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 18":
					// requires 2 slaves [more functionality]
					break;
				case "Job 19":
					if(player.pl_laborer >= 3) {
						player.pl_laborer -= 3;
						player.pl_gold += 10;
						$('.l_count h1').html(player.pl_laborer);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				case "Job 20":
					// requires 2 slaves [more functionality]
					break;
				case "Job 21":
					// requires 2 slaves [more functionality]
					break;
				case "Job 22":
					if(player.pl_craftsmen >= 2) {
						player.pl_craftsmen -= 2;
						player.pl_gold += 10;
						$('.cr_count h1').html(player.pl_craftsmen);
						$('.g_count h1').html(player.pl_gold);
						server.emit('job done', {n:nickname, g:player.pl_gold, l:player.pl_laborer, c: player.pl_cook, cr: player.pl_craftsmen, ox: player.pl_animals.pl_ox, hr: player.pl_animals.pl_horse, zb: player.pl_animals.pl_zebra, el: player.pl_animals.pl_elephant});
						notif("You have successfully done this job!");
						$(this).delay(2000).fadeOut('slow');
					} else {
						notif("Sorry, your slaves is not enough to do this job!");
					}
					break;
				default:
					break;
			}
			
			
		}

		return false;
	});	
	// End players job codes

	// Start retirement codes
	// if page is reloaded then show retirements that already purchased
	server.on('show_retirement', function(data) {

		$('#retirements li').eq(data.ret_no).find('.retirement').addClass('br');
		$('#retirements li').eq(data.ret_no).find('.bought').text(data.name);

	});

	// buy retirements notifications
	server.on('bought', function(data) {
		//alert(data);
		$('#retirements li').eq(data.ret_no).find('.retirement').addClass('br');
		$('#retirements li').eq(data.ret_no).find('.bought').text(data.name);

		//bought notif
		switch(data.ret_no) {
			case 0:
				$('.notification').html('<p>' + data.name +' just bought Candle Factory!</p>');
				$('.notification').slideDown(function() {
					$(this).delay(2000).slideUp();
				});
				break;
			case 1:
				$('.notification').html('<p>' + data.name +' just bought Inn!</p>');
				$('.notification').slideDown(function() {
					$(this).delay(2000).slideUp();
				});
				break;
			case 2:
				$('.notification').html('<p>' + data.name +' just bought Chicken Farm!</p>');
				$('.notification').slideDown(function() {
					$(this).delay(2000).slideUp();
				});
				break;
			case 3:
				$('.notification').html('<p>' + data.name +' just bought 5 Star Restaurant!</p>');
				$('.notification').slideDown(function() {
					$(this).delay(2000).slideUp();
				});
				break;
			case 4:
				$('.notification').html('<p>' + data.name +' just bought Slum Lord!</p>');
				$('.notification').slideDown(function() {
					$(this).delay(2000).slideUp();
				});
				break;
			case 5:
				$('.notification').html('<p>' + data.name +' just bought Hotel!</p>');
				$('.notification').slideDown(function() {
					$(this).delay(2000).slideUp();
				});
				break;
			case 6:
				$('.notification').html('<p>' + data.name +' just bought 5 Star Restaurant Large!</p>');
				$('.notification').slideDown(function() {
					$(this).delay(2000).slideUp();
				});
				break;
			case 7:
				$('.notification').html('<p>' + data.name +' just bought Private Island!</p>');
				$('.notification').slideDown(function() {
					$(this).delay(2000).slideUp();
				});
				break;
			default:
				break;
		}
		
	});


	// Retirements functionalities
	$('.retirement').bind('click', function(event) {

		var userName = player.pl_name;
		
		switch($(this).parent('#retirements li').index()) {

			case 0:
				
				if($(this).hasClass('br')) {
					$('.notification').html('<p>This item already sold, please try another!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					
				} else {
					if(player.pl_gold >= 50) {
						$(this).addClass('br');
						$(this).find('.bought').text(userName);
						$('.notification').html('<p>You just bought Candle Factory!</p>');
						$('.notification').slideDown(function() {
							$(this).delay(2000).slideUp();
						});
						player.pl_gold -= 50;
						$('.g_count h1').html(player.pl_gold);
						server.emit('buy', {name: userName, ret_no: 0});
						console.log(player.pl_gold);
					} else {
						$('.notification').html('<p>Sorry, your golds is not enough to buy this retirement!</p>');
						$('.notification').slideDown(function() {
							$(this).delay(2000).slideUp();
						});
					}
					
				}

				break;
			case 1:
				if($(this).hasClass('br')) {
					$('.notification').html('<p>This item already sold, please try another!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					
				} else {
					$(this).addClass('br');
					$(this).find('.bought').text(userName);
					$('.notification').html('<p>You just bought Inn!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp(); 
					});
					server.emit('buy', {name: userName, ret_no: 1});
				}
				break;
			case 2:
				if($(this).hasClass('br')) {
					$('.notification').html('<p>This item already sold, please try another!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					
				} else {
					$(this).addClass('br');
					$(this).find('.bought').text(userName);
					$('.notification').html('<p>You just bought Chicken Farm!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					server.emit('buy', {name: userName, ret_no: 2});
				}
				break;
			case 3:
				if($(this).hasClass('br')) {
					$('.notification').html('<p>This item already sold, please try another!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					
				} else {
					$(this).addClass('br');
					$(this).find('.bought').text(userName);
					$('.notification').html('<p>You just bought 5 Star Restaurant!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					server.emit('buy', {name: userName, ret_no: 3});
				}
				break;
			case 4:
				if($(this).hasClass('br')) {
					$('.notification').html('<p>This item already sold, please try another!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					
				} else {
					$(this).addClass('br');
					$(this).find('.bought').text(userName);
					$('.notification').html('<p>You just bought Slum Lord!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					server.emit('buy', {name: userName, ret_no: 4});
				}
				break;
			case 5:
				if($(this).hasClass('br')) {
					$('.notification').html('<p>This item already sold, please try another!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					
				} else {
					$(this).addClass('br');
					$(this).find('.bought').text(userName);
					$('.notification').html('<p>You just bought Hotel!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					server.emit('buy', {name: userName, ret_no: 5});
				}
				break;
			case 6:
				if($(this).hasClass('br')) {
					$('.notification').html('<p>This item already sold, please try another!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					
				} else {
					$(this).addClass('br');
					$(this).find('.bought').text(userName);
					$('.notification').html('<p>You just bought 5 Star Restaurant!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					server.emit('buy', {name: userName, ret_no: 6});
				}
				break;
			case 7:
				if($(this).hasClass('br')) {
					$('.notification').html('<p>This item already sold, please try another!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					
				} else {
					$(this).addClass('br');
					$(this).find('.bought').text(userName);
					$('.notification').html('<p>You just bought Private Island!</p>');
					$('.notification').slideDown(function() {
						$(this).delay(2000).slideUp();
					});
					server.emit('buy', {name: userName, ret_no: 7});
				}
				break;
			default:
				alert('Please select something!');
				break;
		}

		return false;
	});
	// End retirement codes

	$('#j').click(function() {
		$('#pl-jobs').fadeIn();

		$('#pl-retirements, #pl-auctions').hide();

		return false;
	});

	$('#r, #rt-box').click(function() {
		$('#pl-retirements').fadeIn();

		$('#pl-jobs, #pl-auctions').hide();

		return false;
	});

	$('#a').click(function() {
		$('#pl-auctions').fadeIn();

		$('#pl-retirements, #pl-jobs').hide();

		return false;
	});

});