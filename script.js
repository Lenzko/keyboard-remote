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

const shiftButton =
    document.getElementById("shiftButton");

const enterButton =
    document.getElementById("enterButton");

const connectionStatus =
    document.getElementById("connectionStatus");


// =====================================================
// BLUETOOTH VARIABLES
// =====================================================

let bluetoothDevice = null;

let commandCharacteristic = null;


// =====================================================
// SHIFT STATUS
// =====================================================

let shiftPressed = false;


// =====================================================
// CEK ELEMENT
// =====================================================

if (!shiftButton) {

    console.error(
        "ERROR: shiftButton tidak ditemukan."
    );
}


if (!enterButton) {

    console.error(
        "ERROR: enterButton tidak ditemukan."
    );
}


if (!connectionStatus) {

    console.error(
        "ERROR: connectionStatus tidak ditemukan."
    );
}


// =====================================================
// CEK WEB BLUETOOTH
// =====================================================

if (!navigator.bluetooth) {

    if (connectionStatus) {

        connectionStatus.textContent =
            "● Web Bluetooth tidak didukung";

        connectionStatus.style.color =
            "#ff4444";
    }

    console.error(
        "Browser ini tidak mendukung Web Bluetooth."
    );
}


// =====================================================
// UPDATE STATUS
// =====================================================

function setStatus(
    text,
    connected = false
) {

    if (!connectionStatus) {
        return;
    }

    connectionStatus.textContent =
        "● " + text;

    connectionStatus.style.color =
        connected
            ? "#00ff66"
            : "#ffffff";
}


// =====================================================
// CONNECT BLUETOOTH
// =====================================================

