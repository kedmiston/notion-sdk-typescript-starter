import express from 'express';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_LEADERSHIP_DB_ID;
if (!databaseId) {
  throw new Error('NOTION_LEADERSHIP_DB_ID is not set in environment');
}


router.post('/api/notion/log-leadership-task', async (req, res) => {
  const { category, title, notes } = req.body;

  if (!category || !title || !notes) {
    return res.status(400).json({ error: 'Missing required fields: category, title, notes' });
  }

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        Category: {
          select: {
            name: category
          }
        },
        Notes: {
          rich_text: [
            {
              text: {
                content: notes
              }
            }
          ]
        }
      }
    });

    res.status(200).json({ success: true, pageId: response.id });
  } catch (error: any) {
    console.error('Error logging leadership task:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
