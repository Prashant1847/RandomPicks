const songGrid = document.querySelector('.songs-grid')
const movieGird = document.querySelector('.movies-grid')
const gameGrid = document.querySelector('.game-grid')

const gameCardTemplate = document.querySelector('.game-card-template')
const movieCardTemplate = document.querySelector('.movie-card-template')
const songCardTemplate = document.querySelector('.song-card-template')
const maxCards = 9

// populating grid using templates 
for (let i = 0; i < maxCards; i++) {
    songGrid.append(songCardTemplate.content.cloneNode(true))
    movieGird.append(movieCardTemplate.content.cloneNode(true))
    gameGrid.append(gameCardTemplate.content.cloneNode(true))
}


// joke section related (api calls, updation of content)
const jokeDiv = document.querySelector(".joke");
const jokeUrl = "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist&type=single"

document.querySelector('.new-joke-btn').addEventListener('click', fetchJokeAndUpdateJoke)

function fetchJokeAndUpdateJoke() {
    fetch(jokeUrl)
        .then(response => {
            if (!response.ok) throw new Error("Something went wrong!!")
            return response.json()
        })
        .then(data => jokeDiv.innerText = data.joke)
        .catch(e => console.log(e))
}


function randomNumFromMinExcludingMax(min, max) {
    return Math.floor((Math.random() * (max - min) + min))
}


//games section (api calls, updation of content, showing information of tags)
const gamesGridItem = Array.from(document.querySelector('.game-grid').getElementsByClassName('grid-card'))
const gamesGridItemTagsBtn = Array.from(document.querySelector('.game-grid').getElementsByTagName('button'))

const gamesApiKey = "apikey"
const gamesBaseUrl = "https://api.rawg.io/api/games"

const maxPageNum = 1000
const pageNumber = randomNumFromMinExcludingMax(0, maxPageNum) //result will be shown in between 1 to max page num
const page_size = 9

let gameFetchedData;

// games data fetching
async function fetchGamesListAndUpdateGridContent() {
    const url = `${gamesBaseUrl}?key=${gamesApiKey}&page_size=${page_size}&page=${pageNumber}`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Something went wrong")
    const data = await response.json()

    gameFetchedData = data.results
    gameFetchedData.forEach((gameDetails, index) => {
        gamesGridItem[index].querySelector('img').src = gameDetails.background_image
        gamesGridItem[index].querySelector('.grid-item-title').innerText = gameDetails.name
    });
}

//for showing information about games tag button on which user is hovering it's mouse  

gamesGridItemTagsBtn.forEach(btn => btn.addEventListener('mouseover', (e) => {
    const gameTitle = e.target.parentElement.previousElementSibling.innerText
    const reqIndexOfGameData = getReqIndexOfGame(gameFetchedData, gameTitle)

    const dataToShow = getTagInfo(e, reqIndexOfGameData, gameFetchedData)
    showTagInfo(dataToShow, reqIndexOfGameData)
}))

gamesGridItemTagsBtn.forEach(btn => btn.addEventListener('mouseleave', (e) => {
    document.querySelector('.tags-description').remove()
}))


function getReqIndexOfGame(data, title) {
    let reqIndex;
    data.forEach((game, index) => {
        if (game.name == title) reqIndex = index
    })
    return reqIndex
}

function showTagInfo(data, reqIndex) {
    const div = document.createElement('div')
    div.classList.add('tags-description')
    div.innerText = data
    gamesGridItem[reqIndex].querySelector('.game-details').append(div)
}


