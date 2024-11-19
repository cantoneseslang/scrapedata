// 必要なライブラリのインポート
import puppeteer from 'puppeteer';
import { google } from 'googleapis';
import open from 'open';
import fs from 'fs';

// 定数の設定
const SPREADSHEET_ID = '1ZPkPq-UdjeRljbtxWIQPisCfBoEsCkxjmTyJ2zufB74';
const JSON_PATH = './credentials/cantonese-katakana-0f740ce346b9.json';

// 認証関数
async function authenticate() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: JSON_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const client = await auth.getClient();
    console.log('認証成功');
    return client;
  } catch (error) {
    console.error('認証エラー:', error);
    throw error;
  }
}

// 為替レート情報を取得するための URL と通貨ペア設定
const urls = [
  {
    url: 'https://hk.ttrate.com/en_us/?c=JPY&b=0&s=3&t=3',
    currencyPair: '1JPY-HKD',
    sheetTitle: '1JPY-HKD',
  },
  {
    url: 'https://hk.ttrate.com/en_us/?c=CNY&b=0&s=3&t=3',
    currencyPair: 'CNY-1HKD',
    sheetTitle: 'CNY-1HKD',
  },
  {
    url: 'https://hk.ttrate.com/en_us/?c=EUR&b=0&s=3&t=3',
    currencyPair: '1EUR-HKD',
    sheetTitle: '1EUR-HKD',
  },
  {
    url: 'https://hk.ttrate.com/en_us/?c=USD&b=0&s=3&t=3',
    currencyPair: '1USD-HKD',
    sheetTitle: '1USD-HKD',
  }
];

// ページからデータを取得する関数
async function fetchData(page, url, currencyPair) {
  try {
    await page.setDefaultNavigationTimeout(30000);
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();

    // 最新情報を取得
    const latestInfoRegex = new RegExp(
      `<div[^>]*>\\s*${currencyPair}\\s*<\\/div>\\s*<div[^>]*>Latest:\\s*([\\d- :HKT]+)<\\/div>`
    );
    
    const latestInfoMatch = latestInfoRegex.exec(content);

    let latestInfo = [];
    if (latestInfoMatch) {
      latestInfo = [currencyPair, `Latest: ${latestInfoMatch[1]}`];
    }

    const data = [];
    const regex = /<a class="rl" href="([^"]+)">.*?<span>(.*?)<\/span>.*?data-rate="([\d.]+)".*?data-rate="([\d.]+)".*?data-time="([\d- :]+)"/gs;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const [_, storeUrl, storeName, buyRate, sellRate, updateTime] = match;
      data.push([storeName.trim(), parseFloat(buyRate).toFixed(4), parseFloat(sellRate).toFixed(4), storeUrl, updateTime]);
    }

    return { latestInfo, data };
  } catch (error) {
    console.error(`データ取得エラー (${currencyPair}):`, error);
    return { latestInfo: [], data: [] };
  }
}
async function getSheetId(sheets, spreadsheetId, sheetTitle) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  
  const sheet = response.data.sheets.find(
    (sheet) => sheet.properties.title === sheetTitle
  );

  if (!sheet) {
    throw new Error(`シート名「${sheetTitle}」が見つかりませんでした。`);
  }

  return sheet.properties.sheetId;
}
// Google Sheetsを更新する関数
async function updateSheet(sheets, spreadsheetId, sheetTitle, latestInfo, data) {
  try {
    // シートをクリア
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetTitle}!A:Z`,
    });

    // ヘッダーと最新情報を書き込み
    const headerValues = [
      ['・買いレート: 両替店があなた（顧客）から日本円を買い取る際のレートです。'], // 1行目
      ['・売りレート: 両替店があなた（顧客）に香港ドルを売る際のレートです。'],     // 2行目
      ['店名', '買いレート', '売りレート', 'URL', '更新時間', '住所', '地域', '地図URL', '電話番号', '平日営業時間', '土日営業時間'],
    ];

    if (latestInfo.length > 0) {
      headerValues.push(latestInfo);
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetTitle}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: headerValues,
      },
    });

    // シートIDを取得
    const sheetId = await getSheetId(sheets, spreadsheetId, sheetTitle);

    // ヘッダーを太字に設定（3行目のみ）
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: getSheetIdByTitle(sheetTitle), // シートIDを整数で指定します
                startRowIndex: 10, // ヘッダーの行インデックス（3行目なのでインデックスは2）
                endRowIndex: 10,
                startColumnIndex: 0,
                endColumnIndex: headerValues[2].length,
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true, // 太字に設定
                  },
                },
              },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
        ],
      },
    });

    // データをバッチ処理で書き込み
    const BATCH_SIZE = 100;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batchData = data.slice(i, i + BATCH_SIZE);
      let retryCount = 5;
      let success = false;

      while (retryCount > 0 && !success) {
        try {
          console.log(`バッチ ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(data.length / BATCH_SIZE)} を処理中...`);

          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetTitle}!A1`,  // 明確にセルを指定する
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: batchData,
            },
          });

          success = true;
        } catch (error) {
          console.error(`バッチ書き込みエラー: ${error.message}. 再試行します...`);
          retryCount--;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (!success) {
        throw new Error(`バッチ ${Math.floor(i / BATCH_SIZE) + 1} の書き込みに失敗しました`);
      }


      await new Promise((resolve) => setTimeout(resolve, 100));
    }
