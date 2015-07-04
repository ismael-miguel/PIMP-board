(function(window, undefined){

	var chat = document.getElementById("chat");
	var input = document.getElementById("input");
	var send = document.getElementById("sayit-button");
	var subscribedStorage = "SIRPYTHON_PIMPBOT_SUBSCRIBED";
	var pimpedStorage = "SIRPYTHON_PIMPBOT_PIMPED";
	var subscribed = localStorage.getItem(subscribedStorage) || '';
	var pimped = localStorage.getItem(pimpedStorage) || '';
	
	if(!subscribed) {
		localStorage.setItem(pimpedStorage, "{\"_length\":0}");
		localStorage.setItem(subscribedStorage, "{\"_length\":0}");
		pimped = {_length:0};
		subscribed = {_length:0};
	} else {
		pimped = JSON.parse(pimped);
		subscribed = JSON.parse(subscribed);
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
		},*/
		"pimp": function(user, args) {
			var qa = args[0];
			var id = args[1];
			var tags = [];
			var message;

			for(var i = 2, length = args.length; i < length; i++) {
				if(args[i][0] != '"') { // if we are not on the message part yet (the first character of the message part is a ")
					tags.push(args[i]);
				}
			}

			message = args[i] ? args[i] : "";

			if( ( qa != "q" && qa != "a" ) ||
				( !id ) ||
				( !tags)
				) {
				commands["help"](user, ["pimp"]);
			} else {
				addToPimped(id);
				var groupMessage = "";

				var subscribed = getSubscribedUsers(tags, user);
				for(var i = 0, length = subscribed.length; i < length; i++) {
					groupMessage += ("@" + subscribed[i] + " ");
				}

				groupMessage += (message ? "\r\n" + message : '');

				sendMessage(groupMessage);
				window.setTimeout(function() {
					sendMessage("http://codereview.stackexchange.com/" + qa + "/" + messageParts[2]);
				}, 4000); // to prevent the chat from blocking the message due to it being sent too early
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
		"help": function(user, args) {
			var topics = {
				"":[
					"Commands:",
					"- `help` - Displays this help or help to a command",
					"- `pimp` - Pimps a post by pinging subscribed users",
					"- `subscribe` - Subscribes you to a list of tags or all",
					"- `unsubscribe` - Unsubscribes you from a list of tags or all",
					"- `tags` - Lists the subscribed tags"
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
					"To unsubscribe entirelly, write `unsubscribe` without arguments"
				],
				"tags": [
					"`tags` lists all the tags you're subscribed to.",
					"All the tags will have a nice link to visit it."
				],
				"pimp": [
					"`pimp` is used to send a notification",
					"The `pimp` command has the following format:",
					"`pimp q|a <id> <optional tag list> <\"Optional message\">`",
					"Example: `pimp a 012345`, `pimp q 012345 sql \"Question 12345\"`"
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
		},1000);
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
		var subscribed = getSubscribedList();
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
			if( subscribed.hasOwnProperty(user) && ignore != user ) {
				if( !tags.length || subscribed[user] === true ) {
					users.push(user);
				} else {
					//tags = tags.split(" ");
					for(var tag in tags) {
						if( subscribed[user].hasOwnProperty(tag) ) {
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
	

	function main() {
		var message = getLastMessage();
		if( message.content && commands.hasOwnProperty(message.content.split(" ")[0]) ) {
			var args = message.content.match(/("([^"]*|\\")*"$|\b\d+|\b\w[\w\d\-]*)/g);

			if(message.user != "SirAlfred" && args) {
				if(commands.hasOwnProperty(args[0])) {
					commands[args.shift()](message.user, args || []);
				}
			}
		}

		window.setTimeout(main, 5000);
	}

	main();


})(Function('return this')());
