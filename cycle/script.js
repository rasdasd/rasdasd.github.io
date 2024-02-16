import { CYCLE } from "./cycles.js";
const DEFAULT_COOKIE_DATA = {
    "version": "1.0.0",
    "settings": {
        "virtual_keyboard_input_only": false,
        "dark_mode": false,
    },
    "guesses": {},
    "solved": {},
}
const START_DATE = new Date("2024-01-01 00:00:00");
const MIN_DELTA = 0;
const MAX_DELTA = CYCLE.length - 1;
const DAY = 1000 * 60 * 60 * 24;
const date_display_options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
};

let curr_date = new Date();
let day_delta = Math.floor((curr_date - START_DATE) / DAY);
day_delta = Math.max(MIN_DELTA, Math.min(MAX_DELTA, day_delta));

const COOKIE_DATA = readCookieData();

let INDEX = day_delta;
let currentCycle = CYCLE[INDEX];
let words = currentCycle.cycle;
let clues = currentCycle.clues;
let sources = currentCycle.sources;
let scores = currentCycle.scores;
let years = currentCycle.years;
let CYCLE_LENGTH = words.length;
let WORD_LENGTH = words[0].length;
if (!COOKIE_DATA.guesses.hasOwnProperty(INDEX)) {
    COOKIE_DATA.guesses[INDEX] = [];
    for (let i = 0; i < CYCLE_LENGTH; i++) {
        COOKIE_DATA.guesses[INDEX].push([]);
    }
}
let guesses = COOKIE_DATA.guesses[INDEX];
let active_guess = 0;
if (!COOKIE_DATA.solved.hasOwnProperty(INDEX)) {
    COOKIE_DATA.solved[INDEX] = false;
}
let solved = COOKIE_DATA.solved[INDEX];

setCookieData();
let init = false;

function readCookieData() {
    let data = Cookies.get("data");
    if (data === undefined) {
        data = DEFAULT_COOKIE_DATA;
    } else {
        data = JSON.parse(data);
    }
    if (data.settings === undefined) {
        data.settings = DEFAULT_COOKIE_DATA.settings;
    }
    data.version = DEFAULT_COOKIE_DATA.version;
    return data;
}

function setCookieData() {
    Cookies.set("data", JSON.stringify(COOKIE_DATA), { expires: 367 });
}

function convertScoreToCommon(score) {
    if (score >= 48) {
        return "Common"
    } else if (score >= 42) {
        return "Uncommon"
    } else if (score >= 35) {
        return "Rare"
    } else if (score >= 25) {
        return "Very Rare"
    } else if (score >= 3) {
        return "Extremely Rare"
    } else if (score >= 2) {
        return "Ultra Rare"
    } else {
        return "Unknown Rarity"
    }
}

function initBoard(index) {
    init = false;
    /* INIT DATA */
    INDEX = index;
    currentCycle = CYCLE[INDEX];
    words = currentCycle.cycle;
    clues = currentCycle.clues;
    sources = currentCycle.sources;
    scores = currentCycle.scores;
    years = currentCycle.years;
    CYCLE_LENGTH = words.length;
    WORD_LENGTH = words[0].length;
    if (!COOKIE_DATA.guesses.hasOwnProperty(INDEX)) {
        COOKIE_DATA.guesses[INDEX] = [];
        for (let i = 0; i < CYCLE_LENGTH; i++) {
            COOKIE_DATA.guesses[INDEX].push([]);
        }
    }
    guesses = COOKIE_DATA.guesses[INDEX];
    active_guess = 0;
    if (!COOKIE_DATA.solved.hasOwnProperty(INDEX)) {
        COOKIE_DATA.solved[INDEX] = false;
    }
    solved = COOKIE_DATA.solved[INDEX];

    // console.log(currentCycle);

    /* INIT BOARD */

    let dateDiv = document.getElementById("date");
    dateDiv.textContent = new Date(START_DATE.getTime() + index * DAY).toLocaleDateString(undefined, date_display_options);


    let board = document.getElementById("game-board");
    /* remove all eleemnts from board */
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }

    let col1 = document.createElement("div");
    col1.className = "col-6";
    col1.classList.add("touchable-col");
    let col2 = document.createElement("div");
    col2.className = "col-6";
    col2.classList.add("touchable-col");
    board.appendChild(col1);
    board.appendChild(col2);
    let col3 = document.createElement("div");
    col3.className = "col-6";
    board.appendChild(col3);

    for (let i = 0; i < CYCLE_LENGTH; i++) {
        let row = document.createElement("div")
        row.className = "clue-wrapper"
        row.classList.add("letter-row");

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
        cluewrapper2.classList.add("tooltip-wrapper");
        let tooltipIcon = document.createElement("span");
        tooltipIcon.className = "tooltip-icon";
        // store data in secondary attribute
        tooltipIcon.setAttribute("data-source", sources[i] + " - " + years[i] + " - " + convertScoreToCommon(scores[i]));

        cluewrapper2.appendChild(tooltipIcon)

        col2.appendChild(cluewrapper)
        col3.appendChild(cluewrapper2)



    }

    // Add event listeners to display clues on hover or touch
    document.querySelectorAll(".tooltip-wrapper").forEach(row => {
        row.addEventListener("mouseenter", displayInfo);
        row.addEventListener("mouseleave", hideInfo);
        row.addEventListener("touchstart", displayInfo);
        row.addEventListener("touchend", hideInfo);
    });

    // on mouseclick or touch, change the active guess
    document.querySelectorAll(".clue-wrapper").forEach(row => {
        row.addEventListener("click", changeActiveGuessOnClick);
        row.addEventListener("touchstart", changeActiveGuessOnClick);
    });

    unsafeInsertLetterFromGuesses();
    changeActiveGuess(active_guess);
    updateActiveCell();
    init = true;
}

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