// まず関数を書き込んで計算させる
// VLOOKUP関数を設定
const lastRow = data.length + 4;
const formulaUpdates = {
  data: [
    {
      range: `${sheetTitle}!F4:F${lastRow}`,
      values: Array(lastRow - 3).fill().map((_, index) => 
        [`=VLOOKUP(A${index + 4},'店舗情報'!$B$2:$G$68,3,0)`]
      )
    },
    {
      range: `${sheetTitle}!G4:G${lastRow}`,
      values: Array(lastRow - 3).fill().map((_, index) => 
        [`=VLOOKUP(A${index + 4},'店舗情報'!$B$2:$G$68,6,0)`]
      )
    }
  ],
  valueInputOption: 'USER_ENTERED'
};

// VLOOKUP関数を適用
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId,
  requestBody: formulaUpdates
});

// 少し待機して関数の計算を待つ
await new Promise(resolve => setTimeout(resolve, 1000));

// 計算された値を取得
const calculatedValues = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${sheetTitle}!F4:G${lastRow}`,
  valueRenderOption: 'UNFORMATTED_VALUE'  // 計算された実際の値を取得
});

// 取得した値を同じ場所に書き戻す
if (calculatedValues.data.values) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTitle}!F4:G${lastRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: calculatedValues.data.values
    }
  });
}

console.log(`${sheetTitle} の更新が完了しました`);
  } catch (error) {
    console.error('シート更新エラーの詳細:', {
      message: error.message,
      code: error.code,
      errors: error.errors,
      sheetTitle,
    });
    throw error;
  }
}

function getSheetIdByTitle(sheetTitle) {
  const sheetIds = {
    'JPY_HKD': 0,
    'CNY_HKD': 1,
    'EUR_HKD': 2,
    'USD_HKD': 3,
  };
  return sheetIds[sheetTitle];
}


// メイン処理
async function main() {
  let browser;
  try {
    console.log('処理を開始します...');

    // ブラウザの起動
    browser = await puppeteer.launch({
      headless: 'new',  // 新しいヘッドレスモードを使用
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    const allData = [];
    for (const { url, currencyPair, sheetTitle } of urls) {
      console.log(`${currencyPair} のデータを取得中...`);
      const { latestInfo, data } = await fetchData(page, url, currencyPair);
      allData.push({ sheetTitle, latestInfo, data });
    }

    const auth = await authenticate();
    const sheets = google.sheets({ version: 'v4', auth });

    for (const { sheetTitle, latestInfo, data } of allData) {
      await updateSheet(sheets, SPREADSHEET_ID, sheetTitle, latestInfo, data);
    }

    await open(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('ブラウザを終了しました');
    }
  }
}

// プログラムの実行
main().catch((error) => {
  console.error('プログラムが異常終了しました:', error);
  process.exit(1);
});
