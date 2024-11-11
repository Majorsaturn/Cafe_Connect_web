async function submitLogin(event) {
    event.preventDefault(); // Prevent the default form submission

    // Capture form inputs
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Validate inputs
    if (!username || !password) {
        displayMessage('Please fill in all fields.', 'red');
        return;
    }

    const loginData = { username, password };

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const result = await response.json();
            displayMessage('Login successful!', 'green');
            console.log('Token:', result.token);
        } else {
            const errorResult = await response.json();
            displayMessage('Login failed: ' + (errorResult.message || 'Invalid credentials'), 'red');
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
