// 物品圖標映射系統
interface IconMapping {
  [key: string]: string
}

// 基於物品類型的圖標映射
const typeIconMapping: IconMapping = {
  // 採礦相關
  'MATERIAL_MINING': 'stone-pile',
  'ORE': 'ore',
  'METAL': 'metal-bar',
  'GEM': 'gem',
  'COAL': 'coal',
  'STONE': 'stone-pile',
  
  // 伐木相關
  'MATERIAL_LOGGING': 'wood-pile',
  'WOOD': 'wood-pile',
  'LOG': 'log',
  'PLANK': 'wood-beam',
  
  // 釣魚相關
  'MATERIAL_FISHING': 'fish',
  'FISH': 'fish',
  'SEAFOOD': 'shrimp',
  'WATER_PLANT': 'seaweed',
  
  // 採集相關
  'MATERIAL_FORAGING': 'berries-bowl',
  'HERB': 'berry',
  'FRUIT': 'cherry',
  'FLOWER': 'flower',
  'MUSHROOM': 'mushrooms',
  'SEED': 'acorn',
  
  // 工藝品
  'CRAFTED': 'gear',
  'TOOL': 'hammer',
  'WEAPON': 'sword',
  'ARMOR': 'chest-armor',
  'ACCESSORY': 'ring',
  
  // 食物
  'FOOD': 'meal',
  'DRINK': 'bottle-vapors',
  'POTION': 'round-potion',
  'INGREDIENT': 'powder',
  
  // 其他
  'CURRENCY': 'coins',
  'BOOK': 'book-cover',
  'SCROLL': 'scroll-unfurled',
  'KEY': 'key',
  'MISC': 'package'
}

