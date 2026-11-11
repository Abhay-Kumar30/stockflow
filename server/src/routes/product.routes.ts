
import { Router } from 'express'
import authMiddleware from '../middleware/auth.middleware'
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller'

const router = Router()

router.use(authMiddleware)

router.post('/', createProduct)
router.get('/', getProducts)
router.get('/:productId', getProductById)
router.put('/:productId', updateProduct)
router.delete('/:productId', deleteProduct)

export default router
