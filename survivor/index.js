const n = 20;
const TIME = 180;
// SEASONS set to the first 40 elements of the seasons array
const SEASONS = seasons.slice(0, 40);
let sortable = null;
let started = false;
// get hours, minutes and seconds from the time
const initTime = new Date(TIME * 1000).toISOString().slice(11, 19);
$("#timer").html(initTime);

var myTimer = new Timer();


function getImage(index) {
    return './assets/' + (index + 1) + '.png';
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {

        // Generate random number 
        var j = Math.floor(Math.random() * (i + 1));

        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

// Shuffle the logos randomly
const shuffledLogos = shuffleArray([...Array(SEASONS.length).keys()]).slice(0, n);
const correctOrder = shuffledLogos.slice().sort((a, b) => a - b);
// console.log(...shuffledLogos);
// console.log(...correctOrder);
function onSubmit() {
    myTimer.stop();
    sortable.option("disabled", true);
    document.getElementById("submit-button").classList.add("disabled");

    showResults();

}

function showResults() {

    const finalItems = document.getElementById("final-items");
    finalItems.classList.remove("hidden");
    const items = document.getElementById("items");
    let correct = 0;
    for (let i = 0; i < n; i++) {
        const item = items.children[i];
        const finalItem = finalItems.children[i];
        if (item.id === finalItem.id) {
            finalItem.classList.add("correct");
            correct++;
        } else {
            finalItem.classList.add("wrong");
        }
    }
}


function initTimer() {
    myTimer.addEventListener("secondsUpdated", function (e) {
        $("#timer").html(myTimer.getTimeValues().toString());
    });
    myTimer.addEventListener("targetAchieved", function (e) {
        console.log("Timer done");
        onSubmit();
    });
    myTimer.start({
        countdown: true,
        startValues: { seconds: TIME },
        target: { seconds: 0 },
    });

}

// Function to start the game
function startGame() {
    if (started) {
        return;
    }
    document.getElementById("start-button").classList.add("disabled");
    document.getElementById("submit-button").classList.remove("disabled");
    initTimer();
    const gameBoard = document.getElementById("game-container");
    gameBoard.classList.remove("hidden");
}

function initBoard() {
    const items = document.getElementById("items");
    const finalItems = document.getElementById("final-items");
    for (let i = 0; i < n; i++) {
        const item = document.createElement("li");
        item.setAttribute("id", shuffledLogos[i]);
        const img = document.createElement("img");
        img.setAttribute("src", getImage(shuffledLogos[i]));
        item.appendChild(img);
        items.appendChild(item);

        const finalItem = document.createElement("li");
        finalItem.setAttribute("id", correctOrder[i]);
        const finalImgContainer = document.createElement("div");
        finalImgContainer.classList.add("img-container");
        const finalImg = document.createElement("img");
        finalImg.setAttribute("src", getImage(correctOrder[i]));
        finalImgContainer.appendChild(finalImg);
        const finalText = document.createElement("span");
        let seasonName = SEASONS[correctOrder[i]].split("Survivor")[1].substring(1).trim();
        finalText.innerHTML = "Season " + (correctOrder[i] + 1) + ": " + seasonName;
        finalImgContainer.appendChild(finalText);
        finalItem.appendChild(finalImgContainer);
        finalItems.appendChild(finalItem);
    }
    sortable = Sortable.create(items, {
        animation: 150,
        ghostClass: 'blue-background-class',
        scroll: true,
        forceAutoScrollFallback: false, // force autoscroll plugin to enable even when native browser autoscroll is available

    });
}

initBoard();

$(document).on('contextmenu', function (e) {
    // stop long touch hold from poping up context menus
    return false;
});

// Start the game on start-button being clicked
document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("submit-button").addEventListener("click", onSubmit);