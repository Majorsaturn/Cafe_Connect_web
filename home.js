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
            user.isFollower = followerIds.includes(user._id); // Mark if the user is already a follower
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
            <div class="tooltip-button">
                <button class="icon-button follower-btn" data-user-id="${user._id}">
                    <i class="fa-solid ${user.isFollower ? 'fa-user-minus' : 'fa-user-plus'}"></i>
                </button>
                <span class="tooltip-text">${user.isFollower ? 'Unfollow' : 'Follow'}</span>
            </div>
            <div class="tooltip-button">
                <button class="icon-button block-btn" data-user-id="${user._id}">
                    <i class="fa-solid ${user.isBlocked ? 'fa-unlock' : 'fa-ban'}"></i> <!-- Dynamically set the icon -->
                </button>
                <span class="tooltip-text">${user.isBlocked ? 'Unblock' : 'Block'}</span>
            </div>
        `;

        const followerButton = userDiv.querySelector('.follower-btn');
        const blockButton = userDiv.querySelector('.block-btn');

        followerButton.addEventListener('click', () => handleFollowerClick(user._id, followerButton));
        blockButton.addEventListener('click', () => handleBlockClick(user._id, blockButton, user.isBlocked));  // Pass the block state

        container.appendChild(userDiv);
    });
}

async function handleFollowerClick(targetUserId, button) {
    const isUnfollow = button.querySelector('i').classList.contains('fa-user-minus');
    const action = isUnfollow ? 'remove-follower' : 'add-follower';
    const url = `/${action}`;

    try {
        // Make API request
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId }),
        });

        const result = await response.json();

        // Handle errors from the backend
        if (!response.ok) {
            console.error('Error:', result.message);
            showConfirmationMessage(button, result.message, "red");
            return;
        }

        // Success: Update button state based on action
        updateButtonState(button, isUnfollow);
        showConfirmationMessage(button, result.message, "green");
    } catch (err) {
        console.error('Error handling follow action:', err);
        showConfirmationMessage(button, "An error occurred. Please try again.", "red");
    }
}

function updateButtonState(button, isFollow) {
    const icon = button.querySelector('i');
    const tooltipText = button.closest('.tooltip-button').querySelector('.tooltip-text');

    if (!tooltipText) {
        console.error('Tooltip text element not found!');
        return;
    }

    if (isFollow) {
        // Switch to "Follow" button
        icon.classList.remove('fa-user-minus');
        icon.classList.add('fa-user-plus');
        tooltipText.textContent = 'Follow';
    } else {
        // Switch to "Unfollow" button
        icon.classList.remove('fa-user-plus');
        icon.classList.add('fa-user-minus');
        tooltipText.textContent = 'Unfollow';
    }
}

async function handleBlockClick(targetUserId, button, isBlocked) {
    const action = isBlocked ? 'unblock-user' : 'block-user';  // Determine the action based on the block state
    const url = `/${action}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId })
        });

        const result = await response.json();

        // If response is not ok, show an error
        if (!response.ok) {
            console.error(result.message);
            showConfirmationMessage(button, result.message, "red");
            return;
        }

        // Success: Update the button state, show success message, and reset button state
        showConfirmationMessage(button, result.message, "green");

        // Toggle button state after successful block/unblock action
        updateBlockButtonState(button, !isBlocked); // Toggle state

    } catch (err) {
        console.error('Error handling block action:', err);
        showConfirmationMessage(button, "An error occurred. Please try again.", "red");
    }
}

function updateBlockButtonState(button, isBlocked) {
    const icon = button.querySelector('i');
    const tooltipText = button.closest('.tooltip-button').querySelector('.tooltip-text');

    if (!tooltipText) {
        console.error('Tooltip text element not found!');
        return;
    }

    if (isBlocked) {
        // Switch to "Unblock" button
        icon.classList.remove('fa-ban');
        icon.classList.add('fa-unlock');
        tooltipText.textContent = 'Unblock';
    } else {
        // Switch to "Block" button
        icon.classList.remove('fa-unlock');
        icon.classList.add('fa-ban');
        tooltipText.textContent = 'Block';
    }
}

function showConfirmationMessage(button, message, color) {
    const existingMessage = button.nextElementSibling;
    if (existingMessage) existingMessage.remove();

    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    messageElement.style.color = color;
    messageElement.style.fontSize = "0.9em";
    messageElement.style.marginLeft = "10px";
    button.parentElement.appendChild(messageElement);

    // Automatically remove the message after 2 seconds
    setTimeout(() => messageElement.remove(), 2000);
}

async function loadFollowersToSidebar() {
    const followersList = document.getElementById('followers-list');
    followersList.innerHTML = ''; // Clear content

    try {
        const response = await fetch('/list-followers');
        if (!response.ok) throw new Error('Failed to fetch followers.');

        const { followers } = await response.json();
        if (followers.length === 0) {
            followersList.innerHTML = '<li>No followers yet.</li>';
            return;
        }

        followers.forEach(follower => {
            const listItem = document.createElement('li');
            listItem.textContent = follower.username;
            followersList.appendChild(listItem);
        });
    } catch (err) {
        console.error('Error loading followers:', err);
        followersList.innerHTML = '<li>Error loading followers.</li>';
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', loadFollowersToSidebar);

function joinTable(tableName) {
    // Placeholder function to handle joining tables
    alert("Joining " + tableName + " table");
    // Redirect to chatroom page or open the chatroom (not yet implemented)
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