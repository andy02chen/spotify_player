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
let musicPlayerTimer = null;
let currrentSongDuration = 0;
let playlistURIs = [];
let currPlayingPlaylistID = null;
let playerShown = false;
let activeDevice = false;
let devID = null;
let songCounter = 0;
let arrOfSongPositions = [];
let queueCounter = 0;

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
    //Display the currently playing playlist
    if(currPlayingPlaylistID) {
        for(let i = 0; i < playlistURIs.length; i++) {
            if(currPlayingPlaylistID === playlistURIs[i]) {
                changeSelectedPlaylist(i);
                break;
            }
        }
    }

    document.getElementById("notPlaying").style.display = 'none';

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

// Displays info about currently playing track after switching playback
function displayPlayerFromSwitch() {
    //Display the currently playing playlist
    if(currPlayingPlaylistID) {
        const playlists = document.querySelectorAll(".playlist");
        

        for(let i = 0; i < playlistURIs.length; i++) {
            const playlist = playlists[i];
            if(currPlayingPlaylistID === playlistURIs[i]) {
                //Apply effects for selected playlist
                if(selectedPlaylist !== i) {
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
                    
                    selectedPlaylist = i;  
                }
                break;
            }
        }
    }

    document.getElementById("notPlaying").style.display = 'none';

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

    connected = await connectWebPlaybackSDK();

    // Ready
    player.addListener('ready', async ({ device_id }) => {
        devID = device_id;
        
        getPlayBackState();
        getUserPlayLists();
    });
}

function doYouWantToSwitchPlayer(device_name) {
    document.getElementById('notPlayingText').style.display = 'none';
    const switchDevice = document.getElementById('playingOn');
    switchDevice.textContent += ` ${device_name}`;
    switchDevice.style.display = 'flex';
    document.getElementById('playingOnButton').style.display = 'flex';
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

    activeDevice = true;

    if(!playerShown) {
        playerShown = true;
        displayPlayerFromSwitch();
    }
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
    data.forEach(playlist => {
        const playlistID = playlist.id;
        playlistURIs.push(playlistID);
    });
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
            if(!activeDevice) {
                autoSwitchSpotifyPlayer(devID);
            }
            
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
        
    } else if (result.status === 200) {
        const currentlyPlaying = await result.json();
        volumeControl = currentlyPlaying.device.volume_percent;

        if(currentlyPlaying.context != null) {
            const getURI = currentlyPlaying.context.uri;
            const parts = getURI.split(":");
            currPlayingPlaylistID = parts[2];
        }

        doYouWantToSwitchPlayer(currentlyPlaying.device.name);

        
    } else {
        console.error('Something went wrong');
    }
}

