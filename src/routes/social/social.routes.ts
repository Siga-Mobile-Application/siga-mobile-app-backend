import { Router } from "express";
import Social from "../../controller/social";

const socialRoutes = Router();

socialRoutes.get('/', Social.getAll);

export default socialRoutes;