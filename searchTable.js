async function searchTable(event) {
    event.preventDefault(); // Prevent the default form submission

    // Capture the table name input from the user
    const tablename = document.getElementById('tablename').value.trim();


    // Update the URL with the search query parameter
    if (tablename) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('tablename', tablename);  // Update the 'tablename' query param
        history.pushState(null, '', `${window.location.pathname}?${searchParams.toString()}`);  // Update the URL

        // Now perform the fetch with the updated URL
        try {
            const response = await fetch(`/table/search?${searchParams.toString()}`, {
                method: 'GET',
            });

            if (response.ok) {
                const results = await response.json();
                displaySearchResults(results);  // Display the search results
            } else {
                const errorResult = await response.json();
                displayMessage('Search failed: ' + (errorResult.message || 'Unknown error'), 'red');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            displayMessage('Error: ' + error.message, 'red');
        }
    }
}

// Function to display search results dynamically
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';  // Clear previous results

    if (results.length === 0) {
        resultsContainer.innerText = 'No tables found.';
    } else {
        results.forEach(table => {
            const tableElement = document.createElement('div');
            tableElement.classList.add('table-item');
            tableElement.innerHTML = `
                <h3>${table.tableName}</h3>
                <p>Max Seats: ${table.maxseats}</p>
                <p>Privacy: ${table.pub_priv}</p>
                <p>Members: ${table.members}</p>
                <button onclick="joinTable('${table._id}')">Join</button>
                <button onclick="deleteTable('${table._id}')">Delete Table</button>
                <button onclick="goToViewTable('${table._id}')">View Table</button>
                `;
            resultsContainer.appendChild(tableElement);
        });
    }
}

// Function to navigate to the view table screen
function goToViewTable(tableId) {
    window.location.href = `/table/view?id=${tableId}`;  // Redirect to the view table screen with the tableId as a query parameter
}

// Helper function to display messages (success/error)
function displayMessage(message, color) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = message;
    messageDiv.style.color = color;
}

// Function to join a table
async function joinTable(tableId) {
    // Confirm with the user before attempting to join
    const confirmJoin = confirm('Are you sure you want to join this table?');
    if (!confirmJoin) return;  // If user cancels, do nothing

    try {
        // Prepare the data to be sent to the server
        const requestData = { tableId };  // Send the tableId in the body

        // Send a POST request to join the table with the tableId in the body
        const response = await fetch('http://localhost:5000/table/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Ensures the server knows we're sending JSON
            },
            body: JSON.stringify(requestData)  // Send the JSON body with tableId
        });

        if (response.ok) {
            const result = await response.json();
            alert('Successfully joined the table!');
            // Optionally, update the UI here, e.g., disable the "Join" button or remove the table from the list
        } else {
            const errorResult = await response.json();
            alert('Failed to join the table: ' + (errorResult.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}


// Go to the home page (handle the "Back to Home" button)
function goToHome() {
    window.location.href = "http://localhost:5000/home";
}

async function deleteTable(tableId) {
    // Confirm with the user before attempting to delete
    const confirmDelete = confirm('Are you sure you want to delete this table?');
    if (!confirmDelete) return;  // If user cancels, do nothing

    try {
        // Prepare the data to be sent to the server
        const requestData = { tableId };  // Send the tableId in the body

        // Send a DELETE request to remove the table with the tableId in the body
        const response = await fetch('http://localhost:5000/table/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',  // Ensures the server knows we're sending JSON// Use the provided token in the Authorization header
            },
            body: JSON.stringify(requestData)  // Send the JSON body with tableId
        });

        if (response.ok) {
            const result = await response.json();
            alert('Table successfully deleted!');
            // Optionally, update the UI here, e.g., remove the table from the list
        } else {
            const errorResult = await response.json();
            alert('Failed to delete the table: ' + (errorResult.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}