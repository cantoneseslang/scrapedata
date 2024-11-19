// test-env.mjs
import dotenv from 'dotenv';
dotenv.config();

console.log('環境変数チェック:');
console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID ? '設定済み' : '未設定');
console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL ? '設定済み' : '未設定');
console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID ? '設定済み' : '未設定');
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '設定済み' : '未設定');

// プライベートキーの形式を確認
if (process.env.GOOGLE_PRIVATE_KEY) {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    .replace(/\\n/g, '\n')
    .replace(/"$/, '')
    .replace(/^"/, '');
    
  console.log('\nプライベートキーの確認:');
  console.log('開始行:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
  console.log('終了行:', privateKey.endsWith('-----END PRIVATE KEY-----\n'));
}