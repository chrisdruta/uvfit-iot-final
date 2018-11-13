function addDevice(event) {
    document.getElementById("card-add").style.display = "block";
}

function submitDevice(event) {
    //var url = document.getElementById("url").value;
    var json = document.getElementById("deviceId").value;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", processResponse);
    xhr.responseType = "json";
    xhr.open("POST", '/devices/register');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("x-auth", window.localStorage.getItem("token"));
    xhr.send(JSON.stringify({photonId:json}));
}

function processResponse() {
    var responseDiv = document.getElementById('ServerResponse');
    var responseHTML = "";

    // 201 is the response code for a successful POST request
    if (this.status === 201) {
        responseHTML += "<ol class='ServerResponse'>";

        for (var key in this.response) {
            responseHTML += "<li>" + key + ": " + this.response[key] + "</li>";
        }
        responseHTML += "</ol>"
    }
    else {
        responseHTML = "<p>Response (" + this.status + "):</p>"
        responseHTML += "<ol class='ServerResponse'>";

        for (var key in this.response) {
            responseHTML += "<li>" + key + ": " + this.response[key] + "</li>";
        }
        responseHTML += "</ol>"
    }

    // Update the response div in the webpage and make it visible
    responseDiv.style.display = "block";
    responseDiv.innerHTML = responseHTML;
}

function getRecentActivity() {
    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayMostActivity);
    xhr.responseType = "json";
    xhr.open("GET", "/users/devices");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayMostRecentActivity() {
    //document.getElementById("main").style.display = "block";

    if (this.status === 200) {
        // If there's at least one pothole, draw the map
        var latitude = 32.2319;
        var longitude = -110.9501;
        var activityReport = "No activity has been reported recently.";

        //show activity

    }
    else if (this.status === 401) {
        window.localStorage.removeItem("authToken");
        window.location = "index.html";
    }
    else {
        potholeText.innerHTML = "Error communicating with server.";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("add").addEventListener("click", addDevice);
    document.getElementById("submit").addEventListener("click", submitDevice)

    function initRecent() {
        // Allow the user to refresh by clicking a button.
        document.getElementById("refreshRecent").addEventListener("click", getRecentActivity);
        getRecentActvity();
    }

});
