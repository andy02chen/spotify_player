const express = require('express');
const session = require('express-session');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const path = require('path');
const { getLyrics, getSong } = require('genius-lyrics-api');

const AUTHENTICATION_URL = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const geniusTOKEN = "https://api.genius.com/oauth/token";
const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.CLIENT_ID;
const scope = process.env.SCOPE;
const client_secret = process.env.CLIENT_SECRET;
const geniusClientSecret = process.env.GENIUS_CLIENT_SECRET;
const geniusClientID = process.env.GENIUS_CLIENT_ID;

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.json());

let accessToken = null;
let refresh_token;
let expiresIn;
let geniusAccessToken = null;

// Home page
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

// Returns the users token
app.get('/getToken', (req, res) => {
	res.send({token:accessToken});
});

// Returns the users genius token
app.get('/getGeniusToken', (req, res) => {
	res.send({token:geniusAccessToken});
});

// Get User Playlists
app.get('/getPlaylists', async(req, res) => {
	const result = await fetch("https://api.spotify.com/v1/me/playlists", {
		method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
	})

	if(result.status !== 200) {
		console.error("Something went wrong");
		console.log(result);
	} else {
		const data = await result.json();
		res.send(data.items);
	}
})

//LOGIN for genius
app.get('/loginGenius', (req, res) => {
	let url = 'https://api.genius.com/oauth/authorize'
    url += "?client_id=" + geniusClientID;
    url += "&redirect_uri=" + redirect_uri;
    url += '&scope=me';
    url += '&state=SOME_STATE_VALUE';
    url += "&response_type=code";
	res.redirect(url);
});

//Login endpoint
app.get('/login', (req, res) => {
	let url = AUTHENTICATION_URL;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + redirect_uri;
    url += "&scope=" + scope;
    url += "&show_dialog=true";
	res.redirect(url);
});

//Login
app.post('/login', (req, res) => {
	if(!req.body.code) {
		res.status(401).send("No token found");
        return;
	}

	const code = req.body.code;
	let body = `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`;

	fetch(TOKEN, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": "Basic " + btoa(client_id + ":" + client_secret) 
		},
		body: body
	})
	.then(response => {
		if (!response.ok) {
			console.log(response)
			throw new Error('Bad Request');
		}
			return response.json();
	})
	.then(data => {
		accessToken = data.access_token;
		refresh_token = data.refresh_token;
		expiresIn = data.expires_in;

		setInterval(refreshToken, 1000 * (expiresIn - 120));
		res.status(200).send("POST request to login was successful");
	})
		.catch(error => {
		console.error('Error:', error);
	});
})

// Genius Authentication
app.post('/lyrics/login', (req, res) => {
	code = req.body.code;

	fetch(geniusTOKEN, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			"code": code,
			"client_secret": geniusClientSecret,
			"grant_type": "authorization_code",
			"client_id": geniusClientID,
			"redirect_uri": "http://localhost:3000/",
			"response_type": "code"
		})
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Failed to fetch access token');
		}
			return response.json();
	})
	.then(data => {
		geniusAccessToken = data.access_token;
		res.status(200).send("POST request to login was successful");
	})
	.catch(error => {
		console.error(error);
	});
});

// Get Lyrics
app.get('/lyrics', async (req, res) => {
	const options = {
		apiKey: geniusAccessToken,
		title: req.query.title,
		artist: req.query.artist,
		optimizeQuery: true
	};
	
	getLyrics(options).then((lyrics) => console.log(lyrics));
	
	getSong(options).then((song) =>
		console.log(`${song.id} - ${song.title} - ${song.url} - ${song.albumArt} - ${song.lyrics}`)
	);
});

//Refresh access token
async function refreshToken() {
	const refreshToken = refresh_token;
	
	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	let body = `grant_type=refresh_token&refresh_token=${refresh_token}`;

	fetch(TOKEN, {
	method: 'POST',
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
		"Authorization": "Basic " + btoa(client_id + ":" + client_secret) 
	},
	body: body
	})
	.then(async response => {
		if (!response.ok) {
			throw new Error('Failed to refresh token');
		}
		const tokens = await response.json();
		accessToken = tokens.access_token;
	})
	.catch(error => {
		console.error('Error refreshing token:', error);
	})
}

app.listen(port, () => {
	console.log(`Example app listening on http://localhost:${port}`)
})