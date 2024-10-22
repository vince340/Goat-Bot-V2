const axios = require('axios');
const moment = require('moment-timezone');

module.exports = {
	config: {
   name: "lovely",
   version: "1.0.0",
   role: 0,
   author: "Kaizenji",
   shortDescription: { en: "no prefix"},
   longDescription: { en: "an Ai powered by Kaizenji Ai"},
 category: "ai",
 countDown: 5,
},

onChat: async function ({ api, event }) {
 const message = event.body;
 const command = "Lovely";

  if (message.indexOf(command) === 0 || message.indexOf(command.charAt(0).toUpperCase() + command.slice(1)) === 0) {

const args = message.split(/\s+/);
  args.shift();

const johannesburgTime = moment.tz('Arfica/Johannesburg');


        const date = johannesburgTime.format('MMMM D, YYYY h:mm A');

try {
const { messageID, messageReply } = event;
 let prompt = args.join(' ');

if (messageReply) {
    const repliedMessage = messageReply.body;
      prompt = `${repliedMessage} ${prompt}`;
 }
     if (!prompt) {

      return api.sendMessage('💙 | 𝖧𝖾𝗅𝗅𝗈, 𝖨 𝖺𝗆 Lovely  𝖠𝗂\n\n𝖧𝗈𝗐 𝗆𝖺𝗒 𝗂 𝖺𝗌𝗌𝗂𝗌𝗍 𝗒𝗈𝗎 𝗍𝗈𝖽𝖺𝗒?', event.threadID, messageID);
        }
        api.sendMessage('🤍 | Lovely 𝖠𝗂 𝗂𝗌 𝗌𝖾𝖺𝗋𝖼𝗁𝗂𝗇𝗀, 𝗉𝗅𝖾𝖺𝗌𝖾 𝗐𝖺𝗂𝗍..', event.threadID);    

      const gpt4 = `https://kai-gpt4-5e4314203253.herokuapp.com/api/gpt4?ask=${encodeURIComponent(prompt)}`;
      
     const response = await axios.get(gpt4);

        if (response.data && response.data.answer) {

            const generatedText = response.data.answer;

               api.sendMessage(`💚 | Lovely 𝖠𝗂 \n\n𝗔𝗻𝘀𝘄𝗲𝗿: ${generatedText}\n\n⏰ | 🗓️: ${date}`, event.threadID, messageID);

        } else {

            console.error('API response did not contain expected data:', response.data);

            api.sendMessage(`❌ An error occurred while generating the text response. Please try again later. Response data: ${JSON.stringify(response.data)}`, event.threadID, messageID);
        }
    } catch (error) {
        console.error('Error:', error);

       api.sendMessage(`❌ An error occurred while generating the text response. Please try again later. Error details: ${error.message}`, event.threadID, event.messageID);
    }
}
},

  onStart: async function ({ api, event, args }) {
}
};
