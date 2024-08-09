let lat, lon;

if ("geolocation" in navigator) {
  console.log("geolocation available");
  navigator.geolocation.getCurrentPosition(async (position) => {
    let lat, lon, weather, icon, air, city, region, country;
    try {
      lat = position.coords.latitude;
      lon = position.coords.longitude;

      document.getElementById("lat").textContent = lat.toFixed(2);
      document.getElementById("lon").textContent = lon.toFixed(2);

      const api_url = `/weather/${lat},${lon}`;
      const response = await fetch(api_url);
      const json = await response.json();
      console.log(json);

      city = json.weather.location.name;
      region = json.weather.location.region;
      country = json.weather.location.country;
      document.getElementById("city").textContent = city;
      document.getElementById("region").textContent = region;
      document.getElementById("country").textContent = country;

      weather = json.weather.current;
      icon = json.weather.current.condition.icon;

      if (
        json.air_quality.results &&
        json.air_quality.results[0] &&
        json.air_quality.results[0].measurements &&
        json.air_quality.results[0].measurements[0]
      ) {
        air = json.air_quality.results[0].measurements[0];
        document.getElementById("aq_parameter").textContent = air.parameter;
        document.getElementById("aq_value").textContent = air.value;
        document.getElementById("aq_unit").textContent = air.unit;
        document.getElementById("aq_date").textContent = air.lastUpdated;
      } else {
        air = { value: -1 };
        document.getElementById("aq_parameter").textContent = "N/A";
        document.getElementById("aq_value").textContent = "N/A";
        document.getElementById("aq_unit").textContent = "N/A";
        document.getElementById("aq_date").textContent = "N/A";
      }

      document.getElementById("summary").textContent = weather.condition.text;
      document.getElementById("temp").textContent = weather.temp_c;
      document.getElementById("icon").src = icon;
    } catch (err) {
      console.error(err);
      air = { value: -1 };
      document.getElementById(
        "summary"
      ).textContent = `No reading available for location at lat ${lat.toFixed(
        2
      )} and lon ${lon.toFixed(2)}!`;
      document.getElementById("temp").textContent = "N/A";
      document.getElementById("aq_parameter").textContent = "N/A";
      document.getElementById("aq_value").textContent = "N/A";
      document.getElementById("aq_unit").textContent = "N/A";
      document.getElementById("aq_date").textContent = "N/A";
    }
    const data = { lat, lon, weather, air };
    const options = {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const db_response = await fetch("/api", options);
    const db_json = await db_response.json();
    console.log(db_json);
  });
} else {
  console.log("geolocation not available");
}
