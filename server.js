const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploadDir) },
    filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());

// API 1: Document Upload (Handles Local AND Google Drive Mock)
app.post('/api/upload', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const finalCost = req.body.finalCost || '₹0.00';
    const copies = req.body.copies || 1;
    const printJobId = 'INK-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Check if it's our Drive dummy file
    const isDriveMock = req.file.originalname.includes('.pdf') && req.file.size < 1000;

    // Auto-delete file after 5 mins (Privacy Feature)
    setTimeout(() => {
        const filePath = path.join(uploadDir, req.file.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[PRIVACY LOCK] Auto-deleted user file: ${req.file.originalname}`);
        }
    }, 300000);

    console.log(`\n=========================================`);
    console.log(`🖨️  NEW INKIFY JOB QUEUED`);
    console.log(`=========================================`);
    console.log(`📄 Document:    ${req.file.originalname}`);
    console.log(`☁️  Source:      ${isDriveMock ? 'Google Drive (API Sync)' : 'Local Upload'}`);
    console.log(`🔢 Copies:      ${copies}`);
    console.log(`💰 Final Rev:   ${finalCost}`);
    console.log(`-----------------------------------------`);
    console.log(`📍 Status: Waiting for QR Scan at Kiosk...`);
    console.log(`=========================================\n`);

    res.json({
        success: true,
        jobId: printJobId,
        fileName: req.file.originalname
    });
});

// API 2: INKIFY Smart Card Registration
app.post('/api/register-card', (req, res) => {
    console.log(`\n💳 NEW SMART CARD REGISTERED`);
    console.log(`User Name: ${req.body.name}`);
    console.log(`Status: Virtual NFC Active\n`);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`\n=================================`);
    console.log(`🚀 INKIFY CLOUD OS V3.0 ONLINE`);
    console.log(`🌐 Dashboard: http://localhost:${port}`);
    console.log(`=================================\n`);
});