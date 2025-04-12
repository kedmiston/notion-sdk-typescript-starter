import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const limit = 10; // hardcoded

app.use(express.json());

console.log('top of server.ts')

// Root check
app.get('/', (req, res) => {
  res.send('Notion API is live!');
});

// List all databases (basic version)
app.get('/databases', async (req, res) => {
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'database' },
    });
    res.json(response.results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Paginated list of databases
app.get('/listDatabases', async (req, res) => {
  try {
    // const limit = parseInt(req.query.limit as string) || 10;
    const start_cursor = req.query.start_cursor as string | undefined;

    console.log('Received /listDatabases request with:');
    console.log('Limit:', limit);
    console.log('Start Cursor:', start_cursor);

    const response = await notion.search({
      page_size: limit,
      start_cursor,
      filter: {
        property: 'object',
        value: 'database',
      },
    });

    console.log('Successfully fetched databases:', response.results.length);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({ error: 'Failed to fetch databases' });
  }
});

// Query a specific database
app.post('/query', async (req, res) => {
  try {
    const { database_id, filter } = req.body;

    const response = await notion.databases.query({
      database_id,
      filter,
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error querying database:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server using the dynamic port from Render
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
