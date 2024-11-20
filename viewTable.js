async function viewTable(event) {
    // Get the table ID from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('id');  // Get the tableId from the URL

    if (!tableId) {
        displayMessage('No table ID provided.', 'red');
        return;
    }

    try {
        // Fetch table details by ID
        const response = await fetch(`/table/view?id=${tableId}`, {
            method: 'POST',
        });

        if (response.ok) {
            const table = await response.json();
            displayTableDetails(table);  // Display the table details
        } else {
            const errorResult = await response.json();
            displayMessage('Failed to retrieve table: ' + (errorResult.message || 'Unknown error'), 'red');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        displayMessage('Error: ' + error.message, 'red');
    }
}

// Function to display the table details dynamically
function displayTableDetails(table) {
    const detailsContainer = document.getElementById('tableDetails');
    detailsContainer.innerHTML = '';  // Clear previous details

    if (table.length === 0) {
        detailsContainer.innerText = 'No tables found.';
    }else {
        const tableElement = document.createElement('div');
        tableElement.classList.add('table-item');
        tableElement.innerHTML = `
        <h3>${table.tablename}</h3>
        <p>Max Seats: ${table.maxseats}</p>
        <p>Privacy: ${table.pub_priv}</p>
        <p>Members: ${table.members.join(', ')}</p>
    `;
        detailsContainer.appendChild(tableElement);
    }
}

// Helper function to display messages (success/error)
function displayMessage(message, color) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = message;
    messageDiv.style.color = color;
}

// Go to the home page (handle the "Back to Home" button)
function goToHome() {
    window.location.href = "http://localhost:5000/home";
}
