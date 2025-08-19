# 快速開始指南

## 🎯 專案概述

這是一個多人在線的網頁版 MMORPG 放置遊戲，玩家可以：
- 訓練 9 種不同的生活技能
- 收集和製作各種物品
- 在市場上與其他玩家交易
- 即時看到其他玩家的活動

## 🚀 快速啟動

### 1. 安裝依賴
```bash
# 安裝所有依賴包
npm run install:all
```

### 2. 設置資料庫
```bash
# 複製環境變數檔案
cp server/.env.example server/.env

# 編輯 server/.env 檔案設置資料庫連接
# DATABASE_URL="postgresql://username:password@localhost:5432/mmorpg_idle_game"
# JWT_SECRET="your-super-secret-jwt-key"
```

### 3. 初始化資料庫
```bash
cd server

# 生成 Prisma 客戶端
npm run db:generate

# 推送資料庫結構
npm run db:push

# 填入初始資料
npx tsx prisma/seed.ts
```

### 4. 啟動開發服務器
```bash
# 回到根目錄
cd ..

# 同時啟動前端和後端
npm run dev
```

開啟瀏覽器訪問 http://localhost:3000

## 📱 遊戲操作指南

### 註冊和登入
1. 在首頁點擊「註冊」頁籤
2. 輸入用戶名、電子郵件和密碼
3. 點擊註冊按鈕即可進入遊戲

### 技能訓練
1. 在遊戲主頁點擊「技能」
2. 選擇想要訓練的技能
3. 點擊「開始訓練」按鈕
4. 等待獲得經驗值和可能的材料獎勵

### 物品製作
1. 訓練相關技能到足夠等級
2. 收集所需的材料
3. 使用製作功能將材料合成為新物品

### 市場交易
1. 點擊「市場」頁籤
2. 在「瀏覽市場」查看其他玩家的商品
3. 在「我的商品」管理自己上架的物品
4. 點擊「購買」購買喜歡的物品

## 🎮 遊戲特色

### 技能系統
- **採集技能**：採礦、伐木、釣魚、採集
- **製作技能**：鍛造、裁縫、廚師、煉金、工藝
- **技能升級**：每級所需經驗遞增，解鎖新的製作配方

### 物品系統
- **稀有度**：普通(灰)、罕見(綠)、稀有(藍)、史詩(紫)、傳說(橙)
- **物品類型**：材料、工具、裝備、消耗品、雜項

### 經濟系統
- **自由定價**：玩家自行設定商品價格
- **供需平衡**：稀有物品價格更高
- **金幣流通**：通過交易獲得和消費金幣

## 🛠 開發指令

```bash
# 僅啟動前端
npm run dev:client

# 僅啟動後端
npm run dev:server

# 建構整個專案
npm run build

# 資料庫管理
cd server
npm run db:studio    # 開啟 Prisma Studio
npm run db:push      # 推送 schema 變更
npm run db:generate  # 重新生成客戶端
```

## 📂 專案架構

```
mmorpg-idle-game/
├── client/          # React 前端
│   ├── src/
│   │   ├── components/    # UI 組件
│   │   ├── pages/        # 頁面
│   │   ├── store/        # Redux 狀態管理
│   │   └── types/        # TypeScript 類型
│   └── package.json
├── server/          # Node.js 後端
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # API 路由
│   │   ├── middleware/   # 中間件
│   │   └── types/        # 類型定義
│   ├── prisma/          # 資料庫 schema
│   └── package.json
└── README.md
```

## 🐛 常見問題

### Q: 資料庫連接失敗
A: 請確認 PostgreSQL 服務正在運行，並檢查 `.env` 檔案中的資料庫連接字串是否正確。

### Q: 前端無法連接後端
A: 確認後端服務運行在 port 5000，前端會自動代理 API 請求。

### Q: 技能訓練沒有反應
A: 確認已經登入且 WebSocket 連接正常。可以查看瀏覽器控制台的錯誤訊息。

## 🔮 未來功能

- [ ] 任務系統
- [ ] 成就系統
- [ ] 公會功能
- [ ] 裝備強化
- [ ] 寵物系統
- [ ] 領地建設

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改善遊戲！

---

現在你可以開始體驗這個多人 MMORPG 放置遊戲了！🎮