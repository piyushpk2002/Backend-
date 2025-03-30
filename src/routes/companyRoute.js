import express from "express";
import { getAllBusiness, listBusiness, getBusinessByCategory, searchProducts} from "../controllers/companyController.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllBusiness);
router.post("/listbusiness", listBusiness);
router.get("/business/:primaryBusiness", getBusinessByCategory);
router.get("/searchResults/:query", searchProducts)

export default router;