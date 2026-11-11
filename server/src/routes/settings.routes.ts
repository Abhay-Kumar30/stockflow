
import { Router } from 'express'
import authMiddleware from '../middleware/auth.middleware'
import {
  getSettings,
  updateSettings,
} from '../controllers/settings.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', getSettings)
router.put('/', updateSettings)

export default router
