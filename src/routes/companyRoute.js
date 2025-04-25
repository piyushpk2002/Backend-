import express from "express";
import {
  getAllBusiness,
  listBusiness,
  getBusinessByCategory,
  searchProducts,
  getCompanyCount,
  getTodaysBusinessCount,
  getTotalUsers,
} from "../controllers/companyController.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllBusiness);
router.post("/listbusiness", listBusiness);

router.get("/business/:primaryBusiness", getBusinessByCategory);
router.get("/searchResults", searchProducts);
router.get("/count", getCompanyCount);
router.get("/count/today", getTodaysBusinessCount);
router.get("/count-user",getTotalUsers);

export default router;
