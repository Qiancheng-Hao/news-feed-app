const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
    apiKey: process.env.VOLC_ARK_API_KEY,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

async function generateTags(content, images = []) {
    const model = process.env.VOLC_ARK_MODEL;

    if (!process.env.VOLC_ARK_API_KEY || !model) {
        console.warn('⚠️ Missing VOLC_ARK_API_KEY or VOLC_ARK_MODEL, skipping AI tagging.');
        return [];
    }

    // Strip HTML tags for the text part
    const plainText = content ? content.replace(/<[^>]+>/g, '') : '';

    // If no content and no images, return empty
    if (!plainText.trim() && images.length === 0) return [];

    const userContent = [];

    // Add text if exists
    if (plainText.trim()) {
        userContent.push({
            type: 'text',
            text: plainText,
        });
    }

    // Add images if exist
    if (images && images.length > 0) {
        images.forEach((url) => {
            const separator = url.includes('?') ? '&' : '?';
            const resizedUrl = `${url}${separator}x-tos-process=image/resize,l_2048`;

            userContent.push({
                type: 'image_url',
                image_url: {
                    url: resizedUrl,
                },
            });
        });
    }

    try {
        const completion = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content:
                        '你是一个标签提取助手。请根据用户提供的文本和图片内容，提取 3 到 5 个**中文**关键词标签。无论原始内容是什么语言，都请输出中文标签。直接返回标签，用英文逗号分隔，不要包含任何解释、序号或额外标点符号。例如：风景,旅行,摄影',
                },
                {
                    role: 'user',
                    content: userContent,
                },
            ],
            model: model,
            temperature: 0.8,
        });

        const result = completion.choices[0]?.message?.content?.trim();
        if (!result) return [];

        const tags = result
            .split(/[,，\n\s]+/)
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0 && tag.length < 20);

        console.log('🤖 AI Generated Tags:', tags);
        return tags;
    } catch (error) {
        console.error('❌ AI Tagging Failed:', error.message);
        return [];
    }
}

module.exports = { generateTags };
