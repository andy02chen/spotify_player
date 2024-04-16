const redirect_uri = "http://localhost:3000/";
let selectedPlaylist = null;

// Volume selection
let volumeControl = 10;
const volumeImageElement = document.getElementById("volumeImage");
let muted = false;
const volumeSlider = document.getElementById('volumeSlider');

// Music Player
let player = null;
let connected = false;
let devID = null;

////////////////////////////////
// Being completely honest idk wha this code does
// But I been debugging this for a while now
// And this works so im keeping it for now
window.onSpotifyWebPlaybackSDKReady = () => {};

async function waitForSpotifyWebPlaybackSDKToLoad () {
    return new Promise(resolve => {
        if (window.Spotify) {
        resolve(window.Spotify);
    } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
            resolve(window.Spotify);
        };
    }
    });
};
////////////////////////////////

// Displays info about currently playing track
function displayPlayer() {
    document.getElementById("notPlaying").style.display = "none";

    const player = document.getElementById("playing");
    const volume = document.getElementById("volume");

    player.classList.add("fade-in");
    volume.classList.add("fade-in");

    player.style.display = "block";
    volume.style.display = "flex";

    setTimeout(() => {
        player.classList.add("show");
        volume.classList.add("show");
    }, 100);
}

export async function getDashboard() {
    document.getElementById('main').style.display = 'flex';
    getUserPlayLists();

    connected = await connectWebPlaybackSDK();

    // Ready
    player.addListener('ready', async ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        if(await getPlayBackState() === true) {
            await autoSwitchSpotifyPlayer(device_id);
        }
    });
}

// Auto switch spotify player
async function autoSwitchSpotifyPlayer(deviceID) {
    //Gets Token
    const token = await fetch(redirect_uri + "getToken", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await token.json();
    
    const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${data.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "device_ids": [
                deviceID
            ],
            play: false
        })
    });

    console.log(response);
}

// Get request to get user's playlists
async function getUserPlayLists() {
    const result = await fetch(redirect_uri + "getPlaylists", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await result.json();
    displayPlaylists(data);
}

// Displays user's playlists
function displayPlaylists(playlists) {
    // Displays user's playlists
    for(let i = 0; i < playlists.length; i++) {
        const playlist = playlists[i];

        const playlistDisplay = document.createElement("div");
        playlistDisplay.classList.add("playlist");

        const playlistImage = document.createElement("img");
        playlistImage.src = playlist.images[0].url;
        playlistImage.alt = `Image for ${playlist.name}`;
        playlistImage.classList.add("playlistImage");
        playlistDisplay.appendChild(playlistImage);

        const playlistName = document.createElement("h1");
        playlistName.textContent = playlist.name;
        playlistName.classList.add("playlistName");
        playlistDisplay.appendChild(playlistName);

        playlistDisplay.onclick = () => {
            changeSelectedPlaylist(i);
        }

        document.getElementById("playlists").appendChild(playlistDisplay);
    }
}

async function getToken() {
    //Get Token
    const token = await fetch(redirect_uri + "getToken", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    return await token.json();
}

// Determines if user is playing music elsewhere
async function getPlayBackState() {
    const data = await getToken();

    // Get playback state
    const result = await fetch("https://api.spotify.com/v1/me/player", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    });

    if(result.status === 204) {
        console.log('No playback state');

    } else if (result.status === 200) {
        return true;
    } else {
        console.error('Something went wrong');
    }

    return false;
}

// Connect to player
async function connectWebPlaybackSDK() {
    const { Player } = await waitForSpotifyWebPlaybackSDKToLoad();

    const data = await getToken();

    // Connect
    player = new Spotify.Player({
            name: 'Shuffle Spotify',
            getOAuthToken: cb => { cb(data.token); },
            volume: (volumeControl / 100)
            });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
        return false;
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
        return false;
    });

    player.addListener('account_error', ({ message }) => {
        console.error(message);
        return false;
    });

    player.addListener('player_state_changed', ({
        paused,
        position,
        duration,
        track_window: { current_track }
    }) => {
        
        const image = current_track.album.images[0].url;
        const trackName = current_track.name;
        const artists = current_track.artists;

        console.log('Currently Playing', current_track);
        console.log('Position in Song', position);
        console.log('Duration of Song', duration);

        if(paused) {
            player.pause().then(() => {
                play = false;
                state.className = "fa-solid fa-play";
            });
        } else {
            player.resume().then(() => {
                play = true;
                state.className = "fa-solid fa-pause";
            });
        }

        updateMusicPlayer(image, trackName, artists, position, duration);
    });

    player.connect();
    return true;
}

