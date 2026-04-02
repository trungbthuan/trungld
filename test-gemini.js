const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkAvailableModels() {
    // Đảm bảo bạn đã set biến môi trường GEMINI_API_KEY,
    // hoặc có thể dán trực tiếp chuỗi API key vào biến dưới đây để test nhanh.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Chưa tìm thấy GEMINI_API_KEY!");
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("Lỗi từ API:", data.error.message);
            return;
        }

        console.log("✅ Các model khả dụng cho API Key của bạn:");
        data.models.forEach((model) => {
            // Lọc ra những model hỗ trợ generateContent
            if (model.supportedGenerationMethods.includes("generateContent")) {
                // API trả về dạng "models/tên-model", chúng ta cắt chữ "models/" đi
                const modelName = model.name.replace("models/", "");
                console.log(`- ${modelName}`);
            }
        });
    } catch (err) {
        console.error("Lỗi khi kết nối:", err.message);
    }
}

async function testGemini() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent("Hello, test AI hoạt động chưa?");

        const response = await result.response;
        console.log("Gemini trả lời:");
        console.log(response.text());
    } catch (err) {
        console.error("Lỗi:", err.message);
    }
}

async function listAllModels() {
    // Đảm bảo GEMINI_API_KEY đã được thiết lập trong biến môi trường
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        console.log("Các model bạn có quyền truy cập:");
        data.models.forEach((m) => console.log("- " + m.name));
    } catch (err) {
        console.error("Lỗi:", err);
    }
}

listAllModels();

//checkAvailableModels();

//testGemini();
