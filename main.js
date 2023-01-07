"use strict";

let token;
let serverId;
let userId;

/* Helper functions */
function qs(e) { return document.querySelector(e); }

window.onload = () => {
	token = localStorage.getItem("token");
	if (token) login();
}

/* Take token and login */
qs(".token-form").addEventListener("submit", e => {
	e.preventDefault();
	token = qs("#token-input").value;
	login();
});

/* Take server ID */
qs(".server-form").addEventListener("submit", e => {
	e.preventDefault();
	serverId = qs("#server-input").value;
	search(userId);
});

/* Delete token */
qs(".delete-token").addEventListener("click", () => {
	qs("#token-input").value = "";
	qs(".saved-token").style.display = "none";
	token = undefined;
	localStorage.removeItem("token");
});

async function getUser() {
	const res = await fetch("https://api.revolt.chat/users/@me", {
		headers: { 'x-session-token': token },
		method: 'GET',
	});	
	return res.json();
}

async function getServer() {
	const res = await 
		fetch(`https://api.revolt.chat/servers/${serverId}?`, {
			headers: { "x-session-token": token, },
			method: "GET",
		});

	return res.json();
}

async function searchChannel(userId, channel) {
	const res = await
		fetch(`https://api.revolt.chat/channels/${channel}/search`, {
			headers: { 'x-session-token': token },
			method: 'POST',
			body: JSON.stringify({
				query: userId,
				limit: 2,
				sort: 'Latest',
				include_users: true,
			}),
		});

	return res.json();
}

async function login() {
	let user = await getUser();
	userId = user._id;
	renderUser(user);

	localStorage.setItem("token", token);
	qs(".saved-token").style.display = "block";
	qs(".mentions-body").style.display = "block";

}

async function search() {
	qs(".mentions").replaceChildren();
	let server = await getServer();
	// console.log(server);
	for (let i = 0; i < server.channels.length; i++) {
		// console.log(server.channels[i]);
		const data = await searchChannel(userId, server.channels[i]);
		renderMention(data);
	}
}

function renderUser(data) {
	qs(".username").innerHTML = 
		`logged in as <b>${data.username}</b> [${data._id}]`;
}

function renderMention(data) {
	console.log(data);
	const mentionContainer = qs(".mentions");

	for (let i = 0; i < data.messages.length; i++) {
		let mBody = document.createElement('div');
		let mUsername = document.createElement('p');
		let mMessage = document.createElement('p');
		let mLink = document.createElement('a');

		mBody.classList.add("mention");
		mUsername.classList.add("m-username");
		mMessage.classList.add("m-message");
		mLink.classList.add("m-link");

		let urlChan = data.messages[i].channel;
		let urlMsg = data.messages[i]._id;

		mUsername.innerText = data.messages[i].author;
		mMessage.innerText = data.messages[i].content;
		mLink.innerText = "open in revolt";
		mLink.href = `https://app.revolt.chat/channel/${urlChan}/${urlMsg}`;

		mBody.append(mUsername, mMessage, mLink);
		mentionContainer.appendChild(mBody);
	}
}

