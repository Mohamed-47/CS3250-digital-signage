// Weather Widget using Open-Meteo API (Denver defaults)
async function initWeather(containerId, lat = 39.7392, lon = -104.9847) {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    const WMO_CODES = {
      0: { label: 'Clear Sky', icon: '☀️' },
      1: { label: 'Mainly Clear', icon: '🌤️' },
      2: { label: 'Partly Cloudy', icon: '⛅' },
      3: { label: 'Overcast', icon: '☁️' },
      45: { label: 'Foggy', icon: '🌫️' },
      48: { label: 'Icy Fog', icon: '🌫️' },
      51: { label: 'Light Drizzle', icon: '🌦️' },
      53: { label: 'Drizzle', icon: '🌦️' },
      55: { label: 'Heavy Drizzle', icon: '🌧️' },
      61: { label: 'Light Rain', icon: '🌧️' },
      63: { label: 'Rain', icon: '🌧️' },
      65: { label: 'Heavy Rain', icon: '🌧️' },
      71: { label: 'Light Snow', icon: '🌨️' },
      73: { label: 'Snow', icon: '❄️' },
      75: { label: 'Heavy Snow', icon: '❄️' },
      80: { label: 'Rain Showers', icon: '🌦️' },
      81: { label: 'Rain Showers', icon: '🌦️' },
      82: { label: 'Violent Showers', icon: '⛈️' },
      95: { label: 'Thunderstorm', icon: '⛈️' },
      99: { label: 'Hail Storm', icon: '⛈️' },
    };
  
    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weathercode,wind_speed_10m,wind_direction_10m,relative_humidity_2m&timezone=America%2FDenver&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`;
        const res = await fetch(url);
        const data = await res.json();
        const c = data.current;
        const code = c.weathercode;
        const info = WMO_CODES[code] || { label: 'Unknown', icon: '🌡️' };
        const windDir = degToCompass(c.wind_direction_10m);
  
        container.innerHTML = `
          <div class="weather-icon">${info.icon}</div>
          <div class="weather-temp">${Math.round(c.temperature_2m)}°F</div>
          <div class="weather-feels">Feels ${Math.round(c.apparent_temperature)}°F</div>
          <div class="weather-condition">${info.label}</div>
          <div class="weather-detail">💧 ${c.relative_humidity_2m}%</div>
          <div class="weather-detail">💨 ${Math.round(c.wind_speed_10m)} mph ${windDir}</div>
        `;
      } catch (e) {
        container.innerHTML = `<div class="weather-error">Weather unavailable</div>`;
      }
    }
  
    function degToCompass(deg) {
      const dirs = ['N','NE','E','SE','S','SW','W','NW'];
      return dirs[Math.round(deg / 45) % 8];
    }
  
    fetchWeather();
    setInterval(fetchWeather, 5 * 60 * 1000); // refresh every 5 min
  } 
  