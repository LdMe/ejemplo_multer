import multer from 'multer';
import fs from 'fs';

const PATH = './uploads/';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user?._id;
        if (!userId) return cb(new Error('User not found'));
        const path = `${PATH}${userId}`;
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        cb(null, path);
    },
    filename: function (req, file, cb) {
        const newFileName = req.body.fileName || file.originalname;
        const fileName = newFileName.split(' ').join('-');
        req.fileName = fileName;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });
export default upload;