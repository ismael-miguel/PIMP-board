(function(window, undefined){

	var chat = document.getElementById("chat");
	var input = document.getElementById("input");
	var send = document.getElementById("sayit-button");
	var subscribedStorage = "SIRPYTHON_PIMPBOT_SUBSCRIBED";
	var pimpedStorage = "SIRPYTHON_PIMPBOT_PIMPED";
	var bannedStorage = "SIRPYTHON_PIMPBOT_BANNED";
	var subscribed = localStorage.getItem(subscribedStorage) || '';
	var pimped = localStorage.getItem(pimpedStorage) || '';
	var banned = localStorage.getItem(bannedStorage) || '';
	
	if(!subscribed) {
		localStorage.setItem(subscribedStorage, "{\"_length\":0}");
		subscribed = {_length:0};
	} else {
		subscribed = JSON.parse(subscribed);
	}
	if(!pimped) {
		localStorage.setItem(pimpedStorage, "{\"_length\":0}");
		pimped = {_length:0};
	} else {
		pimped = JSON.parse(pimped);
	}
	if(!banned) {
		localStorage.setItem(bannedStorage, "{}");
		banned = {};
	} else {
		banned = JSON.parse(banned);
	}

	var commands = {
		"subscribe": function (user, args) {
			if(subscribed.hasOwnProperty(user) && !args.length) {
				sendTo("You are already subscribed.", user);
			} else {
				if(!subscribed.hasOwnProperty(user)) {
					addToSubscribed(user);
				}
				for(var i = 0, length = args.length; i < args.length; i++) {
					args[i] = args[i].toLowerCase();
					subscribed[user][args[i]] = 1;
				}
				setSubscribedList(subscribed);
				sendTo("You have been successfully subscribed. Currently subscribed users: " + subscribed._length, user);
			}
		},
		"unsubscribe": function (user, args) {
			if(!subscribed.hasOwnProperty(user)) {
				sendTo("You need to be subscribed to `unsubscribe`.", user);
			} else {
				if(!args.length) {
					removeFromSubscribed(user);
					sendTo("You have been successfully unsubscribed. Currently subscribed users: " + subscribed._length, user);
				} else {
					for(var i = 0, length = args.length; i < length; i++) {
						args[i] = args[i].toLowerCase();
						delete subscribed[user][args[i]];
					}
					setSubscribedList(subscribed);
					sendTo("You unsubscribed from the tag(s) [tag:" +  args.join("][tag:")  + "]", user);
				}
			}
		},
		/*"pimp": function (message) {
			var messageParts = message.content.match(/^pimp ([qa]) ([1-9]\d*)(?: ((?:\w[\w\d\-]+(?: |$))*)(?:"([^"]+)")?)?$/);
			var id = messageParts ? messageParts[2] : false;
			
			if( !messageParts ) {
				sendTo("",message.user);
			} else if(!isSubscribed(message.user)) {
				sendTo("You must be subscribed to pimp here.", message.user);
			} else if(wasPimped(messageParts[2])) {
				sendTo("That post has already been pimped today.", message.user);
			} else {
				addToPimped(messageParts[2]);
				var groupMessage = "";
				//users 
				var subscribed = getSubscribedUsers(messageParts[3] || '', message.user);
				var qa = (messageParts[1] == "q" ? "q" : "a")
				for(var i = 0, length = subscribed.length; i < length; i++) {
					groupMessage += ("@" + subscribed[i] + " ");
				}
				
				groupMessage += (messageParts[4] ? "\r\n" + messageParts[4] : '');
				
				sendMessage(groupMessage);
				window.setTimeout(function() {
					sendMessage("http://codereview.stackexchange.com/" + qa + "/" + messageParts[2]);
				}, 4000); // to prevent the chat from blocking the message due to it being sent too early
			}
		},*//*
		"pimp": function(user, args) {
			var qa = args[0];
			var id = args[1];
			var tags = [];
			var message = "";

			for(var i = 2, length = args.length; i < length; i++) {
				if(args[i][0] != '"') { // if we are not on the message part yet (the first character of the message part is a ")
					tags.push(args[i].toLowerCase()); //tags don't have casing
				} else {
					message = args[i];
				}
			}

			if( !/^[qa]$/.test(qa) || !id ) {
				commands["help"](user, ["pimp"]);
			} else {
				addToPimped(id);
				var groupMessage = "";

				var users = getSubscribedUsers(tags, user);
				for(var i = 0, length = users.length; i < length; i++) {
					groupMessage += "@" + users[i] + " ";
				}

				groupMessage += (message ? "\r\n" + message : "");
				sendMessage(groupMessage);

				window.setTimeout(function() {
					sendMessage("http://codereview.stackexchange.com/" + qa + "/" + id);
				}, 4000); // to prevent the chat from blocking the message due to it being sent too early
			}
		},*/
		"pimp": function(user, args) {
			var qa = args[0];
			var id = args[1];
			var message = args[2] && args[2][0] == '"' ? args[2] : "";

			if( args.length > 3 ) {
				
				sendTo("**Warning**: The tag list isn't required anymore! Please, remove it next time!", user);
				
				//Just fetch the message from the end, if tag are passed
				message = args[args.length-1][0] == '"' ? args[args.length-1] : "";
				
			}

			if( !/^[qa]$/.test(qa) || !id ) {
				commands["help"](user, ["pimp"]);
			} else {
				
				var xhr=new XMLHttpRequest();
				
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4 && xhr.status == 200) {
						var data = JSON.parse(xhr.responseText);
						
						addToPimped(id);
						var groupMessage = "";

						var users = getSubscribedUsers(data.items[0].tags, user);
						for(var i = 0, length = users.length; i < length; i++) {
							groupMessage += "@" + users[i] + " ";
						}

						groupMessage += (message ? "\r\n" + message : "");
						
						sendMessage(groupMessage);

						window.setTimeout(function() {
							sendMessage("http://codereview.stackexchange.com/" + qa + "/" + id);
						
							//currently, answers don't show the tag list.
							window.setTimeout(function() {
								if( qa == 'a' ) {
									sendMessage("[tag:" + data.items[0].tags.join("] [tag:") + "]");
								}
							}, 2000);
							
						}, 4000); // to prevent the chat from blocking the message due to it being sent too early
					} else if(xhr.readyState==4) {
						sendTo("An error occurred when loading the tags to the id " + id, user);
					}
				}
				switch( qa ) {
					case 'q':
						xhr.open("GET","https://api.stackexchange.com/2.2/questions/" + id + "?order=desc&sort=activity&site=codereview&filter=!Frv9SENgPho8ZP2n*gFopr8oO-",true);
						break;
					case 'a':
						xhr.open("GET","https://api.stackexchange.com/2.2/answers/" + id + "?order=desc&sort=activity&site=codereview&filter=!Fcazzsr2b3L9VFDprzwqyqL-af",true);
						break;
				}
				xhr.send();
			}
		},
		"tags": function(user) {
			if(subscribed.hasOwnProperty(user)) {
				if(isEmpty(subscribed[user])) {
					sendTo("Currently, you are subscribed to all tags.", user);
				} else {
					var markdown = "Subscribed tags: ";
					for(var tag in subscribed[user]) {
						if(subscribed[user].hasOwnProperty(tag)) {
							markdown += " [tag:" + tag + "]";
						}
					}
					sendTo(markdown, user);
				}
			} else {
				sendTo("You need to be subscribed to view the tag list. Write `help subscribe` for more info.", user);
			}
		},
		"hello": function(user){//ignore arguments
			sendTo("Hello ", user);
		},
		//undocumented!
		"ban": function(user, args){
			if( isSU(user) ) {
				var reason = '';
				if(args[args.length-1][0] == '"') {
					reason = args.pop();
				}
				
				for(var i = 0, length = args.length; i < length; i++ ) {
					banned[args[i]] = reason;
					removeFromSubscribed(args[i]);
				}
				sendTo("New bans: " + args, user);
				setBannedList(banned);
			}
		},
		"unban": function(user, args){
			if( isSU(user) ) {
				for(var i = 0, length = args.length; i < length; i++ ) {
					delete banned[args[i]];
				}
				sendTo("Unbanned: " + args, user);
				setBannedList(banned);
			}
		},
		"banned": function(user){
			if(isEmpty(banned)) {
				sendTo("So far, no user had been banned", user);
			} else {
				var bans = "";
				for(var ban in banned) {
					if(banned.hasOwnProperty(ban)) {
						bans += " " + ban + (banned[ban] ? " (*" + banned[ban] + "*)" : "" ) ;
					}
				}
				sendTo("Banned: " + bans, user);
			}
		},
		"all": function(user, args){
			if( args.length && isSU(user)) {
				var users = "";
				for(var name in subscribed) {
					if(name != "_length" && subscribed.hasOwnProperty(name) && name != user) {
						users += "@" + name + " ";
					}
				}
				sendMessage(users + "\r\nMessage from " + user + ": " + args[0]);
			}
		},
		"kill": function(user, args){
			if(isSU(user)) {
				clearInterval(interval);
				sendMessage("*Bot*: Goodbye cruel world!" + (args[0] ? "\r\nMy last words: " + args[0] : ""));
				setBannedList(banned);
				setPimpedList(pimped);
				setSubscribedList(subscribed);
			}
		},
		//-------------
		"help": function(user, args) {
			var topics = {
				"":[
					"Commands:",
					"- `help` - Displays this help or help to a command",
					"- `pimp` - Pimps a post by pinging subscribed users",
					"- `subscribe` - Subscribes you to a list of tags or all",
					"- `unsubscribe` - Unsubscribes you from a list of tags or all",
					"- `tags` - Lists the subscribed tags",
					"- `hello` - Simply says 'Hello' to you",
					"- `banned` - List banned users"
				],
				"help": [
					"`help` is used to obtain help about a command",
					"You can pass any command name as the single parameter",
					"Try writting `help pimp`",
				],
				"subscribe": [
					"`subscribe` allows you to be pinged when a question or answer is `pimp`ed.",
					"You can pass a list of tags, separated by space, that you want to be subscribed to.",
					"If you don't pass any parameter, you are subscribed to all tags"
				],
				"unsubscribe": [
					"`unsubscribe` removes you from the list to be pinged when a question or answer is `pimp`ed.",
					"You can pass a list of tags, separated by space, that you want to be unsubscribed of.",
					"If you unsubscribe all your tags, by providing a list, you'll **subscribe** to all tags",
					"*Passing a list of tags won't have any effect when subscribed to all tags!*",
					"To unsubscribe entirelly, write `unsubscribe` without arguments"
				],
				"tags": [
					"`tags` lists all the tags you're subscribed to.",
					"All the tags will have a nice link to visit it."
				]/*,
				"pimp": [
					"`pimp` is used to send a notification",
					"The `pimp` command has the following format:",
					"`pimp q|a <id> <optional tag list> <\"Optional message\">`",
					"Example: `pimp a 012345`, `pimp q 012345 sql \"Question 12345\"`"
				]*/,
				"pimp": [
					"`pimp` is used to send a notification",
					"The `pimp` command has the following format:",
					"`pimp q|a <id> <\"Optional message\">`",
					"Example: `pimp a 012345`, `pimp q 012345 \"Question 12345\"`",
					"Notice: The tag list was removed! It is now fetched automatically."
				],
				"hello": "Simply says 'Hello', to check functionality.",
				"banned": [
					"Lists all banned users.",
					"Only IsmaelMiguel, SirPython and SirAlfred (maybe some mods in the future) can change users.",
					"You will be unsubscribed automatically when banned."
				]
			};
			
			if( args.length && !topics.hasOwnProperty(args[0]) ) {
				sendTo("`help` - Couldn't find help for the command `'" + args[0] + "'`", user);
			} else {
				sendTo(topics[args[0] || ''], user);
			}
		}
	}

	/**
		Checks if a given object is empty
	*/
	function isEmpty(object) {
		//if it iterated, it isn't empty
		for(var k in object) {
			if( object.hasOwnProperty(k) ) {
				return false;
			}
		}
		return true;
	}

	/**
		Returns the last chat message spoken
	*/
	function getLastMessage() {
		var message = chat.lastElementChild;
		if(message.id=="silence-note") {
			message = message.previousSibling;
		}
		try {
			return {
				content: message.children[1].lastElementChild.children[1].innerHTML,
				user: message.children[0].children[2].innerHTML.replace(/ /g,'')
			};
		}
		catch(e){
			return {
				content: "",
				user: ""
			};
		}
	}

	// ---------- Chat functions ----------
	/**
		Sends a message to chat
	*/
	function sendMessage(message) {
		setTimeout(function(){
			input.value = message;
			send.click();
		},3000);
	}
	/**
		Sends a message @ a user
	*/
	function sendTo(message, user) {
		//maybe it is an array? if so, it must be a multi-line string
		if( 'string' !== (typeof message) && message.join ) {
			message = message.join("\r\n");
		}
		sendMessage("@" + user + " " + message);
	}
	// ---------- Subscribed list functions ----------
	/**
		Returns an object representing the subscribed list from storage
	*/
	function getSubscribedList() {
		return JSON.parse(localStorage.getItem(subscribedStorage));
	}
	/**
		Sets an object representing the subscribed list to storage
	*/
	function setSubscribedList(newList) {
		setTimeout(function(){
			localStorage.setItem(subscribedStorage, JSON.stringify(newList));
		},10);
	}
	/**
		Adds a user to the subscribed list
	*/
	function addToSubscribed(user) {
		subscribed[user] = {};
		subscribed._length++;
		setSubscribedList(subscribed);
	}
	/**
		Removes a user from the subscribed list
	*/
	function removeFromSubscribed(username) {
		delete subscribed[username];
		subscribed._length--;
		setSubscribedList(subscribed);
	}
	/**
		Returns if a user is subscribed
	*/
	function isSubscribed(username) {
		return getSubscribedList().hasOwnProperty(username);
	}
	/**
		Returns all the subscribed users
	*/
	function getSubscribedUsers(tags, ignore) {
		var users = [];
		for(var user in subscribed) {
			if( user != '_length' && subscribed.hasOwnProperty(user) && ignore != user ) {
				// Are we sure we want the || !tags.length part? This could become abusive if people pimp without including tags
				if( !tags.length || isEmpty(subscribed[user]) ) {
					users.push(user);
				} else {
					for(var i = 0, length = tags.length; i < length; i++) {
						if( subscribed[user].hasOwnProperty(tags[i]) ) {
							users.push(user);
							break;
						}
					}
				}
			}
		}
		return users;
	}
	// ---------- Pimped list functions ----------
	/**
		Returns an object representing the pimped list from storage
	*/
	function getPimpedList() {
		return JSON.parse(localStorage.getItem(pimpedStorage));
	}
	/**
		Sets an object representing the pimped list to storage
	*/
	function setPimpedList(newList) {
		localStorage.setItem(pimpedStorage, JSON.stringify(newList));
	}
	/**
		Adds an ID to the pimped list
	*/
	function addToPimped(id) {
		var pimped = getPimpedList()
		pimped[id] = true;
		setPimpedList(pimped);
	}
	/**
		Returns if an ID has been pimped
	*/
	function wasPimped(id) {
		return getPimpedList().hasOwnProperty(id);
	}
	/**
		Sets an object representing the banned list to storage
	*/
	function setBannedList(newList) {
		localStorage.setItem(bannedStorage, JSON.stringify(newList));
	}
	/**
		Returns true if a user is allowed to have super control on the bot
	*/
	function isSU(user) {
		return /^IsmaelMiguel|Sir(?:Python|Alfred)$/.test(user);
	}
	

	function main() {
		var message = getLastMessage();
		if( message.content && commands.hasOwnProperty(message.content.split(" ")[0]) ) {
			var args = message.content.match(/("([^"]*|\\")*"$|\b\d+|\b\w[\w\d\-.#+]*)/g);

			if( banned.hasOwnProperty(message.user) ) {
				sendTo("**You have been banned and can't use the bot anymore!**" + ( banned[message.user] ? " Reason: " + banned[message.user] : "" ), message.user);
			} else if(message.user != "SirAlfred" && args) {
				if(commands.hasOwnProperty(args[0])) {
					commands[args.shift()](message.user, args || []);
				}
			}
		}
	}

	main();
	var interval = setInterval(main, 5000);
	
	sendMessage("*Bot*: Greetings. If you need any help on how to use me, write `help` in a message.");
	
	//exposes BOT API, in case someone blocks the messages
	window.BOT = {
		"kill": function() {
			if( arguments[0] ) {
				commands.kill('SirAlfred', ['"' + arguments[0] + '"']);
			} else {
				commands.kill('SirAlfred');
			}
		},
		"ressurect": function() {
			sendMessage("*Bot*: I'm back from the dead! If you need any help on how to use me, write `help` in a message.");
			interval = setInterval(main, 5000);
		},
		"ban": function() {
			var args = Array.prototype.slice.call(arguments);
			commands.ban('SirAlfred', args);
		},
		"banned": function() {
			commands.banned('SirAlfred');
		},
		"unban": function() {
			var args = Array.prototype.slice.call(arguments);
			commands.unban('SirAlfred', args);
		},
		"all": function() {
			var args = Array.prototype.slice.call(arguments);
			commands.all('SirAlfred', args);
		},
		"getSubscribed": function() {
			return subscribed;
		},
		"getPumped": function() {
			return pumped;
		},
		"getBanned": function() {
			return banned;
		},
		"subscribe": function() {
			var args = Array.prototype.slice.call(arguments);
			commands.subscribe(args.shift(),args);
		},
		"unsubscribe": function() {
			var args = Array.prototype.slice.call(arguments);
			commands.unsubscribe(args.shift(),args);
		},
		"tags": function() {
			var args = Array.prototype.slice.call(arguments);
			commands.unsubscribe(args.shift(),args);
		}
	};

})(Function('return this')());
