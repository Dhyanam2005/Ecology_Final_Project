import React, { useEffect, useState } from "react";
import "./App.css";
import * as THREE from "three";
import FOG from "vanta/dist/vanta.fog.min";
import { fetchNASAData } from "./nasapowerapi";

const App = () => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [RH2M, setRH2M] = useState(null); // Relative Humidity at 2 meters
  const [WS10M, setWS10M] = useState(null); // Wind Speed at 10 meters
  const [T2M, setT2M] = useState(null); // Temperature at 2 meters
  const [ALLSKY_SFC_SW_DWN, setALLSKY_SFC_SW_DWN] = useState(null); // Solar Radiation
  const [saturationVapourPressure, setSaturationVapourPressure] = useState(null);
  const [actualVapourPressure, setActualVapourPressure] = useState(null);
  const [slope, setSlope] = useState(null);
  const [area, setArea] = useState(0); // Area input by user
  const [lati,setLati] = useState(0);
  const [longi,setLongi] = useState(0);
  const [evaporationForArea, setEvaporationForArea] = useState(null); // Evaporation for the given area

  useEffect(() => {
    const vantaEffect = FOG({
      el: "#vanta-bg",
      THREE: THREE,
      highlightColor: 0x0077be,
      midtoneColor: 0x005f99,
      lowlightColor: 0x003f66,
      baseColor: 0x001f33,
      blurFactor: 0.6,
      speed: 1.2,
    });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  const psychrometricConstant = 0.066;

  const calSaturationVapourPressure = (temp) => {
    const power = (17.27 * temp) / (temp + 237.3);
    return 0.6108 * Math.exp(power);
  };

  const calActualVapourPressure = (saturationVapourPressure, relativeHumidity) => {
    return (relativeHumidity * saturationVapourPressure) / 100;
  };

  const calSlope = (saturationVapourPressure, temperature) => {
    return (4098 * saturationVapourPressure) / Math.pow(temperature + 237.3, 2);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      document.getElementById("location-info").innerHTML =
        "Geolocation is not supported by this browser.";
    }
  };

  const calculateEvaporation = (
    psychrometricConstant,
    saturationVapourPressure,
    actualVapourPressure,
    temperature,
    windspeed,
    radiation,
    slope
  ) => {
    const top =
      slope * radiation +
      (psychrometricConstant * 900 * windspeed * (saturationVapourPressure - actualVapourPressure)) /
        (temperature + 273);
    const bottom = slope + psychrometricConstant * (1 + 0.34 * windspeed);
    return top / bottom;
  };

  const showPosition = async (position) => {
    let lat = 16.5792972;
    let lon = 81.2023295;
    setLocation({ latitude: lat, longitude: lon });

    try {
      const data = await fetchNASAData(lat, lon);
      setWeatherData(data);

      const dateKey = "20250315"; // The date you want to retrieve values for

      const rh2mValue = data.properties.parameter.RH2M[dateKey];
      const ws10mValue = data.properties.parameter.WS10M[dateKey];
      const t2mValue = data.properties.parameter.T2M[dateKey];
      const allskySfcSwDwnValue = data.properties.parameter.ALLSKY_SFC_SW_DWN[dateKey];

      setRH2M(rh2mValue);
      setWS10M(ws10mValue);
      setT2M(t2mValue);
      setALLSKY_SFC_SW_DWN(allskySfcSwDwnValue);

      // Calculate additional variables
      const satVapPressure = calSaturationVapourPressure(t2mValue);
      setSaturationVapourPressure(satVapPressure);

      const actualVapPressure = calActualVapourPressure(satVapPressure, rh2mValue);
      setActualVapourPressure(actualVapPressure);

      const slopeValue = calSlope(satVapPressure, t2mValue);
      setSlope(slopeValue);
    } catch (error) {
      console.error("Error fetching NASA data:", error);
    }
  };

  // Calculate evaporation rate and evaporation for the given area
  const ans = calculateEvaporation(
    psychrometricConstant,
    saturationVapourPressure,
    actualVapourPressure,
    T2M,
    WS10M,
    ALLSKY_SFC_SW_DWN,
    slope
  );

  const handleLatitudeChange = (e) => {
    const latitudeValue = e.target.value;
    setLati(latitudeValue);
  }

  const handleLongitudeChange = (e) => {
    const longitudeValue = e.target.value;
    setLati(longitudeValue);
  }

  const handleAreaChange = (e) => {
    const areaValue = e.target.value;
    setArea(areaValue);

    // Calculate evaporation for the input area
    const evaporationForAreaValue = (ans * areaValue * 365) / 1000;
    setEvaporationForArea(evaporationForAreaValue);
  };

  return (
    <div>
      <div id="vanta-bg"></div>

      <div className="section">
          <h1>Calculate annual water loss from evaporation based on your location.</h1>
          <input
      type="number"
      placeholder="Enter area in m²"
      value={area}
      onChange={handleAreaChange}
    />
    {area > 0 && (
      <p className="display-evaporation">Loss of litres due to evaporation is {ans * 365 * area} L per year</p>
    )}
  </div>
  <button onClick={getLocation}>Calculate Evaporation</button>

        

      <div className="evaporation-rate">
        <h2>Evaporation Rate for the year 2024</h2>
        <table border="1" style={{ width: "100%", textAlign: "center" }}>
  <thead>
    <tr>
      <th>Month</th>
      <th>Average Temperature (max, min)</th>
      <th>Highest Average Temperature</th>
      <th>Average Evaporation Rate (mm/day)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>January</td>
      <td>30.48°C,20.77°C</td>
      <td>27°C</td>
      <td>10.91545103</td>
    </tr>
    <tr>
      <td>February</td>
      <td>32.62°C,22.9°C</td>
      <td>30°C</td>
      <td>15.51944688</td>
    </tr>
    <tr>
      <td>March</td>
      <td>34.48°C,24.13°C</td>
      <td>30.5°C</td>
      <td>18.09223118</td>
    </tr>
    <tr>
      <td>April</td>
      <td>37.24°C,26.77°C</td>
      <td>35°C</td>
      <td>19.63286688</td>
    </tr>
    <tr>
      <td>May</td>
      <td>37.9°C,28.9°C</td>
      <td>36°C</td>
      <td>17.92925618</td>
    </tr>
    <tr>
      <td>June</td>
      <td>36.44°C,25.74°C</td>
      <td>35°C</td>
      <td>15.39328944</td>
    </tr>
    <tr>
      <td>July</td>
      <td>34.74°C,25.42°C</td>
      <td>33°C</td>
      <td>13.27584335</td>
    </tr>
    <tr>
      <td>August</td>
      <td>34.74°C,26.74°C</td>
      <td>32.5°C</td>
      <td>12.76022859</td>
    </tr>
    <tr>
      <td>September</td>
      <td>35.6°C,26.6°C</td>
      <td>34.5°C</td>
      <td>13.46316982</td>
    </tr>
    <tr>
      <td>October</td>
      <td>33.23°C,25.52°C</td>
      <td>32°C</td>
      <td>13.3313721</td>
    </tr>
    <tr>
      <td>November</td>
      <td>30.5°C,24.1°C</td>
      <td>29.5°C</td>
      <td>9.802287457</td>
    </tr>
    <tr>
      <td>December</td>
      <td>29.97°C,23.71°C</td>  
      <td>29°C</td>
      <td>8.576698798</td>
    </tr>
  </tbody>
</table>
      <div className="content-of-year">
      <p>AVERAGE RATE OF EVAPORATION FOR CAMPUS PONDS IN 2024 is 14.057 mm/day</p>
      <p>14.057mm * area of ponds(11 acres) = 625.747 m^3</p>
      <p>(assuming surface area of pond is constant and neglecting seepages)</p>
      <p>1m^3 = 1000 Litres</p>
      <p>Water loss due to evaporation is = 625747 litres per day</p>
      </div>
      </div>



      <div className="footer">
        <p>&copy; 2025 EvapoRa. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default App;
