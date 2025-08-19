import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Snackbar, Alert, Slide } from '@mui/material'
import { RootState } from '../store/store'
import { removeNotification } from '../store/slices/gameSlice'

function SlideTransition(props: any) {
  return <Slide {...props} direction="down" />
}

export default function NotificationSystem() {
  const dispatch = useDispatch()
  const notifications = useSelector((state: RootState) => state.game.notifications)

  // 自動移除第一個通知（最舊的）
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(0))
      }, 3000) // 3秒後自動消失

      return () => clearTimeout(timer)
    }
  }, [notifications, dispatch])

  if (notifications.length === 0) {
    return null
  }

  const currentNotification = notifications[0]

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ 
        vertical: 'top', 
        horizontal: 'center' 
      }}
      TransitionComponent={SlideTransition}
      sx={{
        position: 'fixed',
        top: 80, // 在導航欄下方
        zIndex: 9999
      }}
    >
      <Alert 
        severity="success" 
        variant="filled"
        onClose={() => dispatch(removeNotification(0))}
        sx={{
          minWidth: 300,
          fontSize: '1rem',
          fontWeight: 'medium'
        }}
      >
        {currentNotification}
      </Alert>
    </Snackbar>
  )
}