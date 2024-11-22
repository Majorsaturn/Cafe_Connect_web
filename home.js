// Array to store audio files
let audios = [
    { title: 'Café Calm', file: '/audios/CafeCalm.wav' },
    { title: 'Espresso Echoes', file: '/audios/EspressoEchoes.mp3' },
    { title: 'Coffeehouse Chatter', file: '/audios/CoffeehouseChatter.wav' }
];

let currentAudioIndex = 0;  // Index of the audio that is currently being played

// Get references to the audio player and buttons
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