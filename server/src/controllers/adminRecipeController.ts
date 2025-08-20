import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 獲取所有配方
export const getAllRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        item: true,
        ingredients: {
          include: {
            item: true,
            tag: true
          }
        }
      },
      orderBy: [
        { skillType: 'asc' },
        { skillLevel: 'asc' },
        { item: { name: 'asc' } }
      ]
    })

    res.json({
      success: true,
      recipes: recipes.map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients.map(ing => ({
          id: ing.id,
          quantity: ing.quantity,
          item: ing.item ? { id: ing.item.id, name: ing.item.name } : null,
          category: ing.category,
          tag: ing.tag ? { id: ing.tag.id, name: ing.tag.name } : null
        }))
      }))
    })
  } catch (error: any) {
    console.error('獲取配方列表失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 創建新配方
export const createRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      itemId,
      skillType,
      skillLevel,
      ingredients
    } = req.body

    // 檢查物品是否存在
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      res.status(404).json({ success: false, error: '目標物品不存在' })
      return
    }

    // 檢查是否已有此物品的配方
    const existingRecipe = await prisma.recipe.findFirst({
      where: { itemId }
    })

    if (existingRecipe) {
      res.status(400).json({ success: false, error: '此物品已有配方，請先刪除現有配方' })
      return
    }

    // 創建配方
    const recipe = await prisma.recipe.create({
      data: {
        itemId,
        skillType,
        skillLevel: skillLevel || 1
      }
    })

    // 添加材料需求
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        const ingredientData: any = {
          recipeId: recipe.id,
          quantity: ingredient.quantity
        }

        if (ingredient.itemId) {
          ingredientData.itemId = ingredient.itemId
        } else if (ingredient.category) {
          ingredientData.category = ingredient.category
        } else if (ingredient.tagId) {
          ingredientData.tagId = ingredient.tagId
        }

        await prisma.recipeIngredient.create({
          data: ingredientData
        })
      }
    }

    // 返回完整配方資訊
    const createdRecipe = await prisma.recipe.findUnique({
      where: { id: recipe.id },
      include: {
        item: true,
        ingredients: {
          include: {
            item: true,
            tag: true
          }
        }
      }
    })

    res.json({
      success: true,
      recipe: {
        ...createdRecipe,
        ingredients: createdRecipe?.ingredients.map(ing => ({
          id: ing.id,
          quantity: ing.quantity,
          item: ing.item ? { id: ing.item.id, name: ing.item.name } : null,
          category: ing.category,
          tag: ing.tag ? { id: ing.tag.id, name: ing.tag.name } : null
        })) || []
      }
    })
  } catch (error: any) {
    console.error('創建配方失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 更新配方
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      skillType,
      skillLevel,
      ingredients
    } = req.body

    // 檢查配方是否存在
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id }
    })

    if (!existingRecipe) {
      res.status(404).json({ success: false, error: '配方不存在' })
      return
    }

    // 更新配方基本資訊
    await prisma.recipe.update({
      where: { id },
      data: {
        skillType,
        skillLevel: skillLevel || 1
      }
    })

    // 更新材料需求
    if (ingredients !== undefined) {
      // 刪除現有材料需求
      await prisma.recipeIngredient.deleteMany({
        where: { recipeId: id }
      })

      // 添加新材料需求
      if (ingredients.length > 0) {
        for (const ingredient of ingredients) {
          const ingredientData: any = {
            recipeId: id,
            quantity: ingredient.quantity
          }

          if (ingredient.itemId) {
            ingredientData.itemId = ingredient.itemId
          } else if (ingredient.category) {
            ingredientData.category = ingredient.category
          } else if (ingredient.tagId) {
            ingredientData.tagId = ingredient.tagId
          }

          await prisma.recipeIngredient.create({
            data: ingredientData
          })
        }
      }
    }

    // 返回更新後的配方資訊
    const updatedRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        item: true,
        ingredients: {
          include: {
            item: true,
            tag: true
          }
        }
      }
    })

    res.json({
      success: true,
      recipe: {
        ...updatedRecipe,
        ingredients: updatedRecipe?.ingredients.map(ing => ({
          id: ing.id,
          quantity: ing.quantity,
          item: ing.item ? { id: ing.item.id, name: ing.item.name } : null,
          category: ing.category,
          tag: ing.tag ? { id: ing.tag.id, name: ing.tag.name } : null
        })) || []
      }
    })
  } catch (error: any) {
    console.error('更新配方失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 刪除配方
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 檢查配方是否存在
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id }
    })

    if (!existingRecipe) {
      res.status(404).json({ success: false, error: '配方不存在' })
      return
    }

    // 刪除配方（會自動刪除相關的材料需求）
    await prisma.recipe.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '配方已刪除'
    })
  } catch (error: any) {
    console.error('刪除配方失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 獲取技能類型列表
export const getSkillTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const skillTypes = [
      'FISHING',
      'WOODCUTTING', 
      'MINING',
      'SMITHING',
      'TAILORING',
      'COOKING',
      'ALCHEMY'
    ]

    res.json({
      success: true,
      skillTypes
    })
  } catch (error: any) {
    console.error('獲取技能類型失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// 獲取材料分類列表
export const getMaterialCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = [
      'FISH',
      'WOOD',
      'METAL',
      'FIBER',
      'HERB',
      'LIVESTOCK'
    ]

    res.json({
      success: true,
      categories
    })
  } catch (error: any) {
    console.error('獲取材料分類失敗:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}