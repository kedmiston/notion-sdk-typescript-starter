import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const NOTION_TOKEN = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

router.post('/api/notion/create-database', async (req, res) => {
  const { parentPageId, databaseTitle } = req.body;

  if (!parentPageId || !databaseTitle) {
    return res.status(400).json({ error: 'Missing parentPageId or databaseTitle' });
  }

  const headers = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  };

  const body = {
    parent: { type: 'page_id', page_id: parentPageId },
    title: [
      {
        type: 'text',
        text: { content: databaseTitle },
      },
    ],
    properties: {
      Name: { title: {} },
      Category: { select: { options: [] } },
      Subcategory: { rich_text: {} },
      Description: { rich_text: {} },
      AssignedTo: { people: {} },
      DueDate: { date: {} },
      Priority: { select: { options: [] } },
      Status: { select: { options: [] } },
    },
  };

  try {
    const response = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Create DB error:', result);
      return res.status(response.status).json({ error: result });
    }

    res.status(200).json({ success: true, databaseId: result.id });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