// Function to display clues on hover or touch
function displayInfo(event) {
    let tooltip = event.target;
    if (tooltip.tagName !== "SPAN") {
        tooltip = tooltip.querySelector("span.tooltip-icon");
    }
    let parts = tooltip.getAttribute("data-source").split(" - ");
    Toast.fire({
        // title: "Source",
        html: `${parts[0]} - ${parts[1]}<br>${parts[2]}`,
        // icon: "info"
        customClass: {
            popup: "colored-toast"
        },
        iconHtml: `<img class="toast-icon" src="./assets/${parts[0]}.svg" onerror="this.src='./assets/fallback.svg';">`,
    });
}

function hideInfo(event) {
    // Toast.close();
}

function changeActiveGuessOnClick(event) {
    let clue = event.target;
    if (clue.tagName !== "DIV") {
        clue = clue.parentElement;
    }
    let cols = document.getElementsByClassName("touchable-col")
    for (let i = 0; i < cols.length; i++) {
        let col = cols[i]
        let clues = col.getElementsByClassName("clue-wrapper");
        for (let i = 0; i < CYCLE_LENGTH; i++) {
            if (clues[i] === clue) {
                changeActiveGuess(i);
                updateActiveCell();
                return;
            }
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
    setCookieData();
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
    onWin();
}

function insertLetter(pressedKey) {
    if (guesses[active_guess].length === WORD_LENGTH) {
        return
    }
    pressedKey = pressedKey.toUpperCase()

    // let row = document.getElementsByClassName("letter-row")[active_guess]
    // let box = row.children[guesses[active_guess].length]
    // animateCSS(box, "pulse")
    // box.textContent = pressedKey
    // box.classList.add("filled-box")
    let box = unsafeInsertLetter(pressedKey, active_guess, guesses[active_guess].length)
    animateCSS(box, "pulse")
    guesses[active_guess].push(pressedKey);
    setCookieData();
    if (guesses[active_guess].length === WORD_LENGTH) {
        nextGuess()
    }
}

function unsafeInsertLetterFromGuesses() {
    for (let i = 0; i < guesses.length; i++) {
        for (let j = 0; j < guesses[i].length; j++) {
            unsafeInsertLetter(guesses[i][j].toUpperCase(), i, j);
        }
    }

}

function unsafeInsertLetter(key, index, position) {
    let row = document.getElementsByClassName("letter-row")[index]
    let box = row.children[position]
    box.textContent = key
    box.classList.add("filled-box")
    return box;
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
    if (!init) {
        return
    }
    if (solved) {
        return
    }
    if (COOKIE_DATA.settings.virtual_keyboard_input_only && e.code != "virtual") {
        return;
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
});

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

    document.dispatchEvent(new KeyboardEvent("keyup", { 'key': key, 'code': "virtual" }));
});


