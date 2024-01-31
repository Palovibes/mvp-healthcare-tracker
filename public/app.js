// JavaScript (app.js)
window.addEventListener('error', function (e) {
    console.error('Unhandled error:', e.error);
});

window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled rejection:', e.reason);
});

// JavaScript (app.js)
// JavaScript (app.js)
async function fetchClientData() {
    try {
        const clientIdInput = document.getElementById('clientId');
        const clientId = clientIdInput.value;

        // Input validation
        if (!clientId || isNaN(clientId)) {
            displayError('Please enter a valid Client ID.');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/clients/${clientId}`);
        const responseBody = await response.clone().text(); // Clone the response body as text



        // Log the status and response text
        console.log('Response Status:', response.status);
        console.log('Response Text:', responseBody);

        // Parse the cloned response body as JSON
        const data = JSON.parse(responseBody);
        console.log('Data:', data);
        updateDOM(data);

    } catch (error) {
        console.error('Error fetching data:', error);
        displayError('Error fetching data. Please try again.');
    }
}




// Function to update the DOM with client data
function updateDOM(data) {
    // Get the container element
    const container = document.getElementById('app');

    // Clear previous content
    container.innerHTML = '';

    // Check if data is available
    if (data) {
        // Create elements to display client information
        const heading = document.createElement('h2');
        heading.textContent = 'Client Information';

        const clientIdParagraph = document.createElement('p');
        clientIdParagraph.textContent = `Client ID: ${data.id}`;

        const firstNameParagraph = document.createElement('p');
        firstNameParagraph.textContent = `First Name: ${data.first_name}`;

        const lastNameParagraph = document.createElement('p');
        lastNameParagraph.textContent = `Last Name: ${data.last_name}`;

        const emailParagraph = document.createElement('p');
        emailParagraph.textContent = `Email: ${data.email}`;

        const phoneNumberParagraph = document.createElement('p');
        phoneNumberParagraph.textContent = `Phone Number: ${data.phone_number}`;

        const otherDetailsParagraph = document.createElement('p');
        otherDetailsParagraph.textContent = `Other Details: ${data.other_details || 'N/A'}`;

        // Append elements to the container
        container.appendChild(heading);
        container.appendChild(clientIdParagraph);
        container.appendChild(firstNameParagraph);
        container.appendChild(lastNameParagraph);
        container.appendChild(emailParagraph);
        container.appendChild(phoneNumberParagraph);
        container.appendChild(otherDetailsParagraph);
    } else {
        // Display a message if no data is available
        displayError('No data available for the provided client ID.');
    }
}

// Function to display an error message on the page
function displayError(message) {
    const container = document.getElementById('app');
    const errorParagraph = document.createElement('p');
    errorParagraph.textContent = message;
    container.appendChild(errorParagraph);
}
