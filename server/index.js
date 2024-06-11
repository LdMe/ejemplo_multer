import express from 'express';
import cors from 'cors';
import upload from './multer.js';
import fs from 'fs';

const app = express();
const port = 3010;

const isAuthMiddleware = (req, res, next) => {
    req.user = {_id: '125'};
    next();
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', isAuthMiddleware, upload.single('file'), (req, res) => {
    res.json({
        fileName: req.fileName
    });
});

app.get("/uploads/:file", isAuthMiddleware, (req, res) => {
    const { file } = req.params;
    const userId = req.user._id;
    const filePath = `./uploads/${userId}/${file}`;
    if (!fs.existsSync(filePath)) {
        res.status(404).send("File not found");
        return;
    }
    res.sendFile(filePath, { root: "." });
});

app.get("/uploads", isAuthMiddleware, (req, res) => {
    const userId = req.user?._id;
    const path = `./uploads/${userId}`;
    if (!fs.existsSync(path)) {
        res.status(404).send("Directory not found");
        return;
    }
    const files = fs.readdirSync(path);
    res.json(files);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
