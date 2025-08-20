import express from 'express'
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  getAllTags
} from '../controllers/adminItemController.js'
import {
  getAllRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getSkillTypes,
  getMaterialCategories
} from '../controllers/adminRecipeController.js'
import { authenticateAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

// 物品管理路由
router.get('/items', authenticateAdmin, getAllItems)
router.post('/items', authenticateAdmin, createItem)
router.put('/items/:id', authenticateAdmin, updateItem)
router.delete('/items/:id', authenticateAdmin, deleteItem)
router.get('/tags', authenticateAdmin, getAllTags)

// 配方管理路由
router.get('/recipes', authenticateAdmin, getAllRecipes)
router.post('/recipes', authenticateAdmin, createRecipe)
router.put('/recipes/:id', authenticateAdmin, updateRecipe)
router.delete('/recipes/:id', authenticateAdmin, deleteRecipe)

// 輔助數據路由
router.get('/skill-types', authenticateAdmin, getSkillTypes)
router.get('/categories', authenticateAdmin, getMaterialCategories)

export default router