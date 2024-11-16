async function submitCreatTable(event) {
    event.preventDefault(); // Prevent the default form submission

    // Capture form inputs
    const tablename = document.getElementById('tablename').value.trim();
    const maxseats = document.getElementById('maxseats').value.trim();
    const pub_priv = document.getElementById('pub_priv').value.trim();
    const link = "testfiller";

    // Validate inputs
    if (!tablename || !maxseats || !pub_priv) {
        displayMessage('Please fill in all fields.', 'red');
        return;
    }

    const createTableData = { tablename, maxseats, pub_priv, link };

    try {
        const response = await fetch('http://localhost:5000/table/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createTableData)
        });

        if (response.ok) {
            const result = await response.json();
            displayMessage('Table Created!', 'green');
        } else {
            const errorResult = await response.json();
            displayMessage('Table Creation Failed: ' + (errorResult.message || 'Invalid credentials'), 'red');
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

// Clicking the "Create an account" button takes you to the Signup page
function goToHome() {
    window.location.href = "http://localhost:5000/home";
}