// 基於物品名稱的特殊映射（優先級更高）
const nameIconMapping: IconMapping = {
  // ========== 採礦類 ==========
  // 礦石
  '銅礦石': 'ore',
  '鐵礦石': 'metal-bar',
  '金礦石': 'gold-bar',
  '銀礦石': 'silver-ingot',
  '鉛礦石': 'lead-ingot',
  '錫礦石': 'tin-ingot',
  '鋅礦石': 'zinc-ingot',
  '鑽石原石': 'rough-diamond',
  '寶石原石': 'gem-pendant',
  '煤炭': 'coal',
  '石頭': 'stone-pile',
  '大理石': 'marble',
  '花崗岩': 'stone-crafting',
  '水晶': 'crystal-cluster',
  '紫水晶': 'amethyst',
  '翡翠': 'emerald',
  '紅寶石': 'ruby',
  '藍寶石': 'sapphire',
  
  // 精煉金屬
  '銅錠': 'copper-ingot',
  '鐵錠': 'iron-ingot',
  '金錠': 'gold-ingot',
  '銀錠': 'silver-ingot',
  '鋼錠': 'steel-ingot',
  '秘銀錠': 'mithril',
  '精金錠': 'adamantium',
  
  // ========== 伐木類 ==========
  // 原木
  '橡木': 'oak',
  '松木': 'pine-tree',
  '杉木': 'cedar',
  '樺木': 'birch',
  '柳木': 'willow',
  '楓木': 'maple-leaf',
  '竹子': 'bamboo',
  '魔法木': 'magic-tree',
  '古樹之心': 'tree-face',
  
  // 加工木材
  '木板': 'wood-beam',
  '橡木板': 'wood-pile',
  '松木板': 'lumber',
  '精製木板': 'wooden-sign',
  '魔法木板': 'magic-palm',
  
  // ========== 釣魚類 ==========
  // 淡水魚
  '鯉魚': 'fish',
  '鯽魚': 'fish-escape',
  '鱒魚': 'fish-smoking',
  '鯰魚': 'catfish',
  '鰻魚': 'eel',
  '黑魚': 'piranha',
  
  // 海水魚
  '鮭魚': 'salmon',
  '鯊魚': 'shark-jaws',
  '金槍魚': 'swordfish',
  '比目魚': 'flat-fish',
  '章魚': 'octopus',
  '魷魚': 'squid',
  
  // 甲殼類
  '螃蟹': 'crab',
  '龍蝦': 'lobster',
  '蝦子': 'shrimp',
  '扇貝': 'clam',
  '牡蠣': 'oyster',
  
  // 水生植物
  '海藻': 'seaweed',
  '海帶': 'kelp',
  '珊瑚': 'coral',
  '水草': 'water-lily',
  
  // ========== 採集類 ==========
  // 水果
  '蘋果': 'apple',
  '梨子': 'pear',
  '桃子': 'peach',
  '橘子': 'orange',
  '檸檬': 'lemon',
  '葡萄': 'grapes',
  '莓果': 'berries-bowl',
  '草莓': 'strawberry',
  '櫻桃': 'cherry',
  '椰子': 'coconut',
  '香蕉': 'banana',
  
  // 蔬菜
  '胡蘿蔔': 'carrot',
  '洋蔥': 'onion',
  '馬鈴薯': 'potato',
  '番茄': 'tomato',
  '辣椒': 'chili-pepper',
  '大蒜': 'garlic',
  '白菜': 'cabbage',
  '小麦': 'wheat',
  '玉米': 'corn',
  '稻米': 'rice',
  
  // 藥草花卉
  '藥草': 'herb-bundle',
  '薄荷': 'mint-leaves',
  '薰衣草': 'lavender',
  '玫瑰': 'rose',
  '向日葵': 'sunflower',
  '鬱金香': 'tulip',
  '蒲公英': 'dandelion',
  '人參': 'ginseng',
  '靈芝': 'mushroom-gills',
  
  // 菌類
  '蘑菇': 'mushroom',
  '香菇': 'shiitake',
  '松露': 'truffle',
  '毒蘑菇': 'death-cap-mushroom',
  
  // 其他採集品
  '種子': 'acorn',
  '樹脂': 'amber',
  '蜂蜜': 'honey-pot',
  '蜂蠟': 'honeycomb',
  '羽毛': 'feather',
  '獸皮': 'leather',
  '獸骨': 'bone',
  '鹿角': 'antlers',
  
  // ========== 武器類 ==========
  // 劍類
  '短劍': 'stiletto',
  '長劍': 'sword',
  '巨劍': 'two-handed-sword',
  '彎刀': 'scimitar',
  '軍刀': 'cavalry-sabre',
  '西洋劍': 'rapier',
  '聖劍': 'holy-sword',
  '魔劍': 'flame-sword',
  '寶劍': 'jeweled-chalice',
  
  // 刀類
  '小刀': 'knife',
  '匕首': 'dagger',
  '戰刀': 'katana',
  '砍刀': 'machete',
  '忍者刀': 'ninja-sword',
  
  // 斧類
  '手斧': 'hand-axe',
  '戰斧': 'war-axe',
  '巨斧': 'battle-axe',
  '雙刃斧': 'double-sided-axe',
  
  // 錘類
  '錘子': 'hammer',
  '戰錘': 'war-hammer',
  '巨錘': 'sledge-hammer',
  '聖錘': 'thor-hammer',
  
  // 長柄武器
  '長槍': 'spear-head',
  '戟': 'halberd',
  '三叉戟': 'trident',
  '薙刀': 'naginata',
  '長棍': 'bo',
  
  // 遠程武器
  '弓': 'bow',
  '十字弓': 'crossbow',
  '複合弓': 'recurve-bow',
  '魔法弓': 'elven-bow',
  '箭矢': 'arrow',
  '弩箭': 'crossbow-bolt',
  
  // 魔法武器
  '法杖': 'wizard-staff',
  '魔杖': 'wand',
  '水晶球': 'crystal-ball',
  '符文石': 'rune-stone',
  '魔法書': 'spell-book',
  
  // ========== 防具類 ==========
  // 頭盔
  '頭盔': 'helmet',
  '皮帽': 'leather-cap',
  '鐵盔': 'iron-helmet',
  '騎士頭盔': 'knight-helmet',
  '王冠': 'crown',
  '魔法帽': 'wizard-hat',
  
  // 胸甲
  '皮甲': 'leather-armor',
  '鏈甲': 'chain-mail',
  '板甲': 'plate-armor',
  '騎士甲': 'knight-armor',
  '法袍': 'robe',
  '斗篷': 'cloak',
  
  // 護腿
  '皮褲': 'leather-pants',
  '鐵護腿': 'leg-armor',
  '戰裙': 'kilt',
  
  // 鞋靴
  '皮靴': 'leather-boot',
  '鐵靴': 'armored-boot',
  '魔法靴': 'winged-boot',
  '長靴': 'high-boot',
  
  // 盾牌
  '小盾': 'round-shield',
  '塔盾': 'tower-shield',
  '騎士盾': 'knight-banner',
  '魔法盾': 'magic-shield',
  
  // 手套
  '皮手套': 'leather-glove',
  '鐵手套': 'gauntlet',
  '魔法手套': 'magic-glove',
  
  // ========== 飾品類 ==========
  '戒指': 'ring',
  '項鍊': 'necklace',
  '手鐲': 'bracelet',
  '耳環': 'earrings',
  '胸針': 'brooch',
  '護身符': 'amulet',
  '徽章': 'medal',
  '印章': 'signet-ring',
  
  // ========== 食物飲料類 ==========
  // 主食
  '麵包': 'bread-slice',
  '白米飯': 'rice-bowl',
  '麵條': 'noodles',
  '餃子': 'dumpling',
  '包子': 'steamed-bun',
  '餅乾': 'cookie',
  '蛋糕': 'cake-slice',
  
  // 肉類
  '烤肉': 'meat',
  '牛排': 'steak',
  '雞腿': 'chicken-leg',
  '魚排': 'fish-cooked',
  '香腸': 'sausage',
  '培根': 'bacon',
  
  // 湯品
  '湯': 'soup',
  '燉菜': 'meal',
  '粥': 'porridge',
  '火鍋': 'hot-pot',
  
  // 飲料
  '水': 'water-drop',
  '果汁': 'juice',
  '茶': 'tea-pot',
  '咖啡': 'coffee-mug',
  '啤酒': 'beer-stein',
  '紅酒': 'wine-bottle',
  '烈酒': 'whiskey-bottle',
  
  // ========== 藥劑類 ==========
  '治療藥水': 'health-potion',
  '魔力藥水': 'mana-potion',
  '力量藥水': 'strength-potion',
  '敏捷藥水': 'agility-potion',
  '智力藥水': 'intelligence-potion',
  '解毒劑': 'antidote',
  '萬能藥': 'elixir',
  '複活藥': 'resurrection',
  
  // ========== 工具類 ==========
  '鎬子': 'mining',
  '斧頭': 'wood-axe',
  '鋸子': 'hand-saw',
  '鐮刀': 'scythe',
  '鍬子': 'spade',
  '釣竿': 'fishing-pole',
  '網子': 'fishing-net',
  '剪刀': 'scissors',
  '針線': 'sewing-needle',
  '鐵鎚': 'claw-hammer',
  '扳手': 'spanner',
  '鉗子': 'pliers',
  
  // ========== 材料類 ==========
  '布料': 'textile',
  '絲綢': 'silk',
  '麻布': 'hemp',
  '棉花': 'cotton',
  '羊毛': 'wool',
  '線': 'thread',
  '繩子': 'rope',
  '鐵釘': 'nail',
  '螺絲': 'screw',
  '膠水': 'glue',
  '油漆': 'paint-brush',
  
  // ========== 寶物類 ==========
  '寶箱': 'treasure-chest',
  '金幣': 'coins',
  '銀幣': 'silver-coin',
  '寶石': 'gem',
  '珍珠': 'pearl',
  '古董': 'vintage-robot',
  '文物': 'scroll-quill',
  '地圖': 'treasure-map',
  '鑰匙': 'key',
  '鎖': 'padlock',
  
  // ========== 魔法物品類 ==========
  '魔法石': 'power-crystal',
  '符文': 'rune-sword',
  '卷軸': 'scroll-unfurled',
  '魔法卷軸': 'magic-scroll',
  '傳送卷軸': 'teleport',
  '召喚石': 'summoning',
  '靈魂石': 'soul-vessel',
  '生命石': 'heart-bottle',
  '魔法粉': 'powder',
  
  // ========== 其他雜項 ==========
  '容器': 'bottle-vapors',
  '箱子': 'wooden-crate',
  '袋子': 'sack',
  '瓶子': 'round-bottom-flask',
  '罐子': 'amphora',
  '桶子': 'barrel',
  '籃子': 'basket',
  '書': 'book-cover',
  '筆記本': 'notebook',
  '羽毛筆': 'quill-ink',
  '墨水': 'ink-bottle',
  '蠟燭': 'candle-flame',
  '燈籠': 'lantern',
  '火把': 'torch',
  '鏡子': 'mirror',
  '時鐘': 'clock',
  '沙漏': 'hourglass',
  '鈴鐺': 'bell',
  '號角': 'horn-call',
  '旗幟': 'flag',
  '帳篷': 'camping-tent',
  '毯子': 'wool',
  '枕頭': 'pillow'
}

