# MMORPG 放置遊戲

一個多人在線的網頁版放置遊戲，專注於生活技能訓練和玩家間的經濟交易系統。

## 遊戲特色

- **多種生活技能**：採礦、伐木、釣魚、採集、鍛造、裁縫、廚師、煉金、工藝
- **經濟系統**：玩家間可以自由交易材料和成品
- **市場系統**：供需平衡的動態市場
- **即時多人**：所有玩家共享同一個遊戲世界

## 技術架構

- **前端**：React + TypeScript + Redux Toolkit + Material-UI
- **後端**：Node.js + Express + Socket.io
- **資料庫**：PostgreSQL + Prisma ORM
- **即時通訊**：WebSocket (Socket.io)

## 專案結構

```
mmorpg-idle-game/
├── client/                 # 前端 React 應用
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/         # 頁面組件
│   │   ├── store/         # Redux store 和 slices
│   │   ├── types/         # TypeScript 類型定義
│   │   └── utils/         # 工具函數
│   └── package.json
├── server/                # 後端 Node.js 應用
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中間件
│   │   ├── utils/         # 工具函數
│   │   └── types/         # TypeScript 類型定義
│   ├── prisma/           # 資料庫 schema
│   └── package.json
└── package.json          # 根目錄 package.json
```

## 開發環境設置

### 前置需求

- Node.js (版本 18 或以上)
- PostgreSQL 資料庫
- npm 或 yarn

### 安裝步驟

1. **安裝所有依賴**
```bash
npm run install:all
```

2. **設置資料庫**
```bash
# 複製環境變數檔案
cp server/.env.example server/.env

# 編輯 server/.env 檔案，設置資料庫連接
# DATABASE_URL="postgresql://username:password@localhost:5432/mmorpg_idle_game"

# 生成 Prisma 客戶端
cd server
npm run db:generate

# 推送資料庫 schema
npm run db:push
```

3. **啟動開發服務器**
```bash
# 同時啟動前端和後端
npm run dev

# 或分別啟動
npm run dev:client  # 前端 (http://localhost:3000)
npm run dev:server  # 後端 (http://localhost:5000)
```

## 遊戲系統設計

### 技能系統
- 9 種不同的生活技能
- 每種技能都有獨立的等級和經驗值
- 升級需要的經驗值會遞增

### 物品系統
- 材料、工具、裝備、消耗品等不同類型
- 5 種稀有度等級：普通、罕見、稀有、史詩、傳說

### 交易系統
- 玩家可以在市場上架物品
- 其他玩家可以購買上架的物品
- 動態定價機制

### 製作系統
- 使用材料製作新物品
- 需要相應的技能等級
- 不同配方需要不同的材料組合

## 開發計劃

- [x] 基本專案架構
- [x] 前端基礎組件
- [x] 後端基礎設置
- [ ] 資料庫模型實作
- [ ] 技能訓練邏輯
- [ ] 物品和製作系統
- [ ] 市場交易功能
- [ ] 即時多人同步
- [ ] 使用者認證系統

## 貢獻

歡迎提交 Issue 和 Pull Request 來幫助改善這個遊戲！