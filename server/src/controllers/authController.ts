import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../index.js'

export const register = async (req: Request, res: Response) => {
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
      return res.status(400).json({ message: '用戶名或電子郵件已存在' })
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
      },
    })
  } catch (error) {
    console.error('註冊錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res.status(400).json({ message: '用戶名或密碼錯誤' })
    }

    // 驗證密碼
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ message: '用戶名或密碼錯誤' })
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
      },
    })
  } catch (error) {
    console.error('登入錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: true,
        inventory: {
          include: {
            item: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: '用戶不存在' })
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        experience: user.experience,
        gold: user.gold,
      },
      skills: user.skills,
      inventory: user.inventory.map(item => ({
        id: item.item.id,
        name: item.item.name,
        quantity: item.quantity,
        itemType: item.item.itemType,
        rarity: item.item.rarity,
      })),
    })
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}