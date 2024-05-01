const AUTHENTICATION_URL = 'https://accounts.spotify.com/authorize';
const redirect_uri = "http://localhost:3000/";
const scope = "streaming user-read-email user-read-private user-library-read user-read-playback-state user-modify-playback-state user-library-modify playlist-read-private";
const client_id = "9bfeafafb36c47e0a8f222704f2a38c9";
const genius_client_id = "PvfyX2FXpIV8iT0quPCXQqB2B57Rb9sXV8b3_r76E3gqgf6IYFv1CHIZhPkq-dcs";

// Genius Authentication
// export function geniusAuthentication() {
//     let url = 'https://api.genius.com/oauth/authorize'
//     url += "?client_id=" + genius_client_id;
//     url += "&redirect_uri=" + redirect_uri;
//     url += '&scope=me';
//     url += '&state=SOME_STATE_VALUE';
//     url += "&response_type=code";
//     window.location.href = url;
// }

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

// Get genius access token
export async function getGeniusToken() {
    //Get Token
    const token = await fetch(redirect_uri + "getGeniusToken", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    return await token.json();
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

