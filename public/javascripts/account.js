function signout() {
    window.localStorage.removeItem("authToken");
    window.location = "index.html";
}

function goHome() {
    window.location = "home.html";
}

function showInfoChange() {
    document.getElementById("nameDropdown").style.display = "block";
    document.getElementById("emailDropdown").style.display = "block";
    document.getElementById("passwordDropdown").style.display = "block";
    document.getElementById("updateDropdown").style.display = "block";
    document.getElementById("updateInfo").style.display = "none";
}

function hideInfoChange() {
    document.getElementById("nameDropdown").style.display = "none";
    document.getElementById("emailDropdown").style.display = "none";
    document.getElementById("passwordDropdown").style.display = "none";
    document.getElementById("updateDropdown").style.display = "none";
    document.getElementById("updateInfo").style.display = "block";
}

/*function showNameChange() {
    document.getElementById("nameDropdown").style.display = "block";
}

function hideNameChange() {
    document.getElementById("nameDropdown").style.display = "none";
}

function showEmailChange() {
    document.getElementById("emailDropdown").style.display = "block";
}

function hideEmailChange() {
    document.getElementById("emailDropdown").style.display = "none";
}

function showPasswordChange() {
    document.getElementById("passwordDropdown").style.display = "block";
}

function hidePasswordChange() {
    document.getElementById("passwordDropdown").style.display = "none";
}*/

function submitUpdate() {
    var name = document.getElementById("newName").value;
    var email = document.getElementById("newEmail").value;
    var password = document.getElementById("newPassword").value;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", verifyUpdate);
    xhr.responseType = "json";
    xhr.open("POST", '/users/update');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({name:name, email:email, password:password }));
}

function verifyUpdate() {
    // 200 is the response code for a successful GET request
    if (this.status === 201) {
        window.localStorage.setItem("authToken", this.response.token);
        hideInfoChange();
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

/*function nameChange() {
    var name = document.getElementById("newName").value;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", updateName);
    xhr.responseType = "json";
    xhr.open("PUT", '/users/name');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({ name: name }));
}

function updateName() {
    // 200 is the response code for a successful GET request
    if (this.status === 201) {
        window.localStorage.setItem("authToken", this.response.token);
        window.location = "home.html";
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

function emailChange() {
    var email = document.getElementById("newEmail").value;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", updateEmail);
    xhr.responseType = "json";
    xhr.open("PUT", '/users/email');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({ email: email }));
}

function updateEmail() {
    // 200 is the response code for a successful GET request
    if (this.status === 201) {
        window.localStorage.setItem("authToken", this.response.token);
        window.location = "home.html";
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

function passwordChange() {
    var password = document.getElementById("newPassword").value;

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", updatePassword);
    xhr.responseType = "json";
    xhr.open("PUT", '/users/email');
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify({ password: password }));
}

function updatePassword() {
    // 200 is the response code for a successful GET request
    if (this.status === 201) {
        window.localStorage.setItem("authToken", this.response.token);
        window.location = "home.html";
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
}*/

function getAccountInfo() {
    var token = window.localStorage.getItem("authToken");
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", displayAccountInfo);
    xhr.responseType = "json";
    xhr.open("GET", "/users");
    xhr.setRequestHeader("x-auth", token);
    xhr.send();
}

function displayAccountInfo() {
    document.getElementById("user-fullName").innerHTML(data.name);
    document.getElementById("user-email").innerHTML(data.email);
    document.getElementById("user-pasword").innerHTML(data.password);
}

document.addEventListener("DOMContentLoaded", function () {
    getAccountInfo();
    document.getElementById("home").addEventListener("click", goHome);
    document.getElementById("signout").addEventListener("click", signout);

    document.getElementById("updateInfo").addEventListener("click", showInfoChange);
    document.getElementById("cancelUpdate").addEventListener("click", hideInfoChange);
    document.getElementById("submitUpdate").addEventListener("click", submitUpdate)

    /*document.getElementById("nameChange").addEventListener("click", showNameChange);
    document.getElementById("cancelName").addEventListener("click", hideNameChange);
    
    document.getElementById("emailChange").addEventListener("click", showEmailChange);
    document.getElementById("cancelEmail").addEventListener("click", hideEmailChange);

    document.getElementById("passChange").addEventListener("click", showPasswordChange);
    document.getElementById("cancelPassword").addEventListener("click", hidePasswordChange);

    document.getElementById("updateName").addEventListener("click", nameChange);
    document.getElementById("updateEmail").addEventListener("click", emailChange);
    document.getElementById("updatePassword").addEventListener("click", passwordChange);
    */
});