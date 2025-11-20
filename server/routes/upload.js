const express = require('express');
const multer = require('multer');
const { TosClient } = require('@volcengine/tos-sdk');
require('dotenv').config();

const router = express.Router();

// Configure Multer (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize TOS client
const client = new TosClient({
    accessKeyId: process.env.TOS_ACCESS_KEY,
    accessKeySecret: process.env.TOS_SECRET_KEY,
    region: process.env.TOS_REGION,
    endpoint: process.env.TOS_ENDPOINT,
});

// // Upload endpoint (POST /api/upload)
// router.post('/', upload.single('file'), async (req, res) => {
//     try {
//         const file = req.file;
//         if (!file) {
//             return res.status(400).json({ message: '请选择文件' });
//         }

//         // Generate unique file name
//         const fileName = `${Date.now()}_${file.originalname}`;

//         // Upload to TOS
//         await client.putObject({
//             bucket: process.env.TOS_BUCKET,
//             key: fileName,
//             body: file.buffer,
//             contentType: file.mimetype,
//         });

//         // Construct URL
//         const imageUrl = `https://${process.env.TOS_BUCKET}.${process.env.TOS_ENDPOINT}/${fileName}`;

//         res.json({ message: '上传成功', url: imageUrl });
//         console.log(`✅ 图片上传成功: ${imageUrl}`);
//     } catch (error) {
//         console.error('上传失败:', error);
//         res.status(500).json({ message: '上传失败，请检查后台日志' });
//         console.log('❌ 图片上传失败');
//     }
// });

// GET /api/upload/presign
router.get('/presign', async (req, res) => {
    try {
        const { fileName, fileType } = req.query;
        const key = `${Date.now()}_${fileName}`;

        // generate pre-signed URL
        const url = client.getPreSignedUrl({
            bucket: process.env.TOS_BUCKET,
            key: key,
            method: 'PUT',
            expires: 3000,
        });

        const publicUrl = `https://${process.env.TOS_BUCKET}.${process.env.TOS_ENDPOINT}/${key}`;

        res.json({
            uploadUrl: url,
            publicUrl: publicUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '签名生成失败' });
    }
});

// delete the post (DELETE /api/upload)
router.delete('/', async (req, res) => {
    try {
        // Get URL of img
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ message: '缺少 URL 参数' });
        }

        // get img name from url
        const key = url.split('/').pop();

        // call TOS to delete object
        await client.deleteObject({
            bucket: process.env.TOS_BUCKET,
            key: key,
        });

        console.log(`🗑️ 已从 TOS 删除文件: ${key}`);
        res.json({ message: '删除成功' });
    } catch (error) {
        console.error('删除失败:', error);
        res.status(500).json({ message: '删除失败' });
    }
});

module.exports = router;
