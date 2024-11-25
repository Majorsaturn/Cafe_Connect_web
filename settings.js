// Function to toggle the visibility of the edit settings form and populate current settings
async function toggleEditForm() {
    const editForm = document.getElementById('editSettingsForm');
    const formFields = {
        input: document.getElementById('input'),
        output: document.getElementById('output'),
        light_dark: document.getElementById('light_dark'),
        notifications: document.getElementById('notifications')
    };

    // Toggle visibility of the edit form
    if (editForm.style.display === 'none' || editForm.style.display === '') {
        editForm.style.display = 'block'; // Show form
        await populateFormFields(formFields); // Populate fields with current settings
    } else {
        editForm.style.display = 'none'; // Hide form
    }
}

// Function to populate the form fields with current settings
async function populateFormFields(formFields) {
    try {
        const settings = await fetchSettings(); // Fetch current settings (replace with actual fetch call)

        // Populate the fields with current settings if available
        if (settings.input) formFields.input.value = settings.input;
        if (settings.output) formFields.output.value = settings.output;
        if (settings.light_dark !== undefined) formFields.light_dark.checked = settings.light_dark;
        if (settings.notifications !== undefined) formFields.notifications.checked = settings.notifications;
    } catch (error) {
        console.error('Error fetching settings:', error);
        displayMessage('Error fetching settings.', 'red');
    }
}

// Function to fetch current settings (replace with actual API call)
async function fetchSettings() {
    // Example of mock settings; replace this with actual API call to get user settings
    return {
        input: 'Example input value',
        output: 'Example output value',
        light_dark: true,  // true for dark mode, false for light mode
        notifications: true  // true for enabled notifications, false for disabled
    };
}

// Function to handle saving the settings
async function editSettings(event) {
    const input = document.getElementById('input').value;
    const output = document.getElementById('output').value;
    const light_dark = document.getElementById('light_dark').checked;
    const notifications = document.getElementById('notifications').checked;

    const settingsData = {
        input,
        output,
        light_dark,
        notifications
    };

    // Send settingsData to the server via fetch (replace URL with actual API endpoint)
    try {
        const response = await fetch('/settings/edit', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settingsData),
        });

        if (response.ok) {
            displayMessage('Settings updated successfully!', 'green');
        } else {
            const result = await response.json();
            displayMessage('Failed to update settings: ' + result.message, 'red');
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        displayMessage("Error updating settings.", 'red');
    }
}

// Helper function to display success/error messages
function displayMessage(message, color) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = message;
    messageDiv.style.color = color;
}

// Function to cancel editing and hide the form
function cancelEdit() {
    const editForm = document.getElementById('editSettingsForm');
    editForm.style.display = 'none';
}

// Function to toggle the visibility of the edit user form and populate current user data
async function toggleEditUserForm() {
    const editUserForm = document.getElementById('editUserForm');
    const formFields = {
        firstname: document.getElementById('firstname'),
        lastname: document.getElementById('lastname'),
        email: document.getElementById('email')
    };

    // Toggle visibility of the edit user form
    if (editUserForm.style.display === 'none' || editUserForm.style.display === '') {
        editUserForm.style.display = 'block'; // Show form
        await populateUserFormFields(formFields); // Populate fields with current user data
    } else {
        editUserForm.style.display = 'none'; // Hide form
    }
}

// Function to populate the user edit form fields with current user data
async function populateUserFormFields(formFields) {
    try {
        const userData = await fetchUserData(); // Fetch current user data (replace with actual fetch call)

        // Populate the fields with current user data if available
        if (userData.firstname) formFields.firstname.value = userData.firstname;
        if (userData.lastname) formFields.lastname.value = userData.lastname;
        if (userData.email) formFields.email.value = userData.email;
    } catch (error) {
        console.error('Error fetching user data:', error);
        displayMessage('Error fetching user data.', 'red');
    }
}

// Function to fetch current user data (replace with actual API call)
async function fetchUserData() {
    // Example of mock user data; replace this with actual API call to get user data
    return {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com'
    };
}

// Function to handle saving the user data
async function editUser(event) {
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;

    const userData = {
        firstname,
        lastname,
        email
    };

    // Send userData to the server via fetch (replace URL with actual API endpoint)
    try {
        const response = await fetch('/settings/edituser', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            displayMessage('User details updated successfully!', 'green');
        } else {
            const result = await response.json();
            displayMessage('Failed to update user details: ' + result.message, 'red');
        }
    } catch (error) {
        console.error('Error updating user details:', error);
        displayMessage("Error updating user details.", 'red');
    }
}

// Function to cancel editing user details and hide the form
function cancelUserEdit() {
    const editUserForm = document.getElementById('editUserForm');
    editUserForm.style.display = 'none';
}
async function deleteUser() {
    try {
        const response = await fetch('/settings/deleteuser', {
            method: 'DELETE',
            headers: {},
        });
        if (response.ok) {
            displayMessage('User deleted successfully!', 'green');
            goToLogin();  // Redirect after successful deletion
        } else {
            const result = await response.json();
            displayMessage('Failed to delete user: ' + result.message, 'red');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        displayMessage('Error deleting user: ' + (error.message || 'Unknown error'), 'red');
    }
}

// Function to go to the home page (handle the "Back to Home" button)
function goToHome() {
    window.location.href = "http://localhost:5000/home";
}

// Function to go to the login page (after deletion)
function goToLogin() {
    window.location.href = "http://localhost:5000/";
}

