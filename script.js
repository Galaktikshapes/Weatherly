document.addEventListener('DOMContentLoaded', () => {
    // Event listener for the button click
    document.getElementById('getWeatherBtn').addEventListener('click', getWeather);

    // Auto-fetch weather based on the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoordinates(lat, lon);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location. Please enter a city manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Function to get weather data based on city input
async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        alert('Please enter a city name or allow location access for auto-location.');
        return;
    }
    
    const weatherData = await fetchWeatherData(city);
    if (weatherData) {
        updateWeatherUI(weatherData, city); // Pass city to updateWeatherUI
    } else {
        alert('Weather information not available. Please try another city.');
    }
}

// Function to get weather data by coordinates (auto-location)
async function getWeatherByCoordinates(lat, lon) {
    const weatherData = await fetchWeatherDataByCoordinates(lat, lon);
    if (weatherData) {
        const locationName = `Latitude: ${lat}, Longitude: ${lon}`;
        updateWeatherUI(weatherData, locationName); // Pass locationName to updateWeatherUI
    } else {
        alert('Weather information not available. Please try again.');
    }
}

// Function to fetch weather data from Open-Meteo API based on city name
async function fetchWeatherData(city) {
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`;
    
    try {
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.length === 0) {
            throw new Error('City not found');
        }

        const lat = geocodeData[0].lat;
        const lon = geocodeData[0].lon;

        return fetchWeatherDataByCoordinates(lat, lon);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Function to fetch weather data by coordinates from Open-Meteo API
async function fetchWeatherDataByCoordinates(lat, lon) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        return {
            temperature: weatherData.current_weather.temperature,
            weatherCode: weatherData.current_weather.weathercode,
            windSpeed: weatherData.current_weather.windspeed,
        };
    } catch (error) {
        console.error('Error fetching weather data by coordinates:', error);
        return null;
    }
}

// Function to update UI with the weather data and animations
function updateWeatherUI(weatherData, city) {
    const weatherDescription = getWeatherDescription(weatherData.weatherCode);
    const weatherIconUrl = getWeatherIconUrl(weatherData.weatherCode);
    const weatherType = getWeatherType(weatherData.weatherCode);

    // Set weather details
    document.getElementById('weatherDetails').innerHTML = `
        <h3>Current Weather for ${city}</h3>
        <p><strong>Description:</strong> ${weatherDescription}</p>
        <p><strong>Temperature:</strong> ${weatherData.temperature} °C</p>
        <p><strong>Wind Speed:</strong> ${weatherData.windSpeed} m/s</p>
    `;
    
    // Set weather icon and apply animation
    const weatherIcon = document.getElementById('weatherIcon');
    weatherIcon.src = weatherIconUrl;
    weatherIcon.className = 'weather-icon'; // Reset classes
    weatherIcon.classList.add(weatherType);  // Add relevant animation class

    // Show the weather info container
    document.getElementById('weatherInfo').classList.add('active');
}

// Function to get weather description based on code
function getWeatherDescription(code) {
    switch (code) {
        case 0:
        case 1: return 'Clear sky';
        case 2:
        case 3: return 'Partly cloudy';
        case 45:
        case 48: return 'Foggy';
        case 51:
        case 61: return 'Light rain';
        case 71: return 'Snow';
        default: return 'Unknown weather';
    }
}

// Function to get the weather icon URL based on the weather code
function getWeatherIconUrl(code) {
    switch (code) {
        case 0:
        case 1: return 'icons/sunny.png'; // Replace with the path to your sunny icon
        case 2:
        case 3: return 'icons/cloudy.png'; // Replace with the path to your cloudy icon
        case 51:
        case 61: return 'icons/rainy.png'; // Replace with the path to your rainy icon
        case 71: return 'icons/snowy.png'; // Replace with the path to your snowy icon
        default: return 'icons/default.png'; // Replace with the path to your default icon
    }
}

// Function to get the appropriate weather type for animation
function getWeatherType(code) {
    if (code === 0 || code === 1) {
        return 'sunny';
    } else if (code === 2 || code === 3) {
        return 'cloudy';
    } else if (code === 51 || code === 61) {
        return 'rainy';
    } else if (code === 71) {
        return 'snowy';
    } else {
        return '';  // Default to no animation
    }
}