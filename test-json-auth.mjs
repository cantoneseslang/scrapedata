import { google } from 'googleapis';
import fs from 'fs';

async function testJsonAuth() {
  try {
    // JSONファイルの存在確認
    const jsonPath = './credentials/cantonese-katakana-0f740ce346b9.json';
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`JSONファイルが見つかりません: ${jsonPath}`);
    }

    console.log('JSONファイルを読み込み中...');
    const credentials = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // 必要なフィールドの確認
    const requiredFields = ['client_email', 'private_key', 'project_id'];
    for (const field of requiredFields) {
      if (!credentials[field]) {
        throw new Error(`JSONファイルに ${field} が含まれていません`);
      }
    }

    console.log('認証情報の確認：', {
      project_id: credentials.project_id,
      client_email: credentials.client_email,
      private_key_exists: !!credentials.private_key
    });

    console.log('認証クライアントを初期化中...');
    const auth = new google.auth.GoogleAuth({
      keyFile: jsonPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    console.log('認証クライアントを取得中...');
    const client = await auth.getClient();

    console.log('スプレッドシートAPIに接続中...');
    const sheets = google.sheets({ version: 'v4', auth: client });

    // テスト用のスプレッドシートID
    const SPREADSHEET_ID = '1ZPkPq-UdjeRljbtxWIQPisCfBoEsCkxjmTyJ2zufB74';

    console.log('スプレッドシートへのアクセスをテスト中...');
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });

    console.log('認証テスト成功:', {
      title: response.data.properties.title,
      id: response.data.spreadsheetId
    });

  } catch (error) {
    console.error('テスト失敗:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

testJsonAuth();
