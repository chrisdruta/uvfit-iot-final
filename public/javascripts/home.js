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
    xhr.addEventListener("load", displayDevices);
    xhr.responseType = "json";
    xhr.open("GET", "/users/devices");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayDevices() {
    var deviceDiv = document.getElementById('current-devices');
    deviceDiv.innerHTML = "";

    deviceDiv.innerHTML += "<ol>";

    for (var key of this.response.deviceList) {
        deviceDiv.innerHTML += "<li>" + key + "</li>";
        var button = document.createElement('input');
        //button['type'] = 'button';
        //button['id'] = key;
        //button['click'] = "removeDevice()";
        
        button.setAttribute('type', 'button');
        button.setAttribute('id', key);
        button.setAttribute('value', 'Delete Device');
        button.setAttribute('class', 'btn');
        button.setAttribute('onclick', 'removeDevice()');
        deviceDiv.appendChild(button);

    }
    deviceDiv.innerHTML += "</ol>"

}

function removeDevice() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", processRemove);
    xhr.responseType = "json";
    xhr.open("DELETE", '/devices/remove');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("x-auth", window.localStorage.getItem("authToken"));
    xhr.send();
}

function processRemove() {
    var responseDiv = document.getElementById('ServerResponse');
    var responseHTML = "";

    // 200 is the response code for a successful DELETE request
    if (this.status === 200) {
        initRefresh();
        /*responseHTML += "<ol class='ServerResponse'>";

        for (var key in this.response) {
            responseHTML += "<li>" + key + ": " + this.response[key] + "</li>";
        }
        responseHTML += "</ol>";
        responseHTML += "<p>Keep this API key for future reference</p>";*/
    }
    else {
        responseHTML = "<p>Response (" + this.status + "):</p>"
        responseHTML += "<ol class='ServerResponse'>";

        for (var key in this.response) {
            responseHTML += "<li>" + key + ": " + this.response[key] + "</li>";
        }
        responseHTML += "</ol>";
    }
}

function signout() {
    window.localStorage.removeItem("authToken");
    window.location = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    initRefresh();

    $("body").on('click', '.top', function () {
        $("nav.menu").toggleClass("menu_show");
    });
    document.getElementById("add").addEventListener("click", addDevice);
    document.getElementById("submit").addEventListener("click", submitDevice);
    document.getElementById("refresh").addEventListener("click", initRefresh);
    document.getElementById("signout").addEventListener("click", signout);

});
