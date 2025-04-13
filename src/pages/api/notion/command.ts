// pages/api/notion/command.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, databaseId, data, pageId } = req.body;

  try {
    if (action === 'create') {
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: formatProperties(data),
      });
      return res.status(200).json({ success: true, id: response.id });
    }

    if (action === 'update') {
      const response = await notion.pages.update({
        page_id: pageId,
        properties: formatProperties(data),
      });
      return res.status(200).json({ success: true, id: response.id });
    }

    return res.status(400).json({ error: 'Unsupported action' });
  } catch (error: any) {
    console.error('Notion Command Error:', error.body || error.message);
    return res.status(500).json({ error: 'Notion error', details: error.body || error.message });
  }
}

function formatProperties(fields: Record<string, any>) {
  const props: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string') {
      props[key] = { rich_text: [{ text: { content: value } }] };
    } else if (value?.type === 'title') {
      props[key] = { title: [{ text: { content: value.content } }] };
    } else if (value?.type === 'select') {
      props[key] = { select: { name: value.name } };
    } else if (value?.type === 'date') {
      props[key] = { date: { start: value.start } };
    } else if (value?.type === 'people') {
      props[key] = { people: value.people };
    } else {
      props[key] = value;
    }
  }
  return props;
}
