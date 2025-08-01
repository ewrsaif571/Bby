const fs = require("fs-extra");
const request = require("request");
const os = require("os");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    version: "1.4",
    author: "Ayan mgi 🥰",
    shortDescription: "Display bot and user info with uptime and random Imgur video.",
    longDescription: "Show detailed info about the bot and the user, with uptime and send random Imgur video.",
    category: "info",
    guide: {
      en: "[user]",
    },
  },

  onStart: async function ({ api, event }) {
    // User Information
    const userInfo = {
      name: "𝐒𝐚𝐢𝐟 𝐢𝐬𝐥𝐚𝐦",
      age: "𝟏𝟔",
      location: "𝐒𝐢𝐫𝐚𝐣𝐠𝐚𝐧𝐣",
      bio: "𝐁𝐨𝐭 & 𝐉𝐚𝐯𝐚𝐒𝐜𝐫𝐢𝐩𝐭 𝐋𝐨𝐯𝐞𝐫 | 𝐈𝐝𝐤 🙂",
      botName: "𝐌'𝐢𝐤𝐚 𝐒'𝐚 ✨",
      botVersion: "1.0",
    };

    // Bot Uptime
    const botUptime = process.uptime();
    const botHours = Math.floor(botUptime / 3600);
    const botMinutes = Math.floor((botUptime % 3600) / 60);
    const botSeconds = Math.floor(botUptime % 60);
    const formattedBotUptime = `${botHours}h ${botMinutes}m ${botSeconds}s`;

    // System Uptime
    const systemUptime = os.uptime();
    const sysDays = Math.floor(systemUptime / (3600 * 24));
    const sysHours = Math.floor((systemUptime % (3600 * 24)) / 3600);
    const sysMinutes = Math.floor((systemUptime % 3600) / 60);
    const sysSeconds = Math.floor(systemUptime % 60);
    const formattedSystemUptime = `${sysDays}d ${sysHours}h ${sysMinutes}m ${sysSeconds}s`;

    // Imgur Video Links
    const imgurLinks = [
      "https://i.imgur.com/DfTQ5i6.mp4",
      "https://i.imgur.com/R4iAMnn.mp4",
      "https://i.imgur.com/9MoSlTY.mp4",
      "https://i.imgur.com/UiTaUXv.mp4",
      "https://i.imgur.com/CJsIzBc.mp4",
      "https://i.imgur.com/iJOz5pv.mp4",
      "https://i.imgur.com/ayCtv8c.mp4",
      "https://i.imgur.com/dTFkLfO.mp4",
      "https://i.imgur.com/Ov9Iq7A.mp4",
    ];

    // Pick a random video
    const randomLink = imgurLinks[Math.floor(Math.random() * imgurLinks.length)];
    const cacheDir = path.join(__dirname, "cache");
    const videoPath = path.join(cacheDir, "randomVideo.mp4");

    // Ensure cache folder exists
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // Download the random video
    const downloadVideo = (url, filePath) => {
      return new Promise((resolve, reject) => {
        request(url)
          .pipe(fs.createWriteStream(filePath))
          .on("close", resolve)
          .on("error", reject);
      });
    };

    try {
      await downloadVideo(randomLink, videoPath);

      const bodyMsg = `
Information: 🥷

- Name: ${userInfo.name}
- Age: ${userInfo.age}
- Location: ${userInfo.location}
- Bio: ${userInfo.bio}

Bot Details:

- Bot Name: ${userInfo.botName}
- Bot Version: ${userInfo.botVersion}
- Bot Uptime: ${formattedBotUptime}

System Uptime:

- ${formattedSystemUptime}

─────────────────────
`;

      api.sendMessage(
        {
          body: bodyMsg,
          attachment: fs.createReadStream(videoPath),
        },
        event.threadID,
        () => {
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("An error occurred while processing your request.", event.threadID);
    }
  },
};