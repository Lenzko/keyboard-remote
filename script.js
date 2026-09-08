// =========================================
// ELEMENT
// =========================================

const shiftButton = document.getElementById("shiftButton");
const enterButton = document.getElementById("enterButton");
const connectionStatus = document.getElementById("connectionStatus");


// =========================================
// STATUS
// =========================================

let shiftPressed = false;
let enterPressed = false;


// =========================================
// FUNGSI TEKAN SHIFT
// =========================================

function shiftDown() {

    if (shiftPressed) return;

    shiftPressed = true;

    shiftButton.classList.add("active");

    console.log("SHIFT DOWN");
}


// =========================================
// FUNGSI LEPAS SHIFT
// =========================================

function shiftUp() {

    if (!shiftPressed) return;

    shiftPressed = false;

    shiftButton.classList.remove("active");

    console.log("SHIFT UP");
}


// =========================================
// FUNGSI TEKAN ENTER
// =========================================

function enterDown() {

    if (enterPressed) return;

    enterPressed = true;

    enterButton.classList.add("active");

    console.log("ENTER DOWN");
}


// =========================================
// FUNGSI LEPAS ENTER
// =========================================

function enterUp() {

    if (!enterPressed) return;

    enterPressed = false;

    enterButton.classList.remove("active");

    console.log("ENTER UP");
}


// =========================================
// TOUCH SHIFT
// =========================================

shiftButton.addEventListener("pointerdown", function(event) {

    event.preventDefault();

    shiftDown();

});

shiftButton.addEventListener("pointerup", function(event) {

    event.preventDefault();

    shiftUp();

});

shiftButton.addEventListener("pointercancel", function() {

    shiftUp();

});


// =========================================
// TOUCH ENTER
// =========================================

enterButton.addEventListener("pointerdown", function(event) {

    event.preventDefault();

    enterDown();

});

enterButton.addEventListener("pointerup", function(event) {

    event.preventDefault();

    enterUp();

});

enterButton.addEventListener("pointercancel", function() {

    enterUp();

});


// =========================================
// STATUS SEMENTARA
// =========================================

connectionStatus.textContent = "● Ready";

connectionStatus.style.color = "#fff";
