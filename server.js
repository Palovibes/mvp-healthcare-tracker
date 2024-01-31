import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();
const app = express();

// Define the DB URL, either from my env var or a default value 
const DB_URL = process.env.REMOTE_URL || "postgresql://postgres:postgres@localhost:5432/healthcare_db";
console.log(`Database URL: ${DB_URL}`);

// Initiaize a new pool using the DB URL 
const client = new pg.Pool({ connectionString: DB_URL, });
await client.connect(); // connect to the database

// middleware setup
app.use(cors()); // enable Cross Origin Resource Sharing
app.use(morgan('dev')); // enable HTTP request logging
app.use(express.json()); // Parse JSON request bodies
app.use(express.static("public")); // serve static files from 'public'

//CRUD routes:

// POST route to add a new client
app.post('/api/clients', async (req, res) => {
    try {
        // extrac client data from the request body
        const { first_name, last_name, email, phone_number, other_details } = req.body;

        // Validate client data
        if (!first_name || !last_name || !email || !other_details || Number.isNaN(phone_number)) {
            return res.status(400).json({ error: 'Client error' });
        }
        // Insert client into database
        const result = await client.query(
            `INSERT INTO clients (first_name, last_name, email, phone_number, other_details) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [first_name, last_name, email, phone_number, other_details]
        );

        // Send back the newly created client 
        const newClient = result.rows[0];
        delete newClient.id;
        res.json(newClient);
    } catch (error) {
        console.error(err); // log error for debuggin
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE route to delete client
app.delete('/api/clients/:clientId', async (req, res) => {
    try {
        const clientId = parseInt(req.params.clientId);

        // Validate client ID 
        if (!Number.isInteger(clientId)) {
            return res.status(400).json({ error: 'Invalid client ID' });
        }

        const result = await client.query('DELETE FROM clients WHERE id = $1', [clientId]);

        if (result.rowCount > 0) {
            res.json({ message: 'Client deleted successfully ' });
        } else {
            res.status(404).json({ error: 'Client not found' });
        }
    } catch {

    }
});

// GET route to fetch all clients
app.get('/api/clients', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM clients');
        console.log(`All clients: \n, ${JSON.stringify(result.rows, null, 2)}`);
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error;' });
    }
});

// GET route to fetch a single client
app.get('/api/clients/:clientId', async (req, res) => {
    try {
        const clientId = Number.parseInt(req.params.clientId);
        const result = await client.query(`
        SELECT id, first_name, last_name, email, phone_number, other_details
        FROM clients
        WHERE id = $1
    `, [clientId]);
        if (result.rows.length == 0) {
            res.status(404).json({ error: 'Client not found;' });
        }
        console.log("Using clientId: ", clientId);
        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error;' });
    }
})

// GET route to fetch all sessions
app.get('/api/sessions', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM sessions');
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PATCH route to selectively update only the fields the user provides in request body 
app.patch('/api/clients/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const { first_name, last_name, email, phone_number, other_details } = req.body;

        // Check if at least one field is provided for the update
        if (!(first_name || last_name || email || phone_number || other_details)) {
            return res.status(400).json({ error: 'No update fields provided' });
        }

        // SQL query to update the client
        // COALESCE function is used to keep existing values if new values are not provided
        const query = `
        UPDATE clients
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            email = COALESCE($3, email),
            phone_number = COALESCE($4, phone_number),
            other_details = COALESCE($5, other_details)
        WHERE id = $6
        RETURNING *
      `;
        const values = [first_name, last_name, email, phone_number, other_details, clientId];

        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Client not found: ${clientId}` });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error: Failed to update client' });
    }
});


// PUT route to replace entire client information
app.put('/api/clients/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const updatedClient = req.body;

        // Validate incoming data (adjust based on your data requirements)
        if (!updatedClient || !updatedClient.first_name || !updatedClient.last_name || !updatedClient.email || Number.isNaN(updatedClient.phone_number)) {
            return res.status(400).json({ error: 'Invalid client data' });
        }

        // Build SQL query for UPDATE
        const query = `
        UPDATE clients
        SET first_name = $1,
            last_name = $2,
            email = $3,
            phone_number = $4,
            other_details = $5
        WHERE id = $6
        RETURNING *
      `;
        const values = [updatedClient.first_name, updatedClient.last_name, updatedClient.email, updatedClient.phone_number, updatedClient.other_details, clientId];

        // Execute query and handle results
        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: `Client not found: ${clientId}` });
        }

        res.status(200).json(result.rows[0]);  // Return the updated client
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error: Failed to replace client' });
    }
});

