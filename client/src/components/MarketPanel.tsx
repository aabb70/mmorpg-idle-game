import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Chip,
} from '@mui/material'
import { RootState } from '../store/store'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`market-tabpanel-${index}`}
      aria-labelledby={`market-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

export default function MarketPanel() {
  const [tab, setTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const { listings, myListings } = useSelector((state: RootState) => state.market)

  const filteredListings = listings.filter(listing =>
    listing.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        市場交易
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="瀏覽市場" />
          <Tab label="我的商品" />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="搜尋物品或賣家"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="normal"
          />
        </Box>

        {filteredListings.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? '沒有找到相關物品' : '目前市場上沒有物品'}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {filteredListings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {listing.itemName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      賣家：{listing.sellerName}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={`數量：${listing.quantity}`} size="small" />
                      <Chip
                        label={`${listing.pricePerUnit} 金幣/個`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      總價：{listing.totalPrice} 金幣
                    </Typography>
                    <Button variant="contained" fullWidth>
                      購買
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tab} index={1}>
        {myListings.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            你還沒有上架任何物品
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {myListings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {listing.itemName}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip label={`數量：${listing.quantity}`} size="small" />
                      <Chip
                        label={`${listing.pricePerUnit} 金幣/個`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" color="primary" gutterBottom>
                      總價：{listing.totalPrice} 金幣
                    </Typography>
                    <Button variant="outlined" color="error" fullWidth>
                      下架
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </Paper>
  )
}