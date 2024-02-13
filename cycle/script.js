import { CYCLE } from "./cycles.js";

let currentCycle = CYCLE[0];
let words = currentCycle.cycle;
let clues = currentCycle.clues;
let sources = currentCycle.sources;
let scores = currentCycle.scores;
const CYCLE_LENGTH = words.length;
const WORD_LENGTH = words[0].length;
let guesses = [];
for (let i = 0; i < CYCLE_LENGTH; i++) {
    guesses.push([]);
}
let active_guess = 0;
let solved = false;

console.log(currentCycle);

function convertScoreToCommon(score) {
    if (score >= 45) {
        return "Common"
    } else if (score >= 35) {
        return "Uncommon"
    } else if (score >= 25) {
        return "Rare"
    } else if (score >= 3) {
        return "Very Rare"
    } else if (score >= 2) {
        return "Ultra Rare"
    } else {
        return "Unknown Rarity"
    }
}

function initBoard() {
    let board = document.getElementById("game-board");
    let col1 = document.createElement("div");
    col1.className = "col-6";
    let col2 = document.createElement("div");
    col2.className = "col-6";
    board.appendChild(col1);
    board.appendChild(col2);
    let col3 = document.createElement("div");
    col3.className = "col-6";
    board.appendChild(col3);

    for (let i = 0; i < CYCLE_LENGTH; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"

        for (let j = 0; j < WORD_LENGTH; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }
        col1.appendChild(row)

        let cluewrapper = document.createElement("div");
        cluewrapper.className = "clue-wrapper"
        let clue = document.createElement("div")
        clue.className = "clue"
        clue.textContent = clues[i]
        cluewrapper.appendChild(clue)

        // Create a tooltip icon
        let cluewrapper2 = document.createElement("div");
        cluewrapper2.className = "clue-wrapper"
        let tooltipIcon = document.createElement("span");
        tooltipIcon.className = "tooltip-icon";
        tooltipIcon.title = sources[i] + "<br>" + convertScoreToCommon(scores[i]);
        cluewrapper2.appendChild(tooltipIcon)

        col2.appendChild(cluewrapper)
        col3.appendChild(cluewrapper2)



    }

    // Add event listeners to display clues on hover or touch
    document.querySelectorAll(".clue-wrapper").forEach(row => {
        row.addEventListener("mouseenter", displayInfo);
        row.addEventListener("mouseleave", hideInfo);
        row.addEventListener("touchstart", displayInfo);
        row.addEventListener("touchend", hideInfo);
    });

    // on mouseclick or touch, change the active guess
    document.querySelectorAll(".clue-wrapper, .letter-row").forEach(row => {
        row.addEventListener("click", changeActiveGuessOnClick);
        row.addEventListener("touchstart", changeActiveGuessOnClick);
    });


    changeActiveGuess(active_guess);
    updateActiveCell();
}

// Function to display clues on hover or touch
function displayInfo(event) {
    let tooltip = event.target;
    if (tooltip.tagName !== "SPAN") {
        tooltip = tooltip.querySelector("span.tooltip-icon");
    }
    if (tooltip) {
        tooltip.classList.add("show-tooltip");
    }
    toastr.info(tooltip.title, "Source");
}

function hideInfo(event) {
    let tooltip = event.target;
    if (tooltip.tagName !== "SPAN") {
        tooltip = tooltip.querySelector("span.tooltip-icon");
    }
    if (tooltip) {
        tooltip.classList.remove("show-tooltip");
    }
    toastr.remove();
}

function changeActiveGuessOnClick(event) {
    let clue = event.target;
    if (clue.tagName !== "DIV") {
        clue = clue.parentElement;
    }
    let clues = document.getElementsByClassName("clue-wrapper");
    for (let i = 0; i < CYCLE_LENGTH; i++) {
        if (clues[i] === clue) {
            changeActiveGuess(i);
            updateActiveCell();
            return;
        }
    }
    let rows = document.getElementsByClassName("letter-row");
    for (let i = 0; i < CYCLE_LENGTH; i++) {
        if (rows[i] === clue) {
            changeActiveGuess(i);
            updateActiveCell();
            return;
        }
    }

}

function updateActiveCell() {
    // for each row, for each box, remove active-box
    let rows = document.getElementsByClassName("letter-row")
    for (let i = 0; i < CYCLE_LENGTH; i++) {
        let boxes = rows[i].children
        for (let j = 0; j < WORD_LENGTH; j++) {
            boxes[j].classList.remove("active-box")
            // add active-box to the active cell
            if (i === active_guess && j === Math.min(guesses[active_guess].length, WORD_LENGTH - 1)) {
                boxes[j].classList.add("active-box")
            }
        }
    }

}

function changeActiveGuess(newActive) {
    let cols = document.getElementsByClassName("col-6")
    // for each col
    for (let i = 0; i < cols.length; i++) {
        let oldRow = cols[i].children[active_guess]
        let newRow = cols[i].children[newActive]

        oldRow.classList.remove("active-row")
        newRow.classList.add("active-row")
    }
    active_guess = newActive;
}

function nextGuess() {
    changeActiveGuess((active_guess + 1) % CYCLE_LENGTH);
}

function prevGuess() {
    changeActiveGuess((active_guess - 1 + CYCLE_LENGTH) % CYCLE_LENGTH);
}

function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[active_guess]
    let box = row.children[guesses[active_guess].length - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    guesses[active_guess].pop()
}

function checkGuesses() {
    // for each word in the cycle
    for (let i = 0; i < CYCLE_LENGTH; i++) {
        // for each letter in the word
        for (let j = 0; j < WORD_LENGTH; j++) {
            // if the letter is not the same as the guess
            if (words[i][j] !== guesses[i][j]) {
                return
            }
        }
    }
    console.log("CORRECT");
    toastr.success("You got it right! Game over!");
    solved = true;
}

function insertLetter(pressedKey) {
    if (guesses[active_guess].length === WORD_LENGTH) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[active_guess]
    let box = row.children[guesses[active_guess].length]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    guesses[active_guess].push(pressedKey);
    if (guesses[active_guess].length === WORD_LENGTH) {
        nextGuess()
    }
}

const animateCSS = (element, animation, prefix = 'animate__') =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        // const node = document.querySelector(element);
        const node = element
        node.style.setProperty('--animate-duration', '0.3s');

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });

document.addEventListener("keyup", (e) => {
    if (solved) {
        return
    }

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && guesses[active_guess].length !== 0) {
        deleteLetter();
        updateActiveCell();
        return;
    }

    if (pressedKey === "ArrowUp") {
        prevGuess();
        updateActiveCell();
        return;
    }
    if (pressedKey === "ArrowDown") {
        nextGuess();
        updateActiveCell();
        return;
    }
    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey)
        updateActiveCell();
    }
    checkGuesses();
})

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (key === "Del") {
        key = "Backspace"
    }
    else if (key === "Next") {
        key = "ArrowDown"
    }

    document.dispatchEvent(new KeyboardEvent("keyup", { 'key': key }))
})


initBoard()
