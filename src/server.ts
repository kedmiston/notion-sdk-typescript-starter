import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const notion = new Client({ auth: process.env.NOTION_TOKEN });

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
app.get('/dbs-test', (req, res) => {
  res.send('It works!');
});

app.get('/ping', (req, res) => {
  res.json({ ok: true });
});

app.get('/test-gpt', (req, res) => {
  res.json({ hello: 'world' });
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
