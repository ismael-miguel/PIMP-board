var chat = document.getElementById("chat");
var input = document.getElementById("input");
var send = document.getElementById("sayit-button");
var subscribedStorage = "SIRPYTHON_PIMPBOT_SUBSCRIBED";
var pimpedStorage = "SIRPYTHON_PIMPBOT_PIMPED";

sessionStorage.setItem(pimpedStorage, "{}"); // so I don't get an undefined thing later

/**
	Returns the last chat message spoken
*/
function getLastMessage() {
	return {
		content: chat.lastElementChild.children[1].lastElementChild.children[1].innerHTML,
		user: chat.lastElementChild.children[0].children[2].innerHTML.replace(/ /g,'')
	};
}

// ---------- Chat functions ----------
/**
	Sends a message to chat
*/
function sendMessage(message) {
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
	return getSubscribedList()[username] != undefined;
}
/**
	Returns all the subscribed users
*/
function getSubscribedUsers() {
	var users = [];
	var subscribed = getSubscribedList();
	for(var user in subscribed) {
		users.push(user);
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
	return getPimpedList()[id] != undefined;
}

function main() {
	var message = getLastMessage();
	var messageParts = message.content.split(" ");

	if(message.user != "SirAlfred") {
		if(message.content == "subscribe") {
			if(isSubscribed(message.user) == false) {
				addToSubscribed(message.user);
				sendTo("You have been successfully subscribed.", message.user);
			} else {
				sendTo("You are already subscribed.", message.user);
			}
		} else if(message.content == "unsubscribe") {
			if(isSubscribed(message.user) == true) {
				removeFromSubscribed(message.user);
				sendTo("You have been successfully removed.", message.user);
			} else {
				sendTo("You are not subscribed.", message.user);
			}
		} else if(messageParts[0] == "pimp") {
			if(isSubscribed(message.user) == true) {
				var id = messageParts[1];
				if(id == undefined) {
					sendTo("You need to provide the ID of your answer.", message.user);
				}

				if(wasPimped(id) == false) {
					addToPimped(id);
					var groupMessage = "";
					var subscribed = getSubscribedUsers();
					for(var i = 0; i < subscribed.length; i++) {
						groupMessage += ("@" + subscribed[i] + " ");
					}
					sendMessage(groupMessage);
					window.setTimeout(function() {
						sendMessage("http://codereview.stackexchange.com/a/" + id);
					}, 4000);
				} else {
					sendTo("That post has already been pimped today.", message.user);
				}
			} else {
				sendTo("You must be subscribed to pimp here.", message.user);
			}
		}
	}

	window.setTimeout(main, 5000);
}
