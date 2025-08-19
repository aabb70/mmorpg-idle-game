import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AdminJwtPayload {
  isAdmin: boolean
  username: string
}

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ message: '需要管理員權限' })
    return
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, payload) => {
    if (err) {
      res.status(403).json({ message: 'Token 無效' })
      return
    }

    const { isAdmin } = payload as AdminJwtPayload
    if (!isAdmin) {
      res.status(403).json({ message: '需要管理員權限' })
      return
    }

    ;(req as any).admin = payload
    next()
  })
}