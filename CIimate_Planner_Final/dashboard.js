const monitoredLocations = [
  { name: 'Kanha National Park', lat: 22.3345, lng: 80.6115 },
  { name: 'New Delhi, India', lat: 28.6139, lng: 77.2090 },
  { name: 'Cairo, Egypt', lat: 30.0444, lng: 31.2357 },
  { name: 'Norilsk, Russia', lat: 69.3497, lng: 88.2024 },
  { name: 'Mawsynram, India', lat: 25.2975, lng: 91.5826 },
  { name: 'Manaus, Brazil', lat: -3.1190, lng: -60.0217 },
  { name: 'Zurich, Switzerland', lat: 47.3769, lng: 8.5417 },
  { name: 'Reykjavik, Iceland', lat: 64.1466, lng: -21.9426 },
  { name: 'Wellington, New Zealand', lat: -41.2865,  lng: 174.7762 }
];

function getStatusLabel(value, low, medium) {
  if (value <= low) return { status: 'safe', label: '<span class="safe">✅ Safe</span>' };
  if (value <= medium) return { status: 'moderate', label: '<span class="moderate">⚠️ Moderate</span>' };
  return { status: 'danger', label: '<span class="danger">🚨 Dangerous</span>' };
}

function getTempStatus(temp) {
  if (temp < 5 || temp > 40) return { status: 'danger', label: '<span class="danger">🚨 Dangerous</span>' };
  if (temp < 15 || temp > 35) return { status: 'moderate', label: '<span class="moderate">⚠️ Moderate</span>' };
  return { status: 'safe', label: '<span class="safe">✅ Safe</span>' };
}

function getAffectedSchools(locationName) {
  const schoolDb = {
    "New Delhi": ["Delhi Public School", "Modern School", "St. Columba's School"],
    "Cairo": ["Cairo American College", "The British International School"],
  };
  return schoolDb[locationName.split(',')[0]] || ["No specific schools identified in the immediate area."];
}

function getWildlifeImpact(locationName) {
  if (locationName.includes("Kanha")) {
    return "High PM2.5 levels can affect the respiratory systems of tigers and deer. Authorities should monitor water sources.";
  }
  if (locationName.includes("Norilsk")) {
    return "Extreme cold and industrial pollutants pose a significant threat to reindeer herds and arctic fox populations.";
  }
  return "No specific wildlife habitats identified in this urban area.";
}

document.addEventListener('DOMContentLoaded', async () => {
  const dangerousContainer = document.getElementById('dangerous-alerts');
  const moderateContainer = document.getElementById('moderate-warnings');
  const safeContainer = document.getElementById('safe-areas');
  const proneList = document.getElementById('prone-locations-list');
  const loadingMessage = document.getElementById('loading-message');

  let proneLocations = [];

  const results = await Promise.all(monitoredLocations.map(async (loc) => {
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,precipitation,wind_speed_10m&timezone=auto`;
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.lat}&longitude=${loc.lng}&hourly=pm2_5,pm10,carbon_monoxide&timezone=auto`;

      const [weatherRes, airRes] = await Promise.all([fetch(weatherUrl), fetch(airQualityUrl)]);
      const weatherData = await weatherRes.json();
      const airData = await airRes.json();

      return { location: loc, weather: weatherData, air: airData, error: null };
    } catch (err) {
      return { location: loc, error: err };
    }
  }));

  loadingMessage.style.display = 'none';

  results.forEach(res => {
    if (res.error || !res.weather.current || !res.air.hourly) {
      console.error(`Skipping ${res.location.name} due to an error or invalid data.`);
      return;
    }

    const { location, weather, air } = res;

    const temp = weather.current.temperature_2m;
    const rain = weather.current.precipitation;
    const wind = weather.current.wind_speed_10m;
    const pm25 = air.hourly.pm2_5[0];
    const pm10 = air.hourly.pm10[0];

    if ([temp, rain, wind, pm25, pm10].some(val => typeof val !== 'number')) {
      console.error(`Skipping ${res.location.name} due to null or missing metric values.`);
      return;
    }

    const statuses = {
      Temperature: getTempStatus(temp),
      Rainfall: getStatusLabel(rain, 10, 50),
      Wind: getStatusLabel(wind, 20, 35),
      "PM2.5": getStatusLabel(pm25, 12, 35),
      PM10: getStatusLabel(pm10, 50, 100)
    };

    const statusValues = Object.values(statuses).map(s => s.status);
    let overallStatus = 'safe';
    if (statusValues.includes('danger')) {
      overallStatus = 'danger';
    } else if (statusValues.includes('moderate')) {
      overallStatus = 'moderate';
    }

    const problematicParams = Object.entries(statuses)
      .filter(([, value]) => value.status !== 'safe')
      .map(([key]) => key);

    if (overallStatus !== 'safe') {
      proneLocations.push(location.name);
    }

    const card = createAlertCard(location.name, overallStatus, problematicParams);

    if (overallStatus === 'danger') {
      dangerousContainer.innerHTML += card;
    } else if (overallStatus === 'moderate') {
      moderateContainer.innerHTML += card;
    } else {
      safeContainer.innerHTML += card;
    }
  });

  proneList.innerHTML = proneLocations.length > 0
    ? proneLocations.map(name => `<li>${name}</li>`).join('')
    : '<li>No locations with alerts at this time.</li>';
});

function createAlertCard(locationName, status, params) {
  const schools = getAffectedSchools(locationName);
  const wildlife = getWildlifeImpact(locationName);

  return `
    <div class="alert-card ${status}">
      <h3>${locationName}</h3>
      <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
      <p><strong>Key Issues:</strong> ${params.length ? params.join(', ') : 'None detected'}</p>
      
      <div class="insights">
        <h4>Impact Insights (Simulated)</h4>
        <p><strong>🏫 Affected Schools:</strong> ${schools.join(', ')}</p>
        <p><strong>🌳 Wildlife Impact:</strong> ${wildlife}</p>
      </div>

      <button class="respond-button" onclick="handleResponse('${locationName}')">
        Forward Report to Authorities
      </button>
    </div>
  `;
}

function handleResponse(locationName) {
  alert(`✅ Report for ${locationName} has been compiled and forwarded to the respective regional disaster management authorities.`);
}
