// =====================================================
// KEYBOARD REMOTE - BLUETOOTH BLE
// =====================================================

// UUID yang sama dengan bluetooth_server.py
const SERVICE_UUID =
    "7f6a0001-7b7b-4f9a-9c01-123456789abc";

const COMMAND_UUID =
    "7f6a0002-7b7b-4f9a-9c01-123456789abc";


// =====================================================
// ELEMENT
// =====================================================

const shiftButton = document.getElementById("shiftButton");
const enterButton = document.getElementById("enterButton");
const connectionStatus =
    document.getElementById("connectionStatus");


// =====================================================
// BLUETOOTH VARIABLES
// =====================================================

let bluetoothDevice = null;
let commandCharacteristic = null;

let shiftPressed = false;
let enterPressed = false;


// =====================================================
// CEK WEB BLUETOOTH
// =====================================================

if (!navigator.bluetooth) {

    connectionStatus.textContent =
        "● Web Bluetooth tidak didukung";

    connectionStatus.style.color = "#ff4444";

    console.error(
        "Browser ini tidak mendukung Web Bluetooth."
    );
}


// =====================================================
// UPDATE STATUS
// =====================================================

function setStatus(text, connected = false) {

    connectionStatus.textContent =
        connected ? "● " + text : "● " + text;

    connectionStatus.style.color =
        connected ? "#00ff66" : "#ffffff";
}


// =====================================================
// CONNECT BLUETOOTH
// =====================================================

async function connectBluetooth() {

    try {

        setStatus("Mencari Bluetooth...");

        console.log("Mencari KEYBOARD-REMOTE...");


        // ---------------------------------------------
        // CARI DEVICE
        // ---------------------------------------------

        bluetoothDevice =
            await navigator.bluetooth.requestDevice({

                filters: [
                    {
                        services: [SERVICE_UUID]
                    }
                ],

                optionalServices: [
                    SERVICE_UUID
                ]

            });


        console.log(
            "Device ditemukan:",
            bluetoothDevice.name
        );


        setStatus("Menghubungkan...");


        // ---------------------------------------------
        // EVENT DISCONNECT
        // ---------------------------------------------

        bluetoothDevice.addEventListener(
            "gattserverdisconnected",
            bluetoothDisconnected
        );


        // ---------------------------------------------
        // CONNECT GATT
        // ---------------------------------------------

        const server =
            await bluetoothDevice.gatt.connect();


        console.log("GATT connected");


        // ---------------------------------------------
        // GET SERVICE
        // ---------------------------------------------

        const service =
            await server.getPrimaryService(
                SERVICE_UUID
            );


        console.log("Service ditemukan");


        // ---------------------------------------------
        // GET CHARACTERISTIC
        // ---------------------------------------------

        commandCharacteristic =
            await service.getCharacteristic(
                COMMAND_UUID
            );


        console.log(
            "Command characteristic ditemukan"
        );


        // ---------------------------------------------
        // BERHASIL
        // ---------------------------------------------

        setStatus("Bluetooth Connected", true);

        console.log(
            "================================"
        );

        console.log(
            "KEYBOARD-REMOTE TERHUBUNG"
        );

        console.log(
            "================================"
        );


    } catch (error) {

        console.error(
            "Bluetooth error:",
            error
        );

        setStatus("Bluetooth gagal");

        alert(
            "Gagal terhubung ke Bluetooth.\n\n" +
            error.message
        );

    }

}


// =====================================================
// DISCONNECTED
// =====================================================

function bluetoothDisconnected() {

    console.log(
        "Bluetooth terputus"
    );


    commandCharacteristic = null;


    // SAFETY
    shiftPressed = false;
    enterPressed = false;


    shiftButton.classList.remove("active");
    enterButton.classList.remove("active");


    setStatus(
        "Bluetooth Disconnected"
    );
}


// =====================================================
// KIRIM COMMAND
// =====================================================

async function sendCommand(command) {

    if (!commandCharacteristic) {

        console.warn(
            "Bluetooth belum terhubung:",
            command
        );

        return;
    }


    try {

        const encoder =
            new TextEncoder();

        const data =
            encoder.encode(command);


        await commandCharacteristic
            .writeValueWithoutResponse(data);


        console.log(
            "COMMAND:",
            command
        );


    } catch (error) {

        console.error(
            "Gagal mengirim command:",
            error
        );

    }

}


// =====================================================
// SHIFT DOWN
// =====================================================

async function shiftDown() {

    if (shiftPressed)
        return;


    shiftPressed = true;

    shiftButton.classList.add("active");


    await sendCommand(
        "SHIFT_DOWN"
    );

}


// =====================================================
// SHIFT UP
// =====================================================

async function shiftUp() {

    if (!shiftPressed)
        return;


    shiftPressed = false;

    shiftButton.classList.remove("active");


    await sendCommand(
        "SHIFT_UP"
    );

}


// =====================================================
// ENTER DOWN
// =====================================================

async function enterDown() {

    if (enterPressed)
        return;


    enterPressed = true;

    enterButton.classList.add("active");


    await sendCommand(
        "ENTER_DOWN"
    );

}


// =====================================================
// ENTER UP
// =====================================================

async function enterUp() {

    if (!enterPressed)
        return;


    enterPressed = false;

    enterButton.classList.remove("active");


    await sendCommand(
        "ENTER_UP"
    );

}


// =====================================================
// POINTER EVENTS
// =====================================================

shiftButton.addEventListener(
    "pointerdown",
    async function(event) {

        event.preventDefault();

        await shiftDown();

    }
);


shiftButton.addEventListener(
    "pointerup",
    async function(event) {

        event.preventDefault();

        await shiftUp();

    }
);


shiftButton.addEventListener(
    "pointercancel",
    async function() {

        await shiftUp();

    }
);


shiftButton.addEventListener(
    "pointerleave",
    async function() {

        if (shiftPressed) {

            await shiftUp();

        }

    }
);


// =====================================================
// ENTER
// =====================================================

enterButton.addEventListener(
    "pointerdown",
    async function(event) {

        event.preventDefault();

        await enterDown();

    }
);


enterButton.addEventListener(
    "pointerup",
    async function(event) {

        event.preventDefault();

        await enterUp();

    }
);


enterButton.addEventListener(
    "pointercancel",
    async function() {

        await enterUp();

    }
);


enterButton.addEventListener(
    "pointerleave",
    async function() {

        if (enterPressed) {

            await enterUp();

        }

    }
);


// =====================================================
// CONNECT BUTTON
// =====================================================

const connectButton =
    document.createElement("button");

connectButton.textContent =
    "🔵 CONNECT BLUETOOTH";


connectButton.style.position =
    "fixed";

connectButton.style.top =
    "10px";

connectButton.style.left =
    "50%";

connectButton.style.transform =
    "translateX(-50%)";

connectButton.style.zIndex =
    "1000";

connectButton.style.padding =
    "12px 22px";

connectButton.style.border =
    "none";

connectButton.style.borderRadius =
    "25px";

connectButton.style.background =
    "#ffffff";

connectButton.style.color =
    "#111111";

connectButton.style.fontWeight =
    "bold";

connectButton.style.fontSize =
    "15px";

connectButton.style.cursor =
    "pointer";


document.body.appendChild(
    connectButton
);


connectButton.addEventListener(
    "click",
    connectBluetooth
);


// =====================================================
// INITIAL STATUS
// =====================================================

setStatus(
    "Bluetooth Disconnected"
);