async function connectBluetooth() {

    try {

        setStatus(
            "Mencari Bluetooth..."
        );

        console.log(
            "Mencari KEYBOARD-REMOTE..."
        );


        // -------------------------------------------------
        // CARI DEVICE
        // -------------------------------------------------

        bluetoothDevice =
            await navigator.bluetooth.requestDevice({

                filters: [
                    {
                        services: [
                            SERVICE_UUID
                        ]
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


        setStatus(
            "Menghubungkan..."
        );


        // -------------------------------------------------
        // EVENT DISCONNECT
        // -------------------------------------------------

        bluetoothDevice.addEventListener(
            "gattserverdisconnected",
            bluetoothDisconnected
        );


        // -------------------------------------------------
        // CONNECT GATT
        // -------------------------------------------------

        const server =
            await bluetoothDevice.gatt.connect();


        console.log(
            "GATT connected"
        );


        // -------------------------------------------------
        // GET SERVICE
        // -------------------------------------------------

        const service =
            await server.getPrimaryService(
                SERVICE_UUID
            );


        console.log(
            "Service ditemukan"
        );


        // -------------------------------------------------
        // GET CHARACTERISTIC
        // -------------------------------------------------

        commandCharacteristic =
            await service.getCharacteristic(
                COMMAND_UUID
            );


        console.log(
            "Command characteristic ditemukan"
        );


        // -------------------------------------------------
        // BERHASIL TERHUBUNG
        // -------------------------------------------------

        setStatus(
            "Bluetooth Connected",
            true
        );


        console.log(
            "================================"
        );

        console.log(
            "KEYBOARD-REMOTE TERHUBUNG"
        );

        console.log(
            "================================"
        );

    }


    catch (error) {

        console.error(
            "Bluetooth error:",
            error
        );


        setStatus(
            "Bluetooth gagal"
        );


        alert(
            "Gagal terhubung ke Bluetooth.\n\n" +
            error.message
        );

    }

}


// =====================================================
// BLUETOOTH DISCONNECTED
// =====================================================

function bluetoothDisconnected() {

    console.log(
        "Bluetooth terputus"
    );


    commandCharacteristic =
        null;


    // -------------------------------------------------
    // SAFETY SHIFT
    // -------------------------------------------------

    shiftPressed =
        false;


    if (shiftButton) {

        shiftButton.classList.remove(
            "active"
        );
    }


    setStatus(
        "Bluetooth Disconnected"
    );

}


// =====================================================
// KIRIM COMMAND
// =====================================================

async function sendCommand(
    command
) {

    // -------------------------------------------------
    // CEK BLUETOOTH
    // -------------------------------------------------

    if (!commandCharacteristic) {

        console.warn(
            "Bluetooth belum terhubung:",
            command
        );

        return false;
    }


    try {

        // -------------------------------------------------
        // ENCODE COMMAND
        // -------------------------------------------------

        const encoder =
            new TextEncoder();


        const data =
            encoder.encode(
                command
            );


        // -------------------------------------------------
        // KIRIM COMMAND
        // -------------------------------------------------

        await commandCharacteristic
            .writeValueWithoutResponse(
                data
            );


        console.log(
            "COMMAND:",
            command
        );


        return true;

    }


    catch (error) {

        console.error(
            "Gagal mengirim command:",
            command,
            error
        );


        return false;

    }

}


// =====================================================
// SHIFT DOWN
// =====================================================

async function shiftDown() {

    if (shiftPressed) {

        return;
    }


    shiftPressed =
        true;


    if (shiftButton) {

        shiftButton.classList.add(
            "active"
        );
    }


    console.log(
        "SHIFT BUTTON DITEKAN"
    );


    await sendCommand(
        "SHIFT_DOWN"
    );

}


// =====================================================
// SHIFT UP
// =====================================================

async function shiftUp() {

    if (!shiftPressed) {

        return;
    }


    shiftPressed =
        false;


    if (shiftButton) {

        shiftButton.classList.remove(
            "active"
        );
    }


    console.log(
        "SHIFT BUTTON DILEPAS"
    );


    await sendCommand(
        "SHIFT_UP"
    );

}


// =====================================================
// SHIFT - POINTER DOWN
// =====================================================

if (shiftButton) {

    shiftButton.addEventListener(
        "pointerdown",
        async function(event) {

            event.preventDefault();


            console.log(
                "SHIFT POINTER DOWN:",
                event.pointerType
            );


            // -------------------------------------------------
            // POINTER CAPTURE
            // -------------------------------------------------

            try {

                shiftButton.setPointerCapture(
                    event.pointerId
                );

            }
            catch (error) {

                console.warn(
                    "Pointer capture gagal:",
                    error
                );

            }


            // -------------------------------------------------
            // TEKAN SHIFT
            // -------------------------------------------------

            await shiftDown();

        }
    );


    // =====================================================
    // SHIFT - POINTER UP
    // =====================================================

    shiftButton.addEventListener(
        "pointerup",
        async function(event) {

            event.preventDefault();


            console.log(
                "SHIFT POINTER UP"
            );


            await shiftUp();


            // -------------------------------------------------
            // RELEASE POINTER CAPTURE
            // -------------------------------------------------

            try {

                shiftButton.releasePointerCapture(
                    event.pointerId
                );

            }
            catch (error) {

                // Tidak masalah
            }

        }
    );


    // =====================================================
    // SHIFT - POINTER CANCEL
    // =====================================================

    shiftButton.addEventListener(
        "pointercancel",
        async function() {

            console.log(
                "SHIFT POINTER CANCEL"
            );


            await shiftUp();

        }
    );

}


// =====================================================
// ENTER - SEKALI TEKAN
// =====================================================

async function enterClick() {

    console.log(
        "ENTER BUTTON DITEKAN"
    );


    // -------------------------------------------------
    // KIRIM SATU COMMAND
    // -------------------------------------------------

    const success =
        await sendCommand(
            "ENTER"
        );


    if (success) {

        console.log(
            "ENTER BERHASIL DIKIRIM"
        );

    }

}


// =====================================================
// ENTER - POINTER DOWN
// =====================================================

if (enterButton) {

    enterButton.addEventListener(
        "pointerdown",
        async function(event) {

            event.preventDefault();


            console.log(
                "ENTER POINTER DOWN:",
                event.pointerType
            );


            // -------------------------------------------------
            // VISUAL ACTIVE
            // -------------------------------------------------

            enterButton.classList.add(
                "active"
            );


            // -------------------------------------------------
            // KIRIM ENTER
            // -------------------------------------------------

            await enterClick();

        }
    );


    // =====================================================
    // ENTER - POINTER UP
    // =====================================================

    enterButton.addEventListener(
        "pointerup",
        function(event) {

            event.preventDefault();


            enterButton.classList.remove(
                "active"
            );

        }
    );


    // =====================================================
    // ENTER - POINTER CANCEL
    // =====================================================

    enterButton.addEventListener(
        "pointercancel",
        function() {

            enterButton.classList.remove(
                "active"
            );

        }
    );

}


// =====================================================
// CONNECT BUTTON
// =====================================================

const connectButton =
    document.createElement(
        "button"
    );


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


// =====================================================
// CONNECT BUTTON CLICK
// =====================================================

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
