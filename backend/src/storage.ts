import path = require('path');
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";

// storage is used for storing uploaded profile pictures of users

export const STORAGE_IMAGE_LOCATION : string = './upload/pfp'
export const STORAGE_DEFAULT_IMAGE : string = './default.jpeg'

export const storage = {
	storage: diskStorage({
		destination: STORAGE_IMAGE_LOCATION,
		filename: (req, file, cb) => {
			const fname: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
			const ext: string = path.parse(file.originalname).ext;

			cb(null, `${fname}${ext}`);
		}
	})
}
