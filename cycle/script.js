import { CYCLE } from "./cycles.js";

let currentCycle = CYCLE[0];
let words = currentCycle[0];
let clues = currentCycle[1];
const CYCLE_LENGTH = words.length;
const WORD_LENGTH = words[0].length;
let guesses = [];
for (let i = 0; i < CYCLE_LENGTH; i++) {
    guesses.push([]);
}
let active_guess = 0;
let solved = false;

console.log(currentCycle);

function initBoard() {
    let board = document.getElementById("game-board");
    let col1 = document.createElement("div");
    col1.className = "col-6";
    let col2 = document.createElement("div");
    col2.className = "col-6";
    board.appendChild(col1);
    board.appendChild(col2);

    for (let i = 0; i < CYCLE_LENGTH; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"

        for (let j = 0; j < WORD_LENGTH; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }
        col1.appendChild(row)


        let clue = document.createElement("div")
        clue.className = "clue"
        clue.textContent = clues[i]
        col2.appendChild(clue)


    }
}

function changeActiveGuess(newActive) {
    let oldRow = document.getElementsByClassName("letter-row")[active_guess]
    let newRow = document.getElementsByClassName("letter-row")[newActive]

    oldRow.style.backgroundColor = "white"
    newRow.style.backgroundColor = "lightgrey"

    active_guess = newActive
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
        return;
    }

    if (pressedKey === "ArrowUp") {
        prevGuess();
        return;
    }
    if (pressedKey === "ArrowDown") {
        nextGuess();
        return;
    }
    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
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
    else if (key === "Up") {
        key = "ArrowUp"
    }
    else if (key === "Down") {
        key = "ArrowDown"
    }

    document.dispatchEvent(new KeyboardEvent("keyup", { 'key': key }))
})


initBoard()
