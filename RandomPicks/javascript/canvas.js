const title = "Random Picks"

const canvas = document.querySelector("#canvas")
canvas.width = window.document.body.clientWidth
canvas.height = .8 * window.innerHeight

const logo = document.querySelector('.logo')
const logoWidth = 50
const gapOfImageFromTitleInPx = 20
const yOfImage = 14

const minFontSize = 40
const maxFontSize = 60

//this two coordinates will be the same for all letter of title
const startX = canvas.width / 2 
const startY = 80 / 100 * canvas.height

const coordinates_of_all_letter = []
//these are the remainng different coordinates
function Coordinates() {
    this.mid1 = []; 
    this.mid2 = [];
    this.end = []
}

function adjustFontSize() {
    const fontSizeInVW = (4 / 100) * window.document.body.clientWidth
    if (fontSizeInVW < minFontSize) return minFontSize
    else if(fontSizeInVW > maxFontSize) return maxFontSize
    return fontSizeInVW
}

function getFont(fontSize) {
    return `${fontSize}px  Indie Flower, cursive`
}

let currentFontSize = adjustFontSize()

const c = canvas.getContext("2d")
c.font = getFont(currentFontSize)
const  titleWidth = c.measureText(title).width


function getStartingXOfLine(lineWidth, logoWidth, gapOfImageFromTitleInPx) {
    const coorWithLogoIncluded =  window.document.body.clientWidth / 2 - (lineWidth + logoWidth + gapOfImageFromTitleInPx) / 2
    return coorWithLogoIncluded + logoWidth + gapOfImageFromTitleInPx
}

//saving destination coordinates
const endY = 60 //ending position is 60 away from top and is same for all letters
const firstLetterEndX = getStartingXOfLine(titleWidth, logoWidth, gapOfImageFromTitleInPx)

        //setting end coordinates of first letter
const firstLetterCoorObj = new Coordinates()
firstLetterCoorObj.end = [firstLetterEndX, endY]
coordinates_of_all_letter.push(firstLetterCoorObj)


let nextLetterEndX = firstLetterEndX
for (let i = 0; i < title.length - 1; i++) {
    c.font = getFont(currentFontSize)
    nextLetterEndX = nextLetterEndX + c.measureText(title[i]).width
    const letterCordinate = new Coordinates()
    letterCordinate.end = [nextLetterEndX, endY]
    coordinates_of_all_letter.push(letterCordinate)
}


//generating mid control points  and start coordinate
function randomMinMax(min, max) {
    return Math.floor((Math.random() * (max - min)) + min)
}

coordinates_of_all_letter.forEach((coordinates) => {
    const midPoints = []
    for (let i = 0; i < 2; i++) {
        const ramdonX = randomMinMax(50, canvas.width - 50) //change canvas width into a variable
        const ramdonY = randomMinMax(endY + 40, startY - 40) //leaving gap of 20 top and bottom
        midPoints.push([ramdonX, ramdonY])
    }
    coordinates.mid1 = midPoints[0]
    coordinates.mid2 = midPoints[1]
})


//this uses formula to calculate x and y coordinates according coordinates given
//this is also using the startX and startX variable
function giveXAndYCoordinate(coordinatesReq, t) {
    const {mid1, mid2, end } = coordinatesReq
    const x = (Math.pow((1 - t), 3) * startX) + (3 * Math.pow((1 - t), 2) * t * mid1[0]) + (3 * (1 - t) * t * t * mid2[0]) + (Math.pow(t, 3) * end[0])
    const y = (Math.pow((1 - t), 3) * startY) + (3 * Math.pow((1 - t), 2) * t * mid1[1]) + (3 * (1 - t) * t * t * mid2[1]) + (Math.pow(t, 3) * end[1])

    return [x, y]
}

function draw(char, x, y, fontSize) {
    c.font = getFont(fontSize)
    c.fillText(char, x, y)
}

function redraw() {
    const newFontSize = adjustFontSize()
    c.font = getFont(newFontSize)
    const lineWidth = c.measureText(title).width
    const x = getStartingXOfLine(lineWidth, logoWidth, gapOfImageFromTitleInPx)
    c.fillText(title, x, endY)
    positionLogo(x)
}

function positionLogo(lineStartX) {
    logo.style.left = (lineStartX - gapOfImageFromTitleInPx - logoWidth) + "px"
    logo.style.top = yOfImage + "px"
}

// starting the animation and positioning the logo to the left of the title 
positionLogo(firstLetterEndX)

let t = 0;
const interval = setInterval(() => {
    c.clearRect(0, 0, canvas.width, canvas.height); //clearing the canvas before drawing
    if (t >= 1) clearInterval(interval)
    for (let i = 0; i < title.length; i++) {
        const [x, y] = giveXAndYCoordinate(coordinates_of_all_letter[i], t)
        draw(title[i], x, y, currentFontSize)
    }
    t += .006;
}, 17)


addEventListener('resize', () => {
    canvas.width  = window.document.body.clientWidth
    canvas.height = (.8 * window.innerHeight)
    redraw()
})