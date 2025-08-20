import React from 'react'
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ItemIcon from './ItemIcon'

// 測試物品數據
const testItems = {
  '採礦類': [
    { name: '銅礦石', rarity: 'COMMON' },
    { name: '鐵礦石', rarity: 'COMMON' },
    { name: '金礦石', rarity: 'UNCOMMON' },
    { name: '銀礦石', rarity: 'UNCOMMON' },
    { name: '鑽石原石', rarity: 'RARE' },
    { name: '寶石原石', rarity: 'EPIC' },
    { name: '秘銀錠', rarity: 'LEGENDARY' },
    { name: '精金錠', rarity: 'LEGENDARY' }
  ],
  '伐木類': [
    { name: '橡木', rarity: 'COMMON' },
    { name: '松木', rarity: 'COMMON' },
    { name: '竹子', rarity: 'UNCOMMON' },
    { name: '魔法木', rarity: 'RARE' },
    { name: '古樹之心', rarity: 'LEGENDARY' }
  ],
  '釣魚類': [
    { name: '鯉魚', rarity: 'COMMON' },
    { name: '鮭魚', rarity: 'UNCOMMON' },
    { name: '鯊魚', rarity: 'RARE' },
    { name: '章魚', rarity: 'RARE' },
    { name: '龍蝦', rarity: 'EPIC' },
    { name: '海藻', rarity: 'COMMON' },
    { name: '珊瑚', rarity: 'UNCOMMON' }
  ],
  '採集類': [
    { name: '蘋果', rarity: 'COMMON' },
    { name: '草莓', rarity: 'COMMON' },
    { name: '蘑菇', rarity: 'UNCOMMON' },
    { name: '人參', rarity: 'RARE' },
    { name: '靈芝', rarity: 'EPIC' },
    { name: '藥草', rarity: 'COMMON' },
    { name: '玫瑰', rarity: 'UNCOMMON' }
  ],
  '武器類': [
    { name: '短劍', rarity: 'COMMON' },
    { name: '長劍', rarity: 'UNCOMMON' },
    { name: '魔劍', rarity: 'RARE' },
    { name: '聖劍', rarity: 'LEGENDARY' },
    { name: '戰斧', rarity: 'UNCOMMON' },
    { name: '法杖', rarity: 'RARE' },
    { name: '弓', rarity: 'COMMON' },
    { name: '十字弓', rarity: 'UNCOMMON' }
  ],
  '防具類': [
    { name: '皮甲', rarity: 'COMMON' },
    { name: '鏈甲', rarity: 'UNCOMMON' },
    { name: '板甲', rarity: 'RARE' },
    { name: '騎士甲', rarity: 'EPIC' },
    { name: '小盾', rarity: 'COMMON' },
    { name: '塔盾', rarity: 'RARE' },
    { name: '魔法帽', rarity: 'RARE' },
    { name: '皮靴', rarity: 'COMMON' }
  ],
  '飾品類': [
    { name: '戒指', rarity: 'UNCOMMON' },
    { name: '項鍊', rarity: 'RARE' },
    { name: '護身符', rarity: 'EPIC' },
    { name: '徽章', rarity: 'LEGENDARY' }
  ],
  '食物類': [
    { name: '麵包', rarity: 'COMMON' },
    { name: '烤肉', rarity: 'COMMON' },
    { name: '魚排', rarity: 'UNCOMMON' },
    { name: '蛋糕', rarity: 'RARE' },
    { name: '紅酒', rarity: 'UNCOMMON' },
    { name: '咖啡', rarity: 'COMMON' }
  ],
  '藥劑類': [
    { name: '治療藥水', rarity: 'COMMON' },
    { name: '魔力藥水', rarity: 'UNCOMMON' },
    { name: '力量藥水', rarity: 'RARE' },
    { name: '萬能藥', rarity: 'LEGENDARY' }
  ],
  '工具類': [
    { name: '鎬子', rarity: 'COMMON' },
    { name: '斧頭', rarity: 'COMMON' },
    { name: '釣竿', rarity: 'UNCOMMON' },
    { name: '鋸子', rarity: 'UNCOMMON' }
  ],
  '魔法物品': [
    { name: '魔法石', rarity: 'RARE' },
    { name: '符文', rarity: 'EPIC' },
    { name: '傳送卷軸', rarity: 'RARE' },
    { name: '靈魂石', rarity: 'LEGENDARY' }
  ],
  '新增物品測試': [
    { name: '神秘寶石', rarity: 'LEGENDARY' },
    { name: '火焰之劍', rarity: 'EPIC' },
    { name: '月光花瓣', rarity: 'RARE' },
    { name: '龍鱗護甲', rarity: 'EPIC' },
    { name: '星辰法杖', rarity: 'LEGENDARY' },
    { name: '不知名物品', rarity: 'COMMON' }
  ]
}

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3',
  EPIC: '#9C27B0',
  LEGENDARY: '#FF6B35'
}

