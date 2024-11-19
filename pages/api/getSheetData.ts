import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import path from 'path';

const SHEET_NAMES = {
  'JPY': '1JPY-HKD',
  'CNY': 'CNY-1HKD',
  'EUR': '1EUR-HKD',
  'USD': '1USD-HKD',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { baseCurrency } = req.query;

  try {
    // 認証ファイルのパスを修正
    const keyFilePath = path.join(process.cwd(), 'credentials', 'cantonese-katakana-0f740ce346b9.json');

    // ファイルの存在確認を追加
    const fs = require('fs');
    if (!fs.existsSync(keyFilePath)) {
      console.error(`Authentication file not found at: ${keyFilePath}`);
      return res.status(500).json({ error: 'Authentication configuration error' });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // シート名の検証を追加
    const sheetName = SHEET_NAMES[baseCurrency as keyof typeof SHEET_NAMES];
    if (!sheetName) {
      return res.status(400).json({ error: 'Invalid currency specified' });
    }

    const range = `'${sheetName}'!A5:H74`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(200).json({ data: [] });
    }

    const data = rows
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

    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching data:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Failed to fetch data from Google Sheets',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch data from Google Sheets',
        details: 'Unknown error occurred'
      });
    }
  }
}