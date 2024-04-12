const redirect_uri = "http://localhost:3000/";
let selectedPlaylist = null;

export function getDashboard() {
    document.getElementById('main').style.display = 'flex';
    getUserPlayLists();
}

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