import { PrismaClient } from '@prisma/client'

// 標籤定義
const TAGS = [
  // 魚類標籤
  { name: '油脂', description: '富含油脂的魚類' },
  { name: '近海', description: '近海捕獲的魚類' },
  { name: '電性', description: '具有電性特質的魚類' },
  { name: '深海', description: '深海魚類' },
  { name: '冷水', description: '冷水魚類' },
  { name: '熱域', description: '熱帶水域魚類' },
  { name: '夜行', description: '夜間活動的魚類' },
  
  // 香草標籤
  { name: '清香', description: '清淡香味的香草' },
  { name: '辛辣', description: '辛辣味的香草' },
  { name: '麻', description: '具有麻味的香草' },
  
  // 其他標籤
  { name: '堅韌', description: '堅韌耐用的材料' },
  { name: '柔軟', description: '柔軟的材料' },
  { name: '導電', description: '具有導電性的金屬' },
  { name: '抗腐蝕', description: '抗腐蝕的材料' }
]

// 新的材料物品定義
const MATERIALS = [
  // 魚類
  {
    name: '青花魚',
    description: '常見的近海魚類，富含油脂',
    category: 'FISH',
    rarity: 'COMMON',
    baseValue: 8,
    tags: ['油脂', '近海']
  },
  {
    name: '銀龍魚',
    description: '深海中的神秘魚類，具有電性',
    category: 'FISH',
    rarity: 'UNCOMMON',
    baseValue: 25,
    tags: ['電性', '深海']
  },
  {
    name: '冰鱗鯉',
    description: '生活在冷水中的鯉魚',
    category: 'FISH',
    rarity: 'COMMON',
    baseValue: 12,
    tags: ['冷水']
  },
  {
    name: '火斑鮮',
    description: '熱帶水域的色彩鮮豔魚類',
    category: 'FISH',
    rarity: 'RARE',
    baseValue: 35,
    tags: ['熱域']
  },
  {
    name: '夜梭魚',
    description: '夜間活動的捕食魚類',
    category: 'FISH',
    rarity: 'UNCOMMON',
    baseValue: 18,
    tags: ['夜行']
  },
  {
    name: '月鯉',
    description: '傳說中的月光魚類',
    category: 'FISH',
    rarity: 'EPIC',
    baseValue: 80,
    tags: ['夜行', '冷水']
  },
  
  // 金屬
  {
    name: '銅礦石',
    description: '最基礎的金屬礦石',
    category: 'METAL',
    rarity: 'COMMON',
    baseValue: 5,
    tags: ['導電']
  },
  {
    name: '鐵礦石',
    description: '堅韌的金屬礦石',
    category: 'METAL',
    rarity: 'UNCOMMON',
    baseValue: 15,
    tags: ['堅韌']
  },
  {
    name: '鋼錠',
    description: '經過精煉的高品質鋼材',
    category: 'METAL',
    rarity: 'RARE',
    baseValue: 45,
    tags: ['堅韌', '抗腐蝕']
  },
  
  // 木材
  {
    name: '松木',
    description: '輕盈的針葉樹木材',
    category: 'WOOD',
    rarity: 'COMMON',
    baseValue: 3,
    tags: ['柔軟']
  },
  {
    name: '橡木',
    description: '堅實的硬木材料',
    category: 'WOOD',
    rarity: 'UNCOMMON',
    baseValue: 12,
    tags: ['堅韌']
  },
  {
    name: '竹材',
    description: '輕量而有彈性的竹子',
    category: 'WOOD',
    rarity: 'COMMON',
    baseValue: 4,
    tags: ['柔軟']
  },
  
  // 纖維/皮革
  {
    name: '亞麻',
    description: '天然的植物纖維',
    category: 'FIBER',
    rarity: 'COMMON',
    baseValue: 6,
    tags: ['柔軟']
  },
  {
    name: '棉花',
    description: '柔軟的植物纖維',
    category: 'FIBER',
    rarity: 'COMMON',
    baseValue: 7,
    tags: ['柔軟']
  },
  {
    name: '羊毛',
    description: '溫暖的動物纖維',
    category: 'FIBER',
    rarity: 'UNCOMMON',
    baseValue: 15,
    tags: ['柔軟']
  },
  {
    name: '皮革',
    description: '堅韌的動物皮革',
    category: 'FIBER',
    rarity: 'UNCOMMON',
    baseValue: 20,
    tags: ['堅韌']
  },
  
  // 香草
  {
    name: '羅勒',
    description: '清香的料理香草',
    category: 'HERB',
    rarity: 'COMMON',
    baseValue: 8,
    tags: ['清香']
  },
  {
    name: '薄荷',
    description: '清涼的香草植物',
    category: 'HERB',
    rarity: 'COMMON',
    baseValue: 9,
    tags: ['清香']
  },
  {
    name: '辣椒',
    description: '火辣的香料植物',
    category: 'HERB',
    rarity: 'UNCOMMON',
    baseValue: 12,
    tags: ['辛辣']
  },
  {
    name: '花椒',
    description: '具有麻味的香料',
    category: 'HERB',
    rarity: 'RARE',
    baseValue: 25,
    tags: ['麻', '辛辣']
  },
  
  // 畜牧產品
  {
    name: '雞蛋',
    description: '新鮮的雞蛋',
    category: 'LIVESTOCK',
    rarity: 'COMMON',
    baseValue: 5,
    tags: []
  },
  {
    name: '牛奶',
    description: '新鮮的牛奶',
    category: 'LIVESTOCK',
    rarity: 'COMMON',
    baseValue: 6,
    tags: []
  },
  {
    name: '蜂蜜',
    description: '甜美的蜂蜜',
    category: 'LIVESTOCK',
    rarity: 'UNCOMMON',
    baseValue: 18,
    tags: []
  }
]

