import express from 'express';
import { createProperty, deleteProperty, getAllProperties, getPropertyById,  updateProperty} from '../controller/property.js';
import { upload } from '../helpers/multer.js';

const router = express.Router();

router.post('/create', upload.array('images', 5), createProperty);
router.put("/:propertyId", upload.array('images', 5), updateProperty)
router.get("/all", getAllProperties)
router.get("/:propertyId", getPropertyById)
router.delete("/:propertyId", deleteProperty)





export default router;