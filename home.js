document.getElementById('play-pause').addEventListener('click', function() {
    // Logic to play or pause audio
});

document.getElementById('next').addEventListener('click', function() {
    // Logic to skip to the next audio track
});

document.getElementById('prev').addEventListener('click', function() {
    // Logic to go back to the previous audio track
});

function joinTable(tableName) {
    // Placeholder function to handle joining tables
    alert("Joining " + tableName + " table");
    // Redirect to chatroom page or open the chatroom (not yet implemented)
}

function switchPage(page) {
    // Placeholder function to switch to different pages
    alert("Switching to " + page + " page");
    // Implement actual page switch logic here (navigate to respective page)
}

// Toggle the dropdown menu visibility
function toggleDropdown(event) {
    event.stopPropagation();  // Prevent event bubbling so clicking on the dropdown itself won't close it

    const dropdown = event.currentTarget.querySelector(".dropdown-content");

    // Check if the dropdown is currently displayed or hidden
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}

// Close the dropdown if user clicks anywhere outside of the it
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector(".dropdown-content");
    if (dropdown && !dropdown.contains(event.target) && !event.target.closest(".profile-dropdown")) {
        dropdown.style.display = "none";  // Close dropdown if clicking outside
    }
});
