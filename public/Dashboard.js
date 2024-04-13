const redirect_uri = "http://localhost:3000/";
let selectedPlaylist = null;

// Volume selection
let volumeControl = 20;
const volumeImageElement = document.getElementById("volumeImage");
let muted = false;
const volumeSlider = document.getElementById('volumeSlider');

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

//Changes selected playlist
function changeSelectedPlaylist(playlistIndex) {
    const playlists = document.querySelectorAll(".playlist");
    const playlist = playlists[playlistIndex];

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

volumeSlider.addEventListener("input", (event) => {
    const sliderValue = volumeSlider.value;
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
});

volumeSlider.addEventListener("mouseover", (event) => {
    const sliderValue = volumeSlider.value;
    volumeSlider.style.background = `linear-gradient(to top, #1db954 ${sliderValue}%, #ccc ${sliderValue}%)`;
});

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