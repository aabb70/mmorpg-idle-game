import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../index.js'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body

    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      res.status(400).json({ message: '用戶名或電子郵件已存在' })
      return
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10)

    // 建立用戶
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    })

    // 為新用戶建立所有技能
    const skillTypes = [
      'MINING', 'LOGGING', 'FISHING', 'FORAGING',
      'SMITHING', 'TAILORING', 'COOKING', 'ALCHEMY', 'CRAFTING'
    ]

    await Promise.all(
      skillTypes.map(skillType =>
        prisma.skill.create({
          data: {
            userId: user.id,
            skillType: skillType as any,
            level: 1,
            experience: 0,
          },
        })
      )
    )

    // 為新用戶創建所有裝備槽位
    const equipmentSlots = [
      'HEAD', 'HANDS', 'CHEST', 'LEGS', 'CLOAK',
      'MINING_TOOL', 'LOGGING_TOOL', 'FISHING_TOOL', 'FORAGING_TOOL',
      'SMITHING_TOOL', 'TAILORING_TOOL', 'COOKING_TOOL', 'ALCHEMY_TOOL', 'CRAFTING_TOOL'
    ]

    await prisma.userEquipment.createMany({
      data: equipmentSlots.map(slot => ({
        userId: user.id,
        slot: slot as any
      }))
    })

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: '註冊成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        experience: user.experience,
        gold: user.gold,
        health: user.health,
        maxHealth: user.maxHealth,
      },
    })
  } catch (error) {
    console.error('註冊錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      res.status(400).json({ message: '用戶名或密碼錯誤' })
      return
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      res.status(400).json({ message: '用戶名或密碼錯誤' })
      return
    }

    // 生成 JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )

    res.json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        experience: user.experience,
        gold: user.gold,
        health: user.health,
        maxHealth: user.maxHealth,
      },
    })
  } catch (error) {
    console.error('登入錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 計算用戶裝備屬性加成的輔助函數
async function calculateEquipmentBonuses(userId: string) {
  const equipments = await prisma.userEquipment.findMany({
    where: { 
      userId,
      itemId: { not: null }
    },
    include: {
      item: true
    }
  })

  let bonuses = {
    attackBonus: 0,
    defenseBonus: 0,
    healthBonus: 0,
    skillBonuses: {} as Record<string, number>
  }

  equipments.forEach(equipment => {
    if (equipment.item) {
      bonuses.attackBonus += equipment.item.attackBonus
      bonuses.defenseBonus += equipment.item.defenseBonus
      bonuses.healthBonus += equipment.item.healthBonus
      
      // 處理技能等級加成
      if (equipment.item.skillLevelBonus > 0 && equipment.item.requiredSkill) {
        const skillKey = equipment.item.requiredSkill
        bonuses.skillBonuses[skillKey] = (bonuses.skillBonuses[skillKey] || 0) + equipment.item.skillLevelBonus
      }
    }
  })

  return bonuses
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: true,
        inventory: {
          include: {
            item: {
              include: {
                tags: {
                  include: {
                    tag: true
                  }
                }
              }
            },
          },
        },
      },
    })

    if (!user) {
      res.status(404).json({ message: '用戶不存在' })
      return
    }

    // 計算裝備加成
    const equipmentBonuses = await calculateEquipmentBonuses(userId)

    // 應用裝備加成到用戶屬性
    const enhancedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level,
      experience: user.experience,
      gold: user.gold,
      health: user.health,
      maxHealth: user.maxHealth + equipmentBonuses.healthBonus, // 裝備可以增加最大生命值
      // 添加計算後的屬性
      effectiveAttack: equipmentBonuses.attackBonus,
      effectiveDefense: equipmentBonuses.defenseBonus,
      equipmentBonuses
    }

    // 應用技能等級加成到技能
    const enhancedSkills = user.skills.map(skill => ({
      ...skill,
      effectiveLevel: skill.level + (equipmentBonuses.skillBonuses[skill.skillType] || 0)
    }))

    res.json({
      user: enhancedUser,
      skills: enhancedSkills,
      inventory: user.inventory.map((item: any) => ({
        id: item.item.id,
        name: item.item.name,
        description: item.item.description,
        quantity: item.quantity,
        itemType: item.item.itemType,
        category: item.item.category,
        rarity: item.item.rarity,
        baseValue: item.item.baseValue,
        healthRestore: item.item.healthRestore,
        equipmentSlot: item.item.equipmentSlot,
        attackBonus: item.item.attackBonus,
        defenseBonus: item.item.defenseBonus,
        healthBonus: item.item.healthBonus,
        skillLevelBonus: item.item.skillLevelBonus,
        tags: item.item.tags.map((t: any) => ({ name: t.tag.name, description: t.tag.description })),
      })),
    })
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}