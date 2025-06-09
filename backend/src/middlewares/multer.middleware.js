import multer from "multer"
import fs from "fs"
import path from "path"

const uploadPath = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 // Limit file size to 5MB
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /mp4/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            return cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
        }
    }
})

export default upload