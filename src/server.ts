import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Notion API is live!');
});

// Example endpoint to list databases
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

app.get("/listDatabases", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const start_cursor = req.query.start_cursor as string | undefined;

    const response = await notion.search({
      page_size: limit,
      start_cursor,
      filter: {
        property: "object",
        value: "database"
      }
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching databases:", error);
    res.status(500).json({ error: "Failed to fetch databases" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
