// test-sheet.mjs
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

async function testSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        project_id: process.env.GOOGLE_PROJECT_ID
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // シートの一覧を取得
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID
    });

    const existingSheets = response.data.sheets.map(sheet => sheet.properties.title);
    console.log('現在のシート一覧:', existingSheets);

    // 既存のシートの1つに書き込みテスト
    const targetSheet = existingSheets[0]; // 最初のシートを使用
    console.log(`書き込みテスト対象シート: ${targetSheet}`);

    const testData = [['Test Data', new Date().toISOString()]];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${targetSheet}'!A1`,  // シート名をクォートで囲む
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: testData
      }
    });

    console.log('既存シートへの書き込みテスト成功');

    // 新しいテストシートを作成
    const newSheetTitle = 'TestSheet_' + Date.now();
    const newSheet = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: newSheetTitle
            }
          }
        }]
      }
    });

    console.log('新しいシートを作成:', newSheetTitle);
    
    // 新しいシートにデータを書き込み
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `'${newSheetTitle}'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: testData
      }
    });

    console.log('新しいシートへの書き込みテスト成功');

  } catch (error) {
    console.error('エラーの詳細:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testSheet();