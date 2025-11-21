import express, {type Request, type Response} from 'express';
import {AuthController }from '../controllers/auth.controller';


const router = express.Router();

const controller = new AuthController();


router.post("/login", controller.login);
router.post("/signup", controller.signup)
router.post("/refresh", controller.refresh);
router.post("/sendOTP", controller.sendOTP);

// Internal API for service-to-service communication
router.get("/users/:id", controller.getUserById);
router.post("/users/batch", controller.getUsersByIds);



export {router};