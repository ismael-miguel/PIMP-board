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
	function getSubscribedList() {
		return JSON.parse(localStorage.getItem(subscribedStorage));
	}
	/**
		Sets an object representing the subscribed list to storage
	*/
	function setSubscribedList(newList) {
		localStorage.setItem(subscribedStorage, JSON.stringify(newList));
	}
	/**
		Adds a user to the subscribed list
	*/
	function addToSubscribed(username) {
		var subscribed = getSubscribedList();
		subscribed[username] = true;
		setSubscribedList(subscribed);
	}
	/**
		Removes a user from the subscribed list
	*/
	function removeFromSubscribed(username) {
		var subscribed = getSubscribedList();
		delete subscribed[username];
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
		var subscribed = getSubscribedList();
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