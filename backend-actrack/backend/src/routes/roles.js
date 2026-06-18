import express from "express";
import { allRoles, idRol } from "../controllers/rolesController.js";

const router = express.Router();

router.get("/", allRoles);
router.get("/:id/", idRol);

export default router;