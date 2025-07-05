console.log('Lets write some js');
let currentSong = new Audio();
let Songs;
let currFolder;

function formatTime(seconds) {
    // Ensure seconds is a number
    const sec = parseInt(seconds, 10);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;

    // Pad with leading zeros if needed
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let respond = await a.text()
    let div = document.createElement("div")
    div.innerHTML = respond;
    let as = div.getElementsByTagName("a")
    Songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            Songs.push(element.href.split(`/${folder}/`)[1].replaceAll("%20", " "))
        }

    }
    let Songul = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    Songul.innerHTML = " ";
    for (const element of Songs) {
        Songul.innerHTML = Songul.innerHTML + `<li><img class="invert" src="/Spotify.svg/music.svg" alt="">
                            <div class="info">
                                <div class="song-name small">${element.replaceAll("%20", " ")}</div>
                                <div class="song-artist small">VP</div>
                            </div>
                            <div class="playnow flex justify-center">
                                <span>Play now</span>
                                <img class="invert" src="/Spotify.svg/play.svg" height="30px" width="30px";alt="">
                            </div></li>`
    }


    //Atttach an event song to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML)

        })
    })
    return Songs

}

function playMusic(track, pause = false) {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "/Spotify.svg/pause.svg";

    }
    document.querySelector(".song-info").innerHTML = decodeURI(track)
    document.querySelector(".song-time").innerHTML = "00:00/00:00"



}

async function DisplayAblums(params) {
    let a = await fetch(`/songs/`)
    let respond = await a.text()
    let div = document.createElement("div")
    div.innerHTML = respond;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
    
            //Get the meta data of folders  
            let a = await fetch(`/songs/${folder}/info.json`)
            let respond = await a.json()
            console.log(respond);
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder=${folder} class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" fill="#4CAF50" />
                                <path fill="#000000" d="M15 12L9 8v8l6-4z" transform="translate(1 0)" />
                            </svg>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${respond.title}</h2>
                        <p>${respond.description}</p>
                    </div>`


        }

    };
    //Load the library
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            Songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(Songs[0])
        })

    });


}

async function main(params) {


    await getSongs('songs/2')
    playMusic(Songs[0], true)



    //Display all the albums on the page
    DisplayAblums()



    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/Spotify.svg/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "/Spotify.svg/play.svg"

        }

    })

    //to mute the audio
    let vbtn = document.querySelector(".volume>img")
    vbtn.addEventListener("click", e => {
        let Cvol
        if (currentSong.volume != 0) {
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
            e.target.src = "/Spotify.svg/novol.svg"
        }
        else {
            currentSong.volume = 0.1
            e.target.src = "/Spotify.svg/volume.svg"
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}





//update time duration of song
currentSong.addEventListener("timeupdate", (e) => {
    document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
})

//mpve the circle
document.querySelector(".seekbar").addEventListener("click", (e) => {
    let varTime = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = varTime + "%"

    currentSong.currentTime = (varTime * currentSong.duration) / 100
})


//Event for hamburger
document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = 0
})

document.querySelector(".cross").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = -150 + "%"
})

//previous and next event listener
// let previous = document.getElementById("previous")
previous.addEventListener("click", (e) => {

    let CSong = currentSong.src.replaceAll("%20", " ").split("/").pop()
    let index = Songs.indexOf(CSong)
    if (index - 1 >= 0) {
        playMusic(Songs[index - 1])
    }
    let curSrc = (Songs[index - 1].replaceAll("%20", " ").split("/").pop());
    // currentSong.play()


})
// let next = document.getElementById("next")
next.addEventListener("click", (e) => {

    let CSong = currentSong.src.replaceAll("%20", " ").split("/").pop()
    let index = Songs.indexOf(CSong)
    if (index + 1 < Songs.length) {
        playMusic(Songs[index + 1])
    }


})
//volume changing
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
})

function isMobileView() {
    return window.matchMedia("(max-width: 1350px)").matches;
}


function updateVolumeRangeVisibility() {
    const range = document.querySelector(".range");
    if (window.matchMedia("(min-width: 1350px)").matches) {
        range.style.opacity = "1"; // Show if screen is >= 1350px
    } else {
        range.style.opacity = "0"; // Hide if screen is < 1350px
    }
}

// Run once on page load
updateVolumeRangeVisibility();

// Update when the window is resized
window.addEventListener("resize", updateVolumeRangeVisibility);


document.querySelector(".vol-btn").addEventListener("click", e => {
    let range = document.querySelector(".range")
    if(isMobileView()){
    if (range.style.opacity === "1") {
        range.style.opacity = 0;
    } else {
        range.style.opacity = "1"
    }
}}
)






main()
