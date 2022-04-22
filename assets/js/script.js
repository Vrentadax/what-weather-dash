// config variables
var jumbo = $(".jumbotron"),
    city_input = $("#city"),
    city_submit = $("#submit-city"),
    prevSearches = $("#prevSearches"),
    weather_display = $("#weather-forecast"),
    week_forecast = $("#five-forecast"),
    days = "5",
    api_key = "21f70556e9750656e572b49f6f7f3a3b",
    index = 1;


// config weather variables
var city_name = $("#city-name"),
    city_weather = $("#city-weather"),
    city_temp = $("#city-temp"),
    city_wind = $("#city-wind"),
    city_humid = $("#city-humid"),
    city_index = $("#city-index");

// config previous searches
var prevSearchesList = [];

// config moment js
var currentDate = moment().format("dddd, MMMM Do YYYY");

// load previous searches
var loadPrevSearches = function() {
    if (localStorage.getItem("city") === null) {
        return;
    }
    var history = JSON.parse(localStorage.getItem("city"));
    prevSearchesList = history;
    localStorage.setItem("city", JSON.stringify(prevSearchesList));
}

// create the previous searches list
var createSearches = function() {
    if (prevSearchesList === null) {
        return;
    }
    for (var i = 0; i < prevSearchesList.length; i++) {
        prevSearches.append("<li data-city='"+ prevSearchesList[i].toLowerCase() + "' class='item'>" + prevSearchesList[i] + "</li>");
    }
}

// handle input error
var errorHandle = function() {
    city_submit.after(
        "<p class='error-handle' style='color:red'>Please provide a valid city!</p>"
    );
    setTimeout(function() {
        $(".error-handle").remove();
    }, 1000);
}

// display 5-day weather forecast
var displayFiveDays = function(lat, lon) {

    // empty before loading
    week_forecast.empty();

    // config api url
    var apiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=imperial&cnt=" +
        days + "&lat=" +
        lat + "&lon=" +
        lon + "&appid=" +
        api_key;

    // make a get request
    $.ajax({
        url: apiUrl,
        type: "GET",
        dataType: "json",
        success: function(response) {
            console.log(response);
            for (var i = 0; i < response.list.length; i++) {
                var buildDiv = '<div class="day col">' +
                response.list[i].dt_txt+'<br><img src="https://openweathermap.org/img/w/' +
                response.list[i].weather[0].icon + '.png"><br>Temp: ' +
                Math.round(response.list[i].main.temp) + ' °F<br>Wind: ' +
                response.list[i].wind.speed + ' MPH<br>Humidity: ' +
                response.list[i].main.humidity + ' %</div>';
                buildDiv=+
                week_forecast.append(buildDiv);
            }
        },
        error: function(status, err) {
            console.log("ERROR: " + status, err);
        }
    });
}

var getUvi = function(lat, lon) {

    // config api url
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat + "&lon=" +
    lon + "&exclude=minutely,hourly,daily&appid=" +
    api_key;

    // make a get request
    $.ajax({
        url: apiUrl,
        type: "GET",
        dataType: "json",
        success: function(response) {
            var uvi = response.current.uvi;
            city_index.html("UV Index: <span id='uvi'>" + uvi + "</span>");

            // change color according to value
            if (uvi < 2) {
                $("#uvi").css({
                    backgroundColor: "green",
                    padding: "5px 20px"
                });
            } else if (uvi > 2 && uvi < 6) {
                $("#uvi").css({
                    backgroundColor: "yellow",
                    padding: "5px 20px",
                    color: "black"
                });
            } else if (uvi > 5 && uvi < 8) {
                $("#uvi").css({
                    backgroundColor: "orange",
                    padding: "5px 20px",
                    color: "black"
                });
            } else if (uvi > 7 && uvi < 11) {
                $("#uvi").css({
                    backgroundColor: "red",
                    padding: "5px 20px",
                });
            } else {
                $("#uvi").css({
                    backgroundColor: "white",
                    padding: "5px 20px",
                    color: "black"
                });
            }
        },
        error: function(status, err) {
            console.log("ERROR: " + status, err);
        }
    });
}

// submit city search
city_submit.click(function(event) {
    event.preventDefault();

    // error handler
    if (!city_input.val()) {
        errorHandle();
        return;
    }

    // save city
    var city = city_input.val().trim();

    if (!prevSearchesList.includes(city)) {
        prevSearchesList.push(city);
        localStorage.setItem("city", JSON.stringify(prevSearchesList));
        loadPrevSearches();
    }

    // apply api url
    var api_url = "https://api.openweathermap.org/data/2.5/weather?q=" +
        city + "&units=imperial&appid=" +
        api_key;

    // make a get request
    $.ajax({
        url: api_url,
        type: "GET",
        dataType: "json",
        success: function(response) {

            // config responses
            var lat = response.coord.lat,
                lon = response.coord.lon,
                icon = response.weather[0].icon;

            // call displayFiveDays
            displayFiveDays(lat, lon);

            city_name.text(response.name + " (" + currentDate + ")");
            city_weather.html(response.weather[0].main + " <img src='https://openweathermap.org/img/w/" + icon + ".png'>");
            city_temp.text("Temp: " + Math.round(response.main.temp) + "°F (H: " + Math.round(response.main.temp_max) + " L: " + Math.round(response.main.temp_min) + ")");
            city_wind.text("Wind: " + response.wind.speed + " MPH");
            city_humid.text("Humidity: " + response.main.humidity + "%");
            getUvi(lat, lon);
        },
        error: function(status, err) {
            errorHandle();
            console.log("ERROR: " + status, err);
        }
    });
});

// load previous searches
loadPrevSearches();
createSearches();

// add event listener to previous searches
$(document).ready(function() {
    $("li.item").click(function(event) {
        event.preventDefault();

        var data = $(this).attr("data-city");

        // apply api url
        var api_url = "https://api.openweathermap.org/data/2.5/weather?q=" +
            data + "&units=imperial&appid=" +
            api_key;

        // make a get request
        $.ajax({
            url: api_url,
            type: "GET",
            dataType: "json",
            success: function(response) {

                // config responses
                var lat = response.coord.lat,
                    lon = response.coord.lon,
                    icon = response.weather[0].icon;

                // call displayFiveDays
                displayFiveDays(lat, lon);

                city_name.text(response.name + " (" + currentDate + ")");
                city_weather.html(response.weather[0].main + " <img src='https://openweathermap.org/img/w/" + icon + ".png'>");
                city_temp.text("Temp: " + Math.round(response.main.temp) + "°F (H: " + Math.round(response.main.temp_max) + " L: " + Math.round(response.main.temp_min) + ")");
                city_wind.text("Wind: " + response.wind.speed + " MPH");
                city_humid.text("Humidity: " + response.main.humidity + "%");
                getUvi(lat, lon);
            },
            error: function(status, err) {
                errorHandle();
                console.log("ERROR: " + status, err);
            }
        });
    });
});