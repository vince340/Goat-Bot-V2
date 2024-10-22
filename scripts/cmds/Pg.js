const crypto = require('crypto');
const EventSource = require('eventsource');
const fetch = require('node-fetch');

const nevPrompt = "";

async function fetchAndExtractRootUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlContent = await response.text();

        const rootMatch = htmlContent.match(/window\.gradio_config = (.*?});/s);
        if (rootMatch) {
            const gradioConfig = JSON.parse(rootMatch[1]);
            return gradioConfig.root;
        } else {
            throw new Error("Could not extract root value.");
        }
    } catch (error) {
        console.error('Failed to fetch:', error);
        return null;
    }
}

function getEventId() {
    const randomBytes = crypto.randomBytes(16);
    const hexString = randomBytes.toString('hex');
    return hexString;
}

function generateSessionHash() {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateRandomDigits() {
    return Math.floor(Math.random() * (999999999 - 100000000 + 1) + 100000000);
}

async function generateWithPlayground(prompt, resolution) {
    let width, height;
    if (resolution == "Square") {
        width = 1024;
        height = 1024;
    } else if (resolution == "Wide") {
        width = 1280;
        height = 768;
    } else if (resolution == "Portrait") {
        width = 768;
        height = 1280;
    }
    return new Promise(async (resolve, reject) => {
        try {
            const session_hash = generateSessionHash();
            const event_id = getEventId();
            const randomDigit = generateRandomDigits();
            const rootUrl = await fetchAndExtractRootUrl(
                "https://playgroundai-playground-v2-5.hf.space/"
            );

            const urlJoinQueue = `https://playgroundai-playground-v2-5.hf.space/queue/join?fn_index=3&session_hash=${session_hash}`;
            const eventSource = new EventSource(urlJoinQueue);

            eventSource.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                if (data.msg === "send_data") {
                    const eventId = data?.event_id;
                    fetch("https://playgroundai-playground-v2-5.hf.space/queue/data", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            data: [
                                prompt,
                                nevPrompt,
                                true,
                                randomDigit,
                                width,
                                height,
                                3,
                                true,
                            ],
                            event_data: null,
                            fn_index: 3,
                            trigger_id: 6,
                            session_hash: session_hash,
                            event_id: eventId,
                        }),
                    });
                } else if (data.msg === "process_completed") {
                    eventSource.close();
                    const imagePaths =
                        data?.output?.data[0] ??
                        "https://raw.githubusercontent.com/hihumanzone/Gemini-Discord-Bot/main/error.png";
                    const firstImagePath =
                        imagePaths.length > 0 ? imagePaths[0].image.path : null;

                    if (firstImagePath) {
                        const fullUrl = `${rootUrl}/file=${firstImagePath}`;
                        resolve({ images: [{ url: fullUrl }], modelUsed: "Playground" });
                    } else {
                        reject(
                            new Error("No image path found in the process_completed message.")
                        );
                    }
                }
            };

            eventSource.onerror = (error) => {
                eventSource.close();
                reject(error);
            };
        } catch (error) {
            reject(error);
        }
    });
}


module.exports = {
    config: {
        name: "playground",
        aliases: ["pg"],
        version: "1.0.2",
        author: "Shikaki",
        role: 0,
        countDown: 10,
        description: {
            en: "generate images using playground v2.5",
        },
        category: "image-gen-ai",
        guide: {
            en: "{pn} <description>",
        },
    },
    onStart: async function ({ message, api, args, event }) {
        var prompt = args.join(" ");
    
        api.setMessageReaction("⌛", event.messageID, () => { }, true);
    
        try {
            const result = await generateWithPlayground(prompt, "Square");
    
            const imageUrl = result.images[0].url;
    
            await message.reply({
                body: `Here is the image:\n\n${imageUrl}`, attachment: await global.utils.getStreamFromURL(imageUrl)});
    
            console.log(result);
            api.setMessageReaction("✅", event.messageID, () => { }, true);
        } catch (error) {
            console.error('Error:', error);
            api.setMessageReaction("❌", event.messageID, () => { }, true);
            message.reply(`Error: ${error.message}`);
        }
    }    
}
