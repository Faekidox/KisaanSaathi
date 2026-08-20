const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const soil = document.getElementById("soil");
const light = document.getElementById("light");
const soilBar = document.getElementById("soilBar");
const lightBar = document.getElementById("lightBar");
const cropName = document.getElementById("cropName");
const cropDescription = document.getElementById("cropDescription");
const recommendationTitle = document.getElementById("recommendationTitle");
const recommendationDetails = document.getElementById("recommendationDetails");

const crops = {
    rice: {
        name: "🌾 Rice",
        description: "Monitoring rice crop temperature, humidity and soil moisture.",
        temperature: 28.6,
        humidity: 72,
        soil: 64,
        light: 75
    },
    aerohydroponics: {
        name: "🌿 Coriander",
        description: "Monitoring aerohydroponic growing conditions, humidity and root-zone moisture.",
        temperature: 24.8,
        humidity: 68,
        soil: 45,
        light: 80
    },
    flower: {
        name: "🌸 Flower",
        description: "Monitoring flower crop temperature, humidity, soil moisture and light.",
        temperature: 25.7,
        humidity: 64,
        soil: 57,
        light: 78
    }
};

let selectedCrop = "rice";
let demoData = { ...crops.rice };

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function fluctuate(v, amount, min, max) {
    return clamp(v + (Math.random() * amount * 2 - amount), min, max);
}

function selectCrop(key) {
    selectedCrop = key;
    const crop = crops[key];
    demoData = { ...crop };

    document.querySelectorAll(".crop-option").forEach(button => {
        button.classList.toggle("active", button.dataset.crop === key);
    });

    cropName.textContent = crop.name;
    cropDescription.textContent = crop.description;
    updateDashboard();
}

function updateDashboard() {
    // Keep changes small so the values look like real sensor readings.
    demoData.temperature = fluctuate(demoData.temperature, 0.28, 24, 35);
    demoData.humidity = fluctuate(demoData.humidity, 0.9, 45, 85);
    demoData.soil = fluctuate(demoData.soil, 0.55, 25, 80);
    demoData.light = fluctuate(demoData.light, 2.8, 15, 95);

    temperature.textContent = demoData.temperature.toFixed(1);
    humidity.textContent = demoData.humidity.toFixed(1);
    soil.textContent = Math.round(demoData.soil);
    light.textContent = Math.round(demoData.light);

    soilBar.style.width = `${Math.round(demoData.soil)}%`;
    lightBar.style.width = `${Math.round(demoData.light)}%`;

    updateRecommendation();
}

function updateRecommendation() {
    const t = demoData.temperature;
    const h = demoData.humidity;
    const s = demoData.soil;
    const crop = crops[selectedCrop].name.replace(/^\S+\s/, "");

    let title;
    let details;

    if (s < 35) {
        title = `⚠️ ${crop}: moisture is getting low`;
        details = `Soil moisture is around ${Math.round(s)}%, which is below the preferred demo range. With tomorrow's possible rainfall, irrigation decisions should consider the actual rain received. Check the soil again before watering to avoid unnecessary irrigation.`;
    } else if (s > 72) {
        title = `💧 ${crop}: soil is quite wet`;
        details = `Soil moisture is around ${Math.round(s)}%. Watering is not recommended right now. If cloudy or rainy weather continues tomorrow, allow the soil to drain and watch for prolonged waterlogging around the roots.`;
    } else if (t > 33) {
        title = `🌡️ ${crop}: heat watch recommended`;
        details = `The temperature is ${t.toFixed(1)}°C while humidity is ${h.toFixed(1)}%. These conditions can increase crop water demand. Monitor the leaves for heat stress and check soil moisture more frequently during the warmest part of the day.`;
    } else if (h < 52) {
        title = `🌱 ${crop}: humidity is slightly low`;
        details = `Humidity is ${h.toFixed(1)}%. The soil moisture is ${Math.round(s)}%, so the root zone is currently more important than the air humidity alone. Keep monitoring both values as tomorrow's weather changes.`;
    } else {
        title = `🌱 ${crop}: conditions look balanced`;
        details = `Temperature is ${t.toFixed(1)}°C, humidity is ${h.toFixed(1)}%, and soil moisture is ${Math.round(s)}%. These readings are currently within the dashboard's healthy demo range. Tomorrow's cloudy and rainy pattern may naturally increase soil moisture, so re-check before irrigation.`;
    }

    recommendationTitle.textContent = title;
    recommendationDetails.textContent = details;
}

// Tomorrow's demo weather outlook for Panvel.
function updateWeatherPanel() {
    const weatherCurrent = document.getElementById("weatherCurrent");
    const weatherRain = document.getElementById("weatherRain");
    const weatherTomorrow = document.getElementById("weatherTomorrow");

    weatherCurrent.textContent = `${Math.round(demoData.temperature)}°C`;
    weatherRain.textContent = `${55 + Math.round((Math.random() - 0.5) * 8)}%`;
    weatherTomorrow.textContent = "31°C";
}

// Crop selector.
document.querySelectorAll(".crop-option").forEach(button => {
    button.addEventListener("click", () => selectCrop(button.dataset.crop));
});

// Fake serial status: visual only. Nothing is opened or connected.
const statusDot = document.getElementById("statusDot");
const connectionText = document.getElementById("connectionText");
statusDot.classList.add("connected");
connectionText.textContent = "Serial Port Connected";

updateDashboard();
updateWeatherPanel();
setInterval(() => {
    updateDashboard();
    updateWeatherPanel();
}, 2500);

// Scroll animations
const revealElements = document.querySelectorAll(".reveal, .card, .panel, .recommendation");
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

revealElements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.transitionDelay = `${Math.min(index * 60, 300)}ms`;
    observer.observe(element);
});
