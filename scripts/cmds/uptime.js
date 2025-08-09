const moment = require("moment-timezone");
const os = require("os");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "1.1",
    author: "SA IF",
    role: 0,
    category: "system",
    guide: {
      en: "Use {p}uptime."
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();

      const uptime = process.uptime();
      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime % (60 * 60 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const now = moment().tz("Asia/Dhaka");
      const date = now.format("dddd, MMMM Do YYYY");
      const time = now.format("hh:mm:ss A");

      const start = Date.now();
      // Wait a little to simulate latency (fix ping issue)
      await new Promise(resolve => setTimeout(resolve, 10));
      const ping = Date.now() - start;

      let face, statusText;
      if (ping < 200) {
        face = `✧(｡•̀ᴗ-)✧`;
        statusText = "𝐔𝐰𝐔!";
      } else if (ping < 500) {
        face = `(︶︹︺)`;
        statusText = "𝐙'𝐳𝐳";
      } else {
        face = `(｡•́︿•̀｡)`;
        statusText = "";
      }

      const sysUptime = os.uptime(); // in seconds
      const sysDays = Math.floor(sysUptime / (60 * 60 * 24));
      const sysHours = Math.floor((sysUptime % (60 * 60 * 24)) / 3600);
      const sysMinutes = Math.floor((sysUptime % 3600) / 60);
      const sysSeconds = Math.floor(sysUptime % 60);

      const msg =
`
  𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄 🌠
  ${face}
━━━━━━━━━━━━━━━
 • 𝐑𝐮𝐧𝐭𝐢𝐦𝐞: ${days}𝐝 ${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬
 • 𝐒𝐲𝐬𝐭𝐞𝐦: ${sysDays}𝐝 ${sysHours}𝐡 ${sysMinutes}𝐦 ${sysSeconds}𝐬
 • 𝐃𝐚𝐭𝐞: ${date}
 • 𝐓𝐢𝐦𝐞: ${time}
 • 𝐔𝐬𝐞𝐫𝐬: ${allUsers.length.toLocaleString()}
 • 𝐆𝐫𝐨𝐮𝐩𝐬: ${allThreads.length.toLocaleString()}
 • 𝐏𝐢𝐧𝐠: ${ping} 𝐦𝐬
「 𝗔𝗱𝗺𝗶𝗻:𝐒𝐚'!𝐅 」
━━━━━━━━━━━━ `;
  
      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐮𝐩𝐭𝐢𝐦𝐞 𝐝𝐚𝐭𝐚.", event.threadID, event.messageID);
    }
  }
};
                      
