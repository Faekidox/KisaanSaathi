let port = null;
let reader = null;

const connectButton =
    document.getElementById("connectButton");

const connectionText =
    document.getElementById("connectionText");

const statusDot =
    document.getElementById("statusDot");

const temperature =
    document.getElementById("temperature");

const humidity =
    document.getElementById("humidity");

const soil =
    document.getElementById("soil");

const light =
    document.getElementById("light");

const soilBar =
    document.getElementById("soilBar");

const lightBar =
    document.getElementById("lightBar");

const pumpStatus =
    document.getElementById("pumpStatus");

const recommendation =
    document.getElementById("recommendation");

const modeSelect =
    document.getElementById("modeSelect");


// CONNECT ARDUINO
connectButton.addEventListener("click", async () => {

    try {

        port = await navigator.serial.requestPort();

        await port.open({
            baudRate: 115200
        });

        connectionText.textContent =
            "Arduino Connected";

        statusDot.classList.add("connected");

        connectButton.textContent =
            "✓ Connected";

        readArduino();

    } catch (error) {

        console.error(error);

        connectionText.textContent =
            "Connection Failed";

    }

});


// READ SERIAL DATA
async function readArduino() {

    const decoder =
        new TextDecoderStream();

    const readableStreamClosed =
        port.readable.pipeTo(
            decoder.writable
        );

    reader =
        decoder.readable.getReader();

    let buffer = "";

    try {

        while (true) {

            const { value, done } =
                await reader.read();

            if (done) {
                break;
            }

            buffer += value;

            let lines =
                buffer.split("\n");

            buffer =
                lines.pop();

            for (const line of lines) {

                if (line.trim() === "") {
                    continue;
                }

                try {

                    const data =
                        JSON.parse(line);

                    updateDashboard(data);

                } catch (error) {

                    console.log(
                        "Received:",
                        line
                    );

                }
            }
        }

    } catch (error) {

        console.error(error);

    }

}


// UPDATE DASHBOARD
function updateDashboard(data) {

    if (data.temperature !== undefined) {

        temperature.textContent =
            data.temperature.toFixed(1);

    }

    if (data.humidity !== undefined) {

        humidity.textContent =
            data.humidity.toFixed(1);

    }

    if (data.soil !== undefined) {

        soil.textContent =
            data.soil;

        soilBar.style.width =
            data.soil + "%";

    }

    if (data.light !== undefined) {

        light.textContent =
            data.light;

        lightBar.style.width =
            data.light + "%";

    }


    if (data.pump !== undefined) {

        updatePumpStatus(data.pump);

    }


    if (data.mode !== undefined) {

        modeSelect.value =
            data.mode;

    }


    updateRecommendation(data);

}


// PUMP STATUS
function updatePumpStatus(state) {

    if (state === 1) {

        pumpStatus.textContent =
            "ON";

        pumpStatus.className =
            "pump-on";

    } else {

        pumpStatus.textContent =
            "OFF";

        pumpStatus.className =
            "pump-off";

    }

}


// SEND COMMAND
async function sendCommand(command) {

    if (!port || !port.writable) {

        alert(
            "Connect the Arduino first!"
        );

        return;

    }

    const writer =
        port.writable.getWriter();

    const encoder =
        new TextEncoder();

    await writer.write(
        encoder.encode(command + "\n")
    );

    writer.releaseLock();

}


// START PUMP
document
    .getElementById("pumpOn")
    .addEventListener("click", () => {

        sendCommand("PUMP:ON");

    });


// STOP PUMP
document
    .getElementById("pumpOff")
    .addEventListener("click", () => {

        sendCommand("PUMP:OFF");

    });


// CHANGE MODE
modeSelect.addEventListener(
    "change",
    () => {

        if (modeSelect.value === "AUTO") {

            sendCommand("MODE:AUTO");

        } else {

            sendCommand("MODE:MANUAL");

        }

    }
);


// RECOMMENDATION SYSTEM
function updateRecommendation(data) {

    if (
        data.soil !== undefined &&
        data.soil < 30
    ) {

        recommendation.textContent =
            "Soil moisture is low. Irrigation may be required.";

    }

    else if (
        data.soil !== undefined &&
        data.soil > 70
    ) {

        recommendation.textContent =
            "Soil moisture is sufficient. No irrigation is currently needed.";

    }

    else if (
        data.temperature !== undefined &&
        data.temperature > 35
    ) {

        recommendation.textContent =
            "High temperature detected. Monitor the crop for heat stress.";

    }

    else {

        recommendation.textContent =
            "Farm conditions are currently within the monitored range.";

    }

}

const revealElements =
    document.querySelectorAll(
        ".card, .panel, .crop-banner, .recommendation"
    );

const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                observer.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.15
    }
);


revealElements.forEach((element, index) => {

    element.classList.add("reveal");

    element.style.transitionDelay =
        `${index * 80}ms`;

    observer.observe(element);

});