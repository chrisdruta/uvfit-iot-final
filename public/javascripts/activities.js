function loadActivitiesList() {
    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayActivitiesList);
    xhr.responseType = "json";
    xhr.open("GET", "/users/devices");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayActivitiesList() {
    var deviceHTML = "";
    var deviceDiv = document.getElementById('current-devices');

    deviceHTML += "<ol>";

    for (var key in this.response.deviceData) {
        deviceHTML += "<li>" + key + "</li>";
        for (var dataObject of this.response.deviceData[key]) {
            deviceHTML += "<p> Longitude: " + dataObject.long + "\t Latitude: " + dataObject.lat + "\t Speed: " + dataObject.speed + "\t UV: " + dataObject.uv + "</p>";
        }

    }
    deviceHTML += "</ol>"

    deviceDiv.innerHTML = deviceHTML;
}

document.addEventListener("DOMContentLoaded", function () {
    loadActivitiesList();
});