// 食物配方範例
const FOOD_RECIPES = [
  {
    name: '香煎魚片',
    description: '用油脂豐富的魚類製作的美味魚片',
    skillType: 'COOKING',
    skillLevel: 1,
    itemType: 'FOOD',
    rarity: 'COMMON',
    baseValue: 25,
    ingredients: [
      { tagName: '油脂', quantity: 1 },  // 需要任何有「油脂」標籤的魚
    ]
  },
  {
    name: '深海魚湯',
    description: '用深海魚類熬製的營養湯品',
    skillType: 'COOKING',
    skillLevel: 2,
    itemType: 'FOOD',
    rarity: 'UNCOMMON',
    baseValue: 45,
    ingredients: [
      { tagName: '深海', quantity: 1 },
      { category: 'HERB', quantity: 1 }  // 需要任何香草
    ]
  },
  {
    name: '蜂蜜蛋糕',
    description: '香甜的蜂蜜蛋糕',
    skillType: 'COOKING',
    skillLevel: 3,
    itemType: 'FOOD',
    rarity: 'RARE',
    baseValue: 60,
    ingredients: [
      { itemName: '蜂蜜', quantity: 1 },
      { itemName: '雞蛋', quantity: 2 }
    ]
  }
]

// 煉金配方範例
const ALCHEMY_RECIPES = [
  {
    name: '基礎治療藥劑',
    description: '恢復少量體力的藥劑',
    skillType: 'ALCHEMY',
    skillLevel: 1,
    itemType: 'POTION',
    rarity: 'COMMON',
    baseValue: 30,
    ingredients: [
      { tagName: '清香', quantity: 2 },  // 需要任何有「清香」標籤的香草
    ]
  },
  {
    name: '電流藥劑',
    description: '增加電擊傷害的藥劑',
    skillType: 'ALCHEMY',
    skillLevel: 3,
    itemType: 'POTION',
    rarity: 'RARE',
    baseValue: 80,
    ingredients: [
      { tagName: '電性', quantity: 1 },  // 需要電性魚類
      { tagName: '辛辣', quantity: 1 }   // 需要辛辣香草
    ]
  }
]

