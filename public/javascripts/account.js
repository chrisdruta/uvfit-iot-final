function signout() {
    window.localStorage.removeItem("authToken");
    window.location = "index.html";
}

function showInfoChange() {
    document.getElementById("nameDropdown").style.display = "block";
    document.getElementById("emailDropdown").style.display = "block";
    document.getElementById("passwordDropdown").style.display = "block";
    document.getElementById("thresholdDropdown").style.display = "block";
    document.getElementById("updateDropdown").style.display = "block";
    document.getElementById("updateInfo").style.display = "none";
}

function hideInfoChange() {
    document.getElementById("nameDropdown").style.display = "none";
    document.getElementById("emailDropdown").style.display = "none";
    document.getElementById("passwordDropdown").style.display = "none";
    document.getElementById("thresholdDropdown").style.display = "none";
    document.getElementById("updateDropdown").style.display = "none";
    document.getElementById("updateInfo").style.display = "block";
}

function submitUpdate() {
    var name = document.getElementById("newName").value;
    var email = document.getElementById("newEmail").value;
    var oldPassword = document.getElementById("oldPassword").value;
    var password = document.getElementById("newPassword").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var uvLevel = document.getElementById("newUVLevel").value;
    var token = window.localStorage.getItem("authToken");

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", verifyUpdate);
    xhr.responseType = "json";
    xhr.open("PUT", '/users/info');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("x-auth", token);
    xhr.send(JSON.stringify({fullName:name, email:email, password:oldPassword, uvLevel:uvLevel, newPassword:password, newPasswordConfirm:confirmPassword }));
}

function verifyUpdate() {
    // 200 is the response code for a successful GET request
    if (this.status === 201) {
        hideInfoChange();
        getAccountInfo();
    }
    else {
        // Use a span with dark red text for errors
        var responseDiv = document.getElementById("ServerResponse");
        var responseHTML = "<span>";
        responseHTML += "Error: " + this.response.error;
        responseHTML += "</span>"
        responseDiv.innerHTML = responseHTML;
        responseDiv.style.display = "block";
    }

    // Update the response div in the webpage and make it visible
    responseDiv.style.display = "block";
    responseDiv.innerHTML = responseHTML;
}

function getAccountInfo() {
    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayAccountInfo);
    xhr.responseType = "json";
    xhr.open("GET", "/users/info");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayAccountInfo() {
    document.getElementById("user-fullName").innerHTML = this.response.name;
    document.getElementById("user-email").innerHTML = this.response.email;
    document.getElementById("user-threshold").innerHTML = this.response.uvLevel;
}

document.addEventListener("DOMContentLoaded", function () {
    getAccountInfo();

    $("body").on('click', '.top', function () {
        $("nav.menu").toggleClass("menu_show");
    });

    document.getElementById("updateInfo").addEventListener("click", showInfoChange);
    document.getElementById("cancelUpdate").addEventListener("click", hideInfoChange);
    document.getElementById("submitUpdate").addEventListener("click", submitUpdate);
});