var allActivities = null;

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

    for (var active in allActivities) {
        if ((currDate - allActivities[active].endDateTime) <= 7*24*60*60*1000) {
            time += (allActivities[active].endDateTime - allActivities[active].startDateTime);
            calories += allActivities[active].caloriesBurned;
            uv += allActivities[active].uvExposure;
        }
    }

    document.getElementById("7time").innerHTML = time;
    document.getElementById("7calories").innerHTML = calories;
    document.getElementById("7uv").innerHTML = uv;
}

function displayActivitiesList() {
    allActivities = this.response.activities;
    var activityUl = document.getElementById('activities');
    activityUl.innerHTML = "";

    for (var activity in allActivities) {
        var date1 = new Date(allActivities[activity].endDateTime);
        var date2 = new Date(allActivities[activity].startDateTime);
        var li = document.createElement("li");
        li.setAttribute('name', allActivities[activity].id);
        var text = document.createTextNode("Activity " + (allActivities[activity].id) + "; " + (allActivities[activity].type) + "&emsp;Date: " + (allActivities[activity].startDateTime.toLocaleString()) + "&emsp;Duration: " + (date1.getTime() - date2.getTime()) / 60000 + "&emsp;Calories: " + allActivities[activity].caloriesBurned + "&emsp;UV: " + allActivities[activity].uvExposure);
        //li.innerHTML = "Activity " + (allActivities[activity].id) + "; " + (allActivities[activity].type) + "&emsp;Date: " + (allActivities[activity].startDateTime.toLocaleString()) + "&emsp;Duration: " + (allActivities[activity].endDateTime - allActivities[activity].startDateTime) / 60000 + "&emsp;Calories: " + allActivities[activity].caloriesBurned + "&emsp;UV: " + allActivities[activity].uvExposure;
        li.appendChild(text);
        li.addEventListener("click", addToMap);
        activityUl.appendChild(li);
        console.log((date1.getTime() - date2.getTime()) / 60000);
        //activityUl.style.display = 'block';
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
    for (var location of window.localStorage.getItem("activities")[this.name-1].route) {
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