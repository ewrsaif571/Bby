const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

function isURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function getDomain(url) {
  const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function toEdaFont(text) {
  const map = {
    a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢",
    j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫",
    s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
    A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈",
    J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑",
    S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
    0: "𝟎", 1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒", 5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗",
    "?": "？", "!": "！", '"': "“", "'": "‘", "`": "‘", ",": "，", ".": "．",
    ":": "：", ";": "；", "-": "－", "_": "＿", "(": "（", ")": "）",
    "[": "【", "]": "】", "{": "｛", "}": "｝", " ": " ", "\n": "\n"
  };
  return text.split('').map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    name: "cmd",
    version: "1.17",
    author: "NTKhang",
    countDown: 5,
    role: 2,
    description: {
      en: toEdaFont("Manage your command files")
    },
    category: "owner",
    guide: {
      en: toEdaFont(
        "   {pn} load <command file name>"
        + "\n   {pn} loadAll"
        + "\n   {pn} install <url> <command file name>: Download and install a command file from a url, url is the path to the file (raw)"
        + "\n   {pn} install <command file name> <code>: Download and install a command file from a code, code is the code of the command"
      )
    }
  },

  langs: {
    en: {
      missingFileName: toEdaFont("⚠️ | Please enter the command name you want to reload"),
      loaded: toEdaFont("✅ | Loaded command \"%1\" successfully"),
      loadedError: toEdaFont("❌ | Failed to load command \"%1\" with error\n%2: %3"),
      loadedSuccess: toEdaFont("✅ | Loaded successfully (%1) command"),
      loadedFail: toEdaFont("❌ | Failed to load (%1) command\n%2"),
      openConsoleToSeeError: toEdaFont("👀 | Open console to see error details"),
      missingCommandNameUnload: toEdaFont("⚠️ | Please enter the command name you want to unload"),
      unloaded: toEdaFont("✅ | Unloaded command \"%1\" successfully"),
      unloadedError: toEdaFont("❌ | Failed to unload command \"%1\" with error\n%2: %3"),
      missingUrlCodeOrFileName: toEdaFont("⚠️ | Please enter the url or code and command file name you want to install"),
      missingUrlOrCode: toEdaFont("⚠️ | Please enter the url or code of the command file you want to install"),
      missingFileNameInstall: toEdaFont("⚠️ | Please enter the file name to save the command (with .js extension)"),
      invalidUrl: toEdaFont("⚠️ | Please enter a valid url"),
      invalidUrlOrCode: toEdaFont("⚠️ | Unable to get command code"),
      alreadExist: toEdaFont("⚠️ | The command file already exists, are you sure you want to overwrite the old command file?\nReact to this message to continue"),
      installed: toEdaFont("✅ | Installed command \"%1\" successfully, the command file is saved at %2"),
      installedError: toEdaFont("❌ | Failed to install command \"%1\" with error\n%2: %3"),
      missingFile: toEdaFont("⚠️ | Command file \"%1\" not found"),
      invalidFileName: toEdaFont("⚠️ | Invalid command file name"),
      unloadedFile: toEdaFont("✅ | Unloaded command \"%1\"")
    }
  },

  onStart: async function({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) {
    const { unloadScripts, loadScripts } = global.utils;

    if (args[0] == "load" && args.length == 2) {
      if (!args[1])
        return message.reply(toEdaFont(getLang("missingFileName")));
      const infoLoad = loadScripts("cmds", args[1], console.log, global.GoatBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
      if (infoLoad.status == "success")
        return message.reply(toEdaFont(getLang("loaded", infoLoad.name)));
      else
        return message.reply(toEdaFont(getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)));
    }
    else if ((args[0] || "").toLowerCase() == "loadall" || (args[0] == "load" && args.length > 2)) {
      const fileNeedToLoad = args[0].toLowerCase() == "loadall" ?
        fs.readdirSync(__dirname)
          .filter(file =>
            file.endsWith(".js") &&
            !file.match(/(eg)\.js$/g) &&
            (process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
            !global.GoatBot.configCommands.commandUnload?.includes(file)
          )
          .map(item => item = item.split(".")[0]) :
        args.slice(1);
      const arraySucces = [];
      const arrayFail = [];

      for (const fileName of fileNeedToLoad) {
        const infoLoad = loadScripts("cmds", fileName, console.log, global.GoatBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
        if (infoLoad.status == "success")
          arraySucces.push(fileName);
        else
          arrayFail.push(` ❗ ${fileName} => ${infoLoad.error.name}: ${infoLoad.error.message}`);
      }

      let msg = "";
      if (arraySucces.length > 0)
        msg += toEdaFont(getLang("loadedSuccess", arraySucces.length));
      if (arrayFail.length > 0) {
        msg += (msg ? "\n" : "") + toEdaFont(getLang("loadedFail", arrayFail.length, arrayFail.join("\n")));
        msg += "\n" + toEdaFont(getLang("openConsoleToSeeError"));
      }
      return message.reply(msg);
    }
    else if (args[0] == "unload") {
      if (!args[1])
        return message.reply(toEdaFont(getLang("missingCommandNameUnload")));
      const infoUnload = unloadScripts("cmds", args[1], global.GoatBot.configCommands, getLang);
      infoUnload.status == "success" ?
        message.reply(toEdaFont(getLang("unloaded", infoUnload.name))) :
        message.reply(toEdaFont(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message)));
    }
    else if (args[0] == "install") {
      let url = args[1];
      let fileName = args[2];
      let rawCode;

      if (!url || !fileName)
        return message.reply(toEdaFont(getLang("missingUrlCodeOrFileName")));

      if (url.endsWith(".js") && !isURL(url)) {
        const tmp = fileName;
        fileName = url;
        url = tmp;
      }

      if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
        if (!fileName || !fileName.endsWith(".js"))
          return message.reply(toEdaFont(getLang("missingFileNameInstall")));

        const domain = getDomain(url);
        if (!domain)
          return message.reply(toEdaFont(getLang("invalidUrl")));

        if (domain == "pastebin.com") {
          const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
          if (url.match(regex))
            url = url.replace(regex, "https://pastebin.com/raw/$1");
          if (url.endsWith("/"))
            url = url.slice(0, -1);
        }
        else if (domain == "github.com") {
          const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
          if (url.match(regex))
            url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
        }

        rawCode = (await axios.get(url)).data;

        if (domain == "savetext.net") {
          const $ = cheerio.load(rawCode);
          rawCode = $("#content").text();
        }
      }
      else {
        if (args[args.length - 1].endsWith(".js")) {
          fileName = args[args.length - 1];
          rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
        }
        else if (args[1].endsWith(".js")) {
          fileName = args[1];
          rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
        }
        else
          return message.reply(toEdaFont(getLang("missingFileNameInstall")));
      }

      if (!rawCode)
        return message.reply(toEdaFont(getLang("invalidUrlOrCode")));

      if (fs.existsSync(path.join(__dirname, fileName)))
        return message.reply(toEdaFont(getLang("alreadExist")), (err, info) => {
          global.GoatBot.onReaction.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            type: "install",
            author: event.senderID,
            data: {
              fileName,
              rawCode
            }
          });
        });
      else {
        const infoLoad = loadScripts("cmds", fileName, console.log, global.GoatBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
        infoLoad.status == "success" ?
          message.reply(toEdaFont(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), "")))) :
          message.reply(toEdaFont(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)));
      }
    }
    else
      message.SyntaxError();
  },

  onReaction: async function({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
    const { loadScripts } = global.utils;
    const { author, data: { fileName, rawCode } } = Reaction;
    if (event.userID != author)
      return;
    const infoLoad = loadScripts("cmds", fileName, console.log, global.GoatBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
    infoLoad.status == "success" ?
      message.reply(toEdaFont(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), "")))) :
      message.reply(toEdaFont(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message)));
  }
};