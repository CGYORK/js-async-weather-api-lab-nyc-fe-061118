const API_KEY = "91e263778af92361ac356d09d927d749";
const MAP_API_KEY = "AIzaSyDJ_4WZ7DodyxTIfMe1Bc8g1_V0B9MSgrY";

function handleFormSubmit(event) {
  //handle submit event
  event.preventDefault();
  let city = $(`#city`).val();
  fetchCurrentWeather(city);
  fetchCurrentWeatherTwice(city);
  fetchFiveDayForecast(city);
  fetchCreateChart(city);
  }

// function fetchCurrentMap(city) {
//   //fetch map of current weather based on city
//   debugger;
//     fetch (`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${API_KEY}&units=imperial`)
//     .then(res => res.json())
//     .then(initMap)
// }
    
// function initMap(json) {
//   debugger;
//   const lng = json.city.coord.lon;
//   const lat = json.city.coord.lat;
//   fetch (`https://tile.openweathermap.org/map/precipitation_new/6/${lng}/${lat}.png?appid=${API_KEY}`)
//   .then(displayCurrentMap);
// }
 
// function displayCurrentMap(json) {
//   //render map of current weather based on city
//   debugger;
//   let map = `https://tile.openweathermap.org/map/precipitation_new/6/${lng}/${lat}.png?appid=${API_KEY}`
//   let displayMap = document.GetElementById('map');
//   displayMap.innerHTML = map;
// }

/////////////////GENERATE WEATHER DATA/////////////////////////

function fetchCurrentWeather(city) {
  //fetch current weather based on city
    fetch (`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}&units=imperial`)
    .then(res => res.json())
    .then(initialize);
}

function fetchCurrentWeatherTwice(city) {
  //fetch current weather based on city
    fetch (`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}&units=imperial`)
    .then(res => res.json())
    .then(displayCurrentWeather);
}

