// Array to store audio files
let audios = [
    { title: 'Café Calm', file: '/audios/CafeCalm.wav' },
    { title: 'Espresso Echoes', file: '/audios/EspressoEchoes.mp3' },
    { title: 'Coffeehouse Chatter', file: '/audios/CoffeehouseChatter.wav' }
];

let currentAudioIndex = 0;  // Index of the audio that is currently being played

// Get references to the buttons
const audioPlayer = document.getElementById('audio-player');
const playPauseButton = document.getElementById('play-pause');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const currentTimeDisplay = document.getElementById('current-time');
const audioTitle = document.getElementById('audio-title');

// Initialize the first audio
function loadAudio(audioIndex) {
    const audio = audios[audioIndex];
    audioPlayer.src = audio.file;
    audioTitle.textContent = audio.title;
}

// Load the first audio when the page loads
loadAudio(currentAudioIndex);

// Play/Pause Button
playPauseButton.addEventListener('click', function() {
    if (audioPlayer.paused) {
        audioPlayer.play();  // Play the audio
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';  // Change button icon to 'pause'
    } else {
        audioPlayer.pause();  // Pause the audio
        playPauseButton.innerHTML = '<i class="fas fa-play"></i>';  // Change button icon to 'play'
    }
});

// Update the current time display to match the audio time
audioPlayer.addEventListener('timeupdate', function() {
    const minutes = Math.floor(audioPlayer.currentTime / 60);
    const seconds = Math.floor(audioPlayer.currentTime % 60);
    currentTimeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
});

// Next Button - Logic to switch to the next track
nextButton.addEventListener('click', function() {
    // Increment the index and wrap around if necessary
    currentAudioIndex = (currentAudioIndex + 1) % audios.length;
    loadAudio(currentAudioIndex);
    audioPlayer.play();
    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
});

// Previous Button - Logic to switch to the previous track
prevButton.addEventListener('click', function() {
    // Decrement the index and wrap around if necessary
    currentAudioIndex = (currentAudioIndex - 1 + audios.length) % audios.length;
    loadAudio(currentAudioIndex);
    audioPlayer.play();
    playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
});

// Open the user search popup
function openUserSearchPopup() {
    const popup = document.getElementById('user-search-popup');
    popup.classList.remove('hidden');
}

// Close the popup if clicking outside of it
window.onclick = function (event) {
    const popup = document.getElementById('user-search-popup');
    if (event.target === popup) {
        popup.classList.add('hidden');
    }
};

async function searchForUser() {
    const usernameInput = document.getElementById('username-input');
    const searchResultsContainer = document.getElementById('search-results');

    searchResultsContainer.innerHTML = '';

    if (!usernameInput.value) {
        searchResultsContainer.innerHTML = '<p>Please enter a username, full name, or email.</p>';
        return;
    }

    try {
        const response = await fetch(`/search-user?username=${usernameInput.value}`);
        const followersResponse = await fetch('/list-followers');

        if (!response.ok || !followersResponse.ok) {
            throw new Error('Failed to fetch data.');
        }

        const { users } = await response.json();
        const { followers } = await followersResponse.json();

        const followerIds = followers.map(f => f._id);

        users.forEach(user => {
            user.isFollower = followerIds.includes(user._id);  // Correct field for following status
        });

        renderSearchResults(users, searchResultsContainer);
    } catch (err) {
        console.error('Error during fetch:', err);
        searchResultsContainer.innerHTML = '<p>An error occurred while searching.</p>';
    }
}

function renderSearchResults(users, container) {
    if (users.length === 0) {
        container.innerHTML = '<p>No users found.</p>';
        return;
    }

    container.innerHTML = '<h4>Users</h4>';
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('result-item');
        userDiv.innerHTML = `
            <p><strong>Username:</strong> ${user.username}</p>
            <button class="follower-btn" data-user-id="${user._id}">
                ${user.isfollower ? 'Unfollow' : 'Follow'}
            </button>
        `;

        const followerButton = userDiv.querySelector('.follower-btn');
        followerButton.addEventListener('click', () => handleFollowerClick(user._id, followerButton));
        container.appendChild(userDiv);
    });
}

async function handleFollowerClick(targetUserId, button) {
    // Change the text logic to match what's in your UI
    const action = button.textContent.trim() === 'Follow' ? 'add-follower' : 'remove-follower';
    const url = `/${action}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(error.message);
            showConfirmationMessage(button, error.message, "red");
            return;
        }

        const result = await response.json();
        showConfirmationMessage(button, result.message, "green");  // Use the result message from the API
        // Toggle button text based on action
        button.textContent = action === 'add-follower' ? 'Unfollow' : 'Follow';
    } catch (err) {
        console.error('Error handling follow action:', err);
        showConfirmationMessage(button, "An error occurred. Please try again.", "red");
    }
}

function showConfirmationMessage(button, message, color) {
    // Remove any existing message
    const existingMessage = button.nextElementSibling;
    if (existingMessage) existingMessage.remove();

    // Add a new confirmation message
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    messageElement.style.color = color;
    messageElement.style.fontSize = "0.9em";
    messageElement.style.marginLeft = "10px";
    button.parentElement.appendChild(messageElement);
}

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

// Clicking the Cafe Connect logo takes you to the Home page
function goToHome() {
    window.location.href = "http://localhost:5000/home";
}

// Function to redirect to the login page on logout
function logout() {
    window.location.href = "http://localhost:5000/login";
}

// Function to navigate to the Create a Table page
function goToCreateTable() {
    window.location.href = "http://localhost:5000/table/create";
}

// Function to navigate to the Search Table page
function goToSearchTable() {
    window.location.href = "http://localhost:5000/table/search?";
}

function goToSettings() {
    window.location.href = "http://localhost:5000/settings";
}