export async function seedMaterialSystem(prisma: PrismaClient) {
  try {
    console.log('🌱 開始種子材料系統...')
    
    // 創建標籤
    console.log('📋 創建標籤...')
    for (const tagData of TAGS) {
      await prisma.tag.upsert({
        where: { name: tagData.name },
        update: {},
        create: tagData
      })
    }
    
    // 創建材料物品
    console.log('🎒 創建材料物品...')
    for (const materialData of MATERIALS) {
      const { tags, ...itemData } = materialData
      
      const item = await prisma.item.upsert({
        where: { name: materialData.name },
        update: {},
        create: {
          name: itemData.name,
          description: itemData.description,
          itemType: 'MATERIAL' as any,
          category: materialData.category as any,
          rarity: itemData.rarity as any,
          baseValue: itemData.baseValue
        }
      })
      
      // 添加標籤關聯
      for (const tagName of tags) {
        const tag = await prisma.tag.findUnique({ where: { name: tagName } })
        if (tag) {
          await prisma.itemTag.upsert({
            where: {
              itemId_tagId: {
                itemId: item.id,
                tagId: tag.id
              }
            },
            update: {},
            create: {
              itemId: item.id,
              tagId: tag.id
            }
          })
        }
      }
    }
    
    // 創建食物配方
    console.log('🍳 創建料理配方...')
    for (const recipeData of FOOD_RECIPES) {
      const { ingredients, skillType, skillLevel, ...itemData } = recipeData
      
      const item = await prisma.item.upsert({
        where: { name: recipeData.name },
        update: {},
        create: {
          name: itemData.name,
          description: itemData.description,
          itemType: itemData.itemType as any,
          rarity: itemData.rarity as any,
          baseValue: itemData.baseValue
        }
      })
      
      const recipe = await prisma.recipe.create({
        data: {
          itemId: item.id,
          skillType: skillType as any,
          skillLevel: skillLevel
        }
      })
      
      // 創建配方成分
      for (const ingredient of ingredients) {
        const ingredientData: any = {
          recipeId: recipe.id,
          quantity: ingredient.quantity
        }
        
        if ('itemName' in ingredient) {
          const ingredientItem = await prisma.item.findUnique({
            where: { name: ingredient.itemName }
          })
          if (ingredientItem) {
            ingredientData.itemId = ingredientItem.id
          }
        } else if ('tagName' in ingredient) {
          const tag = await prisma.tag.findUnique({
            where: { name: ingredient.tagName }
          })
          if (tag) {
            ingredientData.tagId = tag.id
          }
        } else if ('category' in ingredient) {
          ingredientData.category = ingredient.category
        }
        
        await prisma.recipeIngredient.create({
          data: ingredientData
        })
      }
    }
    
    // 創建煉金配方
    console.log('🧪 創建煉金配方...')
    for (const recipeData of ALCHEMY_RECIPES) {
      const { ingredients, skillType, skillLevel, ...itemData } = recipeData
      
      const item = await prisma.item.upsert({
        where: { name: recipeData.name },
        update: {},
        create: {
          name: itemData.name,
          description: itemData.description,
          itemType: itemData.itemType as any,
          rarity: itemData.rarity as any,
          baseValue: itemData.baseValue
        }
      })
      
      const recipe = await prisma.recipe.create({
        data: {
          itemId: item.id,
          skillType: skillType as any,
          skillLevel: skillLevel
        }
      })
      
      // 創建配方成分
      for (const ingredient of ingredients) {
        const ingredientData: any = {
          recipeId: recipe.id,
          quantity: ingredient.quantity
        }
        
        if ('tagName' in ingredient) {
          const tag = await prisma.tag.findUnique({
            where: { name: ingredient.tagName }
          })
          if (tag) {
            ingredientData.tagId = tag.id
          }
        }
        
        await prisma.recipeIngredient.create({
          data: ingredientData
        })
      }
    }
    
    console.log('✅ 材料系統種子完成!')
    
  } catch (error) {
    console.error('❌ 材料系統種子失敗:', error)
    throw error
  }
}