import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import notionCommand from './routes/notionCommand';
import createDatabase from './routes/createDatabase';
import logLeadershipTask from './routes/logLeadershipTask';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const notion = new Client({ auth: process.env.NOTION_TOKEN });

app.use(express.json());
app.use('/', notionCommand);
app.use('/', createDatabase);
app.use('/', logLeadershipTask);

// Root check
app.get('/', (req, res) => {
  res.send('Notion API is live!');
});

// List all Notion databases this integration can access
app.get('/listDatabases', async (req, res) => {
  try {
    const response = await notion.search({
      page_size: 10,
      filter: { property: 'object', value: 'database' }
    });

    const results = response.results.map((db: any) => ({
      id: db.id,
      title: db?.title?.[0]?.plain_text || 'Untitled',
      url: db.url
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
      filter
    });

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error querying database:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
