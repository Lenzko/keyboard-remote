// =====================================================
// KEYBOARD REMOTE - BLE
// =====================================================

const SERVICE_UUID =
    "7f6a0001-7b7b-4f9a-9c01-123456789abc";

const COMMAND_UUID =
    "7f6a0002-7b7b-4f9a-9c01-123456789abc";


// =====================================================
// ELEMENT
// =====================================================

const shiftButton =
    document.getElementById("shiftButton");

const enterButton =
    document.getElementById("enterButton");

const connectionStatus =
    document.getElementById("connectionStatus");


// =====================================================
// BLUETOOTH
// =====================================================

let bluetoothDevice = null;
let commandCharacteristic = null;

let shiftPressed = false;


// =====================================================
// STATUS
// =====================================================

function setStatus(text, connected = false) {

    if (!connectionStatus) return;

    connectionStatus.textContent = "● " + text;

    connectionStatus.style.color =
        connected ? "#00ff66" : "#ffffff";
}


// =====================================================
// CONNECT
// =====================================================

async function connectBluetooth() {

    try {

        setStatus("Mencari Bluetooth...");

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
            "DEVICE:",
            bluetoothDevice.name
        );


        setStatus("Menghubungkan...");


        bluetoothDevice.addEventListener(
            "gattserverdisconnected",
            bluetoothDisconnected
        );


        const server =
            await bluetoothDevice.gatt.connect();


        const service =
            await server.getPrimaryService(
                SERVICE_UUID
            );


        commandCharacteristic =
            await service.getCharacteristic(
                COMMAND_UUID
            );


        setStatus(
            "Bluetooth Connected",
            true
        );


        console.log(
            "BLUETOOTH SIAP"
        );

    }

    catch (error) {

        console.error(error);

        setStatus("Bluetooth gagal");

        alert(
            "Bluetooth gagal:\n" +
            error.message
        );

    }

}


// =====================================================
// DISCONNECT
// =====================================================

function bluetoothDisconnected() {

    console.log(
        "Bluetooth terputus"
    );

    commandCharacteristic = null;

    shiftPressed = false;

    shiftButton.classList.remove("active");

    setStatus(
        "Bluetooth Disconnected"
    );

}


// =====================================================
// SEND COMMAND
// =====================================================

async function sendCommand(command) {

    if (!commandCharacteristic) {

        console.log(
            "BELUM TERHUBUNG:",
            command
        );

        return;

    }


    try {

        const data =
            new TextEncoder().encode(command);


        await commandCharacteristic
            .writeValueWithoutResponse(data);


        console.log(
            "TERKIRIM:",
            command
        );

    }

    catch (error) {

        console.error(
            "GAGAL KIRIM:",
            command,
            error
        );

    }

}


// =====================================================
// SHIFT
// =====================================================

shiftButton.addEventListener(
    "pointerdown",
    async function(event) {

        event.preventDefault();

        if (shiftPressed) return;

        shiftPressed = true;

        shiftButton.classList.add("active");

        console.log(
            "SHIFT DOWN"
        );

        await sendCommand(
            "SHIFT_DOWN"
        );

    }
);


shiftButton.addEventListener(
    "pointerup",
    async function(event) {

        event.preventDefault();

        if (!shiftPressed) return;

        shiftPressed = false;

        shiftButton.classList.remove("active");

        console.log(
            "SHIFT UP"
        );

        await sendCommand(
            "SHIFT_UP"
        );

    }
);


shiftButton.addEventListener(
    "pointercancel",
    async function() {

        if (!shiftPressed) return;

        shiftPressed = false;

        shiftButton.classList.remove("active");

        await sendCommand(
            "SHIFT_UP"
        );

    }
);


// =====================================================
// ENTER
// =====================================================
// ENTER = SATU KLIK
// =====================================================

enterButton.addEventListener(
    "click",
    async function(event) {

        event.preventDefault();

        console.log(
            "======================"
        );

        console.log(
            "ENTER DIKLIK"
        );

        console.log(
            "======================"
        );


        enterButton.classList.add(
            "active"
        );


        await sendCommand(
            "ENTER"
        );


        setTimeout(
            function() {

                enterButton.classList.remove(
                    "active"
                );

            },
            100
        );

    }
);


// =====================================================
// CONNECT BUTTON
// =====================================================

const connectButton =
    document.createElement("button");


connectButton.innerText =
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
    "9999";

connectButton.style.padding =
    "12px 22px";

connectButton.style.border =
    "none";

connectButton.style.borderRadius =
    "25px";

connectButton.style.background =
    "white";

connectButton.style.color =
    "black";

connectButton.style.fontWeight =
    "bold";

connectButton.style.fontSize =
    "15px";


document.body.appendChild(
    connectButton
);


connectButton.addEventListener(
    "click",
    connectBluetooth
);


// =====================================================
// INITIAL
// =====================================================

setStatus(
    "Bluetooth Disconnected"
);
