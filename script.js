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
// CEK WEB BLUETOOTH
// =====================================================

if (!navigator.bluetooth) {

    connectionStatus.textContent =
        "● Web Bluetooth tidak didukung";

    connectionStatus.style.color =
        "#ff4444";

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
    // SAFETY
    // -------------------------------------------------

    shiftPressed =
        false;


    shiftButton.classList.remove(
        "active"
    );


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
        // KIRIM TANPA RESPONSE
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

    // Jangan kirim berkali-kali
    if (shiftPressed) {
        return;
    }


    // Tandai sedang ditekan
    shiftPressed =
        true;


    // Ubah tampilan tombol
    shiftButton.classList.add(
        "active"
    );


    // Kirim ke laptop
    await sendCommand(
        "SHIFT_DOWN"
    );

}


// =====================================================
// SHIFT UP
// =====================================================

async function shiftUp() {

    // Kalau memang tidak sedang ditekan
    if (!shiftPressed) {
        return;
    }


    // Lepaskan status
    shiftPressed =
        false;


    // Ubah tampilan tombol
    shiftButton.classList.remove(
        "active"
    );


    // Kirim ke laptop
    await sendCommand(
        "SHIFT_UP"
    );

}


// =====================================================
// SHIFT - POINTER DOWN
// =====================================================

shiftButton.addEventListener(
    "pointerdown",
    async function(event) {

        event.preventDefault();


        // Ambil kontrol pointer
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


        // Tekan SHIFT
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


        // Lepaskan SHIFT
        await shiftUp();


        // Lepaskan pointer capture
        try {

            shiftButton.releasePointerCapture(
                event.pointerId
            );

        }
        catch (error) {

            // Tidak masalah jika capture
            // sudah dilepas browser
        }

    }
);


// =====================================================
// SHIFT - POINTER CANCEL
// =====================================================

shiftButton.addEventListener(
    "pointercancel",
    async function() {

        await shiftUp();

    }
);


// =====================================================
// SHIFT - POINTER LEAVE
// =====================================================

shiftButton.addEventListener(
    "pointerleave",
    async function() {

        // Jangan langsung release ketika
        // pointer masih di-capture.
        //
        // Karena kita menggunakan
        // setPointerCapture(), pointerleave
        // tidak menjadi akhir sentuhan.

    }
);


// =====================================================
// ENTER - SEKALI KLIK
// =====================================================

async function enterClick() {

    // Kirim satu command saja
    await sendCommand(
        "ENTER"
    );

}


// =====================================================
// ENTER BUTTON
// =====================================================

enterButton.addEventListener(
    "click",
    async function(event) {

        event.preventDefault();


        // ENTER langsung dieksekusi
        await enterClick();

    }
);


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
