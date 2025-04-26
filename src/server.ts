// server.ts

import express from 'express';
import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const notion = new Client({ auth: process.env.NOTION_TOKEN });

app.use(express.json());

// List Databases route
app.get('/list-databases', async (req, res) => {
  try {
    const response = await notion.search({
      filter: { property: 'object', value: 'database' },
      page_size: 20
    });

    const results = response.results.map((db: any) => ({
      id: db.id,
      title: db?.title?.[0]?.plain_text || 'Untitled',
      url: db.url
    }));

    res.json({ databases: results });
  } catch (error: any) {
    console.error('Error listing databases:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve plugin manifest
app.use('/.well-known/ai-plugin.json', express.static(path.join(__dirname, 'public', '.well-known', 'ai-plugin.json')));

// Serve OpenAPI spec
app.use('/openapi.json', express.static(path.join(__dirname, 'public', 'openapi.json')));

// Root Health Check
app.get('/', (req, res) => {
  res.send('Relay App is live!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
