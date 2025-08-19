# 🚀 雲端部署指南

這個指南會帶你將遊戲部署到雲端，讓其他人可以直接通過網頁遊玩！

## 📋 部署概覽

我們將使用以下免費服務：
- **前端**: Netlify 或 Vercel (靜態網站託管)
- **後端**: Railway 或 Render (Node.js 託管)
- **資料庫**: Neon 或 Supabase (PostgreSQL)

## 🗄️ 第一步：設置雲端資料庫

### 選項 A: 使用 Neon (推薦)

1. 前往 [Neon](https://neon.tech/) 並註冊帳號
2. 建立新專案，選擇 "PostgreSQL"
3. 記下連接字串，格式類似：
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```

### 選項 B: 使用 Supabase

1. 前往 [Supabase](https://supabase.com/) 並註冊
2. 建立新專案
3. 在 Settings → Database 找到連接字串

## 🔧 第二步：部署後端

### 選項 A: 使用 Railway (推薦)

1. 前往 [Railway](https://railway.app/) 並登入 GitHub 帳號

2. 點擊 "New Project" → "Deploy from GitHub repo"

3. 選擇你的專案倉庫

4. 設置環境變數：
   ```
   DATABASE_URL=你的資料庫連接字串
   JWT_SECRET=一個隨機的密鑰字串
   NODE_ENV=production
   ```

5. 在 Settings 中設置：
   - Root Directory: `server`
   - Build Command: `npm run build`
   - Start Command: `npm start`

6. 部署完成後，記下你的後端 URL (如: `https://your-app.railway.app`)

### 選項 B: 使用 Render

1. 前往 [Render](https://render.com/) 並連接 GitHub

2. 建立新的 "Web Service"

3. 連接你的倉庫，設置：
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. 添加環境變數（同上）

## 🌐 第三步：部署前端

### 選項 A: 使用 Netlify

1. 前往 [Netlify](https://netlify.com/) 並登入

2. 將專案推送到 GitHub（如果還沒有的話）

3. 點擊 "New site from Git" → 選擇 GitHub → 選擇你的倉庫

4. 設置建構配置：
   - Build command: `cd client && npm run build`
   - Publish directory: `client/dist`

5. 添加環境變數：
   ```
   VITE_API_URL=你的後端URL
   ```

6. 點擊 "Deploy site"

### 選項 B: 使用 Vercel

1. 前往 [Vercel](https://vercel.com/) 並連接 GitHub

2. 選擇你的倉庫並點擊 "Import"

3. 設置：
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. 添加環境變數：
   ```
   VITE_API_URL=你的後端URL
   ```

## 🔄 第四步：初始化資料庫

1. 在後端部署完成後，需要初始化資料庫

2. 大多數平台都支援執行一次性指令，執行：
   ```bash
   npm run db:deploy
   ```

3. 這會建立所有表格並填入初始遊戲資料

## ✅ 第五步：測試部署

1. 開啟你的前端網址（Netlify/Vercel 提供的 URL）

2. 嘗試註冊新帳號

3. 測試技能訓練、物品製作、市場交易等功能

4. 多開幾個瀏覽器分頁測試多人功能

## 📱 第六步：分享給朋友

部署完成後，你就可以把前端網址分享給朋友了！他們可以：

1. 直接開啟網址
2. 註冊帳號開始遊玩
3. 與你一起在同一個遊戲世界中互動

## 🛠️ 常見問題

### Q: 後端部署失敗
A: 檢查 `package.json` 中的 scripts 是否正確，確保有 `build` 和 `start` 指令

### Q: 資料庫連接失敗
A: 確認 `DATABASE_URL` 環境變數正確，並且包含 `?sslmode=require`

### Q: 前端無法連接後端
A: 確認 `VITE_API_URL` 環境變數設置為你的後端 URL

### Q: WebSocket 連接問題
A: 確保後端支援 WebSocket，大部分雲端平台都預設支援

## 🔄 更新部署

當你修改程式碼後：

1. 推送到 GitHub
2. 大部分平台會自動重新部署
3. 如果資料庫結構有變更，可能需要手動執行 `npm run db:push`

## 💰 費用預估

使用推薦的免費方案：
- **Neon**: 免費方案包含 512MB 儲存空間
- **Railway**: 每月 $5 額度（通常足夠小型遊戲）
- **Netlify**: 免費方案包含 100GB 頻寬

總費用：**$0-5/月**（取決於使用量）

---

完成這些步驟後，你的 MMORPG 放置遊戲就可以讓全世界的人遊玩了！🎮✨