const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp'],
    version: "1.0",
    author: "Loid Butter",
    countDown: 8,
    role: 0,
    shortDescription: "accept users",
    longDescription: "accept users",
    category: "admin",
  },

  onReply: async function ({ message, Reply, event, api, commandName }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;
    const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");

    clearTimeout(Reply.unsendTimeout);

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];

    if (args[0] === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    }
    else if (args[0] === "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    }
    else {
      return api.sendMessage("𝐏𝐥𝐞𝐚𝐬𝐞 𝐮𝐬𝐞: [𝐚𝐝𝐝 | 𝐝𝐞𝐥] [𝐧𝐮𝐦𝐛𝐞𝐫 𝐨𝐫 𝐚𝐥𝐥]", event.threadID, event.messageID);
    }

    let targetIDs = args.slice(1);

    if (args[1] === "all") {
      targetIDs = [];
      const lengthList = listRequest.length;
      for (let i = 1; i <= lengthList; i++) targetIDs.push(i);
    }

    const newTargetIDs = [];
    const promiseFriends = [];

    for (const stt of targetIDs) {
      const u = listRequest[parseInt(stt) - 1];
      if (!u) {
        failed.push(`𝐂𝐚𝐧'𝐭 𝐟𝐢𝐧𝐝 𝐍𝐨. ${stt}`);
        continue;
      }
      form.variables.input.friend_requester_id = u.node.id;
      form.variables = JSON.stringify(form.variables);
      newTargetIDs.push(u);
      promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
      form.variables = JSON.parse(form.variables);
    }

    const lengthTarget = newTargetIDs.length;
    for (let i = 0; i < lengthTarget; i++) {
      try {
        const friendRequest = await promiseFriends[i];
        if (JSON.parse(friendRequest).errors) {
          failed.push(newTargetIDs[i].node.name);
        }
        else {
          success.push(newTargetIDs[i].node.name);
        }
      }
      catch (e) {
        failed.push(newTargetIDs[i].node.name);
      }
    }

    if (success.length > 0) {
      api.sendMessage(`𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐭𝐲𝐩𝐞: ${args[0] === 'add' ? '𝐀𝐜𝐜𝐞𝐩𝐭' : '𝐃𝐞𝐥𝐞𝐭𝐞'}\n\n🪶 𝐒𝐮𝐜𝐜𝐞𝐬𝐬 [${success.length}]:\n${success.join("\n")}${failed.length > 0 ? `\n\n❌ 𝐅𝐚𝐢𝐥𝐞𝐝 [${failed.length}]:\n${failed.join("\n")}` : ""}`, event.threadID, event.messageID);
    } else {
      api.unsendMessage(messageID);
      return api.sendMessage("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐞. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.", event.threadID);
    }

    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, commandName }) {
    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    const listRequest = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form)).data.viewer.friending_possibilities.edges;

    let msg = "";
    let i = 0;

    for (const user of listRequest) {
      i++;
      msg += `\n${i}. 𝐍𝐀𝐌𝐄: ${user.node.name}`
        + `\n   ➥ 𝐈𝐃: ${user.node.id}`
        + `\n   𝐓𝐈𝐌𝐄: ${moment(user.time * 1009).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n`;
    }

    api.sendMessage(`𝐏𝐞𝐧𝐝𝐢𝐧𝐠 𝐅𝐫𝐢𝐞𝐧𝐝 𝐑𝐞𝐪𝐮𝐞𝐬𝐭𝐬:\n${msg}\n\n✨ 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡: [𝐚𝐝𝐝 | 𝐝𝐞𝐥] [𝐧𝐮𝐦𝐛𝐞𝐫/𝐚𝐥𝐥] 𝐭𝐨 𝐭𝐚𝐤𝐞 𝐚𝐜𝐭𝐢𝐨𝐧.`, event.threadID, (e, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        listRequest,
        author: event.senderID,
        unsendTimeout: setTimeout(() => {
          api.unsendMessage(info.messageID);
        }, this.config.countDown * 20000)
      });
    }, event.messageID);
  }
};
        
