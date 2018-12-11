function loadActivitiesList() {
    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    /*xhr.addEventListener("load", (event) => {
        localStorage.setItem('activities', this.response.activities);
        displayActivitiesList();
    });*/
    xhr.addEventListener('load', displayActivitiesList);
    xhr.responseType = "json";
    xhr.open("GET", "/users/activities");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function load7Days() {
    var time = 0;
    var calories = 0;
    var uv = 0;
    currDate = new Date();

    for (var active of localStorage.getItem('activities')) {
        if ((currDate - active.endDateTime) <= 7) {
            time += (active.endDateTime - active.startDateTime);
            calories += active.caloriesBurned;
            uv += active.uvExposure;
        }
    }

    document.getElementById("7time").innerHTML = time + "hrs";
    document.getElementById("7calories").innerHTML = calories;
    document.getElementById("7uv").innerHTML = uv;
}

function displayActivitiesList() {
    localStorage.setItem('activities', this.response.activities);
    var activityUl = document.getElementById('activities');
    activityUl.innerHTML = "";

    for (var activity of localStorage.getItem('activities')) {
        var li = document.createElement("li")
        li.name = activity.id;
        li.innerHTML = "Activity " + activity.id + "; " + activity.type + "&emsp;Date: " + activity.startDateTime.toLocaleString() + "&emsp;Duration: " + activity.endDateTime - activity.startDateTime / 60000 + "&emsp;Calories: " + activity.caloriesBurned + "&emsp;UV: " + activity.uvExposure;
        li.addEventListener("click", addToMap);
        activityUl.appendChild(li);
        
    }
}

function addToMap() {
    document.getElementById("mapid").innerHTML = "";
    var mymap = L.map('mapid').setView([32.242725, -110.963965], 16);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGtvZWhsZXIxNCIsImEiOiJjanBqNDFwcGwwMnZyM3Bwcm5jdmltN3Q3In0.ij9GLBpuJhRlvj-CLFyMjg', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'your.mapbox.access.token'
    }).addTo(mymap);


    activity.route;
    //for loop
    for (var location of localStorage.getItem("activities")[this.name-1].route) {
        var marker = L.marker([location.lat, location.long]).addTo(mymap);
    }
    document.getElementById("mapid").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
    loadActivitiesList();
    load7Days();

    $("body").on('click', '.top', function () {
        $("nav.menu").toggleClass("menu_show");
    });

});