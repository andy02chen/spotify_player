const AUTHENTICATION_URL = 'https://accounts.spotify.com/authorize';
const redirect_uri = "http://localhost:3000/";
const scope = "streaming user-read-email user-read-private user-library-read user-read-playback-state user-modify-playback-state user-library-modify playlist-read-private";
const client_id = "9bfeafafb36c47e0a8f222704f2a38c9";

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

export function getLoginPage() {
    const button = document.getElementById("login");
    button.style.display = "block";
}

