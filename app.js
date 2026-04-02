const express = require("express");
const multer = require("multer");
const cors = require("cors");
const XLSX = require("xlsx");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo với API Key từ biến môi trường Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ================== UPLOAD ==================
app.post("/upload", upload.single("file"), (req, res) => {
    try {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Đọc file lỗi" });
    }
});

// ================== AI ==================
app.post("/analyze", async (req, res) => {
    console.log("Đã nhận yêu cầu analyze từ Client");
    try {
        const data = req.body.data;
        if (!data || !data.length) {
            return res.status(400).json({ analysis: "Không có dữ liệu để phân tích" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const prompt = `
        Phân tích dữ liệu học sinh:
        ${JSON.stringify(data).slice(0, 2000)}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ analysis: text });
    } catch (err) {
        console.error("Lỗi Gemini chi tiết:", err);
        res.status(500).json({ analysis: "AI lỗi: " + err.message });
    }
});

app.get("/api/models", async (req, res) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        res.send({ models: data.models });
    } catch (err) {
        res.send({ "Lỗi:": err });
    }
});

// test server
app.get("/api/test", (req, res) => {
    res.send("API OK");
});

// ================== START ==================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