// Updates music player
// Try to make a smooth transition
function updateMusicPlayer(image, trackName, artists, position, duration) {
    let artistsDisplay = artists.map(artist => artist.name).join(", ");

    const songImage = document.getElementById("songImage");
    const songName = document.getElementById("songName");
    const songArtist = document.getElementById("songArtist");

    songImage.src = image;
    songImage.alt = `Image of ${trackName} by ${artistsDisplay}`;

    songName.textContent = trackName;
    songArtist.textContent = artistsDisplay;
    
    displayPlayer();
}

//Changes selected playlist
function changeSelectedPlaylist(playlistIndex) {
    const playlists = document.querySelectorAll(".playlist");
    const playlist = playlists[playlistIndex];

    displayPlayer();

    if(selectedPlaylist !== playlistIndex) {
        const playlistImg = playlist.getElementsByClassName("playlistImage")[0];

        playlist.classList.add("selectedPlaylist");
        playlistImg.classList.add("currentlyPlaying");

        const addImage = document.createElement("img");
        addImage.src = "imgs/playing.png";
        addImage.alt = "Image of currently playing playlist";
        addImage.classList.add("playingImg");
        playlist.appendChild(addImage);

        if(selectedPlaylist !== null) {
            playlists[selectedPlaylist].classList.remove("selectedPlaylist");
            playlists[selectedPlaylist].getElementsByClassName("playlistImage")[0].classList.remove("currentlyPlaying");
            playlists[selectedPlaylist].removeChild(playlists[selectedPlaylist].lastChild);
        }
        
        selectedPlaylist = playlistIndex;  
    }
}

//For progress sliders interaction
const progressSlider = document.getElementById('musicProgress');
progressSlider.addEventListener("input", (event) => {
    const sliderValue = progressSlider.value;
    progressSlider.style.background = `linear-gradient(to right, #1db954 ${sliderValue}%, #ccc ${sliderValue}%)`;
});

progressSlider.addEventListener("mouseover", (event) => {
    const sliderValue = progressSlider.value;
    progressSlider.style.background = `linear-gradient(to right, #1db954 ${sliderValue}%, #ccc ${sliderValue}%)`;
});

progressSlider.addEventListener("mouseout", (event) => {
    const sliderValue = progressSlider.value;
    progressSlider.style.background = `linear-gradient(to right, #ffffff ${sliderValue}%, #ccc ${sliderValue}%)`;
});

// TODO: Make time and progress bar work
// TODO: shuffle when user is not playing music on desktop app
// TODO: try to make the selected playlist appear when user starts music from desktop app
// TODO: maybe liked songs appear on the playlists too
// TODO: change volume slider when user changes volume on desktop app

// For volume sliders interaction
// For muting
volumeImageElement.addEventListener("click", event => {
    if(!muted && volumeControl > 0) {
        muted = true;
        volumeImageElement.src = "imgs/volume-mute.png";
        volumeImageElement.alt = "Mute";

        player.setVolume(0).then(() => {
            console.log('Volume muted!');
        });

    } else {
        muted = false;
        switch(true) {    
            case (volumeControl >= 1 && volumeControl < 34):
                volumeImageElement.src = "imgs/volume-low.png";
                volumeImageElement.alt = "Low";
                break;
    
            case (volumeControl >= 34 && volumeControl < 67):
                volumeImageElement.src = "imgs/volume-med.png";
                volumeImageElement.alt = "Med";
                break;
    
            case (volumeControl >= 67 && volumeControl <= 100):
                volumeImageElement.src = "imgs/volume-high.png";
                volumeImageElement.alt = "High";
                break;
        }
        player.setVolume(volumeControl/100).then(() => {
            console.log('Volume unmuted!');
        });
    }
});

function changeVolumeImage(sliderValue) {
    switch(true) {
        case sliderValue == 0:
            muted = true;
            volumeImageElement.src = "imgs/volume-mute.png";
            volumeImageElement.alt = "Mute";
            break;

        case (sliderValue >= 1 && sliderValue < 34):
            muted = false;
            volumeImageElement.src = "imgs/volume-low.png";
            volumeImageElement.alt = "Low";
            break;

        case (sliderValue >= 34 && sliderValue < 67):
            muted = false;
            volumeImageElement.src = "imgs/volume-med.png";
            volumeImageElement.alt = "Med";
            break;

        case (sliderValue >= 67 && sliderValue <= 100):
            muted = false;
            volumeImageElement.src = "imgs/volume-high.png";
            volumeImageElement.alt = "High";
            break;
    }
}

// Changes volume when user drags the slider
volumeSlider.addEventListener("input", (event) => {
    let sliderValue = parseFloat(volumeSlider.value);
    volumeSlider.style.background = `linear-gradient(to top, #1db954 ${sliderValue}%, #ccc ${sliderValue}%)`;
    changeVolumeImage(sliderValue);

    volumeControl = sliderValue;
    player.setVolume(volumeControl/100).then(() => {
        console.log('Volume updated!');
    });
});

// Allows user to change volume using mouse wheel
volumeSlider.addEventListener("wheel", (event) => {
    event.preventDefault();

    const sliderValue = parseFloat(volumeSlider.value);
    const delta = event.deltaY > 0 ? -1 : 1;

    const step = 10;
    const newValue = sliderValue + delta * step

    const min = 0;
    const max = 100;

    volumeSlider.value = Math.min(Math.max(min, newValue), max);
    volumeSlider.style.background = `linear-gradient(to top, #1db954 ${volumeSlider.value}%, #ccc ${volumeSlider.value}%)`;

    changeVolumeImage(sliderValue);

    volumeControl = parseFloat(volumeSlider.value);
    player.setVolume(volumeControl/100).then(() => {
        console.log('Volume updated!');
    });
});

// Turns green when user hovers
volumeSlider.addEventListener("mouseover", (event) => {
    const sliderValue = volumeSlider.value;
    volumeSlider.style.background = `linear-gradient(to top, #1db954 ${sliderValue}%, #ccc ${sliderValue}%)`;
});

// Turns white when user stops hovering
volumeSlider.addEventListener("mouseout", (event) => {
    const sliderValue = volumeSlider.value;
    volumeSlider.style.background = `linear-gradient(to top, #ffffff ${sliderValue}%, #ccc ${sliderValue}%)`;
    volumeControl = sliderValue;
});


// For loop song
const loopSong = document.getElementById("loopSong");
let looping = false;

loopSong.addEventListener("click", event => {
    if(!looping) {
        looping = true;
        loopSong.classList.add("spinLoopButton");
    } else {
        looping = false;
        loopSong.classList.remove("spinLoopButton");
    }
});

// For play/pause button
const playPauseButton = document.getElementById("playPauseButton");
let play = false;
const state = document.createElement("i");
state.className = "fa-solid fa-play";
playPauseButton.appendChild(state);

playPauseButton.addEventListener("click", event => {
    if(play) {
        player.pause().then(() => {
            play = false;
            state.className = "fa-solid fa-play";
        });

    } else {
        player.resume().then(() => {
            play = true;
            state.className = "fa-solid fa-pause";
        });
    }
    playPauseButton.appendChild(state);
});