// Connect to player
async function connectWebPlaybackSDK() {
    const { Player } = await waitForSpotifyWebPlaybackSDKToLoad();

    // Connect
    player = new Spotify.Player({
            name: 'Shuffle Spotify',
            getOAuthToken: async cb => { 
                const data = await getToken();
                cb(data.token); },
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

    player.addListener('player_state_changed', async({
        paused,
        position,
        duration,
        track_window: { current_track },
        context
    }) => {
        const image = current_track.album.images[0].url;
        const trackName = current_track.name;
        const artists = current_track.artists;
        currrentSongDuration = duration

        currPlayingPlaylistID = context.uri.split(":")[2];

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
        console.log(queueCounter);
        updateMusicPlayer(image, trackName, artists, position, paused);
    });

    player.connect();
    return true;
}

function formatSeconds(seconds) {
    const num = seconds.toString();

    if(num.length === 1) {
        return "0" + num;
    } else {
        return num
    }
}

// Updates music player
// Try to make a smooth transition
function updateMusicPlayer(image, trackName, artists, position, paused) {
    let artistsDisplay = artists.map(artist => artist.name).join(", ");

    const songImage = document.getElementById("songImage");
    const songName = document.getElementById("songName");
    const songArtist = document.getElementById("songArtist");
    progressSlider.max = currrentSongDuration;
    progressSlider.value = position;
    progressSlider.style.background = `linear-gradient(to right,
        #ffffff ${progressSlider.value/currrentSongDuration*100}%,
        #ccc ${progressSlider.value/currrentSongDuration*100}%)`;

    songImage.src = image;
    songImage.alt = `Image of ${trackName} by ${artistsDisplay}`;

    songName.textContent = trackName;
    songArtist.textContent = artistsDisplay;

    document.getElementById("finishTime").textContent = Math.floor(currrentSongDuration/1000/60) + ":" + formatSeconds(Math.floor(currrentSongDuration/1000%60))
    document.getElementById("startTime").textContent = Math.floor(position/1000/60) + ":" + formatSeconds(Math.floor(position/1000%60))
    
    if(musicPlayerTimer !== null) {
        clearInterval(musicPlayerTimer);
    }

    if(!paused) {
        musicPlayerTimer = setInterval(async() => {
            if(position === 0) {
                if(queueCounter > 0) {
                    queueCounter--;
                }
            }

            document.getElementById("startTime").textContent = Math.floor(position/1000/60) + ":" + formatSeconds(Math.floor(position/1000%60));
            position += 1000;
            progressSlider.value = position;
            progressSlider.style.background = `linear-gradient(to right,
                #ffffff ${progressSlider.value/currrentSongDuration*100}%,
                #ccc ${progressSlider.value/currrentSongDuration*100}%)`;

            // If 2 seconds left in song and not looping add next song to playlist
            if((currrentSongDuration - position <= 3000) && !looping && queueCounter === 0) {
                queueCounter++;
                const data = await getToken();
                // Fetches next song info
                const limit = 100;
                const nextSong = getNextShuffledSong();
                const nextSongNumber = nextSong % limit;
                const nextOffset = nextSong - nextSongNumber;

                const getSecondSong = await fetch(`https://api.spotify.com/v1/playlists/${playlistURIs[selectedPlaylist]}/tracks?offset=${nextOffset}&limit=${limit}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${data.token}`
                    }
                });

                const secondSongInfo = await getSecondSong.json();
                const secondSongURI = secondSongInfo.items[nextSongNumber].track.uri;

                const postNextSong = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${secondSongURI}`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${data.token}`,
                        "Content-Type": "application/json"
                    }
                });

                if(postNextSong.status === 204 || postNextSong.status === 202) {
                    console.log("Added next song to queue");
                } else {
                    console.error("Something went wrong with adding next song to queue");
                }
            }

            player.getVolume().then(volume => {
                const volumeDesktop = Math.floor(volume*100);
                if(volumeDesktop !== volumeControl) {
                    volumeControl = volumeDesktop;
                    volumeSlider.value = volumeControl;
                    changeVolumeImage(volumeControl);
                    volumeSlider.style.background = `linear-gradient(to top, #ffffff ${volumeSlider.value}%, #ccc ${volumeSlider.value}%)`;
                }
            });
        },1000);
    }
}

function getNextShuffledSong() {
    if(songCounter === arrOfSongPositions.length) {
        songCounter = 0;
    }

    const i = arrOfSongPositions.length - 1 - songCounter;
    const j = Math.floor(Math.random() * (i + 1));
    [arrOfSongPositions[i], arrOfSongPositions[j]] = [arrOfSongPositions[j], arrOfSongPositions[i]];

    return arrOfSongPositions[arrOfSongPositions.length - 1 - songCounter++];
}

//Changes selected playlist
async function changeSelectedPlaylist(playlistIndex) {
    songCounter = 0;
    const data = await getToken();

    const limit = 50;
    const playlists = document.querySelectorAll(".playlist");
    const playlist = playlists[playlistIndex];

    // Get playlist information
    

    // Get playback state
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistURIs[playlistIndex]}?limit=${limit}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    });

    const playlistInfo = await result.json();
    const numberOfTracks = playlistInfo.tracks.total;

    for(let i = 0; i < numberOfTracks; i++) {
        arrOfSongPositions.push(i);
    }

    // Shuffles array of ints to select which song to play
    const firstSong = getNextShuffledSong();
    const firstSongNumber = firstSong % limit;
    const firstOffset = firstSong - firstSongNumber;

    // Fetches first song info
    const getFirstSong = await fetch(`https://api.spotify.com/v1/playlists/${playlistURIs[playlistIndex]}/tracks?offset=${firstOffset}&limit=${limit}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    });

    // Plays the first song
    const firstSongInfo = await getFirstSong.json();
    const firstSongURI = firstSongInfo.items[firstSongNumber].track.uri;
    const response = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${data.token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "uris": [`${firstSongURI}`]
        })
    });

    if(response.status === 204 || response.status === 202) {
        //Apply effects for selected playlist
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
    } else {
        console.error("Something went wrong with shuffling");
    }

    //Show player if not already shown
    if(!playerShown) {
        playerShown = true;
        displayPlayer();
    }
}

//For progress sliders interaction
const progressSlider = document.getElementById('musicProgress');
progressSlider.addEventListener("input", (event) => {
    const sliderValue = progressSlider.value;
    

    // Seek to a position in the track
    player.seek(sliderValue).then(() => {
        progressSlider.style.background = `linear-gradient(to right, 
        #1db954 ${sliderValue/currrentSongDuration*100}%, 
        #ccc ${sliderValue/currrentSongDuration*100}%)`;
    });
});