// Route for recording hours of health care (POST)
app.post('/api/hours', async (req, res) => {
    try {
        // Extract data from the request body
        const { client_id, duration, started_at, ended_at, comments } = req.body;

        // Validate incoming data
        if (!client_id || !duration || !started_at || !ended_at) {
            return res.status(400).json({ error: 'Invalid data for recording hours' });
        }

        // Insert the recorded hours into the sessions table
        const query = 'INSERT INTO sessions (client_id, duration, started_at, ended_at, comments) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [client_id, duration, started_at, ended_at, comments];

        const result = await client.query(query, values);

        // Respond with success message
        res.status(201).json({ message: 'Hours recorded successfully', recorded_hours: result.rows[0] });
    } catch (err) {
        console.error(err);
        // Respond with an error message if recording encountered issues
        res.status(500).json({ error: 'Internal Server Error: Failed to record hours' });
    }
});

// Define a GET route for calculating earnings for a client 
app.get('/api/clients/:clientId/earnings', async (req, res) => {
    // Try to perform the calculations and handle any errors
    try {
        // Extract the client ID from the request parameters
        const { clientId } = req.params;

        // Create a Date object representing the current date
        const currentDate = new Date();

        // Calculate the start date for the past week by subtracting 7 days
        const startDate = new Date(currentDate.setDate(currentDate.getDate() - 7));

        // Construct a SQL query to get the total duration of sessions
        // - Select client ID and the sum of sessions' durations in hours
        // - Filter sessions for the specified client starting on or after the start date
        // - Use `EXTRACT(EPOCH FROM duration)` to convert session durations to seconds
        // - Divide by 3600 to convert seconds to hours and handle null values with `COALESCE`
        const query = `
        SELECT
            client_id,
        COALESCE(SUM(EXTRACT(EPOCH FROM duration) / 3600), 0) AS total_hours
        FROM sessions
        WHERE duration IS NOT NULL AND client_id = $1 AND started_at >= $2
        GROUP BY client_id;
      `;

        // Prepare the query parameters: client ID and the calculated start date
        const values = [clientId, startDate];

        // Execute the query and store the result
        const result = await client.query(query, values);

        // Check if any sessions were found for the client in the specified time range
        if (result.rows.length === 0) {
            // Respond with a 404 error if no sessions found
            return res.status(404).json({
                error: 'Client not found or no recorded hours in the last week',
            });
        }

        // Extract the total hours from the query result
        const totalHours = result.rows[0].total_hours;

        // hourly rate of $1 for simplicity 
        const hourlyRate = 1;

        // Calculate the total earnings by multiplying total hours by the hourly rate
        const totalEarnings = totalHours * hourlyRate;

        // Respond with a successful response containing the calculated earnings
        res.status(200).json({ total_earnings: totalEarnings });
    } catch (err) {
        // Log any errors encountered during calculations
        console.error(err);

        // Respond with a 500 error message for internal server issues
        res.status(500).json({ error: 'Internal Server Error: Failed to calculate earnings' });
    }
});

// Define GET route for retrieving client earnings summary
app.get('/api/clients/earnings-summary', async (req, res) => {
    try {
        // Construct the SQL query to retrieve client earnings summary
        const query = `
            SELECT
                clients.id,
                clients.first_name,
                clients.last_name,
                COALESCE(SUM(CASE WHEN duration ~ E'^\\d+\\.?\\d*$' THEN COALESCE(EXTRACT(EPOCH FROM duration)::FLOAT, 0) ELSE 0 END), 0) AS total_earning
            FROM
                clients
            INNER JOIN
                sessions ON clients.id = sessions.client_id
            WHERE
                duration ~ E'^\\d+\\.?\\d*$'  -- Filter out rows where duration is not a valid number
            GROUP BY
                clients.id, clients.first_name, clients.last_name
            ORDER BY
                total_earning DESC;
        `;

        // Execute the query and store the result
        const result = await client.query(query);

        // Check if the result is empty
        if (result.rows.length === 0) {
            // Respond with a 404 error if no data found
            return res.status(404).json({
                error: 'No data found for earnings summary',
            });
        }

        // Respond with a successful response containing the calculated earnings summary
        res.status(200).json(result.rows);
    } catch (err) {
        // Log any errors encountered during the retrieval
        console.error(err);

        // Respond with a 500 error message for internal server issues
        res.status(500).json({ error: 'Failed to retrieve earnings summary' });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});