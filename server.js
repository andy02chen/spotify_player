const express = require('express');
const session = require('express-session');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const path = require('path')

const AUTHENTICATION_URL = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.CLIENT_ID;
const scope = process.env.SCOPE;
const client_secret = process.env.CLIENT_SECRET;

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.json());

let accessToken;
let refresh_token;
let expiresIn;

// Home page
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

// Returns the users token
app.get('/getToken', (req, res) => {
	res.send({token:accessToken});
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

//Login
app.post('/login', (req, res) => {
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
		console.log(accessToken);
	})
	.catch(error => {
		console.error('Error refreshing token:', error);
	})
}

app.listen(port, () => {
	console.log(`Example app listening on http://localhost:${port}`)
})