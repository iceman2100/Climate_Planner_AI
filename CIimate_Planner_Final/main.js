document.addEventListener('DOMContentLoaded', () => {
    const map = L.map("map").setView([20.5937, 78.9629], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    function createColorIcon(color) {
      return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    }

    const greenIcon = createColorIcon('green');
    const yellowIcon = createColorIcon('gold');
    const redIcon = createColorIcon('red');
    const blueIcon = createColorIcon('blue');

    function getStatusLabel(value, low, medium) {
      if (value <= low) return '<span class="safe">✅ Safe</span>';
      if (value <= medium) return '<span class="moderate">⚠️ Moderate</span>';
      return '<span class="danger">🚨 Dangerous</span>';
    }

    function getTempStatus(temp) {
      if (temp < 5 || temp > 40) return '<span class="danger">🚨 Dangerous</span>';
      if (temp < 15 || temp > 35) return '<span class="moderate">⚠️ Moderate</span>';
      return '<span class="safe">✅ Safe</span>';
    }

    function createMarker(lat, lng) {
      const marker = L.marker([lat, lng], { icon: blueIcon }).addTo(map);
      const circle = L.circle([lat, lng], {
        radius: 50,
        color: "#007bff",
        weight: 2,
        fill: false,
        dashArray: "6, 6"
      }).addTo(map);

      marker.bindPopup("<b>Click to load location data.</b>");

      marker.on("click", async function () {
        marker.setPopupContent("<b>Loading data...</b>");

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,cloudcover,wind_speed_10m&timezone=auto`;
        const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=pm10,pm2_5,carbon_monoxide,ozone&timezone=auto`;
        const locationUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

        try {
          const [weatherRes, airRes, locationRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(airQualityUrl),
            fetch(locationUrl),
          ]);

          const weatherData = await weatherRes.json();
          const airData = await airRes.json();
          const locationData = await locationRes.json();

          if (!weatherData.current || !airData.hourly) {
            throw new Error("API did not return valid data.");
          }

          const placeName = locationData.display_name || "Unknown Location";
          const current = weatherData.current;
          const temp = current.temperature_2m, rain = current.precipitation, cloud = current.cloudcover, wind = current.wind_speed_10m;
          const air = airData.hourly;
          const pm25 = air.pm2_5[0], pm10 = air.pm10[0], co = air.carbon_monoxide[0], ozone = air.ozone[0];

          const statuses = [
            getTempStatus(temp),
            getStatusLabel(rain, 10, 50),
            getStatusLabel(cloud, 60, 90),
            getStatusLabel(wind, 20, 35),
            getStatusLabel(pm25, 12, 35),
            getStatusLabel(pm10, 50, 100),
            getStatusLabel(co, 4400, 9400),
            getStatusLabel(ozone, 100, 180)
          ];

          const [tempStatus, rainStatus, cloudStatus, windStatus, pm25Status, pm10Status, coStatus, ozoneStatus] = statuses;

          let overallStatus = 'safe';
          if (statuses.some(s => s.includes('danger'))) overallStatus = 'danger';
          else if (statuses.some(s => s.includes('moderate'))) overallStatus = 'moderate';

          let color, icon;
          if (overallStatus === 'danger') {
            color = 'red'; icon = redIcon;
          } else if (overallStatus === 'moderate') {
            color = 'orange'; icon = yellowIcon;
          } else {
            color = 'green'; icon = greenIcon;
          }

          marker.setIcon(icon);
          circle.setStyle({ color: color, fillColor: color, fillOpacity: 0.2, fill: true });

          const popupContent = `
            <div class="popup-content">
              <strong>📍 ${placeName}</strong><br/>
              <em>Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}</em><br/><br/>
              <strong>🌦️ Weather Info</strong><br/>
              🌡️ Temperature: ${temp} °C — ${tempStatus}<br/>
              🌧️ Rainfall: ${rain} mm — ${getStatusLabel(rain, 10, 50)}<br/>
              💨 Wind: ${wind} km/h — ${windStatus}<br/>
              ☁️ Cloud Cover: ${cloud}% — ${cloudStatus}<br/><br/>
              <strong>🏭 Air Quality</strong><br/>
              PM2.5: ${pm25} µg/m³ — ${pm25Status}<br/>
              PM10: ${pm10} µg/m³ — ${pm10Status}<br/>
              CO: ${co} µg/m³ — ${coStatus}<br/>
              Ozone: ${ozone} µg/m³ — ${ozoneStatus}
            </div>`;
          
          marker.setPopupContent(popupContent);

        } catch (err) {
          console.error("Error fetching data:", err);
          marker.setPopupContent("Failed to load data for this location.");
        }
      });
    }

    const forestLat = 22.3345;
    const forestLng = 80.6115;
    const spacing = 0.0009;
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        createMarker(forestLat + i * spacing, forestLng + j * spacing);
      }
    }

    createMarker(28.6139, 77.2090);    // New Delhi, India
    createMarker(30.0444, 31.2357);    // Cairo, Egypt
    createMarker(69.3497, 88.2024);    // Norilsk, Russia
    createMarker(25.2975, 91.5826);    // Mawsynram, India
    createMarker(-3.1190, -60.0217);   // Manaus, Brazil
    createMarker(47.3769, 8.5417);     // Zurich, Switzerland
    createMarker(64.1466, -21.9426);   // Reykjavik, Iceland
    createMarker(-41.2865, 174.7762);  // Wellington, New Zealand
});

// --- AI Widget Static Prompt Handling ---
const chatHistory = document.getElementById("ai-chat-history");
const promptButtons = document.querySelectorAll(".static-prompt-btn");

const aiResponses = {
  "Which places are dangerous?": "⚠️ Dangerous places today include: New Delhi, Cairo, and Norilsk. Please see the map markers in red.",
  "Any areas with clean air?": "✅ Yes! Zurich, Reykjavik, and Wellington show excellent air quality and mild weather conditions today.",
  "Is Mawsynram safe today?": "🌧️ Mawsynram is experiencing moderate rainfall but no severe alerts. Stay alert for changing conditions."
};

promptButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const prompt = btn.innerText;
    appendMessage(prompt, "user");
    const reply = aiResponses[prompt] || "🤖 Sorry, I don’t have info on that yet.";
    setTimeout(() => appendMessage(reply, "model"), 600);
  });
});

function appendMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `ai-message ${sender}-message`;
  message.innerText = text;
  chatHistory.appendChild(message);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}
