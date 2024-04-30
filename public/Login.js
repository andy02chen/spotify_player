const AUTHENTICATION_URL = 'https://accounts.spotify.com/authorize';
const redirect_uri = "http://localhost:3000/";
const scope = "streaming user-read-email user-read-private user-library-read user-read-playback-state user-modify-playback-state user-library-modify playlist-read-private";
const client_id = "9bfeafafb36c47e0a8f222704f2a38c9";
const genius_client_id = "PvfyX2FXpIV8iT0quPCXQqB2B57Rb9sXV8b3_r76E3gqgf6IYFv1CHIZhPkq-dcs";

// Login to Spotify
export function loginUser() {
    let url = AUTHENTICATION_URL;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + redirect_uri;
    url += "&scope=" + scope;
    url += "&show_dialog=true";
    window.location.href = url;
}

// Genius Authentication
export function geniusAuthentication() {
    let url = `https://api.genius.com/oauth/authorize?
    client_id=YOUR_CLIENT_ID&${genius_client_id}&
    redirect_uri=${redirect_uri}&
    response_type=code
    `
}

// Post to Server
export async function postLogin(code) {
    window.history.pushState("","",redirect_uri);
    const result = await fetch(redirect_uri + "login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({code: code})
    });

    return new Promise((resolve, reject) => {
        if (result.status === 200) {
            resolve();
        } else {
            reject();
        }
    });
}

//POST to server genius
export async function postGeniusCode(code) {
    window.history.pushState("","",redirect_uri);
    const result = await fetch(redirect_uri + "lyrics/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({code: code})
    });

    return new Promise((resolve, reject) => {
        if (result.status === 200) {
            resolve();
        } else {
            reject();
        }
    });
}

export function getLoginPage() {
    const button = document.getElementById("login");
    button.style.display = "block";
}

