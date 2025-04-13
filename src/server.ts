import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import notionCommand from './routes/notionCommand';
import createDatabase from './routes/createDatabase';
import path from 'path';
import mime from 'mime';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Register .yaml as text/yaml (must come before static middleware)
mime.define({ 'text/yaml': ['yaml'] }, true);

app.use(express.json());
app.use(notionCommand);
app.use('/', createDatabase);

// Serve the plugin manifest explicitly first
app.use('/.well-known/ai-plugin.json', express.static(path.join(__dirname, 'public/ai-plugin.json')));

// Serve all static files from public/ (including openapi.yaml)
app.use(express.static(path.join(__dirname, 'public')));

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
    const response = await notion.search({
      page_size: 10,
      filter: { property: 'object', value: 'database' },
    });

    const results = response.results.map((db: any) => ({
      id: db.id,
      title: db.title,
      url: db.url,
    }));

    res.json({ results });
  } catch (error) {
    console.error('Failed to fetch databases:', error);
    res.status(500).json({ error: 'Could not fetch database list' });
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
