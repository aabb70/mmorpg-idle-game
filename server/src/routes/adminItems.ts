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
  getMaterialCategories
} from '../controllers/adminRecipeController.js'
import {
  getAllSkillItems,
  getSkillItemsBySkill,
  createSkillItem,
  updateSkillItem,
  deleteSkillItem,
  batchUpdateSkillItems,
  getSkillTypes,
  migrateSkillItems
} from '../controllers/adminSkillItemController.js'
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

// 技能物品管理路由
router.get('/skill-items', authenticateAdmin, getAllSkillItems)
router.get('/skill-items/:skillType', authenticateAdmin, getSkillItemsBySkill)
router.post('/skill-items', authenticateAdmin, createSkillItem)
router.put('/skill-items/:id', authenticateAdmin, updateSkillItem)
router.delete('/skill-items/:id', authenticateAdmin, deleteSkillItem)
router.post('/skill-items/batch-update', authenticateAdmin, batchUpdateSkillItems)
router.post('/skill-items/migrate', authenticateAdmin, migrateSkillItems)

// 輔助數據路由
router.get('/skill-types', authenticateAdmin, getSkillTypes)
router.get('/categories', authenticateAdmin, getMaterialCategories)

export default router