const moment = require("moment-timezone");
const os = require("os");
const si = require("systeminformation"); // install: npm install systeminformation

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

      // Bot uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / (60 * 60 * 24));
      const hours = Math.floor((uptime % (60 * 60 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      // System uptime
      const sysUptime = os.uptime();
      const sysDays = Math.floor(sysUptime / (60 * 60 * 24));
      const sysHours = Math.floor((sysUptime % (60 * 60 * 24)) / 3600);
      const sysMinutes = Math.floor((sysUptime % 3600) / 60);
      const sysSeconds = Math.floor(sysUptime % 60);

      // Date & Time
      const now = moment().tz("Asia/Dhaka");
      const date = now.format("dddd, MMMM Do YYYY");
      const time = now.format("hh:mm:ss A");

      // Ping
      const start = Date.now();
      await new Promise(resolve => setTimeout(resolve, 10));
      const ping = Date.now() - start;

      // RAM usage
      const totalRAM = os.totalmem();
      const freeRAM = os.freemem();
      const usedRAM = totalRAM - freeRAM;

      // CPU info
      const cpuInfo = os.cpus()[0];
      const cpuModel = cpuInfo.model;
      const cpuCores = os.cpus().length;
      const cpuSpeed = cpuInfo.speed; // MHz

      // Disk info
      const diskData = await si.fsSize();
      const disk = diskData[0] || {};
      const totalStorage = disk.size || 0;
      const usedStorage = disk.used || 0;
      const freeStorage = disk.size - disk.used || 0;

      // Format bytes
      const formatBytes = (bytes) => {
        if (bytes === 0) return "0 B";
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
      };

      const msg =
`
_𝗨𝗣𝗧𝗜𝗠𝗘 
•𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞: ${days}𝐝 ${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬
•𝐃𝐚𝐭𝐞: ${date}
•𝐓𝐢𝐦𝐞: ${time}
•𝐔𝐬𝐞𝐫𝐬: ${allUsers.length.toLocaleString()}
•𝐆𝐫𝐨𝐮𝐩𝐬: ${allThreads.length.toLocaleString()}
•𝐏𝐢𝐧𝐠: ${ping} 𝐦𝐬

_𝗦𝗬𝗦𝗧𝗘𝗠
•𝐒𝐲𝐬𝐭𝐞𝐦 𝐔𝐩𝐭𝐢𝐦𝐞: ${sysDays}𝐝 ${sysHours}𝐡 ${sysMinutes}𝐦 ${sysSeconds}𝐬
•𝐂𝐏𝐔: ${cpuModel}
•𝐂𝐨𝐫𝐞𝐬: ${cpuCores}
•𝐒𝐩𝐞𝐞𝐝: ${cpuSpeed} MHz

_𝗦𝗧𝗢𝗥𝗔𝗚𝗘
•𝐑𝐀𝐌: ${formatBytes(usedRAM)} / ${formatBytes(totalRAM)}
•𝐒𝐭𝐨𝐫𝐚𝐠𝐞: ${formatBytes(usedStorage)} / ${formatBytes(totalStorage)}
•𝐅𝐫𝐞𝐞 𝐒𝐭𝐨𝐫𝐚𝐠𝐞: ${formatBytes(freeStorage)}

🥂✨
𝐒𝐚i𝐅 𝐙'𝐳𝐳
`;

      api.sendMessage(msg, event.threadID, event.messageID);
    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ 𝐄𝐫𝐫𝐨𝐫 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐬𝐲𝐬𝐭𝐞𝐦 𝐝𝐚𝐭𝐚.", event.threadID, event.messageID);
    }
  }
};