/////////////////GENERATE MAP/////////////////////////

  var map;
  var geoJSON;
  var request;
  var gettingData = false;
  var openWeatherMapKey = "91e263778af92361ac356d09d927d749"
  function initialize(json) {
    const lng = json.coord.lon;
    const lat = json.coord.lat;
    var mapOptions = {
      zoom: 10,
      center: new google.maps.LatLng(lat, lng)
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
    // Add interaction listeners to make weather requests
    google.maps.event.addListener(map, 'idle', checkIfDataRequested);
    // Sets up and populates the info window with details
    map.data.addListener('click', function(event) {
      infowindow.setContent(
       "<img src=" + event.feature.getProperty("icon") + ">"
       + "<br /><strong>" + event.feature.getProperty("city") + "</strong>"
       + "<br />" + event.feature.getProperty("temperature") + "&deg;C"
       + "<br />" + event.feature.getProperty("weather")
       );
      infowindow.setOptions({
          position:{
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          },
          pixelOffset: {
            width: 0,
            height: -15
          }
        });
      infowindow.open(map);
    });
  }
  var checkIfDataRequested = function() {
    // Stop extra requests being sent
    while (gettingData === true) {
      request.abort();
      gettingData = false;
    }
    getCoords();
  };
  // Get the coordinates from the Map bounds
  var getCoords = function() {
    var bounds = map.getBounds();
    var NE = bounds.getNorthEast();
    var SW = bounds.getSouthWest();
    getWeather(NE.lat(), NE.lng(), SW.lat(), SW.lng());
  };
  // Make the weather request
  var getWeather = function(northLat, eastLng, southLat, westLng) {
    gettingData = true;
    var requestString = "http://api.openweathermap.org/data/2.5/box/city?bbox="
                        + westLng + "," + northLat + "," //left top
                        + eastLng + "," + southLat + "," //right bottom
                        + map.getZoom()
                        + "&cluster=yes&format=json"
                        + "&APPID=" + openWeatherMapKey;
    request = new XMLHttpRequest();
    request.onload = proccessResults;
    request.open("get", requestString, true);
    request.send();
  };
  // Take the JSON results and proccess them
  var proccessResults = function() {
    console.log(this);
    var results = JSON.parse(this.responseText);
    if (results.list.length > 0) {
        resetData();
        for (var i = 0; i < results.list.length; i++) {
          geoJSON.features.push(jsonToGeoJson(results.list[i]));
        }
        drawIcons(geoJSON);
    }
  };
  var infowindow = new google.maps.InfoWindow();
  // For each result that comes back, convert the data to geoJSON
  var jsonToGeoJson = function (weatherItem) {
    var feature = {
      type: "Feature",
      properties: {
        city: weatherItem.name,
        weather: weatherItem.weather[0].main,
        temperature: weatherItem.main.temp,
        min: weatherItem.main.temp_min,
        max: weatherItem.main.temp_max,
        humidity: weatherItem.main.humidity,
        pressure: weatherItem.main.pressure,
        windSpeed: weatherItem.wind.speed,
        windDegrees: weatherItem.wind.deg,
        windGust: weatherItem.wind.gust,
        icon: "http://openweathermap.org/img/w/"
              + weatherItem.weather[0].icon  + ".png",
        coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
      },
      geometry: {
        type: "Point",
        coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
      }
    };
    // Set the custom marker icon
    map.data.setStyle(function(feature) {
      return {
        icon: {
          url: feature.getProperty('icon'),
          anchor: new google.maps.Point(25, 25)
        }
      };
    });
    // returns object
    return feature;
  };
  // Add the markers to the map
  var drawIcons = function (weather) {
    map.data.addGeoJson(geoJSON);
    // Set the flag to finished
    gettingData = false;
  };
  // Clear data layer and geoJSON
  var resetData = function () {
    geoJSON = {
      type: "FeatureCollection",
      features: []
    };
    map.data.forEach(function(feature) {
      map.data.remove(feature);
    });
  };
// function initMap(city) {
//   //generate and display google map cased on city
//   const lng = json.city.coord.lon;
//   const lat = json.city.coord.lat;
//   var map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: 40.730610, lng: -73.935242},
//     zoom: 10
//     });
// }

// function displayMap() {
//   map.innerHTML = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&callback=initMap`;
// }

/////////////////DISPLAY NON-MAP WEATHER DATA/////////////////////////

function displayCurrentWeather(json) {
  //render current weather data to the DOM using provided IDs and json from API
  let temp = json.main.temp + "°";
  let tempRow = document.getElementById('temp');
  tempRow.innerHTML = temp;
  
  let temp_humidity = json.main.humidity + "%";
  let temp_humidityRow = document.getElementById("humidity");
  temp_humidityRow.innerHTML = temp_humidity;
  
  let temp_clouds = json.clouds.all + "%";
  let temp_cloudsRow = document.getElementById("cloudCover");
  temp_cloudsRow.innerHTML = temp_clouds;
  
  let temp_weather = json['weather']['0']['description'];
  let temp_weatherRow = document.getElementById("weather");
  temp_weatherRow.innerHTML = temp_weather;  
  
  let temp_windSpeed = json.wind.speed + " mph";
  let temp_windSpeedRow = document.getElementById("windSpeed");
  temp_windSpeedRow.innerHTML = temp_windSpeed; 
  
  let temp_minMax = 'H ' + json.main.temp_max + "°" + " /" + ' L ' + json.main.temp_min + "°";
  let temp_minMaxRow = document.getElementById("minMax");
  temp_minMaxRow.innerHTML = temp_minMax;   
  
  }

function fetchFiveDayForecast(city) {
  //fetch five day forecast data based on city
    fetch (`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${API_KEY}&units=imperial`)
    .then(res => res.json())
    .then(displayFiveDayForecast);
}

function displayFiveDayForecast(forcastJson) {
  //render five day forecast data to the DOM using provided IDs and json from API
   forcastJson.list.forEach(function(dateTime) {
     let iconCode = dateTime[`weather`][`0`][`icon`];
     let iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
      $(`#fiveDayTime`).append(`<div>${dateTime.dt_txt + "  <img src='" + iconUrl + "'>"}</div>`);
      $(`#fiveDayDescription`).append(`<div>${dateTime[`weather`][`0`][`description`]}</div>`);
      $(`#fiveDayHighLow`).append(`<div>${dateTime.main.temp_max + "°" + " / " + dateTime.main.temp_min + "°"}</div>`);
      $(`#fiveDayCloudCoverage`).append(`<div>${dateTime.clouds.all + "%"}</div>`);
      $(`#fiveDayWind`).append(`<div>${dateTime.wind.speed + " mph"}</div>`);
      $(`#fiveDayHumidity`).append(`<div>${dateTime.main.humidity + "%"}</div>`);
    });
}

function fetchCreateChart(city) {
    fetch (`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${API_KEY}&units=imperial`)
    .then(res => res.json())
    .then(createChart);
}

function createChart(forcastJson) {
  const labels = forcastJson.list.map(function(e){
    return e.dt_txt;
  });
  const data = forcastJson.list.map(function(e){
    return e.main.temp;
  });
  var ctx = document.getElementById('WeatherChart').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: labels,
        datasets: [{
            label: "5-Day Forcast (Temp)",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: data,
        }]
    },
    options: {
                responsive: false
            }
});
}
// google.maps.event.addDomListener(window, 'load', initialize);

document.addEventListener('DOMContentLoaded', function() {
  $("form").on("submit", handleFormSubmit);
});
