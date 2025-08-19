import { useSelector, useDispatch } from 'react-redux'
import {
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Button,
  Box,
  Card,
  CardContent,
} from '@mui/material'
import { RootState } from '../store/store'
import { SkillType, setActiveSkill, startTraining, stopTraining } from '../store/slices/skillSlice'

const skillNames = {
  [SkillType.MINING]: '採礦',
  [SkillType.LOGGING]: '伐木',
  [SkillType.FISHING]: '釣魚',
  [SkillType.FORAGING]: '採集',
  [SkillType.SMITHING]: '鍛造',
  [SkillType.TAILORING]: '裁縫',
  [SkillType.COOKING]: '廚師',
  [SkillType.ALCHEMY]: '煉金',
  [SkillType.CRAFTING]: '工藝',
}

export default function SkillsPanel() {
  const dispatch = useDispatch()
  const { skills, activeSkill, isTraining } = useSelector((state: RootState) => state.skills)

  const handleStartTraining = (skillType: SkillType) => {
    dispatch(setActiveSkill(skillType))
    dispatch(startTraining())
  }

  const handleStopTraining = () => {
    dispatch(stopTraining())
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        技能訓練
      </Typography>

      {activeSkill && isTraining && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary">
            正在訓練：{skillNames[activeSkill]}
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleStopTraining}>
            停止訓練
          </Button>
        </Box>
      )}

      <Grid container spacing={2}>
        {Object.values(SkillType).map((skillType) => {
          const skill = skills[skillType]
          const progressPercent = (skill.experience / skill.maxExperience) * 100

          return (
            <Grid item xs={12} sm={6} md={4} key={skillType}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {skillNames[skillType]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    等級 {skill.level}
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercent}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {skill.experience} / {skill.maxExperience} 經驗
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isTraining && activeSkill !== skillType}
                    onClick={() => handleStartTraining(skillType)}
                  >
                    {activeSkill === skillType && isTraining ? '訓練中...' : '開始訓練'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Paper>
  )
}