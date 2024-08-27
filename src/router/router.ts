import { Router } from "express";
import ReaderImagesController from "../controllers/reader-images-controller";


const router = Router();

router
    .get("/:customer_code/list", ReaderImagesController.getImages);

export default router;