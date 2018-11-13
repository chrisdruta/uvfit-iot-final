function checkForm(event) {
   var name = document.getElementById("fullName");
   var email = document.getElementById("email");
   var password = document.getElementById("password");
   var passwordConfirm = document.getElementById("passwordConfirm");


   var formErrorsDiv = document.getElementById("formErrors");
   var responseDiv = document.getElementById("response");
   var errorsHTML = "<ul>";
   var count = 0;


   if (name.value.length < 1) {
     formErrorsDiv.style.display = "block";
     name.style.borderColor = "red";
     errorsHTML += "<li>Missing full name.</li>";
     count ++;
   }

   if (email.value.search(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/) < 0) {
     formErrorsDiv.style.display = "block";
     email.style.borderColor = "red";
     errorsHTML += "<li>Invalid or missing email address.</li>";
     count ++;
   }

   if(password.value.length < 10 || password.value.length > 20) {
     formErrorsDiv.style.display = "block";
     formErrorsDiv.style.color = "red";
     password.style.borderColor = "red";
     errorsHTML += "<li>Password must be between 10 and 20 characters.</li>";
     count ++;
   }

   if(password.value.search(/[a-z]/) < 0)  {
     formErrorsDiv.style.display = "block";
     formErrorsDiv.style.color = "red";
     password.style.borderColor = "red";
     errorsHTML += "<li>Password must contain at least one lowercase character.</li>";
     count ++;
   }

   if(password.value.search(/[A-Z]/) < 0) {
     formErrorsDiv.style.display = "block";
     formErrorsDiv.style.color = "red";
     password.style.borderColor = "red";
     errorsHTML += "<li>Password must contain at least one uppercase character.</li>";
     count ++;
   }

   if(password.value.search(/[0-9]/) < 0) {
     formErrorsDiv.style.display = "block";
     formErrorsDiv.style.color = "red";
     password.style.borderColor = "red";
     errorsHTML += "<li>Password must contain at least one digit.</li>";
     count ++;
   }

   if(password.value != passwordConfirm.value) {
     formErrorsDiv.style.display = "block";
     formErrorsDiv.style.color = "red";
     password.style.borderColor = "red";
     passwordConfirm.style.borderColor = "red";
     errorsHTML += "<li>Password and confirmation password don't match.</li>";
     count ++;
	}

	if (count != 0) {
		errorsHTML += "</ul>";
		formErrorsDiv.innerHTML = errorsHTML;
		return;
	}

  //if (count == 0) {
	formErrorsDiv.style.display = "none";
	name.style.border = "1px solid #aaa";
	email.style.border = "1px solid #aaa";
	password.style.border = "1px solid #aaa";
	passwordConfirm.style.border = "1px solid #aaa";
   //}

   //errorsHTML += "</ul>";
   //formErrorsDiv.innerHTML = errorsHTML;

  var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", signUpResponse);
	xhr.responseType = "json";
	xhr.open("POST", '/users/register');
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify({email:email.value,name:fullName.value, password:password.value}));
}

function signUpResponse() {
  // 200 is the response code for a successful GET request
  if (this.status === 201) {
    if (this.response.success) {
      // Change current location to the signin page.
      window.location = "index.html";
    }
    else {
      responseHTML += "<ol class='ServerResponse'>";
      for (key in this.response) {
        responseHTML += "<li> " + key + ": " + this.response[key] + "</li>";
      }
      responseHTML += "</ol>";
    }
  }
  else {
    // Use a span with dark red text for errors
    responseHTML = "<span class='red-text text-darken-2'>";
    responseHTML += "Error: " + this.response.error;
    responseHTML += "</span>"
  }

  // Update the response div in the webpage and make it visible
  responseDiv.style.display = "block";
  responseDiv.innerHTML = responseHTML;
}

document.getElementById("register").addEventListener("click", checkForm);
