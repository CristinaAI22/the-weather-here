import express from "express";
import pkg from "nedb";
import fetch from "node-fetch";
import "dotenv/config";

const app = express();
app.listen(3000, () => console.log("listening at 3000"));
app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
const DataStore = pkg;
const database = new pkg("database.db");
database.loadDatabase();

app.get("/api", (req, res) => {
  database.find({}, (err, data) => {
    if (err) {
      res.end();
      return;
    }
    res.send(data);
  });
});

app.post("/api", (req, res) => {
  console.log(" i got a request");
  console.log(req.body);
  const data = req.body;
  const timestamp = Date.now();
  data.timestamp = timestamp;
  database.insert(data);
  console.log(database);
  res.json(data);
});

app.get("/weather/:latlon", async (req, res) => {
  const latlon = req.params.latlon.split(",");
  console.log(latlon);
  const lat = latlon[0];
  const lon = latlon[1];
  console.log(lat, lon);
  const api_key = process.env.API_KEY;
  try {
    const weather_url = `http://api.weatherapi.com/v1/current.json?key=${api_key}&q=${lat},${lon}`;
    const weather_response = await fetch(weather_url);
    if (!weather_response.ok) {
      throw new Error("Failed to fetch weather data");
    }
    const weather_data = await weather_response.json();

    const aq_url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}`;
    const aq_response = await fetch(aq_url);
    if (!aq_response.ok) {
      throw new Error("Failed to fetch air quality data");
    }
    const aq_data = await aq_response.json();
    const data = {
      weather: weather_data,
      air_quality: aq_data,
    };
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});
