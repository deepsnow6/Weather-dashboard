const apiKey = '3583093fbb58e2abea8b46583e2c6a18';

// Event listener for the search form submission
document.getElementById('search-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const cityInput = document.getElementById('city-input').value.trim();

  if (cityInput !== '') {
    getWeatherData(cityInput);
    document.getElementById('city-input').value = '';
  }
});

// Event listener for the search history buttons
document.getElementById('search-history').addEventListener('click', function(event) {
  if (event.target.classList.contains('search-history-button')) {
    const city = event.target.dataset.city;
    getWeatherData(city);
  }
});

// Fetch weather data from the API
function getWeatherData(city) {
  const apiKey = '3583093fbb58e2abea8b46583e2c6a18';
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const timeZone = data.city.timezone; // Get the time zone offset in seconds
      const currentTime = new Date(); // Get the current local time
      const localTime = new Date(currentTime.getTime() + timeZone * 1000); // Adjust the local time using the time zone offset

      displayCurrentWeather(data, localTime);
      displayForecast(data);
      displayRestOfDayForecast(data);
      saveToLocalStorage(city);
      updateSearchHistory();
      updateBackground(data.list[0].weather[0].main);
    })
    .catch(error => {
      console.log('Error:', error);
    });
}

// Display current weather conditions
function displayCurrentWeather(data) {
  const currentWeatherDiv = document.getElementById('current-weather');
  currentWeatherDiv.innerHTML = '';

  const city = data.city.name;
  const date = new Date(data.list[0].dt * 1000).toLocaleDateString();
  const icon = data.list[0].weather[0].icon;
  const currentTemperature = Math.floor((data.list[0].main.temp * 9) / 5 - 459.67); // Convert Kelvin and round down
  const humidity = data.list[0].main.humidity;
  const windSpeed = data.list[0].wind.speed;

  const timeZoneOffset = data.city.timezone; // Get the time zone offset in seconds
  const localDateTime = new Date(); // Get the current local system time
  const cityDateTime = new Date(localDateTime.getTime() + timeZoneOffset * 1000); // Adjust the time using the time zone offset

  const formatter = new Intl.DateTimeFormat([], {
    timeStyle: 'short',
    timeZone: 'UTC'
  });
  const currentTime = formatter.format(cityDateTime); // Format the time according to the city's time zone

  const currentWeatherHTML = `
    <h2>${city} - ${date}</h2>
    <p>${currentTime}</p>
    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
    <p><strong>Current Temperature:</strong> ${currentTemperature}&deg;F</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${windSpeed} m/s</p>
  `;

  currentWeatherDiv.innerHTML = currentWeatherHTML;
}




// Display the forecast for the rest of the current day
function displayRestOfDayForecast(data) {
    const restOfDayForecastDiv = document.getElementById('rest-of-day-forecast');
    restOfDayForecastDiv.innerHTML = '';
  
    const currentDate = new Date(data.list[0].dt * 1000);
    const currentDay = currentDate.getDate();
  
    for (let i = 0; i < data.list.length; i++) {
      const forecast = data.list[i];
      const forecastDate = new Date(forecast.dt * 1000);
      const forecastDay = forecastDate.getDate();
  
      if (forecastDay === currentDay) {
        const forecastHour = forecastDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); // Format time as AM/PM
        const icon = forecast.weather[0].icon;
        const temperature = Math.floor((forecast.main.temp * 9) / 5 - 459.67); // Convert Kelvin and round down
        const weatherDescription = forecast.weather[0].description;
        const humidity = forecast.main.humidity;
        const windSpeed = forecast.wind.speed;
  
        const forecastHTML = `
          <div class="forecast-item">
            <h3>${forecastHour}</h3>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
            <p>Temperature: ${temperature}&deg;F</p>
            <p>Weather: ${weatherDescription}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
          </div>
        `;
  
        restOfDayForecastDiv.innerHTML += forecastHTML;
      }
    }
  }

// Display the 5-day forecast
function displayForecast(data) {
  const forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = '';

  for (let i = 1; i < 40; i += 8) {
    const forecast = data.list[i];
    const date = new Date(forecast.dt * 1000).toLocaleDateString();
    const icon = forecast.weather[0].icon;
    const temperature = Math.floor((forecast.main.temp * 9) / 5 - 459.67); // Convert Kelvin and round down
    const weatherDescription = forecast.weather[0].description;
    const humidity = forecast.main.humidity;
    const windSpeed = forecast.wind.speed;

    const forecastHTML = `
      <div class="forecast-item">
        <h3>${date}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
        <p>Temperature: ${temperature}&deg;F</p>
        <p>Weather: ${weatherDescription}</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
      </div>
    `;

    forecastDiv.innerHTML += forecastHTML;
  }
}


// Save the searched city to local storage
function saveToLocalStorage(city) {
  const searchHistory = localStorage.getItem('searchHistory');

  if (searchHistory) {
    const cities = JSON.parse(searchHistory);
    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem('searchHistory', JSON.stringify(cities));
    }
  } else {
    localStorage.setItem('searchHistory', JSON.stringify([city]));
  }
}

// Update the search history display
function updateSearchHistory() {
  const searchHistoryDiv = document.getElementById('search-history');
  searchHistoryDiv.innerHTML = '';

  const searchHistory = localStorage.getItem('searchHistory');

  if (searchHistory) {
    const cities = JSON.parse(searchHistory);
    cities.forEach(city => {
      const cityButton = document.createElement('button');
      cityButton.classList.add('search-history-button');
      cityButton.textContent = city;
      cityButton.dataset.city = city;
      searchHistoryDiv.appendChild(cityButton);
    });
  }
}

// Update the background based on the weather condition
function updateBackground(weatherCondition) {
  const appContainer = document.querySelector('.container');

  // Remove existing weather classes
  appContainer.classList.remove('sunny', 'cloudy', 'rainy', 'snowy');

  // Add the appropriate weather class
  switch (weatherCondition) {
    case 'Clear':
      appContainer.classList.add('sunny');
      break;
    case 'Clouds':
      appContainer.classList.add('cloudy');
      break;
    case 'Rain':
      appContainer.classList.add('rainy');
      break;
    case 'Snow':
      appContainer.classList.add('snowy');
      break;
    default:
      // Set a default background class if the weather condition is unknown
      appContainer.classList.add('default');
      break;
  }
}

// Initialize the search history and update the background on page load
updateSearchHistory();