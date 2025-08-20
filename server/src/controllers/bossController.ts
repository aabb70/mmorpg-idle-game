import { Request, Response } from 'express'
import { prisma } from '../index.js'

// 計算攻擊傷害
function calculateDamage(
  playerLevel: number,
  skillLevel: number,
  skillType: string,
  bossWeaknesses: string[],
  bossDefense: number
): { damage: number, isCritical: boolean } {
  // 基礎傷害 = 技能等級 * 玩家等級
  let baseDamage = skillLevel * playerLevel * 5
  
  // 弱點加成（如果使用的技能是 Boss 的弱點）
  const weaknessMultiplier = bossWeaknesses.includes(skillType) ? 1.5 : 1.0
  
  // 隨機因子 (80% - 120%)
  const randomFactor = 0.8 + Math.random() * 0.4
  
  // 暴擊檢查 (10% 暴擊率)
  const isCritical = Math.random() < 0.1
  const criticalMultiplier = isCritical ? 2.0 : 1.0
  
  // 最終傷害計算
  let finalDamage = baseDamage * weaknessMultiplier * randomFactor * criticalMultiplier
  
  // 防禦減免 (最多減免 50%)
  const defenseReduction = Math.min(bossDefense / (bossDefense + 100), 0.5)
  finalDamage *= (1 - defenseReduction)
  
  return {
    damage: Math.floor(finalDamage),
    isCritical
  }
}

