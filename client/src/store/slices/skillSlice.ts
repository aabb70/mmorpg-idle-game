import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum SkillType {
  MINING = 'MINING',
  LOGGING = 'LOGGING',
  FISHING = 'FISHING',
  FORAGING = 'FORAGING',
  SMITHING = 'SMITHING',
  TAILORING = 'TAILORING',
  COOKING = 'COOKING',
  ALCHEMY = 'ALCHEMY',
  CRAFTING = 'CRAFTING',
}

interface Skill {
  skillType: SkillType
  level: number
  experience: number
  maxExperience: number
}

interface SkillState {
  skills: Record<SkillType, Skill>
  activeSkill: SkillType | null
  isTraining: boolean
}

const initialSkills = Object.values(SkillType).reduce((acc, skillType) => {
  acc[skillType] = {
    skillType,
    level: 1,
    experience: 0,
    maxExperience: 100,
  }
  return acc
}, {} as Record<SkillType, Skill>)

const initialState: SkillState = {
  skills: initialSkills,
  activeSkill: null,
  isTraining: false,
}

const skillSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    setActiveSkill: (state, action: PayloadAction<SkillType>) => {
      state.activeSkill = action.payload
    },
    startTraining: (state) => {
      state.isTraining = true
    },
    stopTraining: (state) => {
      state.isTraining = false
    },
    addExperience: (state, action: PayloadAction<{ skillType: SkillType; amount: number }>) => {
      const { skillType, amount } = action.payload
      const skill = state.skills[skillType]
      skill.experience += amount
      
      // 升級邏輯
      while (skill.experience >= skill.maxExperience) {
        skill.experience -= skill.maxExperience
        skill.level += 1
        skill.maxExperience = Math.floor(skill.maxExperience * 1.2)
      }
    },
    setSkills: (state, action: PayloadAction<any[]>) => {
      action.payload.forEach((skill: any) => {
        const skillType = skill.skillType as SkillType
        if (state.skills[skillType]) {
          state.skills[skillType] = {
            skillType,
            level: skill.level,
            experience: skill.experience,
            maxExperience: 100 * Math.pow(1.2, skill.level - 1)
          }
        }
      })
    },
  },
})

export const { setActiveSkill, startTraining, stopTraining, addExperience, setSkills } = skillSlice.actions
export default skillSlice.reducer