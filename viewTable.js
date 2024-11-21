// Function to view the table details based on table ID from URL
async function viewTable(event) {
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('id');  // Get the tableId from the URL

    if (!tableId) {
        displayMessage('No table ID provided.', 'red');
        return;
    }

    try {
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

// Function to get the table invite link from the server
async function getTableInvite(event) {
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('id');  // Get the tableId from the URL

    if (!tableId) {
        displayMessage('No table ID provided.', 'red');
        return;
    }

    try {
        const response = await fetch(`/table/invite?id=${tableId}`, {
            method: 'GET',
        });

        if (response.ok) {
            const tableInvite = await response.json();
            displayInviteLink(tableInvite);  // Display the invite link
        } else {
            const errorResult = await response.json();
            displayMessage('Failed to retrieve invite: ' + (errorResult.message || 'Unknown error'), 'red');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        displayMessage('Error: ' + error.message, 'red');
    }
}

// Function to display the invite link
function displayInviteLink(inviteLink) {
    const inviteLinkContainer = document.getElementById('inviteLinkContainer');
    const inviteLinkElement = document.getElementById('inviteLink');

    if (inviteLink) {
        inviteLinkElement.innerText = inviteLink;
        inviteLinkContainer.style.display = 'block';
    } else {
        inviteLinkContainer.style.display = 'none';
        displayMessage('No invite link available.', 'red');
    }
}

// Function to display the table details dynamically
function displayTableDetails(table) {
    const detailsContainer = document.getElementById('tableDetails');
    detailsContainer.innerHTML = '';  // Clear previous details

    if (table.length === 0) {
        detailsContainer.innerText = 'No tables found.';
    } else {
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

// Function to go to the home page (handle the "Back to Home" button)
function goToHome() {
    window.location.href = "http://localhost:5000/home";
}

// Function to toggle the visibility of the edit form
function toggleEditForm() {
    const editForm = document.getElementById('editTableForm');
    editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';

    // Optionally, preload current data into the form (can be done based on your table data)
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('id');  // Get the tableId from the URL
    if (tableId) {
        prefillEditForm(tableId);
    }
}

// Function to prefill the edit form with current table data (optional)
async function prefillEditForm(tableId) {
    try {
        const response = await fetch(`/table/view?id=${tableId}`, {
            method: 'POST',
        });

        if (response.ok) {
            const table = await response.json();
            document.getElementById('tableName').value = table.tablename;
            document.getElementById('privacy').value = table.pub_priv;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

// Function to handle table edit submission
async function editTable(event) {
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('id');  // Get the tableId from the URL

    if (!tableId) {
        displayMessage('No table ID provided.', 'red');
        return;
    }

    // Get the updated table name and privacy from the form
    const tableName = document.getElementById('tableName').value;
    const privacy = document.getElementById('privacy').value;

    if (!tableName || !privacy) {
        displayMessage('Please fill out all fields.', 'red');
        return;
    }

    try {
        // Send the updated table data to the server in JSON format
        const response = await fetch('/table/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tablename: tableName,
                pub_priv: privacy,
            }),
        });

        if (response.ok) {
            const result = await response.json();
            displayMessage('Table updated successfully!', 'green');
            // Optionally, you could refresh the table details
            viewTable(event);  // Reload the table details
            toggleEditForm();   // Hide the edit form after saving
        } else {
            const errorResult = await response.json();
            displayMessage('Failed to update table: ' + (errorResult.message || 'Unknown error'), 'red');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        displayMessage('Error: ' + error.message, 'red');
    }
}

// Function to cancel editing and hide the form
function cancelEdit() {
    toggleEditForm();
}
