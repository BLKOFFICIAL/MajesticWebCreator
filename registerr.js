document.addEventListener("DOMContentLoaded", function () {
  const themeSelect = document.getElementById("theme");
  const twitterLinkDiv = document.getElementById("twitterUrlDiv");
  const websiteLinkDiv = document.getElementById("websiteUrlDiv");
  const contactLinkDiv = document.getElementById("contactDiv");
 // Made By Adithyadev

  // Function to show both Twitter and Website URL divs
  function discord() {
    twitterLinkDiv.style.display = "block";
    websiteLinkDiv.style.display = "block";
    contactLinkDiv.style.display = "block";
  }

  // Function to hide both Twitter and Website URL divs
  function normal() {
    twitterLinkDiv.style.display = "block";
    websiteLinkDiv.style.display = "block";
    contactLinkDiv.style.display = "none";
  }

  function none() {
    twitterLinkDiv.style.display = "none";
    websiteLinkDiv.style.display = "none";
    contactLinkDiv.style.display = "none";
  }

  themeSelect.addEventListener("change", function () {
    if (themeSelect.value === "discord") {
      discord();
    } else if (themeSelect.value === "normal") {
      normal();
    } else {
      none();
    }
  }); // Made By Adithyadev

  const registrationForm = document.querySelector("form");
  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form submission

    const theme = themeSelect.value;
const profileUrl = document.getElementById("profile").value;
const name = document.getElementById("name").value;
const bio = document.getElementById("bio").value; // Corrected
const youtubeLink = document.getElementById("youtubeLink").value;
const githubLink = document.getElementById("githubLink").value;
const twitterLink = document.getElementById("twitterUrl").value;
const websiteLink = document.getElementById("websiteUrl").value;

// Create a data object to send in the request
const data = {
  theme,
  name,
  bio, // Corrected
  profileUrl,
  youtubeLink,
  githubLink,
  twitterLink,
  websiteLink,
}; // Made By Adithyadev

    // Include the "contact" field conditionally
    if (theme === "discord") {
      // Check if the "contact" field exists in the form
      const contactField = document.getElementById("contact");
      if (contactField) {
        data.contact = contactField.value;
      }
    }

    // Define the API endpoint based on the selected theme
    let apiEndpoint;
    if (theme === "discord") {
      apiEndpoint = "https://powerlessmajesticoutput.info445.repl.co/api/generate-discord-html";
    } else {
      apiEndpoint = "https://powerlessmajesticoutput.info445.repl.co/api/generate-profile-html";
    }

    // Send a POST request using Axios to the appropriate API endpoint // Made By Adithyadev
    axios
      .post(apiEndpoint, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        // Display a success message using alert
        alert("You Profile Created Can Access From - " + response.data);
      })
      .catch((error) => {
        console.error("Error sending request:", error);
      });
  });
});
