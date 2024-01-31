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
app.post('/api/clients', async (req,res) => {
    try {
        // extrac client data from the request body
        const { first_name, last_name, email, phone_number, other_details} = req.body;

        // Validate client data
        if (!first_name || !last_name || !email || !other_details || Number.isNaN(phone_number)) {
            return res.status(400).json({ error: 'Client error'});
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
        res.status(500).json({ error: 'Internal server error'});
    }
});

// DELETE route to delete client
app.delete('/api/clients/:clientId', async(req, res) => {
    try {
        const clientId = parseInt(req.params.clientId);

        // Validate client ID 
        if (!Number.isInteger(clientId)){
            return res.status(400).json({ error: 'Invalid client ID'});
        }

        const result = await client.query('DELETE FROM clients WHERE id = $1',[clientId]);

        if (result.rowCount > 0) {
            res.json({ message: 'Client deleted successfully '});
        } else {
            res.status(404).json({ error: 'Client not found'});
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
        const result = await client.query(`SELECT first_name, last_name, email, phone_number, other_details FROM clients WHERE id = $1`, [clientId])
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
app.get('/api/sessions', async(req,res) => {
    try{
        const result = await client.query('SELECT * FROM sessions');
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});