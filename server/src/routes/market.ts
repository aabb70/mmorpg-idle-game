import { Router } from 'express'
import { 
  getMarketListings, 
  getMyListings, 
  createListing, 
  removeListing, 
  purchaseItem 
} from '../controllers/marketController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

// 所有市場路由都需要認證
router.use(authenticateToken)

router.get('/listings', getMarketListings)
router.get('/my-listings', getMyListings)
router.post('/listings', createListing)
router.delete('/listings/:listingId', removeListing)
router.post('/purchase', purchaseItem)

export default router