import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

const SHEET_NAMES = {
  'JPY': '1JPY-HKD',
  'CNY': 'CNY-1HKD',
  'EUR': '1EUR-HKD',
  'USD': '1USD-HKD',
};

// In-memory cache to store fetched data
const dataCache: { [key: string]: any[] } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { baseCurrency } = req.query;

  if (typeof baseCurrency !== 'string' || !SHEET_NAMES[baseCurrency as keyof typeof SHEET_NAMES]) {
    return res.status(400).json({ error: 'Invalid currency specified' });
  }

  try {
    // Check if data is already in cache
    if (dataCache[baseCurrency]) {
      return res.status(200).json({ data: dataCache[baseCurrency] });
    }

    // If not in cache, fetch from Google Sheets
    const data = await fetchDataFromSheet(baseCurrency);

    // Store fetched data in cache
    dataCache[baseCurrency] = data;

    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from Google Sheets',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

async function fetchDataFromSheet(baseCurrency: string) {
  if (!process.env.GOOGLE_CREDENTIALS) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
  }

  if (!process.env.SPREADSHEET_ID) {
    throw new Error('SPREADSHEET_ID environment variable is not set');
  }

  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString()
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const sheetName = SHEET_NAMES[baseCurrency as keyof typeof SHEET_NAMES];
  const range = `'${sheetName}'!A5:H74`;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: range,
  });

  const rows = response.data.values;

  if (!rows || rows.length === 0) {
    return [];
  }

  return rows
    .filter(row => row[0] && row[0] !== '店名')
    .map(row => ({
      store: row[0],
      buyRate: parseFloat(row[1] || '0'),
      sellRate: parseFloat(row[2] || '0'),
      url: row[3] || '',
      updateTime: row[4] || '',
      address: row[5] || '',
      area: row[6] || '',
      mapUrl: row[7] || '',
    }));
}