progressSlider.addEventListener("mouseover", (event) => {
    const sliderValue = progressSlider.value;
    progressSlider.style.background = `linear-gradient(to right,
        #1db954 ${sliderValue/currrentSongDuration*100}%,
        #ccc ${sliderValue/currrentSongDuration*100}%)`;

});

progressSlider.addEventListener("mouseout", (event) => {
    const sliderValue = progressSlider.value;
    progressSlider.style.background = `linear-gradient(to right,
        #ffffff ${sliderValue/currrentSongDuration*100}%,
        #ccc ${sliderValue/currrentSongDuration*100}%)`;
});

// For volume sliders interaction
// For muting
volumeImageElement.addEventListener("click", event => {


    if(!muted && volumeControl > 0) {
        player.setVolume(0).then(() => {
            muted = true;
            volumeImageElement.src = "imgs/volume-mute.png";
            volumeImageElement.alt = "Mute";
        });

    } else {
        player.setVolume(volumeControl/100).then(() => {
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
    

    volumeControl = sliderValue;
    player.setVolume(volumeControl/100).then(() => {
        changeVolumeImage(sliderValue);
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

    

    volumeControl = parseFloat(volumeSlider.value);
    player.setVolume(volumeControl/100).then(() => {
        changeVolumeImage(sliderValue);
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

loopSong.addEventListener("click", async event => {
    const token = await fetch(redirect_uri + "getToken", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await token.json();

    if(!looping) {
        const response = await fetch("https://api.spotify.com/v1/me/player/repeat?state=track", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${data.token}`,
                "Content-Type": "application/json"
            }
        });

        if(response.status === 204 || response.status === 202) {
            looping = true;
            loopSong.classList.add("spinLoopButton");
        }
        
    } else {
        const response = await fetch("https://api.spotify.com/v1/me/player/repeat?state=context", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${data.token}`,
                "Content-Type": "application/json"
            }
        });

        if(response.status === 204 || response.status === 202) {
            looping = false;
        loopSong.classList.remove("spinLoopButton");
        }
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

            if(musicPlayerTimer !== null) {
                clearInterval(musicPlayerTimer);
            }
        });

    } else {
        player.resume().then(() => {
            play = true;
            state.className = "fa-solid fa-pause";
        });
    }
    playPauseButton.appendChild(state);
});

//For next and previous song
const nextSongButton = document.getElementById("nextSong");
const prevSongButton = document.getElementById('prevSong');

nextSongButton.addEventListener("click", async event => {
    if(queueCounter === 0) {
        const data = await getToken();
        // Fetches next song info
        const limit = 100;
        const nextSong = getNextShuffledSong();
        const nextSongNumber = nextSong % limit;
        const nextOffset = nextSong - nextSongNumber;

        const getSecondSong = await fetch(`https://api.spotify.com/v1/playlists/${playlistURIs[selectedPlaylist]}/tracks?offset=${nextOffset}&limit=${limit}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${data.token}`
            }
        });

        const secondSongInfo = await getSecondSong.json();
        const secondSongURI = secondSongInfo.items[nextSongNumber].track.uri;

        const postNextSong = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${secondSongURI}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${data.token}`,
                "Content-Type": "application/json"
            }
        });

        if(postNextSong.status === 204 || postNextSong.status === 202) {
            queueCounter++;
            console.log("Added next song to queue");
        } else {
            console.error("Something went wrong with adding next song to queue");
        }
    }
    player.nextTrack();
});

prevSongButton.addEventListener("click", event => {
    player.previousTrack();
});

// Button for switching playback device
const switchDeviceButton = document.getElementById("playingOnButton");
switchDeviceButton.addEventListener("click", event => {
    player.activateElement();
    autoSwitchSpotifyPlayer(devID);
});

//TODO: Refresh token should be ok, need to double check, ez tho just use app
//TODO: need to make a slight fix so that the prev songs isnt played a bit before chaning (DONE?)
//TODO: maybe add an up next feature
// TODO: some bug when playing a track and not playlist (DONE?)
//TODO: bug still adding multiple songs to queue but not really an issue tbh