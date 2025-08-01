const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "trash",
    version: "1.1",
    author: "KSHITIZ",
    countDown: 5,
    role: 0,
    shortDescription: "",
    longDescription: "",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | để trống]",
      en: ""
    }
  },

  onStart: async function ({ event, message, usersData }) {
    const mentionID = Object.keys(event.mentions)[0];
    const replyID = event.messageReply?.senderID;
    const senderID = event.senderID;

    const uid = mentionID || replyID || senderID;

    const avatarURL = await usersData.getAvatarUrl(uid);
    const img = await new DIG.Delete().getImage(avatarURL);
    const pathSave = `${__dirname}/tmp/${uid}_delete.png`;

    fs.writeFileSync(pathSave, Buffer.from(img));

    message.reply({
      attachment: fs.createReadStream(pathSave)
    }, () => fs.unlinkSync(pathSave));
  }
};
