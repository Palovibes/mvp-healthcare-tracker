// this function is called once the DOM is fully loaded

document.addEventListener('COMContentLoaded', async() => {
    try {
        const response = await fetch('/api/clients'); // Fetch clients from the server
        const clients = await response.json() // Parse the JSON response

        const clientList = document.getElementById('client-list'); // Get the clinet list containing clients
        clientList.innerHTML = ''; // Clear any existing content

        // loop through each client and add to the client list
        clients.forEach(client =>{
            const clientElement = document.createElement('div');
            clientElement.textContent = `Name: ${client.first_name} ${client.last_name}`; // Set text content for each client
            clientList.appendChild(clientElement); // Append the client element to the list
        });
    } catch(error) {
        console.error('Error fetching clients:', error);
    }
});