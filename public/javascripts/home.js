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
    xhr.setRequestHeader("x-auth", window.localStorage.getItem("authToken"));
    xhr.send(JSON.stringify({photonId:json}));

    document.getElementById("card-add").style.display = "none";
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
        responseHTML += "</ol>";
        responseHTML += "<p>Keep this API key for future reference</p>";
    }
    else {
        responseHTML = "<p>Response (" + this.status + "):</p>"
        responseHTML += "<ol class='ServerResponse'>";

        for (var key in this.response) {
            responseHTML += "<li>" + key + ": " + this.response[key] + "</li>";
        }
        responseHTML += "</ol>";
    }

    // Update the response div in the webpage and make it visible
    responseDiv.style.display = "block";
    responseDiv.innerHTML = responseHTML;
}

function initRefresh() {
    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayRecentActivity);
    xhr.responseType = "json";
    xhr.open("GET", "/users/devices");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayRecentActivity() {
    var deviceHTML = "";
    var deviceDiv = document.getElementById('current-devices');

    deviceHTML += "<ol>";

    for (var key in this.response.deviceData) {
        deviceHTML += "<li>" + key + "</li>";
        for (var dataObject of this.response.deviceData[key]) {
            //for (var objEntry in dataObject) {
            deviceHTML += "<p> Longitude: " + dataObject.long + "\t Latitude: " + dataObject.lat + "\t Speed: " + dataObject.speed + "\t UV: " + dataObject.uv + "</p>";
            //}
        }
        //if (key == "deviceData") {
          //for (key2 in Object.keys(this.response)) {
              //deviceHTML += "<li>" + key + ": " + Object.keys(this.response[key2]) + "</li>";
          //}
        //}


    }
    deviceHTML += "</ol>"

    deviceDiv.innerHTML = deviceHTML;

}

function signout() {
    window.localStorage.removeItem("authToken");
    window.location = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    intitRefresh();
    document.getElementById("add").addEventListener("click", addDevice);
    document.getElementById("submit").addEventListener("click", submitDevice);

    document.getElementById("refresh").addEventListener("click", initRefresh);
    document.getElementById("signout").addEventListener("click", signout);

});
