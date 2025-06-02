import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';

export const multerProductOptions = {
  storage: diskStorage({
    destination: join(__dirname, '..', '..', 'uploads', "products"),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueSuffix);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024
  },
};