function getTagInfo(e, reqIndex, gameData) {
    const tagName = e.target.innerText
    let relatedData = [] //stores array of objects
    let neededData = [] //stores necessary data from array of objects (related data)
    if (tagName == 'Genres') {
        relatedData = gameData[reqIndex].genres
        relatedData.forEach(genre => neededData.push(genre.name))
    }
    else if (tagName == 'Ratings') {
        relatedData = gameData[reqIndex].ratings
        relatedData.forEach(rating => neededData.push(rating.title))
    }
    else if (tagName == 'Tags') {
        relatedData = gameData[reqIndex].tags
        relatedData.forEach(tag => neededData.push(tag.name))
    }
    else {
        relatedData = gameData[reqIndex].platforms
        relatedData.forEach(platformObj => neededData.push(platformObj.platform.name))
    }

    if (neededData.length > 6) neededData = neededData.slice(0, 7)
    return neededData.join(', ')
}
// end



//section for song list based on genre 
const SongsbaseUrl = "https://shazam-core.p.rapidapi.com/v1/charts/genre-world"
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'your rapid api key',
        'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com'
    }
};

const songGridItems = Array.from(document.querySelector('.songs-grid').getElementsByTagName('a'))
const genreList =
    ["POP", "HIP_HOP_RAP", "DANCE", "ELECTRONIC",
        "SOUL_RNB", "ALTERNATIVE", "ROCK", "FILM_TV",
        "COUNTRY", "AFRO_BEATS", "WORLDWIDE", "REGGAE_DANCE_HALL",
        "HOUSE", "K_POP", "FRENCH_POP", "SINGER_SONGWRITER", "REG_MEXICO"]



async function fetchSongAndUpdateGridContent() {
    const rndNum = randomNumFromMinExcludingMax(0, genreList.length)
    const genre = genreList[rndNum]

    const response = await fetch(`${SongsbaseUrl}?genre_code=${genre}`, options)
    if (!response.ok) throw new Error("Something went wrong")

    const data = await response.json()
    //turn below into a function
    let startIndex = randomNumFromMinExcludingMax(0, data.length - maxCards) // we do not want to get data less than max grid cards
    const songsDetails = data.slice(startIndex, startIndex + 9)

    songsDetails.forEach((song, index) => {
        songGridItems[index].href = song.url
        songGridItems[index].querySelector('img').src = song.images.coverart
        songGridItems[index].querySelector('.song-title').innerText = song.title
        songGridItems[index].querySelector('.song-subtitle').innerText = song.subtitle

    })
}


//section for movies list

const moviesApiKey = "your api key here"
const movieBaseUrl = "https://api.themoviedb.org/3/discover/movie?language=en-US"
const moviesImageBaseUrl = "https://image.tmdb.org/t/p/w500"

const include_adult = false;
const include_video = false
const movie_sortBy = ["popularity.asc", "release_date.asc", "release_date.desc", "revenue.desc", "primary_release_date.asc",
    "primary_release_date.desc", "original_title.asc", "original_title.desc", "vote_average.desc", "vote_count.desc"]
const maxMoviesPage = 500


const moviesGridItems = Array.from(document.querySelector('.movies-grid').getElementsByClassName('grid-card'))
let fetchedMoviesData = []

async function fetchMoviesAndUpdateGridContent() {
    const rndNum = randomNumFromMinExcludingMax(0, movie_sortBy.length)
    const sort_by = movie_sortBy[rndNum]
    const pageNum = randomNumFromMinExcludingMax(1, maxMoviesPage - 100) //100 is takes to give new movies list

    const response = await fetch(`${movieBaseUrl}&api_key=${moviesApiKey}&sort_by=${sort_by}&include_adult=${include_adult}&include_video=${include_video}&page=${pageNum}`)
    if (!response.ok) throw new Error("Something went wrong!!!")
    const data = await response.json()

    fetchedMoviesData = data.results
    let startIndex = randomNumFromMinExcludingMax(0, fetchedMoviesData.length - maxCards) //we do not want to get data less than max grid cards
    fetchedMoviesData = fetchedMoviesData.slice(startIndex, startIndex + 9)
    fetchedMoviesData.forEach((movie, index) => {
        const currentCardImg = moviesGridItems[index].querySelector('img')
        let imgSource
        if(movie.poster_path){
            imgSource = `${moviesImageBaseUrl}${movie.poster_path}`
            currentCardImg.classList.remove('imgNotAvailable')
        }
        else {
            imgSource = "images/imgNotAvailable.png"
            currentCardImg.classList.add('imgNotAvailable')
        }
        currentCardImg.src = imgSource
        moviesGridItems[index].querySelector('.movie-title').innerText = movie.title
    })
}

