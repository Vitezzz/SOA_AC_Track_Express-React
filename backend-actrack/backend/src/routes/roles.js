import express from "express";
import { allRoles, idRol } from "../controllers/rolesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect,allRoles);
router.get("/:id/", protect,idRol);

export default router;