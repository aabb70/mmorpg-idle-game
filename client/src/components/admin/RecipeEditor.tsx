import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import { Add, Edit, Delete, ExpandMore, RemoveCircle } from '@mui/icons-material'

interface Recipe {
  id: string
  itemId: string
  skillType: string
  skillLevel: number
  item: {
    id: string
    name: string
    rarity: string
  }
  ingredients: Ingredient[]
}

interface Ingredient {
  id: string
  quantity: number
  item: { id: string; name: string } | null
  category: string | null
  tag: { id: string; name: string } | null
}

interface Item {
  id: string
  name: string
  itemType: string
  rarity: string
}

interface Tag {
  id: string
  name: string
}

export default function RecipeEditor() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const skillTypes = [
    'MINING', 'LOGGING', 'FISHING', 'FORAGING', 
    'SMITHING', 'TAILORING', 'COOKING', 'ALCHEMY', 'CRAFTING'
  ]
  const categories = ['FISH', 'WOOD', 'METAL', 'FIBER', 'HERB', 'LIVESTOCK']
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [formData, setFormData] = useState({
    itemId: '',
    skillType: '',
    skillLevel: 1,
    ingredients: [] as Array<{
      type: 'item' | 'category' | 'tag'
      itemId?: string
      category?: string
      tagId?: string
      quantity: number
    }>
  })

  useEffect(() => {
    fetchRecipes()
    fetchItems()
    fetchTags()
  }, [])

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes || [])
      } else {
        setMessage('獲取配方列表失敗')
      }
    } catch (error) {
      console.error('獲取配方列表錯誤:', error)
      setMessage('獲取配方列表失敗')
    }
  }

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('獲取物品列表錯誤:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/tags`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error('獲取標籤列表錯誤:', error)
    }
  }



  const handleOpenDialog = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe)
      setFormData({
        itemId: recipe.itemId,
        skillType: recipe.skillType,
        skillLevel: recipe.skillLevel,
        ingredients: recipe.ingredients.map(ing => {
          if (ing.item) {
            return { type: 'item', itemId: ing.item.id, quantity: ing.quantity }
          } else if (ing.category) {
            return { type: 'category', category: ing.category, quantity: ing.quantity }
          } else if (ing.tag) {
            return { type: 'tag', tagId: ing.tag.id, quantity: ing.quantity }
          }
          return { type: 'item', quantity: ing.quantity }
        })
      })
    } else {
      setEditingRecipe(null)
      setFormData({
        itemId: '',
        skillType: '',
        skillLevel: 1,
        ingredients: []
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRecipe(null)
    setMessage('')
  }

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { type: 'item', quantity: 1 }]
    })
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    
    // 重置其他類型的值
    if (field === 'type') {
      delete newIngredients[index].itemId
      delete newIngredients[index].category
      delete newIngredients[index].tagId
    }
    
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const url = editingRecipe 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/recipes/${editingRecipe.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/recipes`
      
      const method = editingRecipe ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`配方${editingRecipe ? '更新' : '創建'}成功！`)
        fetchRecipes()
        handleCloseDialog()
      } else {
        setMessage(data.error || `配方${editingRecipe ? '更新' : '創建'}失敗`)
      }
    } catch (error) {
      console.error('操作失敗:', error)
      setMessage(`配方${editingRecipe ? '更新' : '創建'}失敗`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (recipe: Recipe) => {
    if (!confirm(`確定要刪除「${recipe.item.name}」的配方嗎？此操作無法撤銷！`)) {
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/recipes/${recipe.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('配方刪除成功！')
        fetchRecipes()
      } else {
        setMessage(data.error || '配方刪除失敗')
      }
    } catch (error) {
      console.error('刪除失敗:', error)
      setMessage('配方刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      COMMON: '#9E9E9E',
      UNCOMMON: '#4CAF50',
      RARE: '#2196F3',
      EPIC: '#9C27B0',
      LEGENDARY: '#FF9800'
    }
    return colors[rarity as keyof typeof colors] || colors.COMMON
  }

  const renderIngredientName = (ingredient: Ingredient) => {
    if (ingredient.item) {
      return ingredient.item.name
    } else if (ingredient.category) {
      return `任何 ${ingredient.category} 類型`
    } else if (ingredient.tag) {
      return `標籤: ${ingredient.tag.name}`
    }
    return '未知'
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          配方編輯器
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          新增配方
        </Button>
      </Box>

      {message && (
        <Alert severity={message.includes('成功') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={2}>
        {recipes.map((recipe) => (
          <Grid item xs={12} md={6} lg={4} key={recipe.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {recipe.item.name}
                  </Typography>
                  <Chip
                    label={recipe.item.rarity}
                    size="small"
                    sx={{
                      backgroundColor: getRarityColor(recipe.item.rarity),
                      color: 'white'
                    }}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  技能：{recipe.skillType} (等級 {recipe.skillLevel})
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" gutterBottom>
                  材料需求：
                </Typography>
                {recipe.ingredients.map((ingredient, index) => (
                  <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                    • {renderIngredientName(ingredient)} × {ingredient.quantity}
                  </Typography>
                ))}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(recipe)}
                    disabled={loading}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(recipe)}
                    disabled={loading}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 編輯對話框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRecipe ? '編輯配方' : '新增配方'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>目標物品</InputLabel>
                <Select
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  label="目標物品"
                >
                  {items.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} ({item.rarity})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>技能類型</InputLabel>
                <Select
                  value={formData.skillType}
                  onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
                  label="技能類型"
                >
                  {skillTypes.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="技能等級需求"
                type="number"
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">材料需求</Typography>
              <Button startIcon={<Add />} onClick={addIngredient}>
                添加材料
              </Button>
            </Box>

            {formData.ingredients.map((ingredient, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>類型</InputLabel>
                        <Select
                          value={ingredient.type}
                          onChange={(e) => updateIngredient(index, 'type', e.target.value)}
                          label="類型"
                        >
                          <MenuItem value="item">特定物品</MenuItem>
                          <MenuItem value="category">物品分類</MenuItem>
                          <MenuItem value="tag">標籤</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      {ingredient.type === 'item' && (
                        <FormControl fullWidth size="small">
                          <InputLabel>物品</InputLabel>
                          <Select
                            value={ingredient.itemId || ''}
                            onChange={(e) => updateIngredient(index, 'itemId', e.target.value)}
                            label="物品"
                          >
                            {items.filter(item => item.itemType === 'MATERIAL').map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {ingredient.type === 'category' && (
                        <FormControl fullWidth size="small">
                          <InputLabel>分類</InputLabel>
                          <Select
                            value={ingredient.category || ''}
                            onChange={(e) => updateIngredient(index, 'category', e.target.value)}
                            label="分類"
                          >
                            {categories.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {ingredient.type === 'tag' && (
                        <FormControl fullWidth size="small">
                          <InputLabel>標籤</InputLabel>
                          <Select
                            value={ingredient.tagId || ''}
                            onChange={(e) => updateIngredient(index, 'tagId', e.target.value)}
                            label="標籤"
                          >
                            {tags.map((tag) => (
                              <MenuItem key={tag.id} value={tag.id}>
                                {tag.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="數量"
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <IconButton
                        color="error"
                        onClick={() => removeIngredient(index)}
                      >
                        <RemoveCircle />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.itemId || !formData.skillType}
          >
            {loading ? '處理中...' : (editingRecipe ? '更新' : '創建')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}