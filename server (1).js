const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// Upload folder
const upload = multer({ dest: 'uploads/' });

// POST endpoint to upload PDF and return signature image URL
app.post('/images', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const filePath = path.resolve(req.file.path);
        const dataBuffer = fs.readFileSync(filePath);

        // Extract PDF text and images using pdf-parse
        const pdfData = await pdfParse(dataBuffer);

        // For demonstration, we save first page as PNG
        const pdfPages = pdfData.numpages;

        // Using sharp to create dummy signature image
        // In real use-case, you would detect signature region
        const signImagePath = path.resolve('uploads', `${Date.now()}-sign.png`);

        // For example purposes, just copy PDF first page as image placeholder
        // You may replace with real signature detection logic
        fs.writeFileSync(signImagePath, dataBuffer.slice(0, 50000)); // dummy small slice

        // Return API response
        res.json({
            code: 200,
            success: true,
            images: {
                'sign-image': `http://localhost:${PORT}/${path.basename(signImagePath)}`
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ code: 500, success: false, message: err.message });
    } finally {
        // Remove uploaded PDF
        fs.unlinkSync(req.file.path);
    }
});

// Serve uploaded images statically
app.use(express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Signature API running at http://localhost:${PORT}`);
});