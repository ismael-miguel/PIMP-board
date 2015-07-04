(function(window, undefined){

	var chat = document.getElementById("chat");
	var input = document.getElementById("input");
	var send = document.getElementById("sayit-button");
	var subscribedStorage = "SIRPYTHON_PIMPBOT_SUBSCRIBED";
	var pimpedStorage = "SIRPYTHON_PIMPBOT_PIMPED";
	var subscribed = {};

	sessionStorage.setItem(pimpedStorage, "{}"); // so I don't get an undefined thing later

	var commands = {
		"subscribe": function (message) {
			if(isSubscribed(message.user)) {
				sendTo("You are already subscribed.", message.user);
			} else {
				addToSubscribed(message.user);
				sendTo("You have been successfully subscribed. Currently subscribed: " + getSubscribedUsers().length, message.user);
			}
		},
		"unsubscribe": function (message) {
			if(!isSubscribed(message.user)) {
				sendTo("You are not subscribed.", message.user);
			} else {
				removeFromSubscribed(message.user);
				sendTo("You have been successfully removed. Currently subscribed: " + getSubscribedUsers().length, message.user);
			}
		},
		"pimp": function (message) {
			var messageParts = message.content.match(/^pimp ([qa]) ([1-9]\d*)(?: ((?:\w[\w\d\-]+(?: |$))*)(?:"([^"]+)")?)?$/);
			var id = messageParts ? messageParts[2] : false;
			
			if( !messageParts ) {
				sendTo(
					[
						"Invalid format. The pimp command has the following format:",
						"`pimp q|a <id> <optional tag list> \"Optional message\"`",
						"EG.: `pimp a 012345`, `pimp q 012345 sql \"Question 12345\"`"
					],
					message.user
				);
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
		},
		"tags": function(message) {
			
		}
	}

	/**
		Returns the last chat message spoken
	*/
	function getLastMessage() {
		var last = chat.lastElementChild;
		return {
			content: last.children[1].lastElementChild.children[1].innerHTML,
			user: last.children[0].children[2].innerHTML.replace(/ /g,'')
		};
	}

	// ---------- Chat functions ----------
	/**
		Sends a message to chat
	*/
	function sendMessage(message) {
		//maybe it is an array? if so, it must be a multi-line string
		if( 'string' !== (typeof message) && message.join ) {
			message.join("\r\n");
		}
		input.value = message;
		send.click();
	}
	/**
		Sends a message @ a user
	*/
	function sendTo(message, user) {
		sendMessage("@" + user + " " + message);
	}
	// ---------- Subscribed list functions ----------
	/**
		Returns an object representing the subscribed list from storage
	*/
	function getSubscribedMemory() {
		return subscribed;
	}
	/**
		Writes an object representing the subscribed list to storage
	*/
	function setSubscribedMemory(newList) {
		window.setTimeout(function() {
			localStorage.setItem(subscribedStorage, JSON.stringify(newList));
		}, 1); // writing to memory is slow and we don't want to stall the program
	}
	/**
		Adds a user to the subscribed list
	*/
	function addToSubscribed(username, tags) {
		subscribed[username] = tags;
		setSubscribedMemory(subscribed);
	}
	/**
		Removes a user from the subscribed list
	*/
	function removeFromSubscribed(username) {
		delete subscribed[username];
		setSubscribedMemory(subscribed);
	}
	/**
		Returns if a user is subscribed to any of the tags supplied
	*/
	function isSubscribed(username, tags) {
		if(subscribed.hasOwnProperty(username)) {
			for(var i = 0, length = subscribed[username]; i < length; i++) {
				if(tags[i] in subscribed[username]) {
					return true;
				}
			}
		}
		return false;
	}
	/**
		Returns all the subscribed users
	*/
	function getSubscribedUsers(tags, ignore) {
		var users = [];
		var subscribed = getSubscribedMemory();
		for(var user in subscribed) {
			if( subscribed.hasOwnProperty(user) && ignore != user ) {
				if( !tags.length || subscribed[user] === true ) {
					users.push(user);
				} else {
					tags = tags.split(" ");
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
		return JSON.parse(sessionStorage.getItem(pimpedStorage));
	}
	/**
		Sets an object representing the pimped list to storage
	*/
	function setPimpedList(newList) {
		sessionStorage.setItem(pimpedStorage, JSON.stringify(newList));
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
		var command = message.content.match(/^(pimp|help|tags|(?:un)?subscribe)(?:\b|$)/);

		if(message.user != "SirAlfred" && command) {
			if(commands.hasOwnProperty(command[1])) {
				commands[command[1]](message);
			}
		}

		window.setTimeout(main, 5000);
	}

	main();


})(Function('return this')());