const rarityNames = {
  COMMON: '普通',
  UNCOMMON: '精良',
  RARE: '稀有',
  EPIC: '史詩',
  LEGENDARY: '傳奇'
}

export default function IconTestPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        🎮 物品圖標系統測試
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        這裡展示了各類物品的圖標效果，包括稀有度色彩濾鏡和發光動畫。
        新增物品會根據名稱關鍵字自動匹配最適合的圖標。
      </Typography>

      {Object.entries(testItems).map(([category, items]) => (
        <Accordion key={category} defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {category} ({items.length} 項)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {items.map((item, index) => {
                const rarityColor = rarityColors[item.rarity as keyof typeof rarityColors]
                const isLegendary = item.rarity === 'LEGENDARY'
                const isEpic = item.rarity === 'EPIC'
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card 
                      sx={{
                        height: '100%',
                        ...(isLegendary && {
                          border: `2px solid ${rarityColor}`,
                          boxShadow: `0 0 20px ${rarityColor}40, 0 8px 32px rgba(0, 0, 0, 0.3)`,
                          animation: 'legendary-glow 2s ease-in-out infinite alternate'
                        }),
                        ...(isEpic && {
                          border: `1px solid ${rarityColor}80`,
                          boxShadow: `0 0 15px ${rarityColor}30, 0 8px 32px rgba(0, 0, 0, 0.3)`
                        })
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          <ItemIcon
                            itemName={item.name}
                            rarity={item.rarity}
                            size={48}
                            showRarityGlow={true}
                          />
                        </Box>
                        
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        
                        <Chip
                          label={rarityNames[item.rarity as keyof typeof rarityNames]}
                          size="small"
                          sx={{
                            backgroundColor: rarityColor,
                            color: isLegendary ? '#000' : 'white',
                            fontWeight: 'bold',
                            boxShadow: `0 2px 8px ${rarityColor}50`,
                            ...(isLegendary && {
                              background: `linear-gradient(45deg, ${rarityColor} 30%, #FFD700 90%)`
                            })
                          }}
                        />
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            圖標來源：Game-icons.net
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          📝 新增物品圖標規則
        </Typography>
        <Typography variant="body2" paragraph>
          當你新增物品時，系統會按照以下順序自動匹配圖標：
        </Typography>
        <Box component="ol" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2">📋 <strong>名稱精確匹配</strong>：如「鯉魚」→ 魚圖標</Typography>
          <Typography component="li" variant="body2">🏷️ <strong>物品類型匹配</strong>：如 WEAPON → 劍圖標</Typography>
          <Typography component="li" variant="body2">📂 <strong>類別匹配</strong>：如 FOOD → 食物圖標</Typography>
          <Typography component="li" variant="body2">🔍 <strong>關鍵字智能推測</strong>：如包含「劍」→ 劍圖標</Typography>
          <Typography component="li" variant="body2">📦 <strong>預設圖標</strong>：無匹配時顯示包裹圖標</Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, color: 'primary.main' }}>
          💡 支援 500+ 物品名稱自動識別，涵蓋採礦、伐木、釣魚、採集、武器、防具、飾品、食物、藥劑等所有類別！
        </Typography>
      </Box>
    </Box>
  )
}