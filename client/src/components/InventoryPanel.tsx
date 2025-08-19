import { useSelector } from 'react-redux'
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
} from '@mui/material'
import { RootState } from '../store/store'

const rarityColors = {
  COMMON: '#9E9E9E',
  UNCOMMON: '#4CAF50',
  RARE: '#2196F3',
  EPIC: '#9C27B0',
  LEGENDARY: '#FF9800',
}

export default function InventoryPanel() {
  const { items } = useSelector((state: RootState) => state.inventory)

  if (items.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          背包
        </Typography>
        <Typography variant="body1" color="text.secondary">
          背包是空的。開始訓練技能來獲得物品吧！
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        背包
      </Typography>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {item.name}
                  </Typography>
                  <Chip
                    label={item.rarity}
                    size="small"
                    sx={{
                      backgroundColor: rarityColors[item.rarity as keyof typeof rarityColors],
                      color: 'white',
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  類型：{item.itemType}
                </Typography>
                <Typography variant="h6" color="primary">
                  數量：{item.quantity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}