// 獲取物品圖標名稱
export const getItemIcon = (itemName: string, itemType?: string, category?: string): string => {
  // 1. 優先檢查名稱映射
  if (nameIconMapping[itemName]) {
    return nameIconMapping[itemName]
  }
  
  // 2. 檢查類型映射
  if (itemType && typeIconMapping[itemType]) {
    return typeIconMapping[itemType]
  }
  
  // 3. 檢查類別映射
  if (category && typeIconMapping[category]) {
    return typeIconMapping[category]
  }
  
  // 4. 智能關鍵字匹配算法
  const name = itemName.toLowerCase()
  
  // 採礦相關
  if (name.includes('礦石') || name.includes('原石')) return 'ore'
  if (name.includes('礦')) return 'mining'
  if (name.includes('錠') || name.includes('金屬')) return 'metal-bar'
  if (name.includes('石') || name.includes('岩') || name.includes('磚')) return 'stone-pile'
  if (name.includes('水晶') || name.includes('晶')) return 'crystal-cluster'
  if (name.includes('寶石') || name.includes('鑽石') || name.includes('珠寶')) return 'gem'
  if (name.includes('煤')) return 'coal'
  
  // 伐木相關
  if (name.includes('木材') || name.includes('原木') || name.includes('樹') || name.includes('竹')) return 'wood-pile'
  if (name.includes('木板') || name.includes('板材')) return 'wood-beam'
  if (name.includes('木')) return 'oak'
  if (name.includes('樹脂') || name.includes('琥珀')) return 'amber'
  
  // 釣魚相關 - 更細緻的魚類識別
  if (name.includes('鯉') || name.includes('鯽') || name.includes('鱒') || name.includes('黑魚')) return 'fish'
  if (name.includes('鮭') || name.includes('金槍') || name.includes('比目')) return 'salmon'
  if (name.includes('鯊')) return 'shark-jaws'
  if (name.includes('章魚') || name.includes('八爪')) return 'octopus'
  if (name.includes('魷魚') || name.includes('烏賊')) return 'squid'
  if (name.includes('螃蟹') || name.includes('蟹')) return 'crab'
  if (name.includes('龍蝦')) return 'lobster'
  if (name.includes('蝦')) return 'shrimp'
  if (name.includes('魚')) return 'fish'
  if (name.includes('海藻') || name.includes('海帶') || name.includes('水草')) return 'seaweed'
  if (name.includes('珊瑚')) return 'coral'
  if (name.includes('貝') || name.includes('扇貝') || name.includes('牡蠣')) return 'clam'
  
  // 採集相關 - 水果蔬菜
  if (name.includes('蘋果')) return 'apple'
  if (name.includes('梨')) return 'pear'
  if (name.includes('桃')) return 'peach'
  if (name.includes('橘') || name.includes('柑')) return 'orange'
  if (name.includes('檸檬')) return 'lemon'
  if (name.includes('葡萄')) return 'grapes'
  if (name.includes('莓') || name.includes('漿果')) return 'berries-bowl'
  if (name.includes('草莓')) return 'strawberry'
  if (name.includes('櫻桃') || name.includes('櫻')) return 'cherry'
  if (name.includes('椰子')) return 'coconut'
  if (name.includes('香蕉')) return 'banana'
  if (name.includes('胡蘿蔔') || name.includes('蘿蔔')) return 'carrot'
  if (name.includes('洋蔥') || name.includes('蔥')) return 'onion'
  if (name.includes('馬鈴薯') || name.includes('薯')) return 'potato'
  if (name.includes('番茄') || name.includes('西紅柿')) return 'tomato'
  if (name.includes('辣椒') || name.includes('椒')) return 'chili-pepper'
  if (name.includes('蒜') || name.includes('大蒜')) return 'garlic'
  if (name.includes('白菜') || name.includes('高麗菜') || name.includes('包菜')) return 'cabbage'
  if (name.includes('小麥') || name.includes('麥')) return 'wheat'
  if (name.includes('玉米') || name.includes('苞米')) return 'corn'
  if (name.includes('稻') || name.includes('米')) return 'rice'
  
  // 花卉藥草
  if (name.includes('藥草') || name.includes('草藥')) return 'herb-bundle'
  if (name.includes('薄荷')) return 'mint-leaves'
  if (name.includes('薰衣草')) return 'lavender'
  if (name.includes('玫瑰')) return 'rose'
  if (name.includes('向日葵')) return 'sunflower'
  if (name.includes('鬱金香')) return 'tulip'
  if (name.includes('蒲公英')) return 'dandelion'
  if (name.includes('人參')) return 'ginseng'
  if (name.includes('靈芝')) return 'mushroom-gills'
  if (name.includes('花')) return 'flower'
  if (name.includes('草') && !name.includes('草莓')) return 'berry'
  
  // 菌類
  if (name.includes('蘑菇') || name.includes('菇')) return 'mushroom'
  if (name.includes('香菇')) return 'shiitake'
  if (name.includes('松露')) return 'truffle'
  if (name.includes('毒蘑菇') || name.includes('毒菇')) return 'death-cap-mushroom'
  
  // 其他採集品
  if (name.includes('種子') || name.includes('果實')) return 'acorn'
  if (name.includes('蜂蜜') || name.includes('蜜')) return 'honey-pot'
  if (name.includes('蜂蠟')) return 'honeycomb'
  if (name.includes('羽毛')) return 'feather'
  if (name.includes('皮') || name.includes('獸皮')) return 'leather'
  if (name.includes('骨') || name.includes('獸骨')) return 'bone'
  if (name.includes('角') || name.includes('鹿角')) return 'antlers'
  
  // 武器相關 - 劍類
  if (name.includes('短劍')) return 'stiletto'
  if (name.includes('長劍')) return 'sword'
  if (name.includes('巨劍') || name.includes('雙手劍')) return 'two-handed-sword'
  if (name.includes('彎刀')) return 'scimitar'
  if (name.includes('軍刀')) return 'cavalry-sabre'
  if (name.includes('西洋劍')) return 'rapier'
  if (name.includes('聖劍')) return 'holy-sword'
  if (name.includes('魔劍') || name.includes('火劍')) return 'flame-sword'
  if (name.includes('寶劍')) return 'jeweled-chalice'
  if (name.includes('劍')) return 'sword'
  
  // 刀類
  if (name.includes('小刀')) return 'knife'
  if (name.includes('匕首')) return 'dagger'
  if (name.includes('戰刀') || name.includes('武士刀')) return 'katana'
  if (name.includes('砍刀')) return 'machete'
  if (name.includes('忍者刀')) return 'ninja-sword'
  if (name.includes('刀')) return 'katana'
  
  // 斧類
  if (name.includes('手斧')) return 'hand-axe'
  if (name.includes('戰斧')) return 'war-axe'
  if (name.includes('巨斧')) return 'battle-axe'
  if (name.includes('雙刃斧')) return 'double-sided-axe'
  if (name.includes('斧')) return 'war-axe'
  
  // 錘類
  if (name.includes('戰錘')) return 'war-hammer'
  if (name.includes('巨錘')) return 'sledge-hammer'
  if (name.includes('聖錘')) return 'thor-hammer'
  if (name.includes('錘')) return 'hammer'
  
  // 長柄武器
  if (name.includes('長槍') || name.includes('矛')) return 'spear-head'
  if (name.includes('戟')) return 'halberd'
  if (name.includes('三叉戟')) return 'trident'
  if (name.includes('薙刀')) return 'naginata'
  if (name.includes('棍') || name.includes('棒')) return 'bo'
  if (name.includes('槍')) return 'spear-head'
  
  // 遠程武器
  if (name.includes('十字弓') || name.includes('弩')) return 'crossbow'
  if (name.includes('複合弓')) return 'recurve-bow'
  if (name.includes('魔法弓')) return 'elven-bow'
  if (name.includes('弓')) return 'bow'
  if (name.includes('箭')) return 'arrow'
  
  // 魔法武器
  if (name.includes('法杖') || name.includes('權杖')) return 'wizard-staff'
  if (name.includes('魔杖') || name.includes('法棒')) return 'wand'
  if (name.includes('水晶球')) return 'crystal-ball'
  if (name.includes('符文石')) return 'rune-stone'
  
  // 防具相關 - 頭盔
  if (name.includes('皮帽') || name.includes('皮盔')) return 'leather-cap'
  if (name.includes('鐵盔')) return 'iron-helmet'
  if (name.includes('騎士頭盔') || name.includes('騎士盔')) return 'knight-helmet'
  if (name.includes('王冠') || name.includes('皇冠')) return 'crown'
  if (name.includes('魔法帽')) return 'wizard-hat'
  if (name.includes('頭盔') || name.includes('盔')) return 'helmet'
  if (name.includes('帽')) return 'leather-cap'
  
  // 胸甲
  if (name.includes('皮甲')) return 'leather-armor'
  if (name.includes('鏈甲')) return 'chain-mail'
  if (name.includes('板甲')) return 'plate-armor'
  if (name.includes('騎士甲')) return 'knight-armor'
  if (name.includes('法袍')) return 'robe'
  if (name.includes('斗篷')) return 'cloak'
  if (name.includes('甲')) return 'leather-armor'
  if (name.includes('袍')) return 'robe'
  
  // 護腿
  if (name.includes('皮褲')) return 'leather-pants'
  if (name.includes('護腿')) return 'leg-armor'
  if (name.includes('戰裙')) return 'kilt'
  
  // 鞋靴
  if (name.includes('皮靴')) return 'leather-boot'
  if (name.includes('鐵靴')) return 'armored-boot'
  if (name.includes('魔法靴')) return 'winged-boot'
  if (name.includes('長靴')) return 'high-boot'
  if (name.includes('靴') || name.includes('鞋')) return 'leather-boot'
  
  // 盾牌
  if (name.includes('小盾') || name.includes('圓盾')) return 'round-shield'
  if (name.includes('塔盾') || name.includes('大盾')) return 'tower-shield'
  if (name.includes('騎士盾')) return 'knight-banner'
  if (name.includes('魔法盾')) return 'magic-shield'
  if (name.includes('盾')) return 'round-shield'
  
  // 手套
  if (name.includes('皮手套')) return 'leather-glove'
  if (name.includes('鐵手套') || name.includes('護手')) return 'gauntlet'
  if (name.includes('魔法手套')) return 'magic-glove'
  if (name.includes('手套')) return 'leather-glove'
  
  // 飾品
  if (name.includes('戒指') || name.includes('指環')) return 'ring'
  if (name.includes('項鍊') || name.includes('頸鍊')) return 'necklace'
  if (name.includes('手鐲') || name.includes('手環')) return 'bracelet'
  if (name.includes('耳環') || name.includes('耳飾')) return 'earrings'
  if (name.includes('胸針')) return 'brooch'
  if (name.includes('護身符') || name.includes('符咒')) return 'amulet'
  if (name.includes('徽章') || name.includes('勳章')) return 'medal'
  if (name.includes('印章')) return 'signet-ring'
  
  // 食物相關
  if (name.includes('麵包') || name.includes('面包')) return 'bread-slice'
  if (name.includes('米飯') || name.includes('飯')) return 'rice-bowl'
  if (name.includes('麵條') || name.includes('面條') || name.includes('麵')) return 'noodles'
  if (name.includes('餃子')) return 'dumpling'
  if (name.includes('包子')) return 'steamed-bun'
  if (name.includes('餅乾') || name.includes('餅干')) return 'cookie'
  if (name.includes('蛋糕')) return 'cake-slice'
  if (name.includes('烤肉') || name.includes('肉')) return 'meat'
  if (name.includes('牛排')) return 'steak'
  if (name.includes('雞腿') || name.includes('雞肉')) return 'chicken-leg'
  if (name.includes('魚排')) return 'fish-cooked'
  if (name.includes('香腸')) return 'sausage'
  if (name.includes('培根')) return 'bacon'
  if (name.includes('湯')) return 'soup'
  if (name.includes('燉菜') || name.includes('燴')) return 'meal'
  if (name.includes('粥')) return 'porridge'
  if (name.includes('火鍋')) return 'hot-pot'
  
  // 飲料
  if (name.includes('果汁') || name.includes('汁')) return 'juice'
  if (name.includes('茶')) return 'tea-pot'
  if (name.includes('咖啡')) return 'coffee-mug'
  if (name.includes('啤酒')) return 'beer-stein'
  if (name.includes('紅酒') || name.includes('葡萄酒')) return 'wine-bottle'
  if (name.includes('烈酒') || name.includes('白酒')) return 'whiskey-bottle'
  if (name.includes('水')) return 'water-drop'
  
  // 藥劑類
  if (name.includes('治療藥水') || name.includes('生命藥水')) return 'health-potion'
  if (name.includes('魔力藥水') || name.includes('法力藥水')) return 'mana-potion'
  if (name.includes('力量藥水')) return 'strength-potion'
  if (name.includes('敏捷藥水')) return 'agility-potion'
  if (name.includes('智力藥水')) return 'intelligence-potion'
  if (name.includes('解毒劑')) return 'antidote'
  if (name.includes('萬能藥')) return 'elixir'
  if (name.includes('複活藥')) return 'resurrection'
  if (name.includes('藥水') || name.includes('藥劑')) return 'round-potion'
  
  // 工具類
  if (name.includes('鎬') || name.includes('鐵鎬') || name.includes('挖掘')) return 'mining'
  if (name.includes('釣竿') || name.includes('魚竿')) return 'fishing-pole'
  if (name.includes('網') || name.includes('漁網')) return 'fishing-net'
  if (name.includes('鋸') || name.includes('鋸子')) return 'hand-saw'
  if (name.includes('鐮刀') || name.includes('鐮')) return 'scythe'
  if (name.includes('鍬') || name.includes('鏟')) return 'spade'
  if (name.includes('剪刀') || name.includes('剪')) return 'scissors'
  if (name.includes('針') || name.includes('縫紉')) return 'sewing-needle'
  if (name.includes('鐵鎚') || name.includes('鎚子')) return 'claw-hammer'
  if (name.includes('扳手')) return 'spanner'
  if (name.includes('鉗') || name.includes('鉗子')) return 'pliers'
  
  // 材料類
  if (name.includes('布料') || name.includes('布')) return 'textile'
  if (name.includes('絲綢') || name.includes('絲')) return 'silk'
  if (name.includes('麻布') || name.includes('麻')) return 'hemp'
  if (name.includes('棉花') || name.includes('棉')) return 'cotton'
  if (name.includes('羊毛') || name.includes('毛')) return 'wool'
  if (name.includes('線') || name.includes('紗')) return 'thread'
  if (name.includes('繩') || name.includes('繩子')) return 'rope'
  if (name.includes('釘') || name.includes('鐵釘')) return 'nail'
  if (name.includes('螺絲')) return 'screw'
  if (name.includes('膠') || name.includes('膠水')) return 'glue'
  if (name.includes('油漆')) return 'paint-brush'
  
  // 寶物類
  if (name.includes('寶箱') || name.includes('寶盒')) return 'treasure-chest'
  if (name.includes('金幣') || name.includes('金錢')) return 'coins'
  if (name.includes('銀幣')) return 'silver-coin'
  if (name.includes('幣') || name.includes('錢')) return 'coins'
  if (name.includes('珍珠')) return 'pearl'
  if (name.includes('古董')) return 'vintage-robot'
  if (name.includes('文物')) return 'scroll-quill'
  if (name.includes('地圖')) return 'treasure-map'
  if (name.includes('鑰匙') || name.includes('鍵')) return 'key'
  if (name.includes('鎖')) return 'padlock'
  
  // 魔法物品類
  if (name.includes('魔法石')) return 'power-crystal'
  if (name.includes('符文')) return 'rune-sword'
  if (name.includes('魔法卷軸')) return 'magic-scroll'
  if (name.includes('傳送卷軸') || name.includes('傳送')) return 'teleport'
  if (name.includes('召喚石') || name.includes('召喚')) return 'summoning'
  if (name.includes('靈魂石') || name.includes('靈魂')) return 'soul-vessel'
  if (name.includes('生命石') || name.includes('生命')) return 'heart-bottle'
  if (name.includes('魔法粉') || name.includes('法術粉')) return 'powder'
  if (name.includes('卷軸')) return 'scroll-unfurled'
  
  // 其他雜項
  if (name.includes('容器')) return 'bottle-vapors'
  if (name.includes('箱') || name.includes('盒')) return 'wooden-crate'
  if (name.includes('袋') || name.includes('包')) return 'sack'
  if (name.includes('瓶')) return 'round-bottom-flask'
  if (name.includes('罐')) return 'amphora'
  if (name.includes('桶')) return 'barrel'
  if (name.includes('籃')) return 'basket'
  if (name.includes('魔法書') || name.includes('法術書')) return 'spell-book'
  if (name.includes('書') || name.includes('本')) return 'book-cover'
  if (name.includes('筆記') || name.includes('記錄')) return 'notebook'
  if (name.includes('筆') || name.includes('羽毛筆')) return 'quill-ink'
  if (name.includes('墨') || name.includes('墨水')) return 'ink-bottle'
  if (name.includes('蠟燭')) return 'candle-flame'
  if (name.includes('燈') || name.includes('燈籠')) return 'lantern'
  if (name.includes('火把')) return 'torch'
  if (name.includes('鏡') || name.includes('鏡子')) return 'mirror'
  if (name.includes('時鐘') || name.includes('鐘')) return 'clock'
  if (name.includes('沙漏')) return 'hourglass'
  if (name.includes('鈴') || name.includes('鈴鐺')) return 'bell'
  if (name.includes('號角') || name.includes('喇叭')) return 'horn-call'
  if (name.includes('旗') || name.includes('旗幟')) return 'flag'
  if (name.includes('帳篷')) return 'camping-tent'
  if (name.includes('毯') || name.includes('毯子')) return 'wool'
  if (name.includes('枕') || name.includes('枕頭')) return 'pillow'
  
  // 5. 預設圖標
  return 'package'
}

// 稀有度色彩濾鏡
export const getRarityFilter = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case 'common':
    case '普通':
      return 'brightness(0.8) sepia(0) saturate(0.8)'
    
    case 'uncommon':
    case '精良':
      return 'brightness(1) sepia(0.2) saturate(1.2) hue-rotate(90deg)'
    
    case 'rare':
    case '稀有':
      return 'brightness(1.1) sepia(0.3) saturate(1.5) hue-rotate(200deg)'
    
    case 'epic':
    case '史詩':
      return 'brightness(1.2) sepia(0.4) saturate(1.8) hue-rotate(270deg)'
    
    case 'legendary':
    case '傳奇':
      return 'brightness(1.3) sepia(0.8) saturate(2) hue-rotate(45deg) drop-shadow(0 0 8px #FFD700)'
    
    default:
      return 'brightness(1)'
  }
}

// Game-icons.net URL 生成器
export const getGameIconUrl = (iconName: string, size: '1x1' | '2x1' | '3x1' = '1x1'): string => {
  return `https://game-icons.net/icons/ffffff/000000/${size}/${iconName}.svg`
}