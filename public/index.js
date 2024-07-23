import {getLoginPage, postLogin} from './Login.js';
import {getDashboard, getToken} from './Dashboard.js';

const AUTHENTICATION_URL = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';

const client_id = "9bfeafafb36c47e0a8f222704f2a38c9";
const redirect_uri = "http://localhost:3000/";
const scope = "streaming user-read-email user-read-private user-library-read user-read-playback-state user-modify-playback-state user-library-modify playlist-read-private";

let selectedPlaylist = null;
const loginButton = document.getElementById('login');
loginButton.addEventListener('click', () => {
    window.location.href = redirect_uri + 'login';
});

// First function called when page is loaded
window.addEventListener("load", (event) => {
    // To get home page without login
    // getDashboard();

    // Normal Operation
    getHomePage();
});

// Display Home Page
async function getHomePage() {
    const serverSpotifyCode = await getToken();
    if(serverSpotifyCode.token === null) {
        const codeSpotify = getCode();
        codeSpotify ? (await postLogin(codeSpotify), getDashboard()) : getLoginPage();
    } else {
        getDashboard();
    }
}

// Get code from URL
function getCode() {
    return new URLSearchParams(window.location.search).get('code');
}