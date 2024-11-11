async function submitSignup(event) {
    event.preventDefault(); // Prevent the default form submission

    // Capture form inputs
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Validate inputs
    if (!firstName || !lastName || !email || !username || !password) {
        displayMessage('Please fill in all fields.', 'red');
        return;
    }

    const userData = { firstName, lastName, email, username, password };

    try {
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/javascript'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const result = await response.json();
            displayMessage('You have successfully created an account!', 'green');
            document.getElementById('signupForm').reset();  // Reset the form here on success
        } else {
            const errorResult = await response.json();
            displayMessage('Signup failed: ' + (errorResult.message || 'Please try again.'), 'red');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        displayMessage('Error: ' + error.message, 'red');
    }
}

function displayMessage(message, color) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = message;
    messageDiv.style.color = color;
}
