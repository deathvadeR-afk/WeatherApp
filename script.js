const apiKey = "2dfcb906753cbf580f5a027ebe974842"; // Replace with your OpenWeatherMap API key
let units = "metric"; // Default to Celsius

document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("city-input").value;
  if (city) {
    fetchWeather(city);
  } else {
    alert("Please enter a city name!");
  }
});

document.getElementById("unit-btn").addEventListener("click", () => {
  units = units === "metric" ? "imperial" : "metric";
  const unitLabel = units === "metric" ? "°C" : "°F";
  document.getElementById("unit-btn").innerText = `Switch to ${unitLabel}`;
});

// Fetch Weather and Forecast
async function fetchWeather(city) {
  try {
    const currentWeatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`
    );
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`
    );

    if (!currentWeatherRes.ok || !forecastRes.ok) throw new Error("City not found");

    const currentWeather = await currentWeatherRes.json();
    const forecast = await forecastRes.json();

    displayCurrentWeather(currentWeather);
    displayForecast(forecast);
  } catch (error) {
    alert(error.message);
  }
}

// Clock Functionality
function startClock() {
  const clockElement = document.getElementById("clock");

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockElement.innerText = `${hours}:${minutes}:${seconds}`;
  }

  updateClock();
  setInterval(updateClock, 1000); // Update every second
}
startClock();

// Display Current Weather
function displayCurrentWeather(data) {
  const { name } = data;
  const { temp, humidity } = data.main;
  const { speed } = data.wind;
  const { description, icon } = data.weather[0];
  const now = new Date();
  const isNight = now.getHours() >= 18 || now.getHours() <= 6;

  document.getElementById("city-name").innerText = `Weather in ${name}`;
  document.getElementById("temperature").innerText = `Temperature: ${temp}°${units === "metric" ? "C" : "F"}`;
  document.getElementById("description").innerText = `Condition: ${description}`;
  document.getElementById("humidity").innerText = `Humidity: ${humidity}%`;
  document.getElementById("wind-speed").innerText = `Wind Speed: ${speed} ${units === "metric" ? "m/s" : "mph"}`;

  // Update thumbnail (icon)
  const iconUrl = isNight
    ? `https://openweathermap.org/img/wn/${icon.replace("d", "n")}@2x.png`
    : `https://openweathermap.org/img/wn/${icon}@2x.png`;
  document.getElementById("weather-thumbnail").src = iconUrl;

  // Check for rain and show precautions
  if (description.includes("rain")) {
    document.getElementById("precaution").innerText = "It might rain! Don't forget your umbrella!";
    document.getElementById("precaution").classList.remove("hidden");
  } else {
    document.getElementById("precaution").classList.add("hidden");
  }

  document.getElementById("current-weather").classList.remove("hidden");
  updateBackground(description, isNight);
}

// Display Forecast
function displayForecast(data) {
  const forecastContainer = document.querySelector(".forecast-slides");
  forecastContainer.innerHTML = "";

  data.list.forEach((forecast, index) => {
    if (index % 8 === 0) {
      const { temp } = forecast.main;
      const { description, icon } = forecast.weather[0];
      const date = new Date(forecast.dt_txt).toLocaleDateString();

      const forecastCard = document.createElement("div");
      forecastCard.classList.add("forecast-card");

      forecastCard.innerHTML = `
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p>${temp}°${units === "metric" ? "C" : "F"}</p>
        <p>${description}</p>
      `;

      forecastContainer.appendChild(forecastCard);
    }
  });

  document.getElementById("forecast").classList.remove("hidden");
}

// Update Background Dynamically
function updateBackground(description, isNight) {
  const body = document.body;

  if (description.includes("clear")) {
    body.style.backgroundImage = isNight
      ? "url('images/clear-night.jpg')"
      : "url('images/clear-sky.jpg')";
  } else if (description.includes("cloud")) {
    body.style.backgroundImage = isNight
      ? "url('images/cloudy-night.jpg')"
      : "url('images/cloudy.jpg')";
  } else if (description.includes("rain")) {
    body.style.backgroundImage = isNight
      ? "url('images/rainy-night.jpg')"
      : "url('images/rainy.jpg')";
  } else {
    body.style.backgroundImage = isNight
      ? "url('images/default-night-bg.jpg')"
      : "url('images/default-bg.jpg')";
  }

  body.style.animation = "slideBackground 10s infinite alternate";
}
