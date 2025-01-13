import { Router } from "express";
import passport from "passport";

import schedule from "./schedule";

const router = Router();

router.use("/schedule", passport.authenticate("jwt", { session: false }), schedule);

export default router;
