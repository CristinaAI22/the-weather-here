const myMap = L.map("checkinMap").setView([0, 0], 1);
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const tiles = L.tileLayer(tileUrl, {
  attribution: attribution,
});
tiles.addTo(myMap);
getData();

async function getData() {
  try {
    const res = await fetch("/api");
    const data = await res.json();
    console.log(data);

    for (const item of data) {
      try {
        if (!item.lat || !item.lon) {
          console.warn(`Skipping entry due to missing coordinates:`, item);
          continue;
        }

        const marker = L.marker([item.lat, item.lon]).addTo(myMap);

        let weatherText = "No weather data available";
        let tempC = "N/A";

        if (
          item.weather &&
          item.weather.condition &&
          item.weather.condition.text !== undefined &&
          item.weather.temp_c !== undefined
        ) {
          weatherText = item.weather.condition.text;
          tempC = item.weather.temp_c;
        }

        let airQualityText = "No air quality data available";
        if (
          item.air &&
          item.air.value !== undefined &&
          item.air.parameter &&
          item.air.unit &&
          item.air.lastUpdated
        ) {
          if (item.air.value < 0) {
            airQualityText = "No air quality reading!";
          } else {
            airQualityText = `The concentration of particulate matter ${item.air.parameter} is ${item.air.value}${item.air.unit},  last read on ${item.air.lastUpdated}.`;
          }
        }

        const txt = `The weather here at ${item.lat}&deg;, ${item.lon}&deg; is ${weatherText} with a temperature of ${tempC}° Celsius. ${airQualityText}`;

        marker.bindPopup(txt);
      } catch (markerError) {
        console.error(`Error creating marker for item:`, item, markerError);
      }
    }
  } catch (fetchError) {
    console.error("Failed to fetch data", fetchError);
  }
}
