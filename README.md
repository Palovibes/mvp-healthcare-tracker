# mvp-healthcare-tracker
Health Care Sales Tracker
Overview
The Health Care Sales Tracker is a web application designed to help users keep track of clients and the hours of healthcare services provided. The application aims to streamline client management and hour tracking for healthcare professionals. Here's a breakdown of its features:

Features

1- Client Management:

User Input:
Input boxes allow users to enter client names and relevant information.
The "Add Client" button submits the client's information.
User Output:
A client list displays names and essential information.
Users can view detailed client information by clicking on a client's name.

2- Hour Tracking:

User Input:
Users can select a client from a dropdown or list.
An input box allows users to enter the hours of healthcare received.
Clicking the "Record Hours" button saves the entered hours.
User Output:
Earnings are displayed based on the logged hours for the selected client.
A summary of earnings is available for each client.
The client list is updated to reflect total recorded hours.

3- Overall Application:

User Input:
Navigation menu for switching between "Client Management" and "Hour Tracking" sections.
User Output:
Consistent layout with a header and footer.
Visual feedback, including success messages for user actions.

****************************************
Instructions for Running the Application
Follow these steps to set up and run the Health Care Sales Tracker:

1- Clone the Repository:
git clone <repository-url>
cd <repository-directory>

2- Install Dependencies:
npm install

3- Database Setup:
Set up a PostgreSQL database with tables for "clients" and "sessions."
Ensure the database connection details are correctly configured in the application.

4- Run the Application:
npm start

5- Access the Application:
Open your web browser and go to http://localhost:3000.

API Routes
The Express server handles various API routes for interacting with the application:

1- Adding a New Client (POST):
Route: /api/clients
Data Sent: JSON object representing a new client.
Data Sent Back: Success or error message.

2- Retrieving a List of Clients (GET):
Route: /api/clients
Data Sent Back: JSON array containing all clients.

3- Updating Client Information (PATCH):
Route: /api/clients/:clientId
Data Sent: JSON object with updated client information.
Data Sent Back: Success or error message.

4-Replacing Client Information (PUT):
Route: /api/clients/:clientId
Data Sent: JSON object with new client information.
Data Sent Back: Success or error message.

5-Deleting a Client (DELETE):
Route: /api/clients/:clientId
Data Sent Back: Success or error message.

6- Recording Hours of Health Care (POST):
Route: /api/hours
Data Sent: JSON object representing hours of healthcare.
Data Sent Back: Success or error message.

7- Calculating Earnings for a Client (GET):
Route: /api/clients/:clientId/earnings
Data Sent Back: Calculated earnings for the client.

8- Retrieving a Summary of Earnings for All Clients (GET):
Route: /api/clients/earnings-summary
Data Sent Back: JSON array containing earnings summary for all clients.

9- Get All Hours for a Client Summed Up (GET):
Route: /api/clients/:clientId/hours
Data Sent Back: Total combined duration of health care sessions for a specific client.

10- Get All Detailed Session Data for a Client (GET):
Route: /api/clients/:clientId/sessions
Data Sent Back: Detailed breakdown of all health care sessions for a specific client.

11- Get Details About a Specific Session for a Client (GET):
Route: /api/clients/:clientId/sessions/:sessionId
Data Sent Back: Details about a single session for a specific client.

12- Retrieve a Single Client (GET):
Route: /api/clients/:clientId
Data Sent Back: Details about a single client.

13- Send Back Client and Session Details Separately in the Response.


Database Tables

"clients" Table:
id (Primary Key)
first_name
last_name
email
phone_number
other_details

"sessions" Table:
id (Primary Key)
duration
started_at
ended_at
client_id (Foreign Key)
comments


Future Plans

Future updates may include:
Implementation of PATCH requests from the web app to update the DOM dynamically.
Enhancement of user interactions for a seamless experience.
Feel free to explore and contribute to the development of the Health Care Sales Tracker!