// 獲取當前活躍的 Boss
export const getCurrentBoss = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date()
    
    // 查找當前活躍的 Boss 實例
    let activeBossInstance = await prisma.bossInstance.findFirst({
      where: {
        isActive: true,
        endTime: { gte: now }
      },
      include: {
        boss: true,
        actions: {
          include: {
            user: {
              select: {
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50 // 最近50條攻擊記錄
        }
      }
    })
    
    // 如果沒有活躍的 Boss，創建一個新的
    if (!activeBossInstance) {
      // 隨機選擇一個 Boss 模板
      const bosses = await prisma.boss.findMany()
      if (bosses.length === 0) {
        res.status(404).json({ message: '沒有可用的 Boss' })
        return
      }
      
      const randomBoss = bosses[Math.floor(Math.random() * bosses.length)]
      const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24小時後
      
      activeBossInstance = await prisma.bossInstance.create({
        data: {
          bossId: randomBoss.id,
          currentHealth: randomBoss.maxHealth,
          endTime,
        },
        include: {
          boss: true,
          actions: {
            include: {
              user: {
                select: {
                  username: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
          }
        }
      })
    }
    
    // 計算傷害排行榜
    const damageLeaderboard = await prisma.bossAction.groupBy({
      by: ['userId'],
      where: {
        bossInstanceId: activeBossInstance.id
      },
      _sum: {
        damage: true
      },
      orderBy: {
        _sum: {
          damage: 'desc'
        }
      },
      take: 10
    })
    
    // 獲取排行榜玩家信息
    const leaderboardWithUsers = await Promise.all(
      damageLeaderboard.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: { username: true, level: true }
        })
        return {
          userId: entry.userId,
          username: user?.username || '未知玩家',
          level: user?.level || 1,
          totalDamage: entry._sum.damage || 0
        }
      })
    )
    
    res.json({
      bossInstance: activeBossInstance,
      damageLeaderboard: leaderboardWithUsers,
      timeRemaining: Math.max(0, activeBossInstance.endTime.getTime() - now.getTime())
    })
  } catch (error) {
    console.error('獲取當前 Boss 錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 攻擊 Boss
export const attackBoss = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId
    const { skillType } = req.body
    
    if (!skillType) {
      res.status(400).json({ message: '必須指定使用的技能' })
      return
    }
    
    // 檢查技能是否有效
    const validSkills = ['MINING', 'LOGGING', 'FISHING', 'FORAGING', 'SMITHING', 'TAILORING', 'COOKING', 'ALCHEMY', 'CRAFTING']
    if (!validSkills.includes(skillType)) {
      res.status(400).json({ message: '無效的技能類型' })
      return
    }
    
    const now = new Date()
    
    // 獲取用戶信息和技能等級
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          where: { skillType: skillType as any }
        }
      }
    })
    
    if (!user) {
      res.status(404).json({ message: '用戶不存在' })
      return
    }
    
    const skill = user.skills[0]
    if (!skill) {
      res.status(400).json({ message: '你還沒有學會這個技能' })
      return
    }
    
    // 檢查玩家生命值
    if (user.health <= 0) {
      res.status(400).json({ message: '生命值不足，無法戰鬥！請先恢復生命值' })
      return
    }
    
    // 檢查攻擊冷卻時間 (5分鐘)
    const lastAction = await prisma.bossAction.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    
    if (lastAction) {
      const cooldownTime = 5 * 60 * 1000 // 5分鐘
      const timeSinceLastAction = now.getTime() - lastAction.createdAt.getTime()
      if (timeSinceLastAction < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - timeSinceLastAction) / 1000)
        res.status(429).json({ 
          message: `攻擊冷卻中，請等待 ${remainingTime} 秒`,
          remainingCooldown: remainingTime
        })
        return
      }
    }
    
    // 獲取當前活躍的 Boss
    const activeBossInstance = await prisma.bossInstance.findFirst({
      where: {
        isActive: true,
        endTime: { gte: now }
      },
      include: {
        boss: true
      }
    })
    
    if (!activeBossInstance) {
      res.status(404).json({ message: '當前沒有活躍的 Boss' })
      return
    }
    
    if (activeBossInstance.isDefeated) {
      res.status(400).json({ message: '這個 Boss 已經被擊敗了' })
      return
    }
    
    // 計算傷害
    const { damage, isCritical } = calculateDamage(
      user.level,
      skill.level,
      skillType,
      activeBossInstance.boss.weaknessSkills,
      activeBossInstance.boss.defense
    )
    
    // 戰鬥造成的生命值損失 (10-20%)
    const healthLoss = Math.floor(user.maxHealth * (0.1 + Math.random() * 0.1))
    const newHealth = Math.max(0, user.health - healthLoss)
    
    await prisma.$transaction(async (tx) => {
      // 記錄攻擊
      await tx.bossAction.create({
        data: {
          bossInstanceId: activeBossInstance.id,
          userId,
          damage,
          skillUsed: skillType as any,
          isCritical,
          playerLevel: user.level,
          skillLevel: skill.level
        }
      })
      
      // 更新玩家生命值
      await tx.user.update({
        where: { id: userId },
        data: { health: newHealth }
      })
      
      // 更新 Boss 血量
      const newBossHealth = Math.max(0, activeBossInstance.currentHealth - damage)
      const isDefeated = newBossHealth === 0
      
      await tx.bossInstance.update({
        where: { id: activeBossInstance.id },
        data: {
          currentHealth: newBossHealth,
          isDefeated,
          defeatedBy: isDefeated ? userId : undefined,
          defeatedAt: isDefeated ? now : undefined
        }
      })
      
      // 如果 Boss 被擊敗，分發獎勵
      if (isDefeated) {
        // 獲取所有參與者的傷害統計
        const participants = await tx.bossAction.groupBy({
          by: ['userId'],
          where: {
            bossInstanceId: activeBossInstance.id
          },
          _sum: {
            damage: true
          }
        })
        
        const totalDamage = participants.reduce((sum, p) => sum + (p._sum.damage || 0), 0)
        
        // 分發獎勵給所有參與者
        for (const participant of participants) {
          const damageContribution = (participant._sum.damage || 0) / totalDamage
          const goldReward = Math.floor(activeBossInstance.boss.goldReward * damageContribution)
          const expReward = Math.floor(activeBossInstance.boss.expReward * damageContribution)
          
          // 擊殺者獲得額外獎勵
          const isKiller = participant.userId === userId
          const bonusGold = isKiller ? Math.floor(activeBossInstance.boss.goldReward * 0.2) : 0
          const bonusExp = isKiller ? Math.floor(activeBossInstance.boss.expReward * 0.2) : 0
          
          await tx.user.update({
            where: { id: participant.userId },
            data: {
              gold: { increment: goldReward + bonusGold },
              experience: { increment: expReward + bonusExp }
            }
          })
        }
      }
    })
    
    res.json({
      success: true,
      damage,
      isCritical,
      healthLoss,
      newHealth,
      bossDefeated: activeBossInstance.currentHealth - damage <= 0,
      message: isCritical ? '暴擊！' : '攻擊成功！'
    })
  } catch (error) {
    console.error('攻擊 Boss 錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}

// 獲取 Boss 戰鬥歷史
export const getBossHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    
    const bossInstances = await prisma.bossInstance.findMany({
      where: {
        isDefeated: true
      },
      include: {
        boss: true,
        _count: {
          select: {
            actions: true
          }
        }
      },
      orderBy: { defeatedAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum
    })
    
    const total = await prisma.bossInstance.count({
      where: {
        isDefeated: true
      }
    })
    
    res.json({
      bossHistory: bossInstances,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('獲取 Boss 歷史錯誤:', error)
    res.status(500).json({ message: '服務器錯誤' })
  }
}