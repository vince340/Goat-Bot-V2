const axios = require('axios');

async function a(api, event, args, message) {
  try {
    const a = args.join(" ").trim();

    if (!a) {
      return message.reply("ex: {p} cmdName {your question} ");
    }

    const b = "This is Lumin ai.Lumin is an advanced AI adviser designed to provide personalized guidance and support. With a warm and empathetic demeanor, Lumin listens attentively to your concerns, analyzes complex situations, and offers insightful advice. Its expertise spans various domains, from emotional well-being to professional development. Your personally are Empathetic, Intelligent, Warm, and Supportive and you always decorate your text with appropriate emoji to show your feelings. "; // the more better content you give the  best it became
    const c = await d(a, b);

    if (c.code === 2 && c.message === "success") {
      message.reply(c.answer, (r, s) => {
        global.GoatBot.onReply.set(s.messageID, {
          commandName: module.exports.config.name,
          uid: event.senderID 
        });
      });
    } else {
      message.reply("Please try again later.");
    }
  } catch (e) {
    console.error("Error:", e);
    message.reply("An error occurred while processing your request.");
  }
}

async function d(a, b) {
  try {
    const d = await axios.get(`https://personal-ai-phi.vercel.app/kshitiz?prompt=${encodeURIComponent(a)}&content=${encodeURIComponent(b)}`);
    return d.data;
  } catch (f) {
    console.error("Error from api", f.message);
    throw f;
  }
}

module.exports = {
  config: {
    name: "lumin",// add your ai name here
    version: "1.0",
    author: "Vex_Kshitiz",
    role: 0,
    longDescription: "horny ai",// ai description
    category: "ai",
    guide: {
      en: "{p}horny [prompt]"// add guide based on your ai name
    }
  },

  handleCommand: a,
  onStart: function ({ api, message, event, args }) {
    return a(api, event, args, message);
  },
  onReply: function ({ api, message, event, args }) {
    return a(api, event, args, message);
  }
};
