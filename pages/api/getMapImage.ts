import { NextApiRequest, NextApiResponse } from 'next';

// 環境変数からAPIキーを取得
const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// APIレスポンスの型定義
interface MapResponse {
  imageUrl: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapResponse | { message: string }>
) {
  // GETリクエストのみを許可
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { center, zoom, size, markers } = req.query;

    // 必須パラメータの検証
    if (!center || !zoom || !size || !MAPS_API_KEY) {
      return res.status(400).json({ 
        message: !MAPS_API_KEY 
          ? 'API key is not configured' 
          : 'Missing required parameters' 
      });
    }

    // Map Static APIのベースURL
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    
    // 基本パラメータの設定
    const params = new URLSearchParams({
      center: center as string,
      zoom: zoom as string,
      size: size as string,
      scale: '2', // Retina対応
      maptype: 'roadmap',
      key: MAPS_API_KEY,
      language: 'ja', // 日本語表示
    });

    // マーカーの追加（存在する場合）
    if (markers) {
      params.append('markers', markers as string);
    }

    // マップスタイルの定義
    const mapStyles = [
      // ラベル関連
      { feature: 'poi', element: 'labels', visibility: 'off' },
      { feature: 'transit', element: 'labels', visibility: 'off' },
      { feature: 'road', element: 'labels.icon', visibility: 'off' },
      // カラースキーム
      { feature: 'water', color: '#a5d8ff' },
      { feature: 'landscape', color: '#f1f3f5' },
      { feature: 'road', color: '#ffffff' },
      { feature: 'road.arterial', color: '#dee2e6' },
      { feature: 'road.highway', color: '#ced4da' },
      { feature: 'building', color: '#e9ecef' },
      // 追加のスタイル
      { feature: 'administrative', element: 'geometry.stroke', color: '#dee2e6' },
      { feature: 'administrative.locality', element: 'labels', visibility: 'on' },
    ];

    // スタイルパラメータの追加
    mapStyles.forEach(style => {
      let styleString = '';
      if (style.feature) styleString += `feature:${style.feature}|`;
      if (style.element) styleString += `element:${style.element}|`;
      if (style.visibility) styleString += `visibility:${style.visibility}`;
      if (style.color) styleString += `color:${style.color}`;
      params.append('style', styleString);
    });

    // 最終的なURLの構築
    const mapUrl = `${baseUrl}?${params.toString()}`;

    // URLをクライアントに返す
    res.status(200).json({ imageUrl: mapUrl });

  } catch (error) {
    console.error('Map image generation error:', error);
    res.status(500).json({ 
      message: 'Error generating map image'
    });
  }
}