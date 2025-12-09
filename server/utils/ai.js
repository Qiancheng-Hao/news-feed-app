const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
    apiKey: process.env.VOLC_ARK_API_KEY,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

async function callAI(content, images, systemPrompt, logLabel) {
    const model = process.env.VOLC_ARK_MODEL;

    if (!process.env.VOLC_ARK_API_KEY || !model) {
        console.warn(`⚠️ Missing VOLC_ARK_API_KEY or VOLC_ARK_MODEL, skipping ${logLabel}.`);
        return [];
    }

    // Extract images from HTML content
    const contentImages = [];
    if (content) {
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        let match;
        while ((match = imgRegex.exec(content)) !== null) {
            if (match[1]) {
                contentImages.push(match[1]);
            }
        }
    }

    // Merge explicit images with content images
    const allImages = [...(images || []), ...contentImages];

    // Strip HTML tags for the text part
    const plainText = content ? content.replace(/<[^>]+>/g, '') : '';

    // If no content and no images, return empty
    if (!plainText.trim() && allImages.length === 0) return [];

    const userContent = [];

    // Add text if exists
    if (plainText.trim()) {
        userContent.push({
            type: 'text',
            text: plainText,
        });
    }

    // Add images if exist
    if (allImages.length > 0) {
        const uniqueImages = [...new Set(allImages)];

        uniqueImages.forEach((url) => {
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
                    content: systemPrompt,
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

        const items = result
            .split(/[,，\n\s]+/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0 && item.length < 20);

        // console.log(`🤖 AI Generated ${logLabel}:`, items);
        return items;
    } catch (error) {
        console.error(`❌ AI ${logLabel} Failed:`, error.message);
        return [];
    }
}

async function generateTags(content, images = []) {
    const prompt =
        '你是一个标签提取助手。请根据用户提供的文本和图片内容，提取 10 到 15 个**中文**关键词标签。无论原始内容是什么语言，都请输出中文标签。直接返回标签，用英文逗号分隔，不要包含任何解释、序号或额外标点符号。例如：风景,旅行,摄影';
    return callAI(content, images, prompt, 'Tags');
}

async function generateTopics(content, images = []) {
    const prompt =
        '你是一个社交媒体话题助手。请根据用户提供的内容，生成 3 到 5 个**中文话题标签**。标签应具有社交属性和讨论价值，简短有力，适合作为微博或朋友圈的话题。直接返回标签文本（不需要带#号），用英文逗号分隔，不要包含任何解释、序号或额外标点符号。例如：周末去哪儿玩,我的美食日记,今日份快乐';
    return callAI(content, images, prompt, 'Topics');
}

module.exports = { generateTags, generateTopics };
