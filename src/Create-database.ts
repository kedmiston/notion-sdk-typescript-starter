// File: /pages/api/create-database.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: process.env.NOTION_PARENT_PAGE_ID || '', // Replace with actual Notion Page ID
      },
      title: [
        {
          type: 'text',
          text: {
            content: 'Leadership Task Tracker',
          },
        },
      ],
      properties: {
        Task: { title: {} },
        Category: { select: { options: [] } },
        Subcategory: { rich_text: {} },
        Description: { rich_text: {} },
        AssignedTo: { people: {} },
        DueDate: { date: {} },
        Priority: { select: { options: [] } },
        Status: { select: { options: [] } },
      },
    });

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create database' });
  }
}
