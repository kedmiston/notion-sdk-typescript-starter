// pages/api/notion/command.ts

import { NextApiRequest, NextApiResponse } from 'next';

const NOTION_TOKEN = process.env.NOTION_API_KEY;
const NOTION_VERSION = '2022-06-28';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, databaseId, data, pageId } = req.body;

  try {
    const headers = {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    };

    let result;

    if (action === 'create') {
      result = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: buildProperties(data),
        }),
      });
    } else if (action === 'update') {
      result = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          properties: buildProperties(data),
        }),
      });
    } else {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    const json = await result.json();

    if (!result.ok) {
      console.error('Notion API Error:', json);
      return res.status(result.status).json({ error: json });
    }

    res.status(200).json({ success: true, notionResponse: json });
  } catch (err) {
    console.error('Internal API Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function buildProperties(fields: Record<string, any>) {
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
    } else if (value?.type === 'multi_select') {
      props[key] = { multi_select: value.options.map((opt: string) => ({ name: opt })) };
    } else if (value?.type === 'checkbox') {
      props[key] = { checkbox: value.checked };
    } else {
      props[key] = value;
    }
  }
  return props;
}
