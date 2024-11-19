const fs = require('fs');
const path = require('path');

// JSONファイルのパスを修正（credentialsフォルダ内のファイルを参照）
const serviceAccountPath = path.join(__dirname, 'credentials', 'cantonese-katakana-d46ed464d35b.json');
const credentials = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// .env ファイルの内容を作成
const envContent = `
SPREADSHEET_ID=1ZPkPq-UdjeRljbtxWIQPisCfBoEsCkxjmTyJ2zufB74
GOOGLE_PRIVATE_KEY="${credentials.private_key.replace(/\n/g, '\\n')}"
GOOGLE_CLIENT_EMAIL="${credentials.client_email}"
GOOGLE_PROJECT_ID="${credentials.project_id}"
GOOGLE_APPLICATION_CREDENTIALS="./credentials/cantonese-katakana-d46ed464d35b.json"
`.trim();

// .env ファイルをプロジェクトルートに作成
fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log('.env ファイルを更新しました');