//overviewBtn functionality
const overviewBtns = Array.from(document.querySelector('.movies-grid').getElementsByTagName('button'))

overviewBtns.forEach(btn => btn.addEventListener('mouseover', showMovieInfo))
overviewBtns.forEach(btn => btn.addEventListener('mouseleave', hideMovieInfo))

function showMovieInfo(e) {
    const selectedMovieTitle = e.target.parentElement.previousElementSibling.innerText
    fetchedMoviesData.forEach((movie, index) => {
        if (movie.title == selectedMovieTitle) {
            const div = document.createElement('div')
            div.innerText = movie.overview == "" ? "Sorry, No overview available!!": movie.overview
            div.classList.add('tags-description')
            moviesGridItems[index].querySelector('.movie-details').append(div)
        }
    })
}

function hideMovieInfo(e) {
    document.querySelector('.tags-description').remove()
}


//removes skeleton loading animation from images after fetching data
function removeAnimFromImages(grid) {
    Array.from(grid.getElementsByTagName('img')).forEach(img => img.classList.remove('skeleton'))
}

// fetching all data in end
fetchJokeAndUpdateJoke()

fetchMoviesAndUpdateGridContent()
    .catch(err => console.error(err))
    .finally(()=> removeAnimFromImages(movieGird))

fetchSongAndUpdateGridContent()
    .catch(err => console.error(err))
    .finally(()=> removeAnimFromImages(songGrid))

fetchGamesListAndUpdateGridContent()
    .catch(err => console.error(err))
    .finally(()=> removeAnimFromImages(gameGrid))


//adding double click functionality to refresh list
const songsSection = document.querySelector('.songs-section')
const moviesSection = document.querySelector('.movies-section')
const gamesSection = document.querySelector('.games-section')

//add skeleton loading animation to images before fetching data 
function resetImgWithAnim(gridItem) {
    const img = gridItem.querySelector('img')
    img.src = ""
    img.classList.add('skeleton')
}

//recreation of grid items needed to add skeleton animation before fetching data
function recreateGamesGrid() {
    gamesGridItem.forEach(item => {
        resetImgWithAnim(item)
        item.querySelector('.grid-item-title').innerHTML = `<div class="skeleton skeleton-text"></div>`
    })
}

function recreateMoviesGrid() {
    moviesGridItems.forEach(item => {
        resetImgWithAnim(item)
        item.querySelector('.movie-title').innerHTML = `<div class="skeleton skeleton-text"></div>  <div class="skeleton skeleton-text"></div>`
    })
}

function recreateSongGrid() {
    songGridItems.forEach(item => {
        resetImgWithAnim(item)
        item.querySelector('.song-title').innerHTML = `<div class="skeleton skeleton-text"></div>`
        item.querySelector('.song-subtitle').innerHTML = `<div class="skeleton skeleton-text"></div>  <div class="skeleton skeleton-text"></div>`
    })
}


//adding event listners to sections to refresh the grid
songsSection.addEventListener('dblclick', () => {
    recreateSongGrid()
    fetchSongAndUpdateGridContent()
    .catch(err => console.log(err))
    .finally(() => removeAnimFromImages(songGrid))
})

moviesSection.addEventListener('dblclick', () => {
    recreateMoviesGrid()
    fetchMoviesAndUpdateGridContent()
        .catch(err => console.log(err))
        .finally(() => removeAnimFromImages(movieGird))
})

gamesSection.addEventListener('dblclick', () => {
    recreateGamesGrid()
    fetchGamesListAndUpdateGridContent()
        .catch(err => console.log(err))
        .finally(() => removeAnimFromImages(gameGrid))
})