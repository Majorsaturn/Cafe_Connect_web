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

    // Clear previous results
    searchResultsContainer.innerHTML = '';

    if (!usernameInput.value) {
        searchResultsContainer.innerHTML = '<p>Please enter a username, full name, or email.</p>';
        return;
    }

    const url = `/search-user?username=${usernameInput.value}`; // Updated URL

    try {
        const response = await fetch(url);

        // Check if the response is successful
        if (!response.ok) {
            searchResultsContainer.innerHTML = `<p>Failed to fetch data. Server responded with status: ${response.status}</p>`;
            return;
        }

        const data = await response.json();

        if (data.message) {
            searchResultsContainer.innerHTML = `<p>${data.message}</p>`;
        } else if (data.users && data.users.length > 0) {
            searchResultsContainer.innerHTML = '<h4>Users</h4>';

            data.users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.classList.add('result-item');

                userDiv.innerHTML = `
                    <p><strong>Username:</strong> ${user.username}</p>
                    <button class="friend-btn" data-user-id="${user._id}">
                        ${user.isFriend ? 'Remove Friend' : 'Add Friend'}
                    </button>
                `;

                const friendButton = userDiv.querySelector('.friend-btn');
                friendButton.addEventListener('click', () => handleFriendClick(user._id, friendButton));

                searchResultsContainer.appendChild(userDiv);
            });
        }
    } catch (err) {
        searchResultsContainer.innerHTML = '<p>An error occurred while searching.</p>';
        console.error('Error during fetch:', err);
    }
}

async function handleFriendClick(userId, button, event) {
    event.preventDefault(); // Only use this if necessary to prevent form submissions, etc.

    const action = button.textContent === 'Add Friend' ? 'add' : 'remove';

    try {
        const token = document.cookie.split('; ').find(row => row.startsWith('authToken=')).split('=')[1];

        const response = await fetch(`/friends`, {
            method: 'POST', // For adding
            body: JSON.stringify({ username: userId }), // Sending the friend's username
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Pass the token here
            }
        });

        const data = await response.json();

        if (data.success) {
            button.textContent = action === 'add' ? 'Remove Friend' : 'Add Friend';
        } else {
            alert(data.message || 'Error updating friend status.');
        }
    } catch (error) {
        console.error('Error handling friend action:', error);
    }
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