function decrementIndex() {
    let prevIndex = INDEX;
    INDEX = Math.max(MIN_DELTA, INDEX - 1);
    if (INDEX === prevIndex) {
        return
    }
    initBoard(INDEX);
}
function incrementIndex() {
    let prevIndex = INDEX;
    INDEX = Math.min(MAX_DELTA, INDEX + 1);
    if (INDEX === prevIndex) {
        return
    }
    initBoard(INDEX);
}

function onWin() {
    Swal.fire({
        title: "You got it right!",
        text: "Game over!",
        icon: "success",
        confirmButtonText: "Next",
    })
    solved = true;
    COOKIE_DATA.solved[INDEX] = true;
    setCookieData();
}


initBoard(INDEX)



const Dialog = Swal.mixin({
    position: "center",
    showCloseButton: true,
});

function showHowToPlay() {
    // show a welcome message, and have the confirmation button be a share button
    Dialog.fire({
        title: "Welcome to the game!",
        html: `This is a game of <b>Word Cycles</b>. The goal is to guess the word in each cycle. Use the keyboard to enter letters. Use the arrows to navigate between cycles. The game will automatically save your progress. Good luck!`,
        icon: "question",
        confirmButtonText: "Share",
        preConfirm: async () => {
            // copy link to clipboard
            navigator.clipboard.writeText(window.location.href);
            Swal.showValidationMessage(
                "Link copied to clipboard"
            );
            return false;
        }
    });
}

function showStats() {
    // track the following
    // total played
    // win %
    // current streak
    // max streak

    let totalPlayed = 0;
    let wins = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let streak = 0;
    for (let i = 0; i < CYCLE.length; i++) {
        if (COOKIE_DATA.solved[i]) {
            wins++;
            streak++;
        } else {
            streak = 0;
        }
        if (streak > maxStreak) {
            maxStreak = streak;
        }
        totalPlayed++;
    }
    let winPercent = (wins / totalPlayed * 100).toFixed(2);
    Dialog.fire({
        title: "Stats",
        html: `You have played <b>${totalPlayed}</b> cycles.<br>
        You have won <b>${wins}</b> cycles.<br>
        Your win percentage is <b>${winPercent}%</b>.<br>
        Your current streak is <b>${streak}</b>.<br>
        Your max streak is <b>${maxStreak}</b>.`,
        icon: "info",
    });
}

function updateSetting(setting, value) {
    COOKIE_DATA.settings[setting] = value;
    setCookieData();
    if (setting === "dark_mode") {
        update_dark_mode();
    }
}

function update_dark_mode() {
    if (COOKIE_DATA.settings.dark_mode) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function showSettings() {
    // settings include
    // on screen keyboard input only
    // dark mode
    // reset progress

    // settings html
    // for each setting in setting
    // create a div with a label and a toggle switch
    // add an event listener to the switch
    // on change, update the cookie data and the settings
    /* EXAMPLE TOGGLE
    <label class="switch">
        <input type="checkbox">
        <span class="slider round"></span>
    </label>
    */
    let settings = COOKIE_DATA.settings;
    let settingsHTML = "";
    // ensure each setting has its own row
    // ensure that if checkbox is checked, we update settings
    for (let setting in settings) {
        let label = setting.split("_").map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(" ");
        settingsHTML += `
        <div class="setting">
            <span>${label}</span>
            <label class="switch">
                <input type="checkbox" id="${setting}" ${settings[setting] ? "checked" : ""}>
                <span class="slider round"></span>
            </label>
        </div>`;
    }

    Dialog.fire({
        title: "Settings",
        html: settingsHTML,
        icon: "info",
        didOpen: () => {
            for (let setting in settings) {
                let input = document.getElementById(setting);
                input.addEventListener("change", (e) => {
                    updateSetting(setting, e.target.checked);
                });
            }
        }
    });
}

update_dark_mode();

// if there are no solved cycles, show how to play
// solved is a dictionary of index to solved status

if (Object.values(COOKIE_DATA.solved).every(x => x === false)) {
    showHowToPlay();
}


/* implement prev-button */
document.getElementById("prev-button").addEventListener("click", (e) => {
    decrementIndex();
});

/* implement next-button */
document.getElementById("next-button").addEventListener("click", (e) => {
    incrementIndex();
});

/* implement settings-button */
document.getElementById("settings-button").addEventListener("click", (e) => {
    showSettings();
});

/* implement stats-button */
document.getElementById("stats-button").addEventListener("click", (e) => {
    showStats();
});

/* implement help-button */
document.getElementById("help-button").addEventListener("click", (e) => {
    showHowToPlay();
});