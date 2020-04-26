import { randomBytes } from 'crypto';
import { resolve } from 'path';

import { diskStorage } from 'multer';

const tmpFolder = resolve(__dirname, '..', '..', 'tmp');

const uploadOptions = {
  tempDirectory: tmpFolder,

  storage: diskStorage({
    destination: tmpFolder,
    filename: (request, filename, cb) => {
      const hash = randomBytes(10).toString('HEX');
      const newFilename = `${hash}-${filename.originalname}`;

      return cb(null, newFilename);
    },
  }),
};

export default uploadOptions;
