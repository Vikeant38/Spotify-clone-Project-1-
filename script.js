console.log('Lets write some js');
let currentSong = new Audio();
let Songs;
let currFolder;

function formatTime(seconds) {
    const sec = parseInt(seconds, 10);
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    
    try {
        const response = await fetch('/songs.json');
        if (!response.ok) throw new Error('Failed to load songs.json');
        
        const allSongs = await response.json();
        const folderName = folder.includes('/') ? folder.split('/').pop() : folder;
        Songs = allSongs[folderName] || [];
        
        const Songul = document.querySelector(".song-list ul");
        Songul.innerHTML = Songs.map(song => `
            <li>
                <img class="invert" src="/Spotify.svg/music.svg" alt="">
                <div class="info">
                    <div class="song-name small">${song.replace('.mp3', '')}</div>
                    <div class="song-artist small">VP</div>
                </div>
                <div class="playnow flex justify-center">
                    <span>Play now</span>
                    <img class="invert" src="/Spotify.svg/play.svg" height="30px" width="30px" alt="">
                </div>
            </li>
        `).join('');

        Array.from(Songul.children).forEach(li => {
            li.addEventListener('click', () => {
                const songName = li.querySelector('.song-name').textContent + '.mp3';
                playMusic(songName);
            });
        });
        
        return Songs;
        
    } catch (error) {
        console.error("Error loading songs:", error);
        document.querySelector(".song-list ul").innerHTML = `
            <li class="error">No songs found in ${folder}</li>
        `;
        return [];
    }
}

function playMusic(track, pause = false) {
    const encodedTrack = encodeURIComponent(track).replace(/%2F/g, '/');
    currentSong.src = `/${currFolder}/${encodedTrack}`;
    if (!pause) {
        currentSong.play();
        play.src = "/Spotify.svg/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = track.replace('.mp3', '');
    document.querySelector(".song-time").innerHTML = "00:00/00:00";
}

async function DisplayAlbums() {
    try {
        const response = await fetch('/songs.json');
        if (!response.ok) throw new Error('Failed to load songs.json');
        
        const allSongs = await response.json();
        const container = document.querySelector(".card-container");
        container.innerHTML = '';
        
        for (const folder of Object.keys(allSongs)) {
            try {
                const infoResponse = await fetch(`/${folder}/info.json`);
                if (!infoResponse.ok) continue;
                
                const info = await infoResponse.json();
                container.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" fill="#4CAF50" />
                                <path fill="#000000" d="M15 12L9 8v8l6-4z" transform="translate(1 0)" />
                            </svg>
                        </div>
                        <img src="/${folder}/cover.jpeg" alt="${info.title}">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            } catch (error) {
                console.error(`Error loading info for ${folder}:`, error);
            }
        }

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', async () => {
                await getSongs(card.dataset.folder);
                if (Songs.length > 0) {
                    playMusic(Songs[0]);
                }
            });
        });
        
    } catch (error) {
        console.error("Error loading albums:", error);
        document.querySelector(".card-container").innerHTML = `
            <div class="error">Failed to load albums</div>
        `;
    }
}

async function main() {
    await getSongs('2'); // Initialize with folder '2'
    if (Songs.length > 0) {
        playMusic(Songs[0], true);
    }

    DisplayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/Spotify.svg/pause.svg";
        } else {
            currentSong.pause();
            play.src = "/Spotify.svg/play.svg";
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (currentSong.volume != 0) {
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
            e.target.src = "/Spotify.svg/novol.svg";
        } else {
            currentSong.volume = 0.1;
            e.target.src = "/Spotify.svg/volume.svg";
            document.querySelector(".range input").value = 10;
        }
    });
}

// Player controls
currentSong.addEventListener("timeupdate", (e) => {
    document.querySelector(".song-time").innerHTML = 
        `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left = 
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

document.querySelector(".seekbar").addEventListener("click", (e) => {
    const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (percent * currentSong.duration) / 100;
});

// Navigation controls
previous.addEventListener("click", () => {
    const currentTrack = decodeURIComponent(currentSong.src.split('/').pop());
    const index = Songs.indexOf(currentTrack);
    if (index - 1 >= 0) {
        playMusic(Songs[index - 1]);
    }
});

next.addEventListener("click", () => {
    const currentTrack = decodeURIComponent(currentSong.src.split('/').pop());
    const index = Songs.indexOf(currentTrack);
    if (index + 1 < Songs.length) {
        playMusic(Songs[index + 1]);
    }
});

// Volume control
document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
});

// Mobile menu
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-150%";
});

// Mobile volume control
function updateVolumeRangeVisibility() {
    const range = document.querySelector(".range");
    range.style.opacity = window.matchMedia("(min-width: 1350px)").matches ? "1" : "0";
}

document.querySelector(".vol-btn").addEventListener("click", e => {
    if (isMobileView()) {
        const range = document.querySelector(".range");
        range.style.opacity = range.style.opacity === "1" ? "0" : "1";
    }
});

function isMobileView() {
    return window.matchMedia("(max-width: 1350px)").matches;
}

// Initialize
updateVolumeRangeVisibility();
window.addEventListener("resize", updateVolumeRangeVisibility);
main();
