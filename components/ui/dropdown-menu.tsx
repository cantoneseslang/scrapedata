import React, { useState, useRef, useEffect } from 'react';

type DropdownMenuProps = {
  trigger: React.ReactNode; // メニューを開くためのトリガー要素
  children: React.ReactNode; // ドロップダウンの内容となる子要素
};

// ドロップダウンメニューコンポーネントの定義
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, children }) => {
  const [open, setOpen] = useState(false); // ドロップダウンの開閉状態を管理
  const menuRef = useRef<HTMLDivElement>(null); // ドロップダウンメニューへの参照

  // メニュー外をクリックしたときにメニューを閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // メニューが存在し、クリックされた要素がメニュー内に含まれていない場合
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false); // メニューを閉じる
      }
    };
    // ドキュメントにクリックイベントリスナーを追加
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // クリーンアップ時にイベントリスナーを削除
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* メニューを開くためのトリガー要素 */}
      <div onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      {/* メニューが開いている場合に表示 */}
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          {children}
        </div>
      )}
    </div>
  );
};

type DropdownMenuItemProps = {
  onClick?: () => void; // 項目がクリックされたときの処理
  children: React.ReactNode; // 項目の表示内容
};

// ドロップダウンメニューの項目コンポーネント
export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ onClick, children }) => (
  <div
    onClick={onClick}
    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
  >
    {children}
  </div>
);