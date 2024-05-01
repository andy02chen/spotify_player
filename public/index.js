import {getLoginPage, postLogin, postGeniusCode, getGeniusToken} from './Login.js';
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
        codeSpotify ? (await postLogin(codeSpotify), window.location.href = redirect_uri + 'loginGenius') : getLoginPage();
    }

    const serverGeniusCode = await getGeniusToken();
    if(serverGeniusCode.token === null) {
        const codeGenius = getCode();
        codeGenius ? (await postGeniusCode(codeGenius), getDashboard()) : getLoginPage();
    }
}

// Get code from URL
function getCode() {
    return new URLSearchParams(window.location.search).get('code');
}

// // TODO fix code below here

// function handleRedirect() {
//     // let code = getCode();
//     // if(code) {
//     //     window.history.pushState("","",redirect_uri);
//     //     requestAccessToken(code);
//     //     getUserPlayLists();
//     // }
// }

// // Refresh access token
// function refreshAccessToken() {
//     const refreshToken = localStorage.getItem('refresh_token');
//     let body = `grant_type=refresh_token&refresh_token=${refreshToken}`;

//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", TOKEN, true);
//     xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//     xhr.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + client_secret));
//     xhr.send(body);
//     xhr.onload = handleAccessTokenResponse;
// }

// // Get Access Token
// function requestAccessToken(code) {
//     let body = `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`;

//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", TOKEN, true);
//     xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//     xhr.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + client_secret));
//     xhr.send(body);
//     xhr.onload = handleAccessTokenResponse;
// }

// // Stores Access Token or Refreshes it
// function handleAccessTokenResponse() {
    
//     if(this.status === 200) {
//         const data = JSON.parse(this.responseText);
//         const accessToken = data.access_token;
//         const refreshToken = data.refresh_token;

//         localStorage.setItem('access_token', accessToken);
//         localStorage.setItem('refresh_token', refreshToken);

        
//     } else {
//         console.log(this.statusText);
//         if(this.status === 401) {
//             refreshAccessToken();
//         }
//     }
// }


// // Request authorization after login with Spotify
// function requestAuthorization() {
//     let url = AUTHENTICATION_URL;
//     url += "?client_id=" + client_id;
//     url += "&response_type=code";
//     url += "&redirect_uri=" + redirect_uri;
//     url += "&scope=" + scope;
//     url += "&show_dialog=true";
//     window.location.href = url;
// }

// /*
// Functions that affect the UI of the web page.
// In particular, these functions are responsbile for user experience.
// */

// // If not first time loading the page
// function pageLoad() {

//     if(window.location.search.length > 0) {
//         document.getElementById('login').remove();
//         handleRedirect();
//     }
// }

// // Fix bug when playlist is already selected
// //Changes selected playlist
// function changeSelectedPlaylistHighlight(playlistIndex) {
//     const playlists = document.querySelectorAll(".playlist");
//     const playlist = playlists[playlistIndex];
//     const playlistImg = playlist.getElementsByClassName("playlistImage")[0];

//     playlist.classList.add("selectedPlaylist");
//     playlistImg.classList.add("currentlyPlaying");

//     const addImage = document.createElement("img");
//     addImage.src = "imgs/playing.png";
//     addImage.alt = "Image of currently playing playlist";
//     addImage.classList.add("playingImg");
//     playlist.appendChild(addImage);

//     if(selectedPlaylist !== null) {
//         playlists[selectedPlaylist].classList.remove("selectedPlaylist");
//         playlists[selectedPlaylist].getElementsByClassName("playlistImage")[0].classList.remove("currentlyPlaying");
//         playlists[selectedPlaylist].removeChild(playlists[selectedPlaylist].lastChild);
//     }
    
//     selectedPlaylist = playlistIndex;
// }