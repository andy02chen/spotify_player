const redirect_uri = "http://localhost:3000/";
let selectedPlaylist = null;

// Volume selection
let volumeControl = 20;
const volumeImageElement = document.getElementById("volumeImage");
let muted = false;
const volumeSlider = document.getElementById('volumeSlider');

// Music Player
let player = null;
let connected = false;

export function getDashboard() {
    document.getElementById('main').style.display = 'flex';
    getUserPlayLists();
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

async function connectWebPlaybackSDK() {

    const token = await fetch(redirect_uri + "getToken", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const response = await token.json();
    player = new Spotify.Player({
            name: 'Better Shuffle Spotify Player',
            getOAuthToken: cb => { cb(response.token); },
            volume: (volumeControl / 100)
            });

    // window.onSpotifyWebPlaybackSDKReady = () => {
    //     player = new Spotify.Player({
    //     name: 'Better Shuffle Spotify Player',
    //     getOAuthToken: cb => { cb(response.token); },
    //     volume: (volumeControl / 100)
    // });}

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
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

    player.connect();
    return true;
}


//Changes selected playlist
function changeSelectedPlaylist(playlistIndex) {
    const playlists = document.querySelectorAll(".playlist");
    const playlist = playlists[playlistIndex];

    if(!connected) {
        connected = connectWebPlaybackSDK();
    }

    document.getElementById("notPlaying").style.display = "none";
    document.getElementById("playing").style.display = "block";
    document.getElementById("volume").style.display = "flex";

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

// For volume sliders interaction
// For muting
volumeImageElement.addEventListener("click", event => {
    if(!muted && volumeControl > 0) {
        muted = true;
        volumeImageElement.src = "imgs/volume-mute.png";
        volumeImageElement.alt = "Mute";

    } else {
        muted = false;

        switch(true) {
            case volumeControl == 0:
                volumeImageElement.src = "imgs/volume-mute.png";
                volumeImageElement.alt = "Mute";
                break;
    
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
    }
});

// Changes volume when user drags the slider
volumeSlider.addEventListener("input", (event) => {
    let sliderValue = parseFloat(volumeSlider.value);
    volumeSlider.style.background = `linear-gradient(to top, #1db954 ${sliderValue}%, #ccc ${sliderValue}%)`;
    muted = false;
    
    switch(true) {
        case sliderValue == 0:
            muted = true;
            volumeImageElement.src = "imgs/volume-mute.png";
            volumeImageElement.alt = "Mute";
            break;

        case (sliderValue >= 1 && sliderValue < 34):
            volumeImageElement.src = "imgs/volume-low.png";
            volumeImageElement.alt = "Low";
            break;

        case (sliderValue >= 34 && sliderValue < 67):
            volumeImageElement.src = "imgs/volume-med.png";
            volumeImageElement.alt = "Med";
            break;

        case (sliderValue >= 67 && sliderValue <= 100):
            volumeImageElement.src = "imgs/volume-high.png";
            volumeImageElement.alt = "High";
            break;
    }

    volumeControl = sliderValue;
    console.log('vol',volumeControl);
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
    volumeControl = parseFloat(volumeSlider.value);
    console.log('vol2',volumeControl);
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
let play = true;
const state = document.createElement("i");
state.className = "fa-solid fa-pause";
playPauseButton.appendChild(state);

playPauseButton.addEventListener("click", event => {
    if(play) {
        play = false;
        state.className = "fa-solid fa-play";
    } else {
        play = true;
        state.className = "fa-solid fa-pause";
    }
    playPauseButton.appendChild(state);
});