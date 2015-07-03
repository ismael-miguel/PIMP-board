var chat = document.getElementById("next");
var input = document.getElementById("input");
var send = document.getElementById("sayit-button");

/**
	Returns the last chat message spoken
*/
function getLastMessage() {
	return {
		content: chat.lastElementChild.children[1].lastElementChild.children[1].innerHTML,
		user: chat.lastElementChild.children[0].childnre[2].innerHTML.replace(/ /g,'')
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
	Adds a user to the subscribed list
*/
function addToSubscribed(username) {
	localStorage.setItem("SIRPYTHON_PIMPBOT" + username, "subscribed");
}
/**
	Removes a user from the subscribed list
*/
function removeFromSubscribed(username) {
	localStorage.removeItem("SIRPYTHON_PIMPBOT" + username);
}
/**
	Returns if a user is subscribed
*/
function isSubscribed(username) {
	return localStorage.getItem("SIRPYTHON_PIMPBOT" + username) == "subscribed";
}
// ---------- Pimped list functions ----------
/**
	Adds an ID to the pimped list
*/
function addToPimped(id) {
	sessionStorage.setItem("SIRPYTHON_PIMPBOT" + id, "pimped");
}
/**
	Returns if an ID has been pimped
*/
function wasPimped(id) {
	return sessionStorage.getItem("SIRPYTHON_PIMPBOT" + id) == "pimped";
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
			var id = messageParts[1];
			if(id == undefined) {
				sendTo("You need to provide the ID of your answer.", message.user);
			}

			if(isPimped(id) == false) {
				// pimp
			} else {
				sendTo("You have already pimped that post today.", message.user);
			}
		}
	}

	window.setTimeout(main, 1000);
}