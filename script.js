const apiKey = "2dfcb906753cbf580f5a027ebe974842"; // Replace with your OpenWeatherMap API key
async function getWeatherData(city) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  try {
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    console.log("Current Weather Data:", weatherData);

    if (weatherData.cod === 200) {
      updateWeatherInfo(weatherData);

      const { lat, lon } = weatherData.coord;

      // Fetch AQI and Forecast independently
      fetchAQIData(lat, lon);
      fetchForecastData(lat, lon);
    } else {
      alert("City not found!");
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

async function fetchAQIData(lat, lon) {
  const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  try {
    const aqiResponse = await fetch(aqiUrl);
    const aqiData = await aqiResponse.json();
    console.log("AQI Data:", aqiData);

    if (aqiData.list && aqiData.list.length > 0) {
      updateAQI(aqiData.list[0].main.aqi);
    } else {
      document.getElementById("aqi").textContent = "AQI: Not Available";
    }
  } catch (error) {
    console.error("Error fetching AQI data:", error);
    document.getElementById("aqi").textContent = "AQI: Error Fetching Data";
  }
}

async function fetchForecastData(lat, lon) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    console.log("Forecast Data:", forecastData);

    if (forecastData.list && forecastData.list.length > 0) {
      updateForecast(forecastData);
    } else {
      document.getElementById("forecastContainer").innerHTML = "<p>Forecast data unavailable</p>";
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    document.getElementById("forecastContainer").innerHTML = "<p>Forecast data error</p>";
  }
}

function updateWeatherInfo(data) {
    const cityName = document.getElementById("cityName");
    const weatherIcon = document.getElementById("weatherIcon");
    const temperature = document.getElementById("temperature");
    const humidity = document.getElementById("humidity");
    const windSpeed = document.getElementById("windSpeed");
    const rainAlert = document.getElementById("rainAlert");
    const weatherFrame = document.getElementById("weatherFrame");

    const weather = data.weather[0].main.toLowerCase();
    const isNight = checkIfNight(data.timezone);

    cityName.textContent = data.name;
    temperature.textContent = `Temperature: ${data.main.temp} °C`;
    humidity.textContent = `Humidity: ${data.main.humidity} %`;
    windSpeed.textContent = `Wind Speed: ${data.wind.speed} km/h`;

    const iconUrl = isNight ? getNightIcon(weather) : getDayIcon(weather);
    weatherIcon.src = iconUrl;

    weatherFrame.style.backgroundImage = isNight
        ? "url('backgrounds/night.jpg')"
        : "url('backgrounds/day.jpg')";

    if (weather.includes("rain")) {
        rainAlert.textContent = "Take an umbrella! It's likely to rain.";
    } else {
        rainAlert.textContent = "";
    }
}

function updateForecast(data) {
    const forecastContainer = document.getElementById("forecastContainer");
    forecastContainer.innerHTML = "";

    const dailyData = {};
    data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) {
            dailyData[date] = { temps: [], weather: "" };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].weather = item.weather[0].main.toLowerCase();
    });

    Object.keys(dailyData).slice(0, 5).forEach((date) => {
        const temps = dailyData[date].temps;
        const weather = dailyData[date].weather;

        const highTemp = Math.max(...temps);
        const lowTemp = Math.min(...temps);

        const forecastCard = document.createElement("div");
        forecastCard.classList.add("forecast-card");
        forecastCard.innerHTML = `
            <p>${new Date(date).toLocaleDateString("en-us", { weekday: "long" })}</p>
            <img src="${getDayIcon(weather)}" alt="Weather Icon">
            <p>High: ${highTemp.toFixed(1)} °C</p>
            <p>Low: ${lowTemp.toFixed(1)} °C</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}
function updateAQI(aqiValue) {
  const aqiElement = document.getElementById("aqi");
  const aqiStatusElement = document.getElementById("aqi-status");

  // Display AQI value
  aqiElement.textContent = `AQI: ${aqiValue}`;

  // Determine AQI status and color
  let status = "";
  let color = "";

  if (aqiValue === 1) {
    status = "Good";
    color = "green";
  } else if (aqiValue === 2) {
    status = "Fair";
    color = "yellow";
  } else if (aqiValue === 3) {
    status = "Moderate";
    color = "orange";
  } else if (aqiValue === 4) {
    status = "Poor";
    color = "red";
  } else if (aqiValue === 5) {
    status = "Very Poor";
    color = "purple";
  } else {
    status = "Unknown";
    color = "gray";
  }
  // Update AQI status text and color
  aqiStatusElement.textContent = `Status: ${status}`;
  aqiElement.style.color = color;
  aqiStatusElement.style.color = color;
}

function checkIfNight(timezone) {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = new Date(utc + 1000 * timezone);
    return localTime.getHours() >= 18 || localTime.getHours() < 6;
}

function getDayIcon(weather) {
    if (weather.includes("clear")) return "icons/day/clear.png";
    if (weather.includes("clouds")) return "icons/day/cloudy.png";
    if (weather.includes("rain")) return "icons/day/rainy.png";
    return "icons/day/default.png";
}

function getNightIcon(weather) {
    if (weather.includes("clear")) return "icons/night/clear.png";
    if (weather.includes("clouds")) return "icons/night/cloudy.png";
    if (weather.includes("rain")) return "icons/night/rainy.png";
    return "icons/night/default.png";
}

document.getElementById("searchButton").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value;
    getWeatherData(city);
});
