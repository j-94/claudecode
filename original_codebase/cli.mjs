#!/usr/bin/env -S node --no-warnings=ExperimentalWarning --enable-source-maps
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/services/sentry.ts
function initSentry() {
  console.log("Sentry initialization skipped for development");
}
async function captureException(error) {
  console.error("Error captured (not sent to Sentry):", error);
}
var init_sentry = __esm({
  "src/services/sentry.ts"() {
    "use strict";
  }
});

// src/utils/log.ts
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { writeFileSync, readFileSync } from "fs";
import { randomUUID } from "crypto";
import envPaths from "env-paths";
import { promises as fsPromises } from "fs";
function getProjectDir(cwd4) {
  return cwd4.replace(/[^a-zA-Z0-9]/g, "-");
}
function dateToFilename(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}
function getErrorsPath() {
  return join(CACHE_PATHS.errors(), DATE + ".txt");
}
function getMessagesPath(messageLogName, forkNumber, sidechainNumber) {
  return join(
    CACHE_PATHS.messages(),
    `${messageLogName}${forkNumber > 0 ? `-${forkNumber}` : ""}${sidechainNumber > 0 ? `-sidechain-${sidechainNumber}` : ""}.json`
  );
}
function logError(error) {
  try {
    if (false) {
      console.error(error);
    }
    const errorStr = error instanceof Error ? error.stack || error.message : String(error);
    const errorInfo = {
      error: errorStr,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (IN_MEMORY_ERROR_LOG.length >= MAX_IN_MEMORY_ERRORS) {
      IN_MEMORY_ERROR_LOG.shift();
    }
    IN_MEMORY_ERROR_LOG.push(errorInfo);
    appendToLog(getErrorsPath(), {
      error: errorStr
    });
  } catch {
  }
  captureException(error);
}
function getInMemoryErrors() {
  return [...IN_MEMORY_ERROR_LOG];
}
function readLog(path7) {
  if (!existsSync(path7)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(path7, "utf8"));
  } catch {
    return [];
  }
}
function appendToLog(path7, message) {
  if (process.env.USER_TYPE === "external") {
    return;
  }
  const dir = dirname(path7);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(path7)) {
    writeFileSync(path7, "[]", "utf8");
  }
  const messages = readLog(path7);
  const messageWithTimestamp = {
    ...message,
    cwd: process.cwd(),
    userType: process.env.USER_TYPE,
    sessionId: SESSION_ID,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "0.2.8"
  };
  messages.push(messageWithTimestamp);
  writeFileSync(path7, JSON.stringify(messages, null, 2), "utf8");
}
function overwriteLog(path7, messages) {
  if (process.env.USER_TYPE === "external") {
    return;
  }
  if (!messages.length) {
    return;
  }
  const dir = dirname(path7);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const messagesWithMetadata = messages.map((message) => ({
    ...message,
    cwd: process.cwd(),
    userType: process.env.USER_TYPE,
    sessionId: SESSION_ID,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "0.2.8"
  }));
  writeFileSync(path7, JSON.stringify(messagesWithMetadata, null, 2), "utf8");
}
async function loadLogList(path7 = CACHE_PATHS.messages()) {
  if (!existsSync(path7)) {
    logError(`No logs found at ${path7}`);
    return [];
  }
  const files = await fsPromises.readdir(path7);
  const logData = await Promise.all(
    files.map(async (file, i) => {
      const fullPath = join(path7, file);
      const content = await fsPromises.readFile(fullPath, "utf8");
      const messages = JSON.parse(content);
      const firstMessage = messages[0];
      const lastMessage = messages[messages.length - 1];
      const firstPrompt = firstMessage?.type === "user" && typeof firstMessage?.message?.content === "string" ? firstMessage?.message?.content : "No prompt";
      const { date, forkNumber, sidechainNumber } = parseLogFilename(file);
      return {
        date,
        forkNumber,
        fullPath,
        messages,
        value: i,
        // hack: overwritten after sorting, right below this
        created: parseISOString(firstMessage?.timestamp || date),
        modified: lastMessage?.timestamp ? parseISOString(lastMessage.timestamp) : parseISOString(date),
        firstPrompt: firstPrompt.split("\n")[0]?.slice(0, 50) + (firstPrompt.length > 50 ? "\u2026" : "") || "No prompt",
        messageCount: messages.length,
        sidechainNumber
      };
    })
  );
  return sortLogs(logData.filter((_) => _.messages.length)).map((_, i) => ({
    ..._,
    value: i
  }));
}
function parseLogFilename(filename) {
  const base = filename.split(".")[0];
  const segments = base.split("-");
  const hasSidechain = base.includes("-sidechain-");
  let date = base;
  let forkNumber = void 0;
  let sidechainNumber = void 0;
  if (hasSidechain) {
    const sidechainIndex = segments.indexOf("sidechain");
    sidechainNumber = Number(segments[sidechainIndex + 1]);
    if (sidechainIndex > 6) {
      forkNumber = Number(segments[sidechainIndex - 1]);
      date = segments.slice(0, 6).join("-");
    } else {
      date = segments.slice(0, 6).join("-");
    }
  } else if (segments.length > 6) {
    const lastSegment = Number(segments[segments.length - 1]);
    forkNumber = lastSegment >= 0 ? lastSegment : void 0;
    date = segments.slice(0, 6).join("-");
  } else {
    date = base;
  }
  return { date, forkNumber, sidechainNumber };
}
function getNextAvailableLogForkNumber(date, forkNumber, sidechainNumber) {
  while (existsSync(getMessagesPath(date, forkNumber, sidechainNumber))) {
    forkNumber++;
  }
  return forkNumber;
}
function getNextAvailableLogSidechainNumber(date, forkNumber) {
  let sidechainNumber = 1;
  while (existsSync(getMessagesPath(date, forkNumber, sidechainNumber))) {
    sidechainNumber++;
  }
  return sidechainNumber;
}
function sortLogs(logs) {
  return logs.sort((a, b) => {
    const modifiedDiff = b.modified.getTime() - a.modified.getTime();
    if (modifiedDiff !== 0) {
      return modifiedDiff;
    }
    const createdDiff = b.created.getTime() - a.created.getTime();
    if (createdDiff !== 0) {
      return createdDiff;
    }
    return (b.forkNumber ?? 0) - (a.forkNumber ?? 0);
  });
}
function formatDate(date) {
  const now = /* @__PURE__ */ new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).toLowerCase();
  if (isToday) {
    return `Today at ${timeStr}`;
  } else if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    }) + ` at ${timeStr}`;
  }
}
function parseISOString(s) {
  const b = s.split(/\D+/);
  return new Date(
    Date.UTC(
      parseInt(b[0], 10),
      parseInt(b[1], 10) - 1,
      parseInt(b[2], 10),
      parseInt(b[3], 10),
      parseInt(b[4], 10),
      parseInt(b[5], 10),
      parseInt(b[6], 10)
    )
  );
}
function logMCPError(serverName, error) {
  try {
    const logDir = CACHE_PATHS.mcpLogs(serverName);
    const errorStr = error instanceof Error ? error.stack || error.message : String(error);
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const logFile = join(logDir, DATE + ".txt");
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    if (!existsSync(logFile)) {
      writeFileSync(logFile, "[]", "utf8");
    }
    const errorInfo = {
      error: errorStr,
      timestamp,
      sessionId: SESSION_ID,
      cwd: process.cwd()
    };
    const messages = readLog(logFile);
    messages.push(errorInfo);
    writeFileSync(logFile, JSON.stringify(messages, null, 2), "utf8");
  } catch {
  }
}
var IN_MEMORY_ERROR_LOG, MAX_IN_MEMORY_ERRORS, SESSION_ID, paths, CACHE_PATHS, DATE;
var init_log = __esm({
  "src/utils/log.ts"() {
    "use strict";
    init_sentry();
    IN_MEMORY_ERROR_LOG = [];
    MAX_IN_MEMORY_ERRORS = 100;
    SESSION_ID = randomUUID();
    paths = envPaths("claude-cli");
    CACHE_PATHS = {
      errors: () => join(paths.cache, getProjectDir(process.cwd()), "errors"),
      messages: () => join(paths.cache, getProjectDir(process.cwd()), "messages"),
      mcpLogs: (serverName) => join(paths.cache, getProjectDir(process.cwd()), `mcp-logs-${serverName}`)
    };
    DATE = dateToFilename(/* @__PURE__ */ new Date());
  }
});

// node_modules/chalk/source/vendor/ansi-styles/index.js
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ANSI_BACKGROUND_OFFSET, wrapAnsi16, wrapAnsi256, wrapAnsi16m, styles, modifierNames, foregroundColorNames, backgroundColorNames, colorNames, ansiStyles, ansi_styles_default;
var init_ansi_styles = __esm({
  "node_modules/chalk/source/vendor/ansi-styles/index.js"() {
    ANSI_BACKGROUND_OFFSET = 10;
    wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
    wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
    wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
    styles = {
      modifier: {
        reset: [0, 0],
        // 21 isn't widely supported and 22 does the same thing
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        overline: [53, 55],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        // Bright color
        blackBright: [90, 39],
        gray: [90, 39],
        // Alias of `blackBright`
        grey: [90, 39],
        // Alias of `blackBright`
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39]
      },
      bgColor: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        // Bright color
        bgBlackBright: [100, 49],
        bgGray: [100, 49],
        // Alias of `bgBlackBright`
        bgGrey: [100, 49],
        // Alias of `bgBlackBright`
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      }
    };
    modifierNames = Object.keys(styles.modifier);
    foregroundColorNames = Object.keys(styles.color);
    backgroundColorNames = Object.keys(styles.bgColor);
    colorNames = [...foregroundColorNames, ...backgroundColorNames];
    ansiStyles = assembleStyles();
    ansi_styles_default = ansiStyles;
  }
});

// node_modules/chalk/source/vendor/supports-color/index.js
import process2 from "node:process";
import os from "node:os";
import tty from "node:tty";
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : process2.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== void 0) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === void 0) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (process2.platform === "win32") {
    const osRelease = os.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if (["GITHUB_ACTIONS", "GITEA_ACTIONS", "CIRCLECI"].some((key) => key in env)) {
      return 3;
    }
    if (["TRAVIS", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if (env.TERM === "xterm-kitty") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version2 = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env.TERM_PROGRAM) {
      case "iTerm.app": {
        return version2 >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, {
    streamIsTTY: stream && stream.isTTY,
    ...options
  });
  return translateLevel(level);
}
var env, flagForceColor, supportsColor, supports_color_default;
var init_supports_color = __esm({
  "node_modules/chalk/source/vendor/supports-color/index.js"() {
    ({ env } = process2);
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
      flagForceColor = 0;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      flagForceColor = 1;
    }
    supportsColor = {
      stdout: createSupportsColor({ isTTY: tty.isatty(1) }),
      stderr: createSupportsColor({ isTTY: tty.isatty(2) })
    };
    supports_color_default = supportsColor;
  }
});

// node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
var init_utilities = __esm({
  "node_modules/chalk/source/utilities.js"() {
  }
});

// node_modules/chalk/source/index.js
function createChalk(options) {
  return chalkFactory(options);
}
var stdoutColor, stderrColor, GENERATOR, STYLER, IS_EMPTY, levelMapping, styles2, applyOptions, chalkFactory, getModelAnsi, usedModels, proto, createStyler, createBuilder, applyStyle, chalk, chalkStderr, source_default;
var init_source = __esm({
  "node_modules/chalk/source/index.js"() {
    init_ansi_styles();
    init_supports_color();
    init_utilities();
    ({ stdout: stdoutColor, stderr: stderrColor } = supports_color_default);
    GENERATOR = Symbol("GENERATOR");
    STYLER = Symbol("STYLER");
    IS_EMPTY = Symbol("IS_EMPTY");
    levelMapping = [
      "ansi",
      "ansi",
      "ansi256",
      "ansi16m"
    ];
    styles2 = /* @__PURE__ */ Object.create(null);
    applyOptions = (object, options = {}) => {
      if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
        throw new Error("The `level` option should be an integer from 0 to 3");
      }
      const colorLevel = stdoutColor ? stdoutColor.level : 0;
      object.level = options.level === void 0 ? colorLevel : options.level;
    };
    chalkFactory = (options) => {
      const chalk2 = (...strings) => strings.join(" ");
      applyOptions(chalk2, options);
      Object.setPrototypeOf(chalk2, createChalk.prototype);
      return chalk2;
    };
    Object.setPrototypeOf(createChalk.prototype, Function.prototype);
    for (const [styleName, style] of Object.entries(ansi_styles_default)) {
      styles2[styleName] = {
        get() {
          const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
          Object.defineProperty(this, styleName, { value: builder });
          return builder;
        }
      };
    }
    styles2.visible = {
      get() {
        const builder = createBuilder(this, this[STYLER], true);
        Object.defineProperty(this, "visible", { value: builder });
        return builder;
      }
    };
    getModelAnsi = (model2, level, type, ...arguments_) => {
      if (model2 === "rgb") {
        if (level === "ansi16m") {
          return ansi_styles_default[type].ansi16m(...arguments_);
        }
        if (level === "ansi256") {
          return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
        }
        return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
      }
      if (model2 === "hex") {
        return getModelAnsi("rgb", level, type, ...ansi_styles_default.hexToRgb(...arguments_));
      }
      return ansi_styles_default[type][model2](...arguments_);
    };
    usedModels = ["rgb", "hex", "ansi256"];
    for (const model2 of usedModels) {
      styles2[model2] = {
        get() {
          const { level } = this;
          return function(...arguments_) {
            const styler = createStyler(getModelAnsi(model2, levelMapping[level], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
            return createBuilder(this, styler, this[IS_EMPTY]);
          };
        }
      };
      const bgModel = "bg" + model2[0].toUpperCase() + model2.slice(1);
      styles2[bgModel] = {
        get() {
          const { level } = this;
          return function(...arguments_) {
            const styler = createStyler(getModelAnsi(model2, levelMapping[level], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
            return createBuilder(this, styler, this[IS_EMPTY]);
          };
        }
      };
    }
    proto = Object.defineProperties(() => {
    }, {
      ...styles2,
      level: {
        enumerable: true,
        get() {
          return this[GENERATOR].level;
        },
        set(level) {
          this[GENERATOR].level = level;
        }
      }
    });
    createStyler = (open, close, parent) => {
      let openAll;
      let closeAll;
      if (parent === void 0) {
        openAll = open;
        closeAll = close;
      } else {
        openAll = parent.openAll + open;
        closeAll = close + parent.closeAll;
      }
      return {
        open,
        close,
        openAll,
        closeAll,
        parent
      };
    };
    createBuilder = (self, _styler, _isEmpty) => {
      const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
      Object.setPrototypeOf(builder, proto);
      builder[GENERATOR] = self;
      builder[STYLER] = _styler;
      builder[IS_EMPTY] = _isEmpty;
      return builder;
    };
    applyStyle = (self, string) => {
      if (self.level <= 0 || !string) {
        return self[IS_EMPTY] ? "" : string;
      }
      let styler = self[STYLER];
      if (styler === void 0) {
        return string;
      }
      const { openAll, closeAll } = styler;
      if (string.includes("\x1B")) {
        while (styler !== void 0) {
          string = stringReplaceAll(string, styler.close, styler.open);
          styler = styler.parent;
        }
      }
      const lfIndex = string.indexOf("\n");
      if (lfIndex !== -1) {
        string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
      }
      return openAll + string + closeAll;
    };
    Object.defineProperties(createChalk.prototype, styles2);
    chalk = createChalk();
    chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
    source_default = chalk;
  }
});

// src/services/browserMocks.ts
var mockDocument, mockWindow, mockNavigator;
var init_browserMocks = __esm({
  "src/services/browserMocks.ts"() {
    "use strict";
    mockDocument = {
      visibilityState: "visible",
      documentElement: {
        lang: "en"
      },
      addEventListener: (_event, _handler) => {
      }
    };
    mockWindow = {
      document: mockDocument,
      location: {
        href: "node://localhost",
        pathname: "/"
      },
      addEventListener: (event, handler) => {
        if (event === "beforeunload") {
          process.on("exit", () => {
            if (typeof handler === "function") {
              handler({});
            } else {
              handler.handleEvent({});
            }
          });
        }
      },
      focus: () => {
      },
      innerHeight: 768,
      innerWidth: 1024
    };
    mockNavigator = {
      sendBeacon: (_url, _data) => {
        return true;
      },
      userAgent: "Mozilla/5.0 (Node.js) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0",
      language: "en-US"
    };
    if (typeof window === "undefined") {
      global.window = mockWindow;
    }
    if (typeof navigator === "undefined") {
      global.navigator = mockNavigator;
    }
  }
});

// src/services/statsigStorage.ts
import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";
import { existsSync as existsSync3, unlinkSync } from "fs";
var STATSIG_DIR, FileSystemStorageProvider;
var init_statsigStorage = __esm({
  "src/services/statsigStorage.ts"() {
    "use strict";
    init_log();
    STATSIG_DIR = path.join(homedir(), ".claude", "statsig");
    try {
      fs.mkdirSync(STATSIG_DIR, { recursive: true });
    } catch (error) {
      logError(`Failed to create statsig storage directory: ${error}`);
    }
    FileSystemStorageProvider = class {
      constructor() {
        this.cache = /* @__PURE__ */ new Map();
        this.ready = false;
        try {
          if (!fs.existsSync(STATSIG_DIR)) {
            fs.mkdirSync(STATSIG_DIR, { recursive: true });
          }
          const files = fs.readdirSync(STATSIG_DIR);
          for (const file of files) {
            const key = decodeURIComponent(file);
            const value = fs.readFileSync(path.join(STATSIG_DIR, file), "utf8");
            this.cache.set(key, value);
          }
          this.ready = true;
        } catch (error) {
          logError(`Failed to initialize statsig storage: ${error}`);
          this.ready = true;
        }
      }
      isReady() {
        return this.ready;
      }
      isReadyResolver() {
        return this.ready ? Promise.resolve() : null;
      }
      getProviderName() {
        return "FileSystemStorageProvider";
      }
      getItem(key) {
        return this.cache.get(key) ?? null;
      }
      setItem(key, value) {
        this.cache.set(key, value);
        try {
          const encodedKey = encodeURIComponent(key);
          fs.writeFileSync(path.join(STATSIG_DIR, encodedKey), value, "utf8");
        } catch (error) {
          logError(`Failed to write statsig storage item: ${error}`);
        }
      }
      removeItem(key) {
        this.cache.delete(key);
        const encodedKey = encodeURIComponent(key);
        const file = path.join(STATSIG_DIR, encodedKey);
        if (!existsSync3(file)) {
          return;
        }
        try {
          unlinkSync(file);
        } catch (error) {
          logError(`Failed to remove statsig storage item: ${error}`);
        }
      }
      getAllKeys() {
        return Array.from(this.cache.keys());
      }
    };
  }
});

// src/constants/keys.ts
var STATSIG_CLIENT_KEY;
var init_keys = __esm({
  "src/constants/keys.ts"() {
    "use strict";
    STATSIG_CLIENT_KEY = "client-RRNS7R65EAtReO5XA4xDC3eU6ZdJQi6lLEP6b5j32Me";
  }
});

// src/utils/user.ts
import { memoize } from "lodash-es";
var getGitEmail, getUser;
var init_user = __esm({
  "src/utils/user.ts"() {
    "use strict";
    init_config();
    init_env();
    init_execFileNoThrow();
    init_log();
    getGitEmail = memoize(async () => {
      const result = await execFileNoThrow("git", ["config", "user.email"]);
      if (result.code !== 0) {
        logError(`Failed to get git email: ${result.stdout} ${result.stderr}`);
        return void 0;
      }
      return result.stdout.trim() || void 0;
    });
    getUser = memoize(async () => {
      const userID = getOrCreateUserID();
      const config3 = getGlobalConfig();
      const email = process.env.USER_TYPE === "ant" ? config3.oauthAccount?.emailAddress ?? await getGitEmail() ?? (process.env.COO_CREATOR ? `${process.env.COO_CREATOR}@anthropic.com` : void 0) : void 0;
      return {
        customIDs: {
          // for session level tests
          sessionId: SESSION_ID
        },
        userID,
        appVersion: "0.2.8",
        userAgent: env2.platform,
        email,
        custom: {
          nodeVersion: env2.nodeVersion,
          userType: process.env.USER_TYPE,
          organizationUuid: config3.oauthAccount?.organizationUuid,
          accountUuid: config3.oauthAccount?.accountUuid
        }
      };
    });
  }
});

// src/constants/betas.ts
var GATE_TOKEN_EFFICIENT_TOOLS, BETA_HEADER_TOKEN_EFFICIENT_TOOLS, GATE_USE_EXTERNAL_UPDATER, CLAUDE_CODE_20250219_BETA_HEADER;
var init_betas = __esm({
  "src/constants/betas.ts"() {
    "use strict";
    GATE_TOKEN_EFFICIENT_TOOLS = "tengu-token-efficient-tools";
    BETA_HEADER_TOKEN_EFFICIENT_TOOLS = "token-efficient-tools-2024-12-11";
    GATE_USE_EXTERNAL_UPDATER = "tengu-use-external-updater";
    CLAUDE_CODE_20250219_BETA_HEADER = "claude-code-20250219";
  }
});

// src/utils/betas.ts
import { memoize as memoize2 } from "lodash-es";
var getBetas;
var init_betas2 = __esm({
  "src/utils/betas.ts"() {
    "use strict";
    init_statsig();
    init_betas();
    getBetas = memoize2(async () => {
      const betaHeaders = [CLAUDE_CODE_20250219_BETA_HEADER];
      if (process.env.USER_TYPE === "ant" || process.env.SWE_BENCH) {
        const useTokenEfficientTools = await checkGate(GATE_TOKEN_EFFICIENT_TOOLS);
        if (useTokenEfficientTools) {
          betaHeaders.push(BETA_HEADER_TOKEN_EFFICIENT_TOOLS);
        }
      }
      return betaHeaders;
    });
  }
});

// src/utils/git.ts
import { memoize as memoize3 } from "lodash-es";
async function getGitState() {
  try {
    const [commitHash, branchName, remoteUrl, isHeadOnRemote, isClean] = await Promise.all([
      getHead(),
      getBranch(),
      getRemoteUrl(),
      getIsHeadOnRemote(),
      getIsClean()
    ]);
    return {
      commitHash,
      branchName,
      remoteUrl,
      isHeadOnRemote,
      isClean
    };
  } catch (_) {
    return null;
  }
}
var getIsGit, getHead, getBranch, getRemoteUrl, getIsHeadOnRemote, getIsClean;
var init_git = __esm({
  "src/utils/git.ts"() {
    "use strict";
    init_execFileNoThrow();
    getIsGit = memoize3(async () => {
      const { code } = await execFileNoThrow("git", [
        "rev-parse",
        "--is-inside-work-tree"
      ]);
      return code === 0;
    });
    getHead = async () => {
      const { stdout } = await execFileNoThrow("git", ["rev-parse", "HEAD"]);
      return stdout.trim();
    };
    getBranch = async () => {
      const { stdout } = await execFileNoThrow(
        "git",
        ["rev-parse", "--abbrev-ref", "HEAD"],
        void 0,
        void 0,
        false
      );
      return stdout.trim();
    };
    getRemoteUrl = async () => {
      const { stdout, code } = await execFileNoThrow(
        "git",
        ["remote", "get-url", "origin"],
        void 0,
        void 0,
        false
      );
      return code === 0 ? stdout.trim() : null;
    };
    getIsHeadOnRemote = async () => {
      const { code } = await execFileNoThrow(
        "git",
        ["rev-parse", "@{u}"],
        void 0,
        void 0,
        false
      );
      return code === 0;
    };
    getIsClean = async () => {
      const { stdout } = await execFileNoThrow(
        "git",
        ["status", "--porcelain"],
        void 0,
        void 0,
        false
      );
      return stdout.trim().length === 0;
    };
  }
});

// src/utils/model.ts
var model_exports = {};
__export(model_exports, {
  SMALL_FAST_MODEL: () => SMALL_FAST_MODEL,
  USE_BEDROCK: () => USE_BEDROCK,
  USE_VERTEX: () => USE_VERTEX,
  getSlowAndCapableModel: () => getSlowAndCapableModel,
  getVertexRegionForModel: () => getVertexRegionForModel,
  hasResearchModelAccess: () => hasResearchModelAccess,
  isDefaultSlowAndCapableModel: () => isDefaultSlowAndCapableModel,
  isModelAllowed: () => isModelAllowed,
  isResearchModel: () => isResearchModel
});
import { memoize as memoize4 } from "lodash-es";
async function getModelConfig() {
  try {
    return await getDynamicConfig(
      "tengu-capable-model-config",
      DEFAULT_MODEL_CONFIG
    );
  } catch (error) {
    logError(error);
    return DEFAULT_MODEL_CONFIG;
  }
}
function isResearchModel(modelName) {
  return Boolean(modelName?.startsWith("research-"));
}
function hasResearchModelAccess() {
  if (false) {
    return true;
  }
  if (process.env.USER_TYPE === "ant") {
    return true;
  }
  const config3 = getGlobalConfig();
  return Boolean(config3.researchModelAccess);
}
function isModelAllowed(modelName) {
  if (!isResearchModel(modelName)) {
    return true;
  }
  const config3 = getGlobalConfig();
  if (!config3.researchModelAccess) {
    return false;
  }
  if (!config3.allowedModels || config3.allowedModels.length === 0) {
    return true;
  }
  return config3.allowedModels.includes(modelName);
}
async function isDefaultSlowAndCapableModel() {
  const config3 = getGlobalConfig();
  return !process.env.ANTHROPIC_MODEL && !config3.preferredModel || process.env.ANTHROPIC_MODEL === await getSlowAndCapableModel() || config3.preferredModel === await getSlowAndCapableModel();
}
function getVertexRegionForModel(model2) {
  if (model2?.startsWith("claude-3-5-haiku")) {
    return process.env.VERTEX_REGION_CLAUDE_3_5_HAIKU;
  } else if (model2?.startsWith("claude-3-5-sonnet")) {
    return process.env.VERTEX_REGION_CLAUDE_3_5_SONNET;
  } else if (model2?.startsWith("claude-3-7-sonnet")) {
    return process.env.VERTEX_REGION_CLAUDE_3_7_SONNET;
  }
}
var USE_BEDROCK, USE_VERTEX, DEFAULT_MODEL_CONFIG, SMALL_FAST_MODEL, getSlowAndCapableModel;
var init_model = __esm({
  "src/utils/model.ts"() {
    "use strict";
    init_statsig();
    init_log();
    init_config();
    USE_BEDROCK = !!process.env.CLAUDE_CODE_USE_BEDROCK;
    USE_VERTEX = !!process.env.CLAUDE_CODE_USE_VERTEX;
    DEFAULT_MODEL_CONFIG = {
      bedrock: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
      vertex: "claude-3-7-sonnet@20250219",
      firstParty: "claude-3-7-sonnet-20250219"
    };
    SMALL_FAST_MODEL = USE_BEDROCK ? "us.anthropic.claude-3-5-haiku-20241022-v1:0" : USE_VERTEX ? "claude-3-5-haiku@20241022" : "claude-3-5-haiku-20241022";
    getSlowAndCapableModel = memoize4(async () => {
      if (process.env.ANTHROPIC_MODEL) {
        const modelName = process.env.ANTHROPIC_MODEL;
        if (isResearchModel(modelName) && !hasResearchModelAccess()) {
          console.warn(`Research model ${modelName} requested but research model access is not enabled.`);
        } else {
          return modelName;
        }
      }
      const globalConfig = getGlobalConfig();
      if (globalConfig.preferredModel) {
        if (isResearchModel(globalConfig.preferredModel) && !hasResearchModelAccess()) {
          console.warn(`Research model ${globalConfig.preferredModel} requested but research model access is not enabled.`);
        } else {
          return globalConfig.preferredModel;
        }
      }
      if (process.env.USER_TYPE === "ant") {
        return (await getExperimentValue("chihuahua", {
          color: "research-claude-denim"
        })).color;
      }
      if (process.env.USER_TYPE === "SWE_BENCH") {
        if (process.env.ANTHROPIC_MODEL) {
          return process.env.ANTHROPIC_MODEL;
        }
      }
      const config3 = await getModelConfig();
      if (USE_BEDROCK) {
        return config3.bedrock;
      }
      if (USE_VERTEX) {
        return config3.vertex;
      }
      return config3.firstParty;
    });
  }
});

// src/services/statsig.ts
import React from "react";
import { memoize as memoize5 } from "lodash-es";
import {
  StatsigClient,
  LogLevel
} from "@statsig/js-client";
function logEvent(eventName, metadata) {
  if (env2.isCI || false) {
    return;
  }
  Promise.all([
    initializeStatsig(),
    getIsGit(),
    getBetas(),
    metadata.model ? Promise.resolve(metadata.model) : getSlowAndCapableModel()
  ]).then(([statsigClient, isGit, betas, model2]) => {
    if (!statsigClient) return;
    const eventMetadata = {
      ...metadata,
      model: model2,
      sessionId: SESSION_ID,
      userType: process.env.USER_TYPE || "",
      ...process.env.SWE_BENCH_RUN_ID ? { sweBenchId: process.env.SWE_BENCH_RUN_ID } : {},
      ...betas.length > 0 ? { betas: betas.join(",") } : {},
      env: JSON.stringify({
        isGit,
        platform: env2.platform,
        nodeVersion: env2.nodeVersion,
        terminal: env2.terminal,
        version: "0.2.8"
      })
    };
    if (process.env.USER_TYPE === "ant" && (process.argv.includes("--debug") || process.argv.includes("-d"))) {
      console.log(
        source_default.dim(
          `[DEBUG-ONLY] Statsig event: ${eventName} ${JSON.stringify(metadata, null, 0)}`
        )
      );
    }
    const event = {
      eventName,
      metadata: eventMetadata
    };
    statsigClient.logEvent(event);
  });
}
var gateValues, client, initializeStatsig, checkGate, getExperimentValue, getDynamicConfig;
var init_statsig = __esm({
  "src/services/statsig.ts"() {
    "use strict";
    init_source();
    init_browserMocks();
    init_statsigStorage();
    init_keys();
    init_env();
    init_user();
    init_log();
    init_log();
    init_betas2();
    init_git();
    init_model();
    gateValues = {};
    client = null;
    initializeStatsig = memoize5(
      async () => {
        if (env2.isCI || false) {
          return null;
        }
        const user = await getUser();
        const options = {
          networkConfig: {
            api: "https://statsig.anthropic.com/v1/"
          },
          environment: {
            tier: env2.isCI || ["test", "development"].includes("production") ? "dev" : "production"
          },
          logLevel: LogLevel.None,
          storageProvider: new FileSystemStorageProvider()
        };
        client = new StatsigClient(STATSIG_CLIENT_KEY, user, options);
        client.on("error", (errorEvent) => {
          logError(`Statsig error: ${errorEvent}`);
        });
        await client.initializeAsync();
        process.on("exit", () => {
          client?.flush();
        });
        return client;
      }
    );
    checkGate = memoize5(async (gateName) => {
      if (env2.isCI || false) {
        return false;
      }
      const statsigClient = await initializeStatsig();
      if (!statsigClient) return false;
      const value = statsigClient.checkGate(gateName);
      gateValues[gateName] = value;
      return value;
    });
    getExperimentValue = memoize5(
      async (experimentName, defaultValue) => {
        if (env2.isCI || false) {
          return defaultValue;
        }
        const statsigClient = await initializeStatsig();
        if (!statsigClient) return defaultValue;
        const experiment = statsigClient.getExperiment(experimentName);
        if (Object.keys(experiment.value).length === 0) {
          logError(`getExperimentValue got empty value for ${experimentName}`);
          return defaultValue;
        }
        return experiment.value;
      }
    );
    getDynamicConfig = async (configName, defaultValue) => {
      if (env2.isCI || false) {
        return defaultValue;
      }
      const statsigClient = await initializeStatsig();
      if (!statsigClient) return defaultValue;
      const config3 = statsigClient.getDynamicConfig(configName);
      if (Object.keys(config3.value).length === 0) {
        logError(`getDynamicConfig got empty value for ${configName}`);
        return defaultValue;
      }
      return config3.value;
    };
  }
});

// src/utils/PersistentShell.ts
import * as fs2 from "fs";
import { homedir as homedir2 } from "os";
import { existsSync as existsSync5 } from "fs";
import shellquote from "shell-quote";
import { spawn, execSync } from "child_process";
import { isAbsolute, resolve, join as join3 } from "path";
import * as os2 from "os";
var TEMPFILE_PREFIX, DEFAULT_TIMEOUT, SIGTERM_CODE, FILE_SUFFIXES, SHELL_CONFIGS, PersistentShell;
var init_PersistentShell = __esm({
  "src/utils/PersistentShell.ts"() {
    "use strict";
    init_log();
    init_statsig();
    TEMPFILE_PREFIX = os2.tmpdir() + "/claude-";
    DEFAULT_TIMEOUT = 30 * 60 * 1e3;
    SIGTERM_CODE = 143;
    FILE_SUFFIXES = {
      STATUS: "-status",
      STDOUT: "-stdout",
      STDERR: "-stderr",
      CWD: "-cwd"
    };
    SHELL_CONFIGS = {
      "/bin/bash": ".bashrc",
      "/bin/zsh": ".zshrc"
    };
    PersistentShell = class _PersistentShell {
      constructor(cwd4) {
        this.commandQueue = [];
        this.isExecuting = false;
        this.isAlive = true;
        this.commandInterrupted = false;
        this.binShell = process.env.SHELL || "/bin/bash";
        this.shell = spawn(this.binShell, ["-l"], {
          stdio: ["pipe", "pipe", "pipe"],
          cwd: cwd4,
          env: {
            ...process.env,
            GIT_EDITOR: "true"
          }
        });
        this.cwd = cwd4;
        this.shell.on("exit", (code, signal) => {
          if (code) {
            logError(`Shell exited with code ${code} and signal ${signal}`);
            logEvent("persistent_shell_exit", {
              code: code?.toString() || "null",
              signal: signal || "null"
            });
          }
          for (const file of [
            this.statusFile,
            this.stdoutFile,
            this.stderrFile,
            this.cwdFile
          ]) {
            if (fs2.existsSync(file)) {
              fs2.unlinkSync(file);
            }
          }
          this.isAlive = false;
        });
        const id = Math.floor(Math.random() * 65536).toString(16).padStart(4, "0");
        this.statusFile = TEMPFILE_PREFIX + id + FILE_SUFFIXES.STATUS;
        this.stdoutFile = TEMPFILE_PREFIX + id + FILE_SUFFIXES.STDOUT;
        this.stderrFile = TEMPFILE_PREFIX + id + FILE_SUFFIXES.STDERR;
        this.cwdFile = TEMPFILE_PREFIX + id + FILE_SUFFIXES.CWD;
        for (const file of [this.statusFile, this.stdoutFile, this.stderrFile]) {
          fs2.writeFileSync(file, "");
        }
        fs2.writeFileSync(this.cwdFile, cwd4);
        const configFile = SHELL_CONFIGS[this.binShell];
        if (configFile) {
          const configFilePath = join3(homedir2(), configFile);
          if (existsSync5(configFilePath)) {
            this.sendToShell(`source ${configFilePath}`);
          }
        }
      }
      static {
        this.instance = null;
      }
      static restart() {
        if (_PersistentShell.instance) {
          _PersistentShell.instance.close();
          _PersistentShell.instance = null;
        }
      }
      static getInstance() {
        if (!_PersistentShell.instance || !_PersistentShell.instance.isAlive) {
          _PersistentShell.instance = new _PersistentShell(process.cwd());
        }
        return _PersistentShell.instance;
      }
      killChildren() {
        const parentPid = this.shell.pid;
        try {
          const childPids = execSync(`pgrep -P ${parentPid}`).toString().trim().split("\n").filter(Boolean);
          if (childPids.length > 0) {
            logEvent("persistent_shell_command_interrupted", {
              numChildProcesses: childPids.length.toString()
            });
          }
          childPids.forEach((pid) => {
            try {
              process.kill(Number(pid), "SIGTERM");
            } catch (error) {
              logError(`Failed to kill process ${pid}: ${error}`);
              logEvent("persistent_shell_kill_process_error", {
                error: error.message.substring(0, 10)
              });
            }
          });
        } catch {
        } finally {
          this.commandInterrupted = true;
        }
      }
      async processQueue() {
        if (this.isExecuting || this.commandQueue.length === 0) return;
        this.isExecuting = true;
        const { command: command3, abortSignal, timeout, resolve: resolve16, reject } = this.commandQueue.shift();
        const killChildren = () => this.killChildren();
        if (abortSignal) {
          abortSignal.addEventListener("abort", killChildren);
        }
        try {
          const result = await this.exec_(command3, timeout);
          resolve16(result);
        } catch (error) {
          logEvent("persistent_shell_command_error", {
            error: error.message.substring(0, 10)
          });
          reject(error);
        } finally {
          this.isExecuting = false;
          if (abortSignal) {
            abortSignal.removeEventListener("abort", killChildren);
          }
          this.processQueue();
        }
      }
      async exec(command3, abortSignal, timeout) {
        return new Promise((resolve16, reject) => {
          this.commandQueue.push({ command: command3, abortSignal, timeout, resolve: resolve16, reject });
          this.processQueue();
        });
      }
      async exec_(command3, timeout) {
        const quotedCommand = shellquote.quote([command3]);
        try {
          execSync(`${this.binShell} -n -c ${quotedCommand}`, {
            stdio: "ignore",
            timeout: 1e3
          });
        } catch (stderr) {
          const errorStr = typeof stderr === "string" ? stderr : String(stderr || "");
          logEvent("persistent_shell_syntax_error", {
            error: errorStr.substring(0, 10)
          });
          return Promise.resolve({
            stdout: "",
            stderr: errorStr,
            code: 128,
            interrupted: false
          });
        }
        const commandTimeout = timeout || DEFAULT_TIMEOUT;
        this.commandInterrupted = false;
        return new Promise((resolve16) => {
          fs2.writeFileSync(this.stdoutFile, "");
          fs2.writeFileSync(this.stderrFile, "");
          fs2.writeFileSync(this.statusFile, "");
          const commandParts = [];
          commandParts.push(
            `eval ${quotedCommand} < /dev/null > ${this.stdoutFile} 2> ${this.stderrFile}`
          );
          commandParts.push(`EXEC_EXIT_CODE=$?`);
          commandParts.push(`pwd > ${this.cwdFile}`);
          commandParts.push(`echo $EXEC_EXIT_CODE > ${this.statusFile}`);
          this.sendToShell(commandParts.join("\n"));
          const start = Date.now();
          const checkCompletion = setInterval(() => {
            try {
              let statusFileSize = 0;
              if (fs2.existsSync(this.statusFile)) {
                statusFileSize = fs2.statSync(this.statusFile).size;
              }
              if (statusFileSize > 0 || Date.now() - start > commandTimeout || this.commandInterrupted) {
                clearInterval(checkCompletion);
                const stdout = fs2.existsSync(this.stdoutFile) ? fs2.readFileSync(this.stdoutFile, "utf8") : "";
                let stderr = fs2.existsSync(this.stderrFile) ? fs2.readFileSync(this.stderrFile, "utf8") : "";
                let code;
                if (statusFileSize) {
                  code = Number(fs2.readFileSync(this.statusFile, "utf8"));
                } else {
                  this.killChildren();
                  code = SIGTERM_CODE;
                  stderr += (stderr ? "\n" : "") + "Command execution timed out";
                  logEvent("persistent_shell_command_timeout", {
                    command: command3.substring(0, 10),
                    timeout: commandTimeout.toString()
                  });
                }
                resolve16({
                  stdout,
                  stderr,
                  code,
                  interrupted: this.commandInterrupted
                });
              }
            } catch {
            }
          }, 10);
        });
      }
      sendToShell(command3) {
        try {
          this.shell.stdin.write(command3 + "\n");
        } catch (error) {
          const errorString = error instanceof Error ? error.message : String(error || "Unknown error");
          logError(`Error in sendToShell: ${errorString}`);
          logEvent("persistent_shell_write_error", {
            error: errorString.substring(0, 100),
            command: command3.substring(0, 30)
          });
          throw error;
        }
      }
      pwd() {
        try {
          const newCwd = fs2.readFileSync(this.cwdFile, "utf8").trim();
          if (newCwd) {
            this.cwd = newCwd;
          }
        } catch (error) {
          logError(`Shell pwd error ${error}`);
        }
        return this.cwd;
      }
      async setCwd(cwd4) {
        const resolved = isAbsolute(cwd4) ? cwd4 : resolve(process.cwd(), cwd4);
        if (!existsSync5(resolved)) {
          throw new Error(`Path "${resolved}" does not exist`);
        }
        await this.exec(`cd ${resolved}`);
      }
      close() {
        this.shell.stdin.end();
        this.shell.kill();
      }
    };
  }
});

// src/utils/state.ts
import { cwd } from "process";
async function setCwd(cwd4) {
  await PersistentShell.getInstance().setCwd(cwd4);
}
function getOriginalCwd() {
  return STATE.originalCwd;
}
function getCwd() {
  return PersistentShell.getInstance().pwd();
}
var STATE;
var init_state = __esm({
  "src/utils/state.ts"() {
    "use strict";
    init_PersistentShell();
    STATE = {
      originalCwd: cwd()
    };
  }
});

// src/utils/execFileNoThrow.ts
import { execFile } from "child_process";
function execFileNoThrow(file, args, abortSignal, timeout = 10 * SECONDS_IN_MINUTE * MS_IN_SECOND, preserveOutputOnError = true) {
  return new Promise((resolve16) => {
    try {
      execFile(
        file,
        args,
        {
          maxBuffer: 1e6,
          signal: abortSignal,
          timeout,
          cwd: getCwd()
        },
        (error, stdout, stderr) => {
          if (error) {
            if (preserveOutputOnError) {
              const errorCode = typeof error.code === "number" ? error.code : 1;
              resolve16({
                stdout: stdout || "",
                stderr: stderr || "",
                code: errorCode
              });
            } else {
              resolve16({ stdout: "", stderr: "", code: 1 });
            }
          } else {
            resolve16({ stdout, stderr, code: 0 });
          }
        }
      );
    } catch (error) {
      logError(error);
      resolve16({ stdout: "", stderr: "", code: 1 });
    }
  });
}
var MS_IN_SECOND, SECONDS_IN_MINUTE;
var init_execFileNoThrow = __esm({
  "src/utils/execFileNoThrow.ts"() {
    "use strict";
    init_state();
    init_log();
    MS_IN_SECOND = 1e3;
    SECONDS_IN_MINUTE = 60;
  }
});

// src/utils/env.ts
import { memoize as memoize6 } from "lodash-es";
import { join as join4 } from "path";
import { homedir as homedir3 } from "os";
import { existsSync as existsSync6 } from "fs";
import { config } from "dotenv";
function loadEnv() {
  const envPath = join4(getCwd(), ".env");
  if (existsSync6(envPath)) {
    config({ path: envPath });
    return true;
  }
  const claudeEnvPath = join4(CLAUDE_BASE_DIR, ".env");
  if (existsSync6(claudeEnvPath)) {
    config({ path: claudeEnvPath });
    return true;
  }
  return false;
}
function getResearchToolsEnvInfo() {
  return {
    lotus: {
      apiKeyAvailable: !!process.env.LOTUS_API_KEY || !!process.env.OPENAI_API_KEY,
      apiKeySource: process.env.LOTUS_API_KEY ? "LOTUS_API_KEY" : process.env.OPENAI_API_KEY ? "OPENAI_API_KEY" : "Not Available"
    },
    docETL: {
      apiKeyAvailable: !!process.env.DOCETL_API_KEY || !!process.env.OPENAI_API_KEY || !!process.env.ANTHROPIC_API_KEY,
      apiKeySource: process.env.DOCETL_API_KEY ? "DOCETL_API_KEY" : process.env.OPENAI_API_KEY ? "OPENAI_API_KEY" : process.env.ANTHROPIC_API_KEY ? "ANTHROPIC_API_KEY" : "Not Available",
      model: process.env.DOCETL_MODEL || "gpt-4 (default)"
    },
    claudeModel: {
      model: process.env.ANTHROPIC_MODEL || "default",
      isResearchModel: process.env.ANTHROPIC_MODEL?.startsWith("research-") || false
    },
    debug: process.env.DEBUG === "true"
  };
}
var CLAUDE_BASE_DIR, GLOBAL_CLAUDE_FILE, MEMORY_DIR, getIsDocker, hasInternetAccess, env2;
var init_env = __esm({
  "src/utils/env.ts"() {
    "use strict";
    init_execFileNoThrow();
    init_state();
    CLAUDE_BASE_DIR = process.env.CLAUDE_CONFIG_DIR ?? join4(homedir3(), ".claude");
    GLOBAL_CLAUDE_FILE = process.env.CLAUDE_CONFIG_DIR ? join4(CLAUDE_BASE_DIR, "config.json") : join4(homedir3(), ".claude.json");
    MEMORY_DIR = join4(CLAUDE_BASE_DIR, "memory");
    loadEnv();
    getIsDocker = memoize6(async () => {
      const { code } = await execFileNoThrow("test", ["-f", "/.dockerenv"]);
      if (code !== 0) {
        return false;
      }
      return process.platform === "linux";
    });
    hasInternetAccess = memoize6(async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1e3);
        await fetch("http://1.1.1.1", {
          method: "HEAD",
          signal: controller.signal
        });
        clearTimeout(timeout);
        return true;
      } catch {
        return false;
      }
    });
    env2 = {
      getIsDocker,
      hasInternetAccess,
      isCI: Boolean(process.env.CI),
      platform: process.platform === "win32" ? "windows" : process.platform === "darwin" ? "macos" : "linux",
      nodeVersion: process.version,
      terminal: process.env.TERM_PROGRAM
    };
  }
});

// src/utils/json.ts
function safeParseJSON(json) {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json);
  } catch (e) {
    logError(e);
    return null;
  }
}
var init_json = __esm({
  "src/utils/json.ts"() {
    "use strict";
    init_log();
  }
});

// src/utils/errors.ts
var MalformedCommandError, AbortError, ConfigParseError;
var init_errors = __esm({
  "src/utils/errors.ts"() {
    "use strict";
    MalformedCommandError = class extends TypeError {
    };
    AbortError = class extends Error {
    };
    ConfigParseError = class extends Error {
      constructor(message, filePath, defaultConfig) {
        super(message);
        this.name = "ConfigParseError";
        this.filePath = filePath;
        this.defaultConfig = defaultConfig;
      }
    };
  }
});

// src/utils/config.ts
import { existsSync as existsSync7, readFileSync as readFileSync4, writeFileSync as writeFileSync4 } from "fs";
import { resolve as resolve2, join as join5 } from "path";
import { cloneDeep, memoize as memoize7, pick } from "lodash-es";
import { homedir as homedir4 } from "os";
import { randomBytes } from "crypto";
function defaultConfigForProject(projectPath) {
  const config3 = { ...DEFAULT_PROJECT_CONFIG };
  if (projectPath === homedir4()) {
    config3.dontCrawlDirectory = true;
  }
  return config3;
}
function isAutoUpdaterStatus(value) {
  return ["disabled", "enabled", "no_permissions", "not_configured"].includes(
    value
  );
}
function isGlobalConfigKey(key) {
  return GLOBAL_CONFIG_KEYS.includes(key);
}
function checkHasTrustDialogAccepted() {
  let currentPath = getCwd();
  const config3 = getConfig(GLOBAL_CLAUDE_FILE, DEFAULT_GLOBAL_CONFIG);
  while (true) {
    const projectConfig = config3.projects?.[currentPath];
    if (projectConfig?.hasTrustDialogAccepted) {
      return true;
    }
    const parentPath = resolve2(currentPath, "..");
    if (parentPath === currentPath) {
      break;
    }
    currentPath = parentPath;
  }
  return false;
}
function isProjectConfigKey(key) {
  return PROJECT_CONFIG_KEYS.includes(key);
}
function saveGlobalConfig(config3) {
  if (false) {
    for (const key in config3) {
      TEST_GLOBAL_CONFIG_FOR_TESTING[key] = config3[key];
    }
    return;
  }
  saveConfig(
    GLOBAL_CLAUDE_FILE,
    {
      ...config3,
      projects: getConfig(GLOBAL_CLAUDE_FILE, DEFAULT_GLOBAL_CONFIG).projects
    },
    DEFAULT_GLOBAL_CONFIG
  );
}
function getGlobalConfig() {
  if (false) {
    return TEST_GLOBAL_CONFIG_FOR_TESTING;
  }
  return getConfig(GLOBAL_CLAUDE_FILE, DEFAULT_GLOBAL_CONFIG);
}
function getAnthropicApiKey() {
  const config3 = getGlobalConfig();
  if (process.env.USER_TYPE === "SWE_BENCH") {
    return process.env.ANTHROPIC_API_KEY_OVERRIDE ?? null;
  }
  if (process.env.USER_TYPE === "external") {
    return config3.primaryApiKey ?? null;
  }
  if (process.env.USER_TYPE === "ant") {
    if (process.env.ANTHROPIC_API_KEY && config3.customApiKeyResponses?.approved?.includes(
      normalizeApiKeyForConfig(process.env.ANTHROPIC_API_KEY)
    )) {
      return process.env.ANTHROPIC_API_KEY;
    }
    return config3.primaryApiKey ?? null;
  }
  return null;
}
function normalizeApiKeyForConfig(apiKey) {
  return apiKey.slice(-20);
}
function isDefaultApiKey() {
  const config3 = getGlobalConfig();
  const apiKey = getAnthropicApiKey();
  return apiKey === config3.primaryApiKey;
}
function getCustomApiKeyStatus(truncatedApiKey) {
  const config3 = getGlobalConfig();
  if (config3.customApiKeyResponses?.approved?.includes(truncatedApiKey)) {
    return "approved";
  }
  if (config3.customApiKeyResponses?.rejected?.includes(truncatedApiKey)) {
    return "rejected";
  }
  return "new";
}
function saveConfig(file, config3, defaultConfig) {
  const filteredConfig = Object.fromEntries(
    Object.entries(config3).filter(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(defaultConfig[key])
    )
  );
  writeFileSync4(file, JSON.stringify(filteredConfig, null, 2), "utf-8");
}
function enableConfigs() {
  configReadingAllowed = true;
  getConfig(
    GLOBAL_CLAUDE_FILE,
    DEFAULT_GLOBAL_CONFIG,
    true
  );
}
function getConfig(file, defaultConfig, throwOnInvalid) {
  if (!configReadingAllowed && true) {
    throw new Error("Config accessed before allowed.");
  }
  if (!existsSync7(file)) {
    return cloneDeep(defaultConfig);
  }
  try {
    const fileContent = readFileSync4(file, "utf-8");
    try {
      const parsedConfig = JSON.parse(fileContent);
      return {
        ...cloneDeep(defaultConfig),
        ...parsedConfig
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ConfigParseError(errorMessage, file, defaultConfig);
    }
  } catch (error) {
    if (error instanceof ConfigParseError && throwOnInvalid) {
      throw error;
    }
    return cloneDeep(defaultConfig);
  }
}
function getCurrentProjectConfig() {
  if (false) {
    return TEST_PROJECT_CONFIG_FOR_TESTING;
  }
  const absolutePath = resolve2(getCwd());
  const config3 = getConfig(GLOBAL_CLAUDE_FILE, DEFAULT_GLOBAL_CONFIG);
  if (!config3.projects) {
    return defaultConfigForProject(absolutePath);
  }
  const projectConfig = config3.projects[absolutePath] ?? defaultConfigForProject(absolutePath);
  if (typeof projectConfig.allowedTools === "string") {
    projectConfig.allowedTools = safeParseJSON(projectConfig.allowedTools) ?? [];
  }
  return projectConfig;
}
function saveCurrentProjectConfig(projectConfig) {
  if (false) {
    for (const key in projectConfig) {
      TEST_PROJECT_CONFIG_FOR_TESTING[key] = projectConfig[key];
    }
    return;
  }
  const config3 = getConfig(GLOBAL_CLAUDE_FILE, DEFAULT_GLOBAL_CONFIG);
  saveConfig(
    GLOBAL_CLAUDE_FILE,
    {
      ...config3,
      projects: {
        ...config3.projects,
        [resolve2(getCwd())]: projectConfig
      }
    },
    DEFAULT_GLOBAL_CONFIG
  );
}
async function isAutoUpdaterDisabled() {
  const useExternalUpdater = await checkGate(GATE_USE_EXTERNAL_UPDATER);
  return useExternalUpdater || getGlobalConfig().autoUpdaterStatus === "disabled";
}
function getOrCreateUserID() {
  const config3 = getGlobalConfig();
  if (config3.userID) {
    return config3.userID;
  }
  const userID = randomBytes(32).toString("hex");
  saveGlobalConfig({ ...config3, userID });
  return userID;
}
function getConfigForCLI(key, global2) {
  logEvent("tengu_config_get", {
    key,
    global: global2?.toString() ?? "false"
  });
  if (global2) {
    if (!isGlobalConfigKey(key)) {
      console.error(
        `Error: '${key}' is not a valid config key. Valid keys are: ${GLOBAL_CONFIG_KEYS.join(", ")}`
      );
      process.exit(1);
    }
    return getGlobalConfig()[key];
  } else {
    if (!isProjectConfigKey(key)) {
      console.error(
        `Error: '${key}' is not a valid config key. Valid keys are: ${PROJECT_CONFIG_KEYS.join(", ")}`
      );
      process.exit(1);
    }
    return getCurrentProjectConfig()[key];
  }
}
function setConfigForCLI(key, value, global2) {
  logEvent("tengu_config_set", {
    key,
    global: global2?.toString() ?? "false"
  });
  if (global2) {
    if (!isGlobalConfigKey(key)) {
      console.error(
        `Error: Cannot set '${key}'. Only these keys can be modified: ${GLOBAL_CONFIG_KEYS.join(", ")}`
      );
      process.exit(1);
    }
    if (key === "autoUpdaterStatus" && !isAutoUpdaterStatus(value)) {
      console.error(
        `Error: Invalid value for autoUpdaterStatus. Must be one of: disabled, enabled, no_permissions, not_configured`
      );
      process.exit(1);
    }
    const currentConfig = getGlobalConfig();
    saveGlobalConfig({
      ...currentConfig,
      [key]: value
    });
  } else {
    if (!isProjectConfigKey(key)) {
      console.error(
        `Error: Cannot set '${key}'. Only these keys can be modified: ${PROJECT_CONFIG_KEYS.join(", ")}. Did you mean --global?`
      );
      process.exit(1);
    }
    const currentConfig = getCurrentProjectConfig();
    saveCurrentProjectConfig({
      ...currentConfig,
      [key]: value
    });
  }
  setTimeout(() => {
    process.exit(0);
  }, 100);
}
function deleteConfigForCLI(key, global2) {
  logEvent("tengu_config_delete", {
    key,
    global: global2?.toString() ?? "false"
  });
  if (global2) {
    if (!isGlobalConfigKey(key)) {
      console.error(
        `Error: Cannot delete '${key}'. Only these keys can be modified: ${GLOBAL_CONFIG_KEYS.join(", ")}`
      );
      process.exit(1);
    }
    const currentConfig = getGlobalConfig();
    delete currentConfig[key];
    saveGlobalConfig(currentConfig);
  } else {
    if (!isProjectConfigKey(key)) {
      console.error(
        `Error: Cannot delete '${key}'. Only these keys can be modified: ${PROJECT_CONFIG_KEYS.join(", ")}. Did you mean --global?`
      );
      process.exit(1);
    }
    const currentConfig = getCurrentProjectConfig();
    delete currentConfig[key];
    saveCurrentProjectConfig(currentConfig);
  }
}
function listConfigForCLI(global2) {
  logEvent("tengu_config_list", {
    global: global2?.toString() ?? "false"
  });
  if (global2) {
    const currentConfig = pick(getGlobalConfig(), GLOBAL_CONFIG_KEYS);
    return currentConfig;
  } else {
    return pick(getCurrentProjectConfig(), PROJECT_CONFIG_KEYS);
  }
}
var DEFAULT_PROJECT_CONFIG, DEFAULT_GLOBAL_CONFIG, GLOBAL_CONFIG_KEYS, PROJECT_CONFIG_KEYS, TEST_GLOBAL_CONFIG_FOR_TESTING, TEST_PROJECT_CONFIG_FOR_TESTING, configReadingAllowed, getMcprcConfig;
var init_config = __esm({
  "src/utils/config.ts"() {
    "use strict";
    init_env();
    init_state();
    init_json();
    init_statsig();
    init_betas();
    init_errors();
    DEFAULT_PROJECT_CONFIG = {
      allowedTools: [],
      context: {},
      history: [],
      dontCrawlDirectory: false,
      enableArchitectTool: false,
      mcpContextUris: [],
      mcpServers: {},
      approvedMcprcServers: [],
      rejectedMcprcServers: [],
      hasTrustDialogAccepted: false
    };
    DEFAULT_GLOBAL_CONFIG = {
      numStartups: 0,
      autoUpdaterStatus: "not_configured",
      theme: "dark",
      preferredNotifChannel: "iterm2",
      verbose: false,
      customApiKeyResponses: {
        approved: [],
        rejected: []
      }
    };
    GLOBAL_CONFIG_KEYS = [
      "autoUpdaterStatus",
      "theme",
      "hasCompletedOnboarding",
      "lastOnboardingVersion",
      "lastReleaseNotesSeen",
      "verbose",
      "customApiKeyResponses",
      "primaryApiKey",
      "preferredNotifChannel",
      "shiftEnterKeyBindingInstalled",
      "researchModelAccess",
      "allowedModels",
      "preferredModel"
    ];
    PROJECT_CONFIG_KEYS = [
      "dontCrawlDirectory",
      "enableArchitectTool",
      "hasTrustDialogAccepted",
      "hasCompletedProjectOnboarding"
    ];
    TEST_GLOBAL_CONFIG_FOR_TESTING = {
      ...DEFAULT_GLOBAL_CONFIG,
      autoUpdaterStatus: "disabled"
    };
    TEST_PROJECT_CONFIG_FOR_TESTING = {
      ...DEFAULT_PROJECT_CONFIG
    };
    configReadingAllowed = false;
    getMcprcConfig = memoize7(
      () => {
        if (false) {
          return TEST_MCPRC_CONFIG_FOR_TESTING;
        }
        const mcprcPath = join5(getCwd(), ".mcprc");
        if (!existsSync7(mcprcPath)) {
          return {};
        }
        try {
          const mcprcContent = readFileSync4(mcprcPath, "utf-8");
          const config3 = safeParseJSON(mcprcContent);
          if (config3 && typeof config3 === "object") {
            logEvent("tengu_mcprc_found", {
              numServers: Object.keys(config3).length.toString()
            });
            return config3;
          }
        } catch {
        }
        return {};
      },
      // This function returns the same value as long as the cwd and mcprc file content remain the same
      () => {
        const cwd4 = getCwd();
        const mcprcPath = join5(cwd4, ".mcprc");
        if (existsSync7(mcprcPath)) {
          try {
            const stat2 = readFileSync4(mcprcPath, "utf-8");
            return `${cwd4}:${stat2}`;
          } catch {
            return cwd4;
          }
        }
        return cwd4;
      }
    );
  }
});

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports, module) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports, module) {
    var debug2 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module.exports = debug2;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports, module) {
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug2 = require_debug();
    exports = module.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var safeSrc = exports.safeSrc = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug2(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports, module) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports, module) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports, module) {
    var debug2 = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, safeSrc: src, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version2, options) {
        options = parseOptions(options);
        if (version2 instanceof _SemVer) {
          if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
            return version2;
          } else {
            version2 = version2.version;
          }
        } else if (typeof version2 !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
        }
        if (version2.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug2("SemVer", version2, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version2.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version2}`);
        }
        this.raw = version2;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug2("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug2("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug2("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const r = new RegExp(`^${this.options.loose ? src[t.PRERELEASELOOSE] : src[t.PRERELEASE]}$`);
            const match = `-${identifier}`.match(r);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports, module) {
    var SemVer = require_semver();
    var parse4 = (version2, options, throwErrors = false) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      try {
        return new SemVer(version2, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module.exports = parse4;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports, module) {
    var parse4 = require_parse();
    var valid = (version2, options) => {
      const v = parse4(version2, options);
      return v ? v.version : null;
    };
    module.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports, module) {
    var parse4 = require_parse();
    var clean = (version2, options) => {
      const s = parse4(version2.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports, module) {
    var SemVer = require_semver();
    var inc = (version2, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version2 instanceof SemVer ? version2.version : version2,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports, module) {
    var parse4 = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse4(version1, null, true);
      const v2 = parse4(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports, module) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports, module) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports, module) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports, module) {
    var parse4 = require_parse();
    var prerelease = (version2, options) => {
      const parsed = parse4(version2, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports, module) {
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports, module) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports, module) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports, module) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports, module) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports, module) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports, module) {
    var compare = require_compare();
    var gt2 = (a, b, loose) => compare(a, b, loose) > 0;
    module.exports = gt2;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports, module) {
    var compare = require_compare();
    var lt2 = (a, b, loose) => compare(a, b, loose) < 0;
    module.exports = lt2;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports, module) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports, module) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports, module) {
    var compare = require_compare();
    var gte2 = (a, b, loose) => compare(a, b, loose) >= 0;
    module.exports = gte2;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports, module) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports, module) {
    var eq = require_eq();
    var neq = require_neq();
    var gt2 = require_gt();
    var gte2 = require_gte();
    var lt2 = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt2(a, b, loose);
        case ">=":
          return gte2(a, b, loose);
        case "<":
          return lt2(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports, module) {
    var SemVer = require_semver();
    var parse4 = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version2, options) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      if (typeof version2 === "number") {
        version2 = String(version2);
      }
      if (typeof version2 !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version2.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse4(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module.exports = coerce;
  }
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports, module) {
    var LRUCache2 = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module.exports = LRUCache2;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports, module) {
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug2("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug2("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug2("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug2("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug2("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug2("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version2) {
        if (!version2) {
          return false;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version2, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug2 = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      debug2("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug2("caret", comp);
      comp = replaceTildes(comp, options);
      debug2("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug2("xrange", comp);
      comp = replaceStars(comp, options);
      debug2("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug2("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug2("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug2("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug2("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z21 = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug2("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z21} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z21} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z21} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug2("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug2("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z21} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z21} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug2("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug2("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug2("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug2("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug2("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug2("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version2, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version2)) {
          return false;
        }
      }
      if (version2.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug2(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports, module) {
    var ANY = Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug2("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug2("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version2) {
        debug2("Comparator.test", version2, this.options.loose);
        if (this.semver === ANY || version2 === ANY) {
          return true;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version2, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug2 = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports, module) {
    var Range = require_range();
    var satisfies = (version2, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version2);
    };
    module.exports = satisfies;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports, module) {
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var gt2 = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt2(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt2(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports, module) {
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports, module) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt2 = require_gt();
    var lt2 = require_lt();
    var lte = require_lte();
    var gte2 = require_gte();
    var outside = (version2, range, hilo, options) => {
      version2 = new SemVer(version2, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt2;
          ltefn = lte;
          ltfn = lt2;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt2;
          ltefn = gte2;
          ltfn = gt2;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version2, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports, module) {
    var outside = require_outside();
    var gtr = (version2, range, options) => outside(version2, range, ">", options);
    module.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports, module) {
    var outside = require_outside();
    var ltr = (version2, range, options) => outside(version2, range, "<", options);
    module.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports, module) {
    var Range = require_range();
    var intersects2 = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module.exports = intersects2;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports, module) {
    var satisfies = require_satisfies();
    var compare = require_compare();
    module.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version2 of v) {
        const included = satisfies(version2, range, options);
        if (included) {
          prev = version2;
          if (!first) {
            first = version2;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports, module) {
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt2, lt2;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt2 = higherGT(gt2, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt2 = lowerLT(lt2, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt2 && lt2) {
        gtltComp = compare(gt2.semver, lt2.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt2.operator !== ">=" || lt2.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt2 && !satisfies(eq, String(gt2), options)) {
          return null;
        }
        if (lt2 && !satisfies(eq, String(lt2), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt2 && !options.includePrerelease && lt2.semver.prerelease.length ? lt2.semver : false;
      let needDomGTPre = gt2 && !options.includePrerelease && gt2.semver.prerelease.length ? gt2.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt2.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt2) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt2, c, options);
            if (higher === c && higher !== gt2) {
              return false;
            }
          } else if (gt2.operator === ">=" && !satisfies(gt2.semver, String(c), options)) {
            return false;
          }
        }
        if (lt2) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt2, c, options);
            if (lower === c && lower !== lt2) {
              return false;
            }
          } else if (lt2.operator === "<=" && !satisfies(lt2.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt2 || gt2) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt2 && hasDomLT && !lt2 && gtltComp !== 0) {
        return false;
      }
      if (lt2 && hasDomGT && !gt2 && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports, module) {
    var internalRe = require_re();
    var constants2 = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse4 = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt2 = require_gt();
    var lt2 = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte2 = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects2 = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module.exports = {
      parse: parse4,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt: gt2,
      lt: lt2,
      eq,
      neq,
      gte: gte2,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects: intersects2,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants2.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants2.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// node_modules/wrap-ansi/node_modules/string-width/node_modules/emoji-regex/index.js
var require_emoji_regex = __commonJS({
  "node_modules/wrap-ansi/node_modules/string-width/node_modules/emoji-regex/index.js"(exports, module) {
    module.exports = () => {
      return /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE])))?))?|\uDC6F(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDD75(?:\uD83C[\uDFFB-\uDFFF]|\uFE0F)?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE89\uDE8F-\uDEC2\uDEC6\uDECE-\uDEDC\uDEDF-\uDEE9]|\uDD3C(?:\u200D[\u2640\u2642]\uFE0F?|\uD83C[\uDFFB-\uDFFF])?|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
    };
  }
});

// src/utils/melonWrapper.js
var melonWrapper_exports = {};
__export(melonWrapper_exports, {
  runMelonWrapper: () => runMelonWrapper
});
function runMelonWrapper(args) {
  console.log("Mock melon wrapper called with args:", args);
  return 0;
}
var init_melonWrapper = __esm({
  "src/utils/melonWrapper.js"() {
    "use strict";
  }
});

// src/entrypoints/cli.tsx
init_sentry();

// src/constants/product.ts
var PRODUCT_NAME = "Claude Code";
var PRODUCT_URL = "https://docs.anthropic.com/s/claude-code";

// src/entrypoints/cli.tsx
import * as dontcare from "@anthropic-ai/sdk/shims/node";
import React109 from "react";
import { ReadStream } from "tty";
import { openSync as openSync2, existsSync as existsSync25 } from "fs";
import { render as render7 } from "ink";

// src/screens/REPL.tsx
import { Box as Box70, Newline as Newline2, Static as Static2 } from "ink";

// src/ProjectOnboarding.tsx
init_config();
import * as React2 from "react";
import { OrderedList } from "@inkjs/ui";
import { Box, Text } from "ink";
import { existsSync as existsSync9 } from "fs";
import { join as join8 } from "path";
import { homedir as homedir6 } from "os";

// src/commands/terminalSetup.ts
init_execFileNoThrow();
init_source();
import { EOL, platform, homedir as homedir5 } from "os";

// src/utils/theme.ts
init_config();
var lightTheme = {
  bashBorder: "#ff0087",
  claude: "#D97757",
  permission: "#5769f7",
  secondaryBorder: "#999",
  text: "#000",
  secondaryText: "#666",
  suggestion: "#5769f7",
  success: "#2c7a39",
  error: "#ab2b3f",
  warning: "#966c1e",
  diff: {
    added: "#69db7c",
    removed: "#ffa8b4",
    addedDimmed: "#c7e1cb",
    removedDimmed: "#fdd2d8"
  }
};
var lightDaltonizedTheme = {
  bashBorder: "#0066cc",
  // Blue instead of pink for better contrast
  claude: "#ff9933",
  // Orange adjusted for deuteranopia
  permission: "#3366ff",
  // Brighter blue for better visibility
  secondaryBorder: "#999",
  text: "#000",
  secondaryText: "#666",
  suggestion: "#3366ff",
  success: "#006699",
  // Blue instead of green
  error: "#cc0000",
  // Pure red for better distinction
  warning: "#ff9900",
  // Orange adjusted for deuteranopia
  diff: {
    added: "#99ccff",
    // Light blue instead of green
    removed: "#ffcccc",
    // Light red for better contrast
    addedDimmed: "#d1e7fd",
    removedDimmed: "#ffe9e9"
  }
};
var darkTheme = {
  bashBorder: "#fd5db1",
  claude: "#D97757",
  permission: "#b1b9f9",
  secondaryBorder: "#888",
  text: "#fff",
  secondaryText: "#999",
  suggestion: "#b1b9f9",
  success: "#4eba65",
  error: "#ff6b80",
  warning: "#ffc107",
  diff: {
    added: "#225c2b",
    removed: "#7a2936",
    addedDimmed: "#47584a",
    removedDimmed: "#69484d"
  }
};
var darkDaltonizedTheme = {
  bashBorder: "#3399ff",
  // Bright blue instead of pink
  claude: "#ff9933",
  // Orange adjusted for deuteranopia
  permission: "#99ccff",
  // Light blue for better contrast
  secondaryBorder: "#888",
  text: "#fff",
  secondaryText: "#999",
  suggestion: "#99ccff",
  success: "#3399ff",
  // Bright blue instead of green
  error: "#ff6666",
  // Bright red for better visibility
  warning: "#ffcc00",
  // Yellow-orange for deuteranopia
  diff: {
    added: "#004466",
    // Dark blue instead of green
    removed: "#660000",
    // Dark red for better contrast
    addedDimmed: "#3e515b",
    removedDimmed: "#3e2c2c"
  }
};
function getTheme(overrideTheme) {
  const config3 = getGlobalConfig();
  switch (overrideTheme ?? config3.theme) {
    case "light":
      return lightTheme;
    case "light-daltonized":
      return lightDaltonizedTheme;
    case "dark-daltonized":
      return darkDaltonizedTheme;
    default:
      return darkTheme;
  }
}

// src/commands/terminalSetup.ts
init_env();
init_config();
init_json();
init_log();
import { readFileSync as readFileSync5, writeFileSync as writeFileSync5 } from "fs";
import { join as join6 } from "path";
var terminalSetup = {
  type: "local",
  name: "terminal-setup",
  userFacingName() {
    return "terminal-setup";
  },
  description: "Install Shift+Enter key binding for newlines (iTerm2 and VSCode only)",
  isEnabled: platform() === "darwin" && env2.terminal === "iTerm.app" || env2.terminal === "vscode",
  isHidden: false,
  async call() {
    let result = "";
    switch (env2.terminal) {
      case "iTerm.app":
        result = await installBindingsForITerm2();
        break;
      case "vscode":
        result = installBindingsForVSCodeTerminal();
        break;
    }
    const config3 = getGlobalConfig();
    config3.shiftEnterKeyBindingInstalled = true;
    saveGlobalConfig(config3);
    markProjectOnboardingComplete();
    return result;
  }
};
function isShiftEnterKeyBindingInstalled() {
  return getGlobalConfig().shiftEnterKeyBindingInstalled === true;
}
var terminalSetup_default = terminalSetup;
async function installBindingsForITerm2() {
  const { code } = await execFileNoThrow("defaults", [
    "write",
    "com.googlecode.iterm2",
    "GlobalKeyMap",
    "-dict-add",
    "0xd-0x20000-0x24",
    `<dict>
      <key>Text</key>
      <string>\\n</string>
      <key>Action</key>
      <integer>12</integer>
      <key>Version</key>
      <integer>1</integer>
      <key>Keycode</key>
      <integer>13</integer>
      <key>Modifiers</key>
      <integer>131072</integer>
    </dict>`
  ]);
  if (code !== 0) {
    throw new Error("Failed to install iTerm2 Shift+Enter key binding");
  }
  return `${source_default.hex(getTheme().success)(
    "Installed iTerm2 Shift+Enter key binding"
  )}${EOL}${source_default.dim("See iTerm2 \u2192 Preferences \u2192 Keys")}${EOL}`;
}
function installBindingsForVSCodeTerminal() {
  const vscodeKeybindingsPath = join6(
    homedir5(),
    platform() === "win32" ? join6("AppData", "Roaming", "Code", "User") : platform() === "darwin" ? join6("Library", "Application Support", "Code", "User") : join6(".config", "Code", "User"),
    "keybindings.json"
  );
  try {
    const content = readFileSync5(vscodeKeybindingsPath, "utf-8");
    const keybindings = safeParseJSON(content) ?? [];
    const existingBinding = keybindings.find(
      (binding) => binding.key === "shift+enter" && binding.command === "workbench.action.terminal.sendSequence" && binding.when === "terminalFocus"
    );
    if (existingBinding) {
      return `${source_default.hex(getTheme().warning)(
        "Found existing VSCode terminal Shift+Enter key binding. Remove it to continue."
      )}${EOL}${source_default.dim(`See ${vscodeKeybindingsPath}`)}${EOL}`;
    }
    keybindings.push({
      key: "shift+enter",
      command: "workbench.action.terminal.sendSequence",
      args: { text: "\\\r\n" },
      when: "terminalFocus"
    });
    writeFileSync5(
      vscodeKeybindingsPath,
      JSON.stringify(keybindings, null, 4),
      "utf-8"
    );
    return `${source_default.hex(getTheme().success)(
      "Installed VSCode terminal Shift+Enter key binding"
    )}${EOL}${source_default.dim(`See ${vscodeKeybindingsPath}`)}${EOL}`;
  } catch (e) {
    logError(e);
    throw new Error("Failed to install VSCode terminal Shift+Enter key binding");
  }
}

// src/constants/releaseNotes.ts
var RELEASE_NOTES = {
  "0.1.178": [
    "New release notes now show you what's changed since you last launched"
  ]
};

// src/ProjectOnboarding.tsx
var import_semver = __toESM(require_semver2(), 1);

// src/utils/file.ts
init_log();
import {
  readFileSync as readFileSync6,
  writeFileSync as writeFileSync6,
  openSync,
  readSync,
  closeSync,
  existsSync as existsSync8,
  readdirSync as readdirSync2,
  opendirSync
} from "fs";
import {
  isAbsolute as isAbsolute2,
  normalize,
  resolve as resolve5,
  resolve as resolvePath,
  relative,
  sep,
  basename,
  dirname as dirname2,
  extname,
  join as join7
} from "path";
import { glob as globLib } from "glob";
import { cwd as cwd2 } from "process";

// src/utils/ripgrep.ts
init_log();
init_execFileNoThrow();
import { findActualExecutable } from "spawn-rx";
import { memoize as memoize8 } from "lodash-es";
import { fileURLToPath, resolve as resolve3 } from "node:url";
import * as path2 from "path";
import { execFile as execFile2 } from "child_process";
import debug from "debug";
var __filename = fileURLToPath(import.meta.url);
var __dirname = resolve3(
  __filename,
  false ? "../.." : "."
);
var d = debug("claude:ripgrep");
var useBuiltinRipgrep = !!process.env.USE_BUILTIN_RIPGREP;
if (useBuiltinRipgrep) {
  d("Using builtin ripgrep because USE_BUILTIN_RIPGREP is set");
}
var ripgrepPath = memoize8(() => {
  const { cmd } = findActualExecutable("rg", []);
  d(`ripgrep initially resolved as: ${cmd}`);
  if (cmd !== "rg" && !useBuiltinRipgrep) {
    return cmd;
  } else {
    const rgRoot = path2.resolve(__dirname, "vendor", "ripgrep");
    if (process.platform === "win32") {
      return path2.resolve(rgRoot, "x64-win32", "rg.exe");
    }
    const ret = path2.resolve(
      rgRoot,
      `${process.arch}-${process.platform}`,
      "rg"
    );
    d("internal ripgrep resolved as: %s", ret);
    return ret;
  }
});
async function ripGrep(args, target, abortSignal) {
  await codesignRipgrepIfNecessary();
  const rg = ripgrepPath();
  d("ripgrep called: %s %o", rg, target, args);
  return new Promise((resolve16) => {
    execFile2(
      ripgrepPath(),
      [...args, target],
      {
        maxBuffer: 1e6,
        signal: abortSignal,
        timeout: 1e4
      },
      (error, stdout) => {
        if (error) {
          if (error.code !== 1) {
            d("ripgrep error: %o", error);
            logError(error);
          }
          resolve16([]);
        } else {
          d("ripgrep succeeded with %s", stdout);
          resolve16(stdout.trim().split("\n").filter(Boolean));
        }
      }
    );
  });
}
async function listAllContentFiles(path7, abortSignal, limit) {
  try {
    d("listAllContentFiles called: %s", path7);
    return (await ripGrep(["-l", ".", path7], path7, abortSignal)).slice(0, limit);
  } catch (e) {
    d("listAllContentFiles failed: %o", e);
    logError(e);
    return [];
  }
}
var alreadyDoneSignCheck = false;
async function codesignRipgrepIfNecessary() {
  if (process.platform !== "darwin" || alreadyDoneSignCheck) {
    return;
  }
  alreadyDoneSignCheck = true;
  d("checking if ripgrep is already signed");
  const lines = (await execFileNoThrow(
    "codesign",
    ["-vv", "-d", ripgrepPath()],
    void 0,
    void 0,
    false
  )).stdout.split("\n");
  const needsSigned = lines.find((line) => line.includes("linker-signed"));
  if (!needsSigned) {
    d("seems to be already signed");
    return;
  }
  try {
    d("signing ripgrep");
    const signResult = await execFileNoThrow("codesign", [
      "--sign",
      "-",
      "--force",
      "--preserve-metadata=entitlements,requirements,flags,runtime",
      ripgrepPath()
    ]);
    if (signResult.code !== 0) {
      d("failed to sign ripgrep: %o", signResult);
      logError(
        `Failed to sign ripgrep: ${signResult.stdout} ${signResult.stderr}`
      );
    }
    d("removing quarantine");
    const quarantineResult = await execFileNoThrow("xattr", [
      "-d",
      "com.apple.quarantine",
      ripgrepPath()
    ]);
    if (quarantineResult.code !== 0) {
      d("failed to remove quarantine: %o", quarantineResult);
      logError(
        `Failed to remove quarantine: ${quarantineResult.stdout} ${quarantineResult.stderr}`
      );
    }
  } catch (e) {
    d("failed during sign: %o", e);
    logError(e);
  }
}

// src/utils/file.ts
init_state();
import { LRUCache } from "lru-cache";
async function fileExists(path7) {
  return existsSync8(path7);
}
async function glob(filePattern, cwd4, { limit, offset }, abortSignal) {
  const paths2 = await globLib([filePattern], {
    cwd: cwd4,
    nocase: true,
    nodir: true,
    signal: abortSignal,
    stat: true,
    withFileTypes: true
  });
  const sortedPaths = paths2.sort((a, b) => (a.mtimeMs ?? 0) - (b.mtimeMs ?? 0));
  const truncated = sortedPaths.length > offset + limit;
  return {
    files: sortedPaths.slice(offset, offset + limit).map((path7) => path7.fullpath()),
    truncated
  };
}
function isInDirectory(relativePath, relativeCwd) {
  if (relativePath === ".") {
    return true;
  }
  if (relativePath.startsWith("~")) {
    return false;
  }
  if (relativePath.includes("\0") || relativeCwd.includes("\0")) {
    return false;
  }
  let normalizedPath = normalize(relativePath);
  let normalizedCwd = normalize(relativeCwd);
  normalizedPath = normalizedPath.endsWith(sep) ? normalizedPath : normalizedPath + sep;
  normalizedCwd = normalizedCwd.endsWith(sep) ? normalizedCwd : normalizedCwd + sep;
  const fullPath = resolvePath(cwd2(), normalizedCwd, normalizedPath);
  const fullCwd = resolvePath(cwd2(), normalizedCwd);
  return fullPath.startsWith(fullCwd);
}
function readTextContent(filePath, offset = 0, maxLines) {
  const enc = detectFileEncoding(filePath);
  const content = readFileSync6(filePath, enc);
  const lines = content.split(/\r?\n/);
  const toReturn = maxLines !== void 0 && lines.length - offset > maxLines ? lines.slice(offset, offset + maxLines) : lines.slice(offset);
  return {
    content: toReturn.join("\n"),
    // TODO: This probably won't work for Windows
    lineCount: toReturn.length,
    totalLines: lines.length
  };
}
function writeTextContent(filePath, content, encoding, endings) {
  let toWrite = content;
  if (endings === "CRLF") {
    toWrite = content.split("\n").join("\r\n");
  }
  writeFileSync6(filePath, toWrite, { encoding, flush: true });
}
var repoEndingCache = new LRUCache({
  fetchMethod: (path7) => detectRepoLineEndingsDirect(path7),
  ttl: 5 * 60 * 1e3,
  ttlAutopurge: false,
  max: 1e3
});
async function detectRepoLineEndings(filePath) {
  return repoEndingCache.fetch(resolve5(filePath));
}
async function detectRepoLineEndingsDirect(cwd4) {
  const abortController = new AbortController();
  setTimeout(() => {
    abortController.abort();
  }, 1e3);
  const allFiles = await listAllContentFiles(cwd4, abortController.signal, 15);
  let crlfCount = 0;
  for (const file of allFiles) {
    const lineEnding = detectLineEndings(file);
    if (lineEnding === "CRLF") {
      crlfCount++;
    }
  }
  return crlfCount > 3 ? "CRLF" : "LF";
}
function fetch2(cache, key, value) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const v = value();
  cache.set(key, v);
  return v;
}
var fileEncodingCache = new LRUCache({
  fetchMethod: (path7) => detectFileEncodingDirect(path7),
  ttl: 5 * 60 * 1e3,
  ttlAutopurge: false,
  max: 1e3
});
function detectFileEncoding(filePath) {
  const k = resolve5(filePath);
  return fetch2(fileEncodingCache, k, () => detectFileEncodingDirect(k));
}
function detectFileEncodingDirect(filePath) {
  const BUFFER_SIZE = 4096;
  const buffer = Buffer.alloc(BUFFER_SIZE);
  let fd = void 0;
  try {
    fd = openSync(filePath, "r");
    const bytesRead = readSync(fd, buffer, 0, BUFFER_SIZE, 0);
    if (bytesRead >= 2) {
      if (buffer[0] === 255 && buffer[1] === 254) return "utf16le";
    }
    if (bytesRead >= 3 && buffer[0] === 239 && buffer[1] === 187 && buffer[2] === 191) {
      return "utf8";
    }
    const isUtf8 = buffer.slice(0, bytesRead).toString("utf8").length > 0;
    return isUtf8 ? "utf8" : "ascii";
  } catch (error) {
    logError(`Error detecting encoding for file ${filePath}: ${error}`);
    return "utf8";
  } finally {
    if (fd) closeSync(fd);
  }
}
var lineEndingCache = new LRUCache({
  fetchMethod: (path7) => detectLineEndingsDirect(path7),
  ttl: 5 * 60 * 1e3,
  ttlAutopurge: false,
  max: 1e3
});
function detectLineEndings(filePath) {
  const k = resolve5(filePath);
  return fetch2(lineEndingCache, k, () => detectLineEndingsDirect(k));
}
function detectLineEndingsDirect(filePath, encoding = "utf8") {
  try {
    const buffer = Buffer.alloc(4096);
    const fd = openSync(filePath, "r");
    const bytesRead = readSync(fd, buffer, 0, 4096, 0);
    closeSync(fd);
    const content = buffer.toString(encoding, 0, bytesRead);
    let crlfCount = 0;
    let lfCount = 0;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === "\n") {
        if (i > 0 && content[i - 1] === "\r") {
          crlfCount++;
        } else {
          lfCount++;
        }
      }
    }
    return crlfCount > lfCount ? "CRLF" : "LF";
  } catch (error) {
    logError(`Error detecting line endings for file ${filePath}: ${error}`);
    return "LF";
  }
}
function normalizeFilePath(filePath) {
  const absoluteFilePath = isAbsolute2(filePath) ? filePath : resolve5(getCwd(), filePath);
  if (absoluteFilePath.endsWith(" AM.png")) {
    return absoluteFilePath.replace(
      " AM.png",
      `${String.fromCharCode(8239)}AM.png`
    );
  }
  if (absoluteFilePath.endsWith(" PM.png")) {
    return absoluteFilePath.replace(
      " PM.png",
      `${String.fromCharCode(8239)}PM.png`
    );
  }
  return absoluteFilePath;
}
function getAbsolutePath(path7) {
  return path7 ? isAbsolute2(path7) ? path7 : resolve5(getCwd(), path7) : void 0;
}
function getAbsoluteAndRelativePaths(path7) {
  const absolutePath = getAbsolutePath(path7);
  const relativePath = absolutePath ? relative(getCwd(), absolutePath) : void 0;
  return { absolutePath, relativePath };
}
function findSimilarFile(filePath) {
  try {
    const dir = dirname2(filePath);
    const fileBaseName = basename(filePath, extname(filePath));
    if (!existsSync8(dir)) {
      return void 0;
    }
    const files = readdirSync2(dir);
    const similarFiles = files.filter(
      (file) => basename(file, extname(file)) === fileBaseName && join7(dir, file) !== filePath
    );
    const firstMatch = similarFiles[0];
    if (firstMatch) {
      return firstMatch;
    }
    return void 0;
  } catch (error) {
    logError(`Error finding similar file for ${filePath}: ${error}`);
    return void 0;
  }
}
function addLineNumbers({
  content,
  // 1-indexed
  startLine
}) {
  if (!content) {
    return "";
  }
  return content.split(/\r?\n/).map((line, index) => {
    const lineNum = index + startLine;
    const numStr = String(lineNum);
    if (numStr.length >= 6) {
      return `${numStr}	${line}`;
    }
    const n = numStr.padStart(6, " ");
    return `${n}	${line}`;
  }).join("\n");
}
function isDirEmpty(dirPath) {
  try {
    const dir = opendirSync(dirPath);
    const firstEntry = dir.readSync();
    dir.closeSync();
    return firstEntry === null;
  } catch (error) {
    logError(`Error checking directory: ${error}`);
    return false;
  }
}

// src/ProjectOnboarding.tsx
function markProjectOnboardingComplete() {
  const projectConfig = getCurrentProjectConfig();
  if (!projectConfig.hasCompletedProjectOnboarding) {
    saveCurrentProjectConfig({
      ...projectConfig,
      hasCompletedProjectOnboarding: true
    });
  }
}
function markReleaseNotesSeen() {
  const config3 = getGlobalConfig();
  saveGlobalConfig({
    ...config3,
    lastReleaseNotesSeen: "0.2.8"
  });
}
function ProjectOnboarding({
  workspaceDir
}) {
  const projectConfig = getCurrentProjectConfig();
  const showOnboarding = !projectConfig.hasCompletedProjectOnboarding;
  const config3 = getGlobalConfig();
  const previousVersion = config3.lastReleaseNotesSeen;
  let releaseNotesToShow = [];
  if (!previousVersion || (0, import_semver.gt)("0.2.8", previousVersion)) {
    releaseNotesToShow = RELEASE_NOTES["0.2.8"] || [];
  }
  const hasReleaseNotes = releaseNotesToShow.length > 0;
  React2.useEffect(() => {
    if (hasReleaseNotes && !showOnboarding) {
      markReleaseNotesSeen();
    }
  }, [hasReleaseNotes, showOnboarding]);
  if (!showOnboarding && !hasReleaseNotes) {
    return null;
  }
  const hasClaudeMd = existsSync9(join8(workspaceDir, "CLAUDE.md"));
  const isWorkspaceDirEmpty = isDirEmpty(workspaceDir);
  const needsClaudeMd = !hasClaudeMd && !isWorkspaceDirEmpty;
  const showTerminalTip = terminalSetup_default.isEnabled && !getGlobalConfig().shiftEnterKeyBindingInstalled;
  const theme = getTheme();
  return /* @__PURE__ */ React2.createElement(Box, { flexDirection: "column", gap: 1, padding: 1, paddingBottom: 0 }, showOnboarding && /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(Text, { color: theme.secondaryText }, "Tips for getting started:"), /* @__PURE__ */ React2.createElement(OrderedList, null, (() => {
    const items = [];
    if (isWorkspaceDirEmpty) {
      items.push(
        /* @__PURE__ */ React2.createElement(OrderedList.Item, { key: "workspace" }, /* @__PURE__ */ React2.createElement(Text, { color: theme.secondaryText }, "Ask Claude to create a new app or clone a repository."))
      );
    }
    if (needsClaudeMd) {
      items.push(
        /* @__PURE__ */ React2.createElement(OrderedList.Item, { key: "claudemd" }, /* @__PURE__ */ React2.createElement(Text, { color: theme.secondaryText }, "Run ", /* @__PURE__ */ React2.createElement(Text, { color: theme.text }, "/init"), " to create a CLAUDE.md file with instructions for Claude."))
      );
    }
    if (showTerminalTip) {
      items.push(
        /* @__PURE__ */ React2.createElement(OrderedList.Item, { key: "terminal" }, /* @__PURE__ */ React2.createElement(Text, { color: theme.secondaryText }, "Run ", /* @__PURE__ */ React2.createElement(Text, { color: theme.text }, "/terminal-setup"), /* @__PURE__ */ React2.createElement(Text, { bold: false }, " to set up terminal integration")))
      );
    }
    items.push(
      /* @__PURE__ */ React2.createElement(OrderedList.Item, { key: "questions" }, /* @__PURE__ */ React2.createElement(Text, { color: theme.secondaryText }, "Ask Claude questions about your codebase."))
    );
    items.push(
      /* @__PURE__ */ React2.createElement(OrderedList.Item, { key: "changes" }, /* @__PURE__ */ React2.createElement(Text, { color: theme.secondaryText }, "Ask Claude to implement changes to your codebase."))
    );
    return items;
  })())), !showOnboarding && hasReleaseNotes && /* @__PURE__ */ React2.createElement(
    Box,
    {
      borderColor: getTheme().secondaryBorder,
      flexDirection: "column",
      marginRight: 1
    },
    /* @__PURE__ */ React2.createElement(Box, { flexDirection: "column", gap: 0 }, /* @__PURE__ */ React2.createElement(Box, { marginBottom: 1 }, /* @__PURE__ */ React2.createElement(Text, null, "\u{1F195} What's new in v", "0.2.8", ":")), /* @__PURE__ */ React2.createElement(Box, { flexDirection: "column", marginLeft: 1 }, releaseNotesToShow.map((note, noteIndex) => /* @__PURE__ */ React2.createElement(Text, { key: noteIndex, color: getTheme().secondaryText }, "\u2022 ", note))))
  ), workspaceDir === homedir6() && /* @__PURE__ */ React2.createElement(Text, { color: getTheme().warning }, "Note: You have launched ", /* @__PURE__ */ React2.createElement(Text, { bold: true }, "claude"), " in your home directory. For the best experience, launch it in a project directory instead."));
}

// src/components/CostThresholdDialog.tsx
import { Box as Box2, Text as Text4, useInput } from "ink";
import React5 from "react";

// src/components/CustomSelect/index.js
import React3 from "react";
import { Text as Text2 } from "ink";
function Select({ options, onChange, onFocus, defaultValue }) {
  return React3.createElement(Text2, null, "Mock Select Component");
}

// src/components/Link.tsx
init_env();
import InkLink from "ink-link";
import { Text as Text3 } from "ink";
import React4 from "react";
var LINK_SUPPORTING_TERMINALS = ["iTerm.app", "WezTerm", "Hyper", "VSCode"];
function Link({ url: url2, children }) {
  const supportsLinks = LINK_SUPPORTING_TERMINALS.includes(env2.terminal ?? "");
  const displayContent = children || url2;
  if (supportsLinks || displayContent !== url2) {
    return /* @__PURE__ */ React4.createElement(InkLink, { url: url2 }, /* @__PURE__ */ React4.createElement(Text3, null, displayContent));
  } else {
    return /* @__PURE__ */ React4.createElement(Text3, { underline: true }, displayContent);
  }
}

// src/components/CostThresholdDialog.tsx
function CostThresholdDialog({ onDone }) {
  useInput((input, key) => {
    if (key.ctrl && (input === "c" || input === "d") || key.escape) {
      onDone();
    }
  });
  return /* @__PURE__ */ React5.createElement(
    Box2,
    {
      flexDirection: "column",
      borderStyle: "round",
      padding: 1,
      borderColor: getTheme().secondaryBorder
    },
    /* @__PURE__ */ React5.createElement(Box2, { marginBottom: 1, flexDirection: "column" }, /* @__PURE__ */ React5.createElement(Text4, { bold: true }, "You've spent $5 on the Anthropic API this session."), /* @__PURE__ */ React5.createElement(Text4, null, "Learn more about how to monitor your spending:"), /* @__PURE__ */ React5.createElement(Link, { url: "https://docs.anthropic.com/s/claude-code-cost" })),
    /* @__PURE__ */ React5.createElement(Box2, null, /* @__PURE__ */ React5.createElement(
      Select,
      {
        options: [
          {
            value: "ok",
            label: "Got it, thanks!"
          }
        ],
        onChange: onDone
      }
    ))
  );
}

// src/screens/REPL.tsx
import * as React97 from "react";
import { useEffect as useEffect21, useMemo as useMemo15, useRef as useRef6, useState as useState23, useCallback as useCallback11 } from "react";

// src/components/Logo.tsx
import { Box as Box3, Text as Text5 } from "ink";
import * as React6 from "react";
init_config();
init_state();
var MIN_LOGO_WIDTH = 46;
function Logo({
  mcpClients,
  isDefaultModel = false
}) {
  const width = Math.max(MIN_LOGO_WIDTH, getCwd().length + 12);
  const theme = getTheme();
  const currentModel = process.env.ANTHROPIC_MODEL;
  const apiKey = getAnthropicApiKey();
  const isCustomApiKey = !isDefaultApiKey();
  const isCustomModel = !isDefaultModel && Boolean(currentModel);
  const hasOverrides = process.env.USER_TYPE === "ant" && Boolean(
    isCustomApiKey || process.env.DISABLE_PROMPT_CACHING || process.env.API_TIMEOUT_MS || process.env.MAX_THINKING_TOKENS || process.env.ANTHROPIC_BASE_URL || isCustomModel
  );
  return /* @__PURE__ */ React6.createElement(Box3, { flexDirection: "column" }, /* @__PURE__ */ React6.createElement(
    Box3,
    {
      borderColor: theme.claude,
      borderStyle: "round",
      flexDirection: "column",
      gap: 1,
      paddingLeft: 1,
      width
    },
    /* @__PURE__ */ React6.createElement(Text5, null, /* @__PURE__ */ React6.createElement(Text5, { color: theme.claude }, "\u273B"), " Welcome to", " ", /* @__PURE__ */ React6.createElement(Text5, { bold: true }, PRODUCT_NAME), " ", /* @__PURE__ */ React6.createElement(Text5, null, "research preview!")),
    /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(Box3, { paddingLeft: 2, flexDirection: "column", gap: 1 }, /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText, italic: true }, "/help for help", process.env.USER_TYPE === "ant" && /* @__PURE__ */ React6.createElement(React6.Fragment, null, " \xB7 https://go/claude-cli")), /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "cwd: ", getCwd())), hasOverrides && /* @__PURE__ */ React6.createElement(
      Box3,
      {
        borderColor: theme.secondaryBorder,
        borderStyle: "single",
        borderBottom: false,
        borderLeft: false,
        borderRight: false,
        borderTop: true,
        flexDirection: "column",
        marginLeft: 2,
        marginRight: 1,
        paddingTop: 1
      },
      /* @__PURE__ */ React6.createElement(Box3, { marginBottom: 1 }, /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "Overrides (via env):")),
      isCustomModel && /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "\u2022 Model: ", /* @__PURE__ */ React6.createElement(Text5, { bold: true }, currentModel)),
      isCustomApiKey && apiKey ? /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "\u2022 API Key:", " ", /* @__PURE__ */ React6.createElement(Text5, { bold: true }, "sk-ant-\u2026", apiKey.slice(-width + 25))) : null,
      process.env.DISABLE_PROMPT_CACHING ? /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "\u2022 Prompt caching:", " ", /* @__PURE__ */ React6.createElement(Text5, { color: theme.error, bold: true }, "off")) : null,
      process.env.API_TIMEOUT_MS ? /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "\u2022 API timeout:", " ", /* @__PURE__ */ React6.createElement(Text5, { bold: true }, process.env.API_TIMEOUT_MS, "ms")) : null,
      process.env.MAX_THINKING_TOKENS ? /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "\u2022 Max thinking tokens:", " ", /* @__PURE__ */ React6.createElement(Text5, { bold: true }, process.env.MAX_THINKING_TOKENS)) : null,
      process.env.ANTHROPIC_BASE_URL ? /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "\u2022 API Base URL:", " ", /* @__PURE__ */ React6.createElement(Text5, { bold: true }, process.env.ANTHROPIC_BASE_URL)) : null
    )),
    mcpClients.length ? /* @__PURE__ */ React6.createElement(
      Box3,
      {
        borderColor: theme.secondaryBorder,
        borderStyle: "single",
        borderBottom: false,
        borderLeft: false,
        borderRight: false,
        borderTop: true,
        flexDirection: "column",
        marginLeft: 2,
        marginRight: 1,
        paddingTop: 1
      },
      /* @__PURE__ */ React6.createElement(Box3, { marginBottom: 1 }, /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "MCP Servers:")),
      mcpClients.map((client2, idx) => /* @__PURE__ */ React6.createElement(Box3, { key: idx, width: width - 6 }, /* @__PURE__ */ React6.createElement(Text5, { color: theme.secondaryText }, "\u2022 ", client2.name), /* @__PURE__ */ React6.createElement(Box3, { flexGrow: 1 }), /* @__PURE__ */ React6.createElement(
        Text5,
        {
          bold: true,
          color: client2.type === "connected" ? theme.success : theme.error
        },
        client2.type === "connected" ? "connected" : "failed"
      )))
    ) : null
  ));
}

// src/components/Message.tsx
init_log();
import { Box as Box48 } from "ink";
import * as React72 from "react";

// src/components/messages/UserToolResultMessage/UserToolResultMessage.tsx
import * as React59 from "react";

// src/utils/messages.tsx
import { randomUUID as randomUUID4 } from "crypto";
import { Box as Box35 } from "ink";

// src/components/Bug.tsx
import { Box as Box8, Text as Text14, useInput as useInput4 } from "ink";
import * as React16 from "react";
import { useState as useState4, useCallback, useEffect as useEffect4 } from "react";

// src/messages.ts
var getMessages = () => [];
var setMessages = () => {
};
function setMessagesGetter(getter) {
  getMessages = getter;
}
function getMessagesGetter() {
  return getMessages;
}
function setMessagesSetter(setter) {
  setMessages = setter;
}
function getMessagesSetter() {
  return setMessages;
}

// src/components/TextInput.tsx
init_source();
import React7 from "react";
import { Text as Text6, useInput as useInput2 } from "ink";

// src/hooks/useTextInput.ts
import { useState } from "react";

// src/hooks/useDoublePress.ts
import { useRef } from "react";
var DOUBLE_PRESS_TIMEOUT_MS = 2e3;
function useDoublePress(setPending, onDoublePress, onFirstPress) {
  const lastPressRef = useRef(0);
  const timeoutRef = useRef();
  return () => {
    const now = Date.now();
    const timeSinceLastPress = now - lastPressRef.current;
    if (timeSinceLastPress <= DOUBLE_PRESS_TIMEOUT_MS && timeoutRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = void 0;
      }
      onDoublePress();
      setPending(false);
    } else {
      onFirstPress?.();
      setPending(true);
      timeoutRef.current = setTimeout(
        () => setPending(false),
        DOUBLE_PRESS_TIMEOUT_MS
      );
    }
    lastPressRef.current = now;
  };
}

// node_modules/wrap-ansi/node_modules/strip-ansi/node_modules/ansi-regex/index.js
function ansiRegex({ onlyFirst = false } = {}) {
  const ST = "(?:\\u0007|\\u001B\\u005C|\\u009C)";
  const pattern = [
    `[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?${ST})`,
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
  ].join("|");
  return new RegExp(pattern, onlyFirst ? void 0 : "g");
}

// node_modules/wrap-ansi/node_modules/strip-ansi/index.js
var regex = ansiRegex();
function stripAnsi(string) {
  if (typeof string !== "string") {
    throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
  }
  return string.replace(regex, "");
}

// node_modules/get-east-asian-width/lookup.js
function isAmbiguous(x) {
  return x === 161 || x === 164 || x === 167 || x === 168 || x === 170 || x === 173 || x === 174 || x >= 176 && x <= 180 || x >= 182 && x <= 186 || x >= 188 && x <= 191 || x === 198 || x === 208 || x === 215 || x === 216 || x >= 222 && x <= 225 || x === 230 || x >= 232 && x <= 234 || x === 236 || x === 237 || x === 240 || x === 242 || x === 243 || x >= 247 && x <= 250 || x === 252 || x === 254 || x === 257 || x === 273 || x === 275 || x === 283 || x === 294 || x === 295 || x === 299 || x >= 305 && x <= 307 || x === 312 || x >= 319 && x <= 322 || x === 324 || x >= 328 && x <= 331 || x === 333 || x === 338 || x === 339 || x === 358 || x === 359 || x === 363 || x === 462 || x === 464 || x === 466 || x === 468 || x === 470 || x === 472 || x === 474 || x === 476 || x === 593 || x === 609 || x === 708 || x === 711 || x >= 713 && x <= 715 || x === 717 || x === 720 || x >= 728 && x <= 731 || x === 733 || x === 735 || x >= 768 && x <= 879 || x >= 913 && x <= 929 || x >= 931 && x <= 937 || x >= 945 && x <= 961 || x >= 963 && x <= 969 || x === 1025 || x >= 1040 && x <= 1103 || x === 1105 || x === 8208 || x >= 8211 && x <= 8214 || x === 8216 || x === 8217 || x === 8220 || x === 8221 || x >= 8224 && x <= 8226 || x >= 8228 && x <= 8231 || x === 8240 || x === 8242 || x === 8243 || x === 8245 || x === 8251 || x === 8254 || x === 8308 || x === 8319 || x >= 8321 && x <= 8324 || x === 8364 || x === 8451 || x === 8453 || x === 8457 || x === 8467 || x === 8470 || x === 8481 || x === 8482 || x === 8486 || x === 8491 || x === 8531 || x === 8532 || x >= 8539 && x <= 8542 || x >= 8544 && x <= 8555 || x >= 8560 && x <= 8569 || x === 8585 || x >= 8592 && x <= 8601 || x === 8632 || x === 8633 || x === 8658 || x === 8660 || x === 8679 || x === 8704 || x === 8706 || x === 8707 || x === 8711 || x === 8712 || x === 8715 || x === 8719 || x === 8721 || x === 8725 || x === 8730 || x >= 8733 && x <= 8736 || x === 8739 || x === 8741 || x >= 8743 && x <= 8748 || x === 8750 || x >= 8756 && x <= 8759 || x === 8764 || x === 8765 || x === 8776 || x === 8780 || x === 8786 || x === 8800 || x === 8801 || x >= 8804 && x <= 8807 || x === 8810 || x === 8811 || x === 8814 || x === 8815 || x === 8834 || x === 8835 || x === 8838 || x === 8839 || x === 8853 || x === 8857 || x === 8869 || x === 8895 || x === 8978 || x >= 9312 && x <= 9449 || x >= 9451 && x <= 9547 || x >= 9552 && x <= 9587 || x >= 9600 && x <= 9615 || x >= 9618 && x <= 9621 || x === 9632 || x === 9633 || x >= 9635 && x <= 9641 || x === 9650 || x === 9651 || x === 9654 || x === 9655 || x === 9660 || x === 9661 || x === 9664 || x === 9665 || x >= 9670 && x <= 9672 || x === 9675 || x >= 9678 && x <= 9681 || x >= 9698 && x <= 9701 || x === 9711 || x === 9733 || x === 9734 || x === 9737 || x === 9742 || x === 9743 || x === 9756 || x === 9758 || x === 9792 || x === 9794 || x === 9824 || x === 9825 || x >= 9827 && x <= 9829 || x >= 9831 && x <= 9834 || x === 9836 || x === 9837 || x === 9839 || x === 9886 || x === 9887 || x === 9919 || x >= 9926 && x <= 9933 || x >= 9935 && x <= 9939 || x >= 9941 && x <= 9953 || x === 9955 || x === 9960 || x === 9961 || x >= 9963 && x <= 9969 || x === 9972 || x >= 9974 && x <= 9977 || x === 9979 || x === 9980 || x === 9982 || x === 9983 || x === 10045 || x >= 10102 && x <= 10111 || x >= 11094 && x <= 11097 || x >= 12872 && x <= 12879 || x >= 57344 && x <= 63743 || x >= 65024 && x <= 65039 || x === 65533 || x >= 127232 && x <= 127242 || x >= 127248 && x <= 127277 || x >= 127280 && x <= 127337 || x >= 127344 && x <= 127373 || x === 127375 || x === 127376 || x >= 127387 && x <= 127404 || x >= 917760 && x <= 917999 || x >= 983040 && x <= 1048573 || x >= 1048576 && x <= 1114109;
}
function isFullWidth(x) {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
}
function isWide(x) {
  return x >= 4352 && x <= 4447 || x === 8986 || x === 8987 || x === 9001 || x === 9002 || x >= 9193 && x <= 9196 || x === 9200 || x === 9203 || x === 9725 || x === 9726 || x === 9748 || x === 9749 || x >= 9776 && x <= 9783 || x >= 9800 && x <= 9811 || x === 9855 || x >= 9866 && x <= 9871 || x === 9875 || x === 9889 || x === 9898 || x === 9899 || x === 9917 || x === 9918 || x === 9924 || x === 9925 || x === 9934 || x === 9940 || x === 9962 || x === 9970 || x === 9971 || x === 9973 || x === 9978 || x === 9981 || x === 9989 || x === 9994 || x === 9995 || x === 10024 || x === 10060 || x === 10062 || x >= 10067 && x <= 10069 || x === 10071 || x >= 10133 && x <= 10135 || x === 10160 || x === 10175 || x === 11035 || x === 11036 || x === 11088 || x === 11093 || x >= 11904 && x <= 11929 || x >= 11931 && x <= 12019 || x >= 12032 && x <= 12245 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12353 && x <= 12438 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12773 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 42124 || x >= 42128 && x <= 42182 || x >= 43360 && x <= 43388 || x >= 44032 && x <= 55203 || x >= 63744 && x <= 64255 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 94176 && x <= 94180 || x === 94192 || x === 94193 || x >= 94208 && x <= 100343 || x >= 100352 && x <= 101589 || x >= 101631 && x <= 101640 || x >= 110576 && x <= 110579 || x >= 110581 && x <= 110587 || x === 110589 || x === 110590 || x >= 110592 && x <= 110882 || x === 110898 || x >= 110928 && x <= 110930 || x === 110933 || x >= 110948 && x <= 110951 || x >= 110960 && x <= 111355 || x >= 119552 && x <= 119638 || x >= 119648 && x <= 119670 || x === 126980 || x === 127183 || x === 127374 || x >= 127377 && x <= 127386 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x === 127568 || x === 127569 || x >= 127584 && x <= 127589 || x >= 127744 && x <= 127776 || x >= 127789 && x <= 127797 || x >= 127799 && x <= 127868 || x >= 127870 && x <= 127891 || x >= 127904 && x <= 127946 || x >= 127951 && x <= 127955 || x >= 127968 && x <= 127984 || x === 127988 || x >= 127992 && x <= 128062 || x === 128064 || x >= 128066 && x <= 128252 || x >= 128255 && x <= 128317 || x >= 128331 && x <= 128334 || x >= 128336 && x <= 128359 || x === 128378 || x === 128405 || x === 128406 || x === 128420 || x >= 128507 && x <= 128591 || x >= 128640 && x <= 128709 || x === 128716 || x >= 128720 && x <= 128722 || x >= 128725 && x <= 128727 || x >= 128732 && x <= 128735 || x === 128747 || x === 128748 || x >= 128756 && x <= 128764 || x >= 128992 && x <= 129003 || x === 129008 || x >= 129292 && x <= 129338 || x >= 129340 && x <= 129349 || x >= 129351 && x <= 129535 || x >= 129648 && x <= 129660 || x >= 129664 && x <= 129673 || x >= 129679 && x <= 129734 || x >= 129742 && x <= 129756 || x >= 129759 && x <= 129769 || x >= 129776 && x <= 129784 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
}

// node_modules/get-east-asian-width/index.js
function validate(codePoint) {
  if (!Number.isSafeInteger(codePoint)) {
    throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
  }
}
function eastAsianWidth(codePoint, { ambiguousAsWide = false } = {}) {
  validate(codePoint);
  if (isFullWidth(codePoint) || isWide(codePoint) || ambiguousAsWide && isAmbiguous(codePoint)) {
    return 2;
  }
  return 1;
}

// node_modules/wrap-ansi/node_modules/string-width/index.js
var import_emoji_regex = __toESM(require_emoji_regex(), 1);
var segmenter = new Intl.Segmenter();
var defaultIgnorableCodePointRegex = /^\p{Default_Ignorable_Code_Point}$/u;
function stringWidth(string, options = {}) {
  if (typeof string !== "string" || string.length === 0) {
    return 0;
  }
  const {
    ambiguousIsNarrow = true,
    countAnsiEscapeCodes = false
  } = options;
  if (!countAnsiEscapeCodes) {
    string = stripAnsi(string);
  }
  if (string.length === 0) {
    return 0;
  }
  let width = 0;
  const eastAsianWidthOptions = { ambiguousAsWide: !ambiguousIsNarrow };
  for (const { segment: character } of segmenter.segment(string)) {
    const codePoint = character.codePointAt(0);
    if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159) {
      continue;
    }
    if (codePoint >= 8203 && codePoint <= 8207 || codePoint === 65279) {
      continue;
    }
    if (codePoint >= 768 && codePoint <= 879 || codePoint >= 6832 && codePoint <= 6911 || codePoint >= 7616 && codePoint <= 7679 || codePoint >= 8400 && codePoint <= 8447 || codePoint >= 65056 && codePoint <= 65071) {
      continue;
    }
    if (codePoint >= 55296 && codePoint <= 57343) {
      continue;
    }
    if (codePoint >= 65024 && codePoint <= 65039) {
      continue;
    }
    if (defaultIgnorableCodePointRegex.test(character)) {
      continue;
    }
    if ((0, import_emoji_regex.default)().test(character)) {
      width += 2;
      continue;
    }
    width += eastAsianWidth(codePoint, eastAsianWidthOptions);
  }
  return width;
}

// node_modules/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET2 = 10;
var wrapAnsi162 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi2562 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m2 = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles3 = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames2 = Object.keys(styles3.modifier);
var foregroundColorNames2 = Object.keys(styles3.color);
var backgroundColorNames2 = Object.keys(styles3.bgColor);
var colorNames2 = [...foregroundColorNames2, ...backgroundColorNames2];
function assembleStyles2() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles3)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles3[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles3[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles3, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles3, "codes", {
    value: codes,
    enumerable: false
  });
  styles3.color.close = "\x1B[39m";
  styles3.bgColor.close = "\x1B[49m";
  styles3.color.ansi = wrapAnsi162();
  styles3.color.ansi256 = wrapAnsi2562();
  styles3.color.ansi16m = wrapAnsi16m2();
  styles3.bgColor.ansi = wrapAnsi162(ANSI_BACKGROUND_OFFSET2);
  styles3.bgColor.ansi256 = wrapAnsi2562(ANSI_BACKGROUND_OFFSET2);
  styles3.bgColor.ansi16m = wrapAnsi16m2(ANSI_BACKGROUND_OFFSET2);
  Object.defineProperties(styles3, {
    rgbToAnsi256: {
      value: (red, green, blue) => {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value: (hex) => {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles3.rgbToAnsi256(...styles3.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value: (code) => {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles3.ansi256ToAnsi(styles3.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles3.ansi256ToAnsi(styles3.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles3;
}
var ansiStyles2 = assembleStyles2();
var ansi_styles_default2 = ansiStyles2;

// node_modules/wrap-ansi/index.js
var ESCAPES = /* @__PURE__ */ new Set([
  "\x1B",
  "\x9B"
]);
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var wrapAnsiCode = (code) => `${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url2) => `${ESCAPES.values().next().value}${ANSI_ESCAPE_LINK}${url2}${ANSI_ESCAPE_BELL}`;
var wordLengths = (string) => string.split(" ").map((character) => stringWidth(character));
var wrapWord = (rows, word, columns) => {
  const characters = [...word];
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let visible = stringWidth(stripAnsi(rows.at(-1)));
  for (const [index, character] of characters.entries()) {
    const characterLength = stringWidth(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (ESCAPES.has(character)) {
      isInsideEscape = true;
      const ansiEscapeLinkCandidate = characters.slice(index + 1, index + 1 + ANSI_ESCAPE_LINK.length).join("");
      isInsideLinkEscape = ansiEscapeLinkCandidate === ANSI_ESCAPE_LINK;
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
      continue;
    }
    visible += characterLength;
    if (visible === columns && index < characters.length - 1) {
      rows.push("");
      visible = 0;
    }
  }
  if (!visible && rows.at(-1).length > 0 && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last5 = words.length;
  while (last5 > 0) {
    if (stringWidth(words[last5 - 1]) > 0) {
      break;
    }
    last5--;
  }
  if (last5 === words.length) {
    return string;
  }
  return words.slice(0, last5).join(" ") + words.slice(last5).join("");
};
var exec = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const lengths = wordLengths(string);
  let rows = [""];
  for (const [index, word] of string.split(" ").entries()) {
    if (options.trim !== false) {
      rows[rows.length - 1] = rows.at(-1).trimStart();
    }
    let rowLength = stringWidth(rows.at(-1));
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength > 0 || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    if (options.hard && lengths[index] > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      continue;
    }
    if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        continue;
      }
      rows.push("");
    }
    if (rowLength + lengths[index] > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      continue;
    }
    rows[rows.length - 1] += word;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join("\n");
  const pre = [...preString];
  let preStringIndex = 0;
  for (const [index, character] of pre.entries()) {
    returnValue += character;
    if (ESCAPES.has(character)) {
      const { groups } = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`).exec(preString.slice(preStringIndex)) || { groups: {} };
      if (groups.code !== void 0) {
        const code2 = Number.parseFloat(groups.code);
        escapeCode = code2 === END_CODE ? void 0 : code2;
      } else if (groups.uri !== void 0) {
        escapeUrl = groups.uri.length === 0 ? void 0 : groups.uri;
      }
    }
    const code = ansi_styles_default2.codes.get(Number(escapeCode));
    if (pre[index + 1] === "\n") {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      if (escapeCode && code) {
        returnValue += wrapAnsiCode(code);
      }
    } else if (character === "\n") {
      if (escapeCode && code) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
    preStringIndex += character.length;
  }
  return returnValue;
};
function wrapAnsi(string, columns, options) {
  return String(string).normalize().replaceAll("\r\n", "\n").split("\n").map((line) => exec(line, columns, options)).join("\n");
}

// src/utils/Cursor.ts
var Cursor = class _Cursor {
  constructor(measuredText, offset = 0, selection = 0) {
    this.measuredText = measuredText;
    this.selection = selection;
    this.offset = Math.max(0, Math.min(this.measuredText.text.length, offset));
  }
  static fromText(text, columns, offset = 0, selection = 0) {
    return new _Cursor(new MeasuredText(text, columns - 1), offset, selection);
  }
  render(cursorChar, mask, invert) {
    const { line, column } = this.getPosition();
    return this.measuredText.getWrappedText().map((text, currentLine, allLines) => {
      let displayText = text;
      if (mask && currentLine === allLines.length - 1) {
        const lastSixStart = Math.max(0, text.length - 6);
        displayText = mask.repeat(lastSixStart) + text.slice(lastSixStart);
      }
      if (line != currentLine) return displayText.trimEnd();
      return displayText.slice(0, column) + invert(displayText[column] || cursorChar) + displayText.trimEnd().slice(column + 1);
    }).join("\n");
  }
  left() {
    return new _Cursor(this.measuredText, this.offset - 1);
  }
  right() {
    return new _Cursor(this.measuredText, this.offset + 1);
  }
  up() {
    const { line, column } = this.getPosition();
    if (line == 0) {
      return new _Cursor(this.measuredText, 0, 0);
    }
    const newOffset = this.getOffset({ line: line - 1, column });
    return new _Cursor(this.measuredText, newOffset, 0);
  }
  down() {
    const { line, column } = this.getPosition();
    if (line >= this.measuredText.lineCount - 1) {
      return new _Cursor(this.measuredText, this.text.length, 0);
    }
    const newOffset = this.getOffset({ line: line + 1, column });
    return new _Cursor(this.measuredText, newOffset, 0);
  }
  startOfLine() {
    const { line } = this.getPosition();
    return new _Cursor(
      this.measuredText,
      this.getOffset({
        line,
        column: 0
      }),
      0
    );
  }
  endOfLine() {
    const { line } = this.getPosition();
    const column = this.measuredText.getLineLength(line);
    const offset = this.getOffset({ line, column });
    return new _Cursor(this.measuredText, offset, 0);
  }
  nextWord() {
    let nextCursor = this;
    while (nextCursor.isOverWordChar() && !nextCursor.isAtEnd()) {
      nextCursor = nextCursor.right();
    }
    while (!nextCursor.isOverWordChar() && !nextCursor.isAtEnd()) {
      nextCursor = nextCursor.right();
    }
    return nextCursor;
  }
  prevWord() {
    let cursor = this;
    if (!cursor.left().isOverWordChar()) {
      cursor = cursor.left();
    }
    while (!cursor.isOverWordChar() && !cursor.isAtStart()) {
      cursor = cursor.left();
    }
    if (cursor.isOverWordChar()) {
      while (cursor.left().isOverWordChar() && !cursor.isAtStart()) {
        cursor = cursor.left();
      }
    }
    return cursor;
  }
  modifyText(end, insertString = "") {
    const startOffset = this.offset;
    const endOffset = end.offset;
    const newText = this.text.slice(0, startOffset) + insertString + this.text.slice(endOffset);
    return _Cursor.fromText(
      newText,
      this.columns,
      startOffset + insertString.length
    );
  }
  insert(insertString) {
    const newCursor = this.modifyText(this, insertString);
    return newCursor;
  }
  del() {
    if (this.isAtEnd()) {
      return this;
    }
    return this.modifyText(this.right());
  }
  backspace() {
    if (this.isAtStart()) {
      return this;
    }
    return this.left().modifyText(this);
  }
  deleteToLineStart() {
    return this.startOfLine().modifyText(this);
  }
  deleteToLineEnd() {
    if (this.text[this.offset] === "\n") {
      return this.modifyText(this.right());
    }
    return this.modifyText(this.endOfLine());
  }
  deleteWordBefore() {
    if (this.isAtStart()) {
      return this;
    }
    return this.prevWord().modifyText(this);
  }
  deleteWordAfter() {
    if (this.isAtEnd()) {
      return this;
    }
    return this.modifyText(this.nextWord());
  }
  isOverWordChar() {
    const currentChar = this.text[this.offset] ?? "";
    return /\w/.test(currentChar);
  }
  equals(other) {
    return this.offset === other.offset && this.measuredText == other.measuredText;
  }
  isAtStart() {
    return this.offset == 0;
  }
  isAtEnd() {
    return this.offset == this.text.length;
  }
  get text() {
    return this.measuredText.text;
  }
  get columns() {
    return this.measuredText.columns + 1;
  }
  getPosition() {
    return this.measuredText.getPositionFromOffset(this.offset);
  }
  getOffset(position) {
    return this.measuredText.getOffsetFromPosition(position);
  }
};
var WrappedLine = class {
  constructor(text, startOffset, isPrecededByNewline, endsWithNewline = false) {
    this.text = text;
    this.startOffset = startOffset;
    this.isPrecededByNewline = isPrecededByNewline;
    this.endsWithNewline = endsWithNewline;
  }
  equals(other) {
    return this.text === other.text && this.startOffset === other.startOffset;
  }
  get length() {
    return this.text.length + (this.endsWithNewline ? 1 : 0);
  }
};
var MeasuredText = class {
  constructor(text, columns) {
    this.text = text;
    this.columns = columns;
    this.wrappedLines = this.measureWrappedText();
  }
  measureWrappedText() {
    const wrappedText = wrapAnsi(this.text, this.columns, {
      hard: true,
      trim: false
    });
    const wrappedLines = [];
    let searchOffset = 0;
    let lastNewLinePos = -1;
    const lines = wrappedText.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      const isPrecededByNewline = (startOffset) => i == 0 || startOffset > 0 && this.text[startOffset - 1] === "\n";
      if (text.length === 0) {
        lastNewLinePos = this.text.indexOf("\n", lastNewLinePos + 1);
        if (lastNewLinePos !== -1) {
          const startOffset = lastNewLinePos;
          const endsWithNewline = true;
          wrappedLines.push(
            new WrappedLine(
              text,
              startOffset,
              isPrecededByNewline(startOffset),
              endsWithNewline
            )
          );
        } else {
          const startOffset = this.text.length;
          wrappedLines.push(
            new WrappedLine(
              text,
              startOffset,
              isPrecededByNewline(startOffset),
              false
            )
          );
        }
      } else {
        const startOffset = this.text.indexOf(text, searchOffset);
        if (startOffset === -1) {
          console.log("Debug: Failed to find wrapped line in original text");
          console.log("Debug: Current text:", text);
          console.log("Debug: Full original text:", this.text);
          console.log("Debug: Search offset:", searchOffset);
          console.log("Debug: Wrapped text:", wrappedText);
          throw new Error("Failed to find wrapped line in original text");
        }
        searchOffset = startOffset + text.length;
        const potentialNewlinePos = startOffset + text.length;
        const endsWithNewline = potentialNewlinePos < this.text.length && this.text[potentialNewlinePos] === "\n";
        if (endsWithNewline) {
          lastNewLinePos = potentialNewlinePos;
        }
        wrappedLines.push(
          new WrappedLine(
            text,
            startOffset,
            isPrecededByNewline(startOffset),
            endsWithNewline
          )
        );
      }
    }
    return wrappedLines;
  }
  getWrappedText() {
    return this.wrappedLines.map(
      (line) => line.isPrecededByNewline ? line.text : line.text.trimStart()
    );
  }
  getLine(line) {
    return this.wrappedLines[Math.max(0, Math.min(line, this.wrappedLines.length - 1))];
  }
  getOffsetFromPosition(position) {
    const wrappedLine = this.getLine(position.line);
    const startOffsetPlusColumn = wrappedLine.startOffset + position.column;
    if (wrappedLine.text.length === 0 && wrappedLine.endsWithNewline) {
      return wrappedLine.startOffset;
    }
    const lineEnd = wrappedLine.startOffset + wrappedLine.text.length;
    const maxOffset = wrappedLine.endsWithNewline ? lineEnd + 1 : lineEnd;
    return Math.min(startOffsetPlusColumn, maxOffset);
  }
  getLineLength(line) {
    const currentLine = this.getLine(line);
    const nextLine = this.getLine(line + 1);
    if (nextLine.equals(currentLine)) {
      return this.text.length - currentLine.startOffset;
    }
    return nextLine.startOffset - currentLine.startOffset - 1;
  }
  getPositionFromOffset(offset) {
    const lines = this.wrappedLines;
    for (let line2 = 0; line2 < lines.length; line2++) {
      const currentLine = lines[line2];
      const nextLine = lines[line2 + 1];
      if (offset >= currentLine.startOffset && (!nextLine || offset < nextLine.startOffset)) {
        const leadingWhitepace = currentLine.isPrecededByNewline ? 0 : currentLine.text.length - currentLine.text.trimStart().length;
        const column = Math.max(
          0,
          Math.min(
            offset - currentLine.startOffset - leadingWhitepace,
            currentLine.text.length
          )
        );
        return {
          line: line2,
          column
        };
      }
    }
    const line = lines.length - 1;
    return {
      line,
      column: this.wrappedLines[line].text.length
    };
  }
  get lineCount() {
    return this.wrappedLines.length;
  }
  equals(other) {
    return this.text === other.text && this.columns === other.columns;
  }
};

// src/utils/imagePaste.ts
import { execSync as execSync2 } from "child_process";
import { readFileSync as readFileSync7 } from "fs";
var SCREENSHOT_PATH = "/tmp/claude_cli_latest_screenshot.png";
var CLIPBOARD_ERROR_MESSAGE = "No image found in clipboard. Use Cmd + Ctrl + Shift + 4 to copy a screenshot to clipboard.";
function getImageFromClipboard() {
  if (process.platform !== "darwin") {
    return null;
  }
  try {
    execSync2(`osascript -e 'the clipboard as \xABclass PNGf\xBB'`, {
      stdio: "ignore"
    });
    execSync2(
      `osascript -e 'set png_data to (the clipboard as \xABclass PNGf\xBB)' -e 'set fp to open for access POSIX file "${SCREENSHOT_PATH}" with write permission' -e 'write png_data to fp' -e 'close access fp'`,
      { stdio: "ignore" }
    );
    const imageBuffer = readFileSync7(SCREENSHOT_PATH);
    const base64Image = imageBuffer.toString("base64");
    execSync2(`rm -f "${SCREENSHOT_PATH}"`, { stdio: "ignore" });
    return base64Image;
  } catch {
    return null;
  }
}

// src/hooks/useTextInput.ts
var IMAGE_PLACEHOLDER = "[Image pasted]";
function mapInput(input_map) {
  return function(input) {
    const handler = new Map(input_map).get(input) ?? (() => {
    });
    return handler(input);
  };
}
function useTextInput({
  value: originalValue,
  onChange,
  onSubmit,
  onExit,
  onExitMessage,
  onMessage,
  onHistoryUp,
  onHistoryDown,
  onHistoryReset,
  mask = "",
  multiline = false,
  cursorChar,
  invert,
  columns,
  onImagePaste,
  disableCursorMovementForUpDownKeys = false,
  externalOffset,
  onOffsetChange
}) {
  const offset = externalOffset;
  const setOffset = onOffsetChange;
  const cursor = Cursor.fromText(originalValue, columns, offset);
  const [imagePasteErrorTimeout, setImagePasteErrorTimeout] = useState(null);
  function maybeClearImagePasteErrorTimeout() {
    if (!imagePasteErrorTimeout) {
      return;
    }
    clearTimeout(imagePasteErrorTimeout);
    setImagePasteErrorTimeout(null);
    onMessage?.(false);
  }
  const handleCtrlC = useDoublePress(
    (show) => {
      maybeClearImagePasteErrorTimeout();
      onExitMessage?.(show, "Ctrl-C");
    },
    () => onExit?.(),
    () => {
      if (originalValue) {
        onChange("");
        onHistoryReset?.();
      }
    }
  );
  const handleEscape = useDoublePress(
    (show) => {
      maybeClearImagePasteErrorTimeout();
      onMessage?.(!!originalValue && show, `Press Escape again to clear`);
    },
    () => {
      if (originalValue) {
        onChange("");
      }
    }
  );
  function clear2() {
    return Cursor.fromText("", columns, 0);
  }
  const handleEmptyCtrlD = useDoublePress(
    (show) => onExitMessage?.(show, "Ctrl-D"),
    () => onExit?.()
  );
  function handleCtrlD() {
    maybeClearImagePasteErrorTimeout();
    if (cursor.text === "") {
      handleEmptyCtrlD();
      return cursor;
    }
    return cursor.del();
  }
  function tryImagePaste() {
    const base64Image = getImageFromClipboard();
    if (base64Image === null) {
      if (process.platform !== "darwin") {
        return cursor;
      }
      onMessage?.(true, CLIPBOARD_ERROR_MESSAGE);
      maybeClearImagePasteErrorTimeout();
      setImagePasteErrorTimeout(
        // @ts-expect-error: Bun is overloading types here, but we're using the NodeJS runtime
        setTimeout(() => {
          onMessage?.(false);
        }, 4e3)
      );
      return cursor;
    }
    onImagePaste?.(base64Image);
    return cursor.insert(IMAGE_PLACEHOLDER);
  }
  const handleCtrl = mapInput([
    ["a", () => cursor.startOfLine()],
    ["b", () => cursor.left()],
    ["c", handleCtrlC],
    ["d", handleCtrlD],
    ["e", () => cursor.endOfLine()],
    ["f", () => cursor.right()],
    ["h", () => cursor.backspace()],
    ["k", () => cursor.deleteToLineEnd()],
    ["l", () => clear2()],
    ["n", () => downOrHistoryDown()],
    ["p", () => upOrHistoryUp()],
    ["u", () => cursor.deleteToLineStart()],
    ["v", tryImagePaste],
    ["w", () => cursor.deleteWordBefore()]
  ]);
  const handleMeta = mapInput([
    ["b", () => cursor.prevWord()],
    ["f", () => cursor.nextWord()],
    ["d", () => cursor.deleteWordAfter()]
  ]);
  function handleEnter(key) {
    if (multiline && cursor.offset > 0 && cursor.text[cursor.offset - 1] === "\\") {
      return cursor.backspace().insert("\n");
    }
    if (key.meta) {
      return cursor.insert("\n");
    }
    onSubmit?.(originalValue);
  }
  function upOrHistoryUp() {
    if (disableCursorMovementForUpDownKeys) {
      onHistoryUp?.();
      return cursor;
    }
    const cursorUp = cursor.up();
    if (cursorUp.equals(cursor)) {
      onHistoryUp?.();
    }
    return cursorUp;
  }
  function downOrHistoryDown() {
    if (disableCursorMovementForUpDownKeys) {
      onHistoryDown?.();
      return cursor;
    }
    const cursorDown = cursor.down();
    if (cursorDown.equals(cursor)) {
      onHistoryDown?.();
    }
    return cursorDown;
  }
  function mapKey(key) {
    switch (true) {
      case key.escape:
        return handleEscape;
      case (key.leftArrow && (key.ctrl || key.meta || key.fn)):
        return () => cursor.prevWord();
      case (key.rightArrow && (key.ctrl || key.meta || key.fn)):
        return () => cursor.nextWord();
      case key.backspace:
        return key.meta ? () => cursor.deleteWordBefore() : () => cursor.backspace();
      case key.delete:
        return key.meta ? () => cursor.deleteToLineEnd() : () => cursor.del();
      case key.ctrl:
        return handleCtrl;
      case key.home:
        return () => cursor.startOfLine();
      case key.end:
        return () => cursor.endOfLine();
      case key.pageDown:
        return () => cursor.endOfLine();
      case key.pageUp:
        return () => cursor.startOfLine();
      case key.meta:
        return handleMeta;
      case key.return:
        return () => handleEnter(key);
      case key.tab:
        return () => {
        };
      case key.upArrow:
        return upOrHistoryUp;
      case key.downArrow:
        return downOrHistoryDown;
      case key.leftArrow:
        return () => cursor.left();
      case key.rightArrow:
        return () => cursor.right();
    }
    return function(input) {
      switch (true) {
        // Home key
        case (input == "\x1B[H" || input == "\x1B[1~"):
          return cursor.startOfLine();
        // End key
        case (input == "\x1B[F" || input == "\x1B[4~"):
          return cursor.endOfLine();
        default:
          return cursor.insert(input.replace(/\r/g, "\n"));
      }
    };
  }
  function onInput(input, key) {
    const nextCursor = mapKey(key)(input);
    if (nextCursor) {
      if (!cursor.equals(nextCursor)) {
        setOffset(nextCursor.offset);
        if (cursor.text != nextCursor.text) {
          onChange(nextCursor.text);
        }
      }
    }
  }
  return {
    onInput,
    renderedValue: cursor.render(cursorChar, mask, invert),
    offset,
    setOffset
  };
}

// src/components/TextInput.tsx
function TextInput({
  value: originalValue,
  placeholder = "",
  focus = true,
  mask,
  multiline = false,
  highlightPastedText = false,
  showCursor = true,
  onChange,
  onSubmit,
  onExit,
  onHistoryUp,
  onHistoryDown,
  onExitMessage,
  onMessage,
  onHistoryReset,
  columns,
  onImagePaste,
  onPaste,
  isDimmed = false,
  disableCursorMovementForUpDownKeys = false,
  cursorOffset,
  onChangeCursorOffset
}) {
  const { onInput, renderedValue } = useTextInput({
    value: originalValue,
    onChange,
    onSubmit,
    onExit,
    onExitMessage,
    onMessage,
    onHistoryReset,
    onHistoryUp,
    onHistoryDown,
    focus,
    mask,
    multiline,
    cursorChar: showCursor ? " " : "",
    highlightPastedText,
    invert: source_default.inverse,
    themeText: (text) => source_default.hex(getTheme().text)(text),
    columns,
    onImagePaste,
    disableCursorMovementForUpDownKeys,
    externalOffset: cursorOffset,
    onOffsetChange: onChangeCursorOffset
  });
  const [pasteState, setPasteState] = React7.useState({ chunks: [], timeoutId: null });
  const resetPasteTimeout = (currentTimeoutId) => {
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
    }
    return setTimeout(() => {
      setPasteState(({ chunks }) => {
        const pastedText = chunks.join("");
        Promise.resolve().then(() => onPaste(pastedText));
        return { chunks: [], timeoutId: null };
      });
    }, 100);
  };
  const wrappedOnInput = (input, key) => {
    if (onPaste && (input.length > 800 || pasteState.timeoutId)) {
      setPasteState(({ chunks, timeoutId }) => {
        return {
          chunks: [...chunks, input],
          timeoutId: resetPasteTimeout(timeoutId)
        };
      });
      return;
    }
    onInput(input, key);
  };
  useInput2(wrappedOnInput, { isActive: focus });
  let renderedPlaceholder = placeholder ? source_default.hex(getTheme().secondaryText)(placeholder) : void 0;
  if (showCursor && focus) {
    renderedPlaceholder = placeholder.length > 0 ? source_default.inverse(placeholder[0]) + source_default.hex(getTheme().secondaryText)(placeholder.slice(1)) : source_default.inverse(" ");
  }
  const showPlaceholder = originalValue.length == 0 && placeholder;
  return /* @__PURE__ */ React7.createElement(Text6, { wrap: "truncate-end", dimColor: isDimmed }, showPlaceholder ? renderedPlaceholder : renderedValue);
}

// src/components/Bug.tsx
init_log();
init_env();
init_git();

// src/hooks/useTerminalSize.ts
import { useEffect as useEffect2, useState as useState2 } from "react";
function useTerminalSize() {
  const [size, setSize] = useState2({
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24
  });
  useEffect2(() => {
    function updateSize() {
      setSize({
        columns: process.stdout.columns || 80,
        rows: process.stdout.rows || 24
      });
    }
    process.stdout.on("resize", updateSize);
    return () => {
      process.stdout.off("resize", updateSize);
    };
  }, []);
  return size;
}

// src/components/Bug.tsx
init_config();

// src/utils/http.ts
var USER_AGENT = `claude-cli/${"0.2.8"} (${process.env.USER_TYPE})`;

// src/components/Bug.tsx
init_statsig();

// src/services/claude.ts
init_source();
init_betas2();
import "@anthropic-ai/sdk/shims/node";
import Anthropic, { APIConnectionError, APIError } from "@anthropic-ai/sdk";
import { AnthropicBedrock } from "@anthropic-ai/bedrock-sdk";
import { AnthropicVertex } from "@anthropic-ai/vertex-sdk";
import { createHash as createHash2, randomUUID as randomUUID2 } from "crypto";
import "dotenv/config";

// src/cost-tracker.ts
init_source();
import { useEffect as useEffect3 } from "react";

// src/utils/format.tsx
function wrapText(text, width) {
  const lines = [];
  let currentLine = "";
  for (const char of text) {
    if ([...currentLine].length < width) {
      currentLine += char;
    } else {
      lines.push(currentLine);
      currentLine = char;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
function formatDuration(ms) {
  if (ms < 6e4) {
    return `${(ms / 1e3).toFixed(1)}s`;
  }
  const hours = Math.floor(ms / 36e5);
  const minutes = Math.floor(ms % 36e5 / 6e4);
  const seconds = (ms % 6e4 / 1e3).toFixed(1);
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
function formatNumber(number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number).toLowerCase();
}

// src/cost-tracker.ts
init_config();
init_log();
var STATE2 = {
  totalCost: 0,
  totalAPIDuration: 0,
  startTime: Date.now(),
  totalTokens: {
    input: 0,
    output: 0,
    cached: 0
  }
};
function addToTotalCost(cost2, duration) {
  STATE2.totalCost += cost2;
  STATE2.totalAPIDuration += duration;
}
function addToTotalTokens(input, output, cached = 0) {
  STATE2.totalTokens.input += input;
  STATE2.totalTokens.output += output;
  STATE2.totalTokens.cached += cached;
}
function getTotalTokens() {
  const { input, output, cached } = STATE2.totalTokens;
  return {
    input,
    output,
    cached,
    total: input + output
  };
}
function getTotalCost() {
  return STATE2.totalCost;
}
function getTotalDuration() {
  return Date.now() - STATE2.startTime;
}
function formatCost(cost2) {
  return `$${cost2 > 0.5 ? round(cost2, 100).toFixed(2) : cost2.toFixed(4)}`;
}
function formatTotalCost() {
  const tokens = getTotalTokens();
  return source_default.grey(
    `Total cost: ${formatCost(STATE2.totalCost)}
Total tokens: ${tokens.total.toLocaleString()} (in: ${tokens.input.toLocaleString()}, out: ${tokens.output.toLocaleString()}, cached: ${tokens.cached.toLocaleString()})
Total duration (API): ${formatDuration(STATE2.totalAPIDuration)}
Total duration (wall): ${formatDuration(getTotalDuration())}`
  );
}
function useCostSummary() {
  useEffect3(() => {
    const f = () => {
      process.stdout.write("\n" + formatTotalCost() + "\n");
      const projectConfig = getCurrentProjectConfig();
      const tokens = getTotalTokens();
      saveCurrentProjectConfig({
        ...projectConfig,
        lastCost: STATE2.totalCost,
        lastAPIDuration: STATE2.totalAPIDuration,
        lastDuration: getTotalDuration(),
        lastSessionId: SESSION_ID,
        lastTokenUsage: {
          input: tokens.input,
          output: tokens.output,
          cached: tokens.cached,
          total: tokens.total
        }
      });
    };
    process.on("exit", f);
    return () => {
      process.off("exit", f);
    };
  }, []);
}
function round(number, precision) {
  return Math.round(number * precision) / precision;
}

// src/services/claude.ts
init_config();
init_log();

// src/utils/tokens.ts
function countTokens(messages) {
  let i = messages.length - 1;
  while (i >= 0) {
    const message = messages[i];
    if (message?.type === "assistant" && "usage" in message.message && !(message.message.content[0]?.type === "text" && SYNTHETIC_ASSISTANT_MESSAGES.has(message.message.content[0].text))) {
      const { usage } = message.message;
      return usage.input_tokens + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0) + usage.output_tokens;
    }
    i--;
  }
  return 0;
}
function countCachedTokens(messages) {
  let i = messages.length - 1;
  while (i >= 0) {
    const message = messages[i];
    if (message?.type === "assistant" && "usage" in message.message) {
      const { usage } = message.message;
      return (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0);
    }
    i--;
  }
  return 0;
}

// src/services/claude.ts
init_statsig();

// src/services/vcr.ts
init_env();
init_state();
import { createHash } from "crypto";
import { mkdirSync as mkdirSync3, readFileSync as readFileSync8, writeFileSync as writeFileSync7 } from "fs";
import { dirname as dirname3 } from "path";
import { existsSync as existsSync10 } from "fs";
import * as path3 from "path";
import { mapValues } from "lodash-es";
async function withVCR(messages, f) {
  if (true) {
    return await f();
  }
  const dehydratedInput = mapMessages(
    messages.map((_) => _.message.content),
    dehydrateValue
  );
  const filename = `./fixtures/${dehydratedInput.map((_) => createHash("sha1").update(JSON.stringify(_)).digest("hex").slice(0, 6)).join("-")}.json`;
  if (existsSync10(filename)) {
    const cached = JSON.parse(readFileSync8(filename, "utf-8"));
    return mapAssistantMessage(cached.output, hydrateValue);
  }
  if (env2.isCI) {
    console.warn(
      `Anthropic API fixture missing. Re-run npm test locally, then commit the result. ${JSON.stringify({ input: dehydratedInput }, null, 2)}`
    );
  }
  const result = await f();
  if (env2.isCI) {
    return result;
  }
  if (!existsSync10(dirname3(filename))) {
    mkdirSync3(dirname3(filename), { recursive: true });
  }
  writeFileSync7(
    filename,
    JSON.stringify(
      {
        input: dehydratedInput,
        output: mapAssistantMessage(result, dehydrateValue)
      },
      null,
      2
    )
  );
  return result;
}
function mapMessages(messages, f) {
  return messages.map((_) => {
    if (typeof _ === "string") {
      return f(_);
    }
    return _.map((_2) => {
      switch (_2.type) {
        case "tool_result":
          if (typeof _2.content === "string") {
            return { ..._2, content: f(_2.content) };
          }
          if (Array.isArray(_2.content)) {
            return {
              ..._2,
              content: _2.content.map((_3) => {
                switch (_3.type) {
                  case "text":
                    return { ..._3, text: f(_3.text) };
                  case "image":
                    return _3;
                }
              })
            };
          }
          return _2;
        case "text":
          return { ..._2, text: f(_2.text) };
        case "tool_use":
          return {
            ..._2,
            input: mapValues(_2.input, f)
          };
        case "image":
          return _2;
      }
    });
  });
}
function mapAssistantMessage(message, f) {
  return {
    durationMs: "DURATION",
    costUSD: "COST",
    uuid: "UUID",
    message: {
      ...message.message,
      content: message.message.content.map((_) => {
        switch (_.type) {
          case "text":
            return {
              ..._,
              text: f(_.text),
              citations: _.citations || []
            };
          // Ensure citations
          case "tool_use":
            return {
              ..._,
              input: mapValues(_.input, f)
            };
          default:
            return _;
        }
      }).filter(Boolean)
    },
    type: "assistant"
  };
}
function dehydrateValue(s) {
  if (typeof s !== "string") {
    return s;
  }
  const s1 = s.replace(/num_files="\d+"/g, 'num_files="[NUM]"').replace(/duration_ms="\d+"/g, 'duration_ms="[DURATION]"').replace(/cost_usd="\d+"/g, 'cost_usd="[COST]"').replace(/\//g, path3.sep).replaceAll(getCwd(), "[CWD]");
  if (s1.includes("Files modified by user:")) {
    return "Files modified by user: [FILES]";
  }
  return s1;
}
function hydrateValue(s) {
  if (typeof s !== "string") {
    return s;
  }
  return s.replaceAll("[NUM]", "1").replaceAll("[DURATION]", "100").replaceAll("[CWD]", getCwd());
}

// src/services/claude.ts
init_model();
import { zodToJsonSchema } from "zod-to-json-schema";

// src/constants/prompts.ts
init_env();
init_git();
init_state();

// src/tools/BashTool/BashTool.tsx
import { statSync as statSync3 } from "fs";
import { EOL as EOL2 } from "os";
import { isAbsolute as isAbsolute6, relative as relative5, resolve as resolve9 } from "path";
import * as React15 from "react";
import { z as z4 } from "zod";

// src/components/FallbackToolUseRejectedMessage.tsx
import * as React8 from "react";
import { Text as Text7 } from "ink";
function FallbackToolUseRejectedMessage() {
  return /* @__PURE__ */ React8.createElement(Text7, null, "\xA0\xA0\u23BF \xA0", /* @__PURE__ */ React8.createElement(Text7, { color: getTheme().error }, "No (tell Claude what to do differently)"));
}

// src/utils/commands.ts
import { memoize as memoize9 } from "lodash-es";
import { parse } from "shell-quote";
var SINGLE_QUOTE = "__SINGLE_QUOTE__";
var DOUBLE_QUOTE = "__DOUBLE_QUOTE__";
function splitCommand(command3) {
  const parts = [];
  for (const part of parse(
    command3.replaceAll('"', `"${DOUBLE_QUOTE}`).replaceAll("'", `'${SINGLE_QUOTE}`),
    // parse() strips out quotes :P
    (varName) => `$${varName}`
    // Preserve shell variables
  )) {
    if (typeof part === "string") {
      if (parts.length > 0 && typeof parts[parts.length - 1] === "string") {
        parts[parts.length - 1] += " " + part;
        continue;
      }
    }
    parts.push(part);
  }
  const stringParts = parts.map((part) => {
    if (typeof part === "string") {
      return part;
    }
    if ("comment" in part) {
      return "#" + part.comment;
    }
    if ("op" in part && part.op === "glob") {
      return part.pattern;
    }
    if ("op" in part) {
      return part.op;
    }
    return null;
  }).filter((_) => _ !== null);
  const quotedParts = stringParts.map((part) => {
    return part.replaceAll(`${SINGLE_QUOTE}`, "'").replaceAll(`${DOUBLE_QUOTE}`, '"');
  });
  return quotedParts.filter(
    (part) => !COMMAND_LIST_SEPARATORS.has(part)
  );
}
var getCommandSubcommandPrefix = memoize9(
  async (command3, abortSignal) => {
    const subcommands = splitCommand(command3);
    const [fullCommandPrefix, ...subcommandPrefixesResults] = await Promise.all(
      [
        getCommandPrefix(command3, abortSignal),
        ...subcommands.map(async (subcommand) => ({
          subcommand,
          prefix: await getCommandPrefix(subcommand, abortSignal)
        }))
      ]
    );
    if (!fullCommandPrefix) {
      return null;
    }
    const subcommandPrefixes = subcommandPrefixesResults.reduce(
      (acc, { subcommand, prefix }) => {
        if (prefix) {
          acc.set(subcommand, prefix);
        }
        return acc;
      },
      /* @__PURE__ */ new Map()
    );
    return {
      ...fullCommandPrefix,
      subcommandPrefixes
    };
  },
  (command3) => command3
  // memoize by command only
);
var getCommandPrefix = memoize9(
  async (command3, abortSignal) => {
    const response = await queryHaiku({
      systemPrompt: [
        `Your task is to process Bash commands that an AI coding agent wants to run.

This policy spec defines how to determine the prefix of a Bash command:`
      ],
      userPrompt: `<policy_spec>
# ${PRODUCT_NAME} Code Bash command prefix detection

This document defines risk levels for actions that the ${PRODUCT_NAME} agent may take. This classification system is part of a broader safety framework and is used to determine when additional user confirmation or oversight may be needed.

## Definitions

**Command Injection:** Any technique used that would result in a command being run other than the detected prefix.

## Command prefix extraction examples
Examples:
- cat foo.txt => cat
- cd src => cd
- cd path/to/files/ => cd
- find ./src -type f -name "*.ts" => find
- gg cat foo.py => gg cat
- gg cp foo.py bar.py => gg cp
- git commit -m "foo" => git commit
- git diff HEAD~1 => git diff
- git diff --staged => git diff
- git diff $(pwd) => command_injection_detected
- git status => git status
- git status# test(\`id\`) => command_injection_detected
- git status\`ls\` => command_injection_detected
- git push => none
- git push origin master => git push
- git log -n 5 => git log
- git log --oneline -n 5 => git log
- grep -A 40 "from foo.bar.baz import" alpha/beta/gamma.py => grep
- pig tail zerba.log => pig tail
- npm test => none
- npm test --foo => npm test
- npm test -- -f "foo" => npm test
- pwd
 curl example.com => command_injection_detected
- pytest foo/bar.py => pytest
- scalac build => none
</policy_spec>

The user has allowed certain command prefixes to be run, and will otherwise be asked to approve or deny the command.
Your task is to determine the command prefix for the following command.

IMPORTANT: Bash commands may run multiple commands that are chained together.
For safety, if the command seems to contain command injection, you must return "command_injection_detected". 
(This will help protect the user: if they think that they're allowlisting command A, 
but the AI coding agent sends a malicious command that technically has the same prefix as command A, 
then the safety system will see that you said \u201Ccommand_injection_detected\u201D and ask the user for manual confirmation.)

Note that not every command has a prefix. If a command has no prefix, return "none".

ONLY return the prefix. Do not return any other text, markdown markers, or other content or formatting.

Command: ${command3}
`,
      signal: abortSignal,
      enablePromptCaching: false
    });
    const prefix = typeof response.message.content === "string" ? response.message.content : Array.isArray(response.message.content) ? response.message.content.find((_) => _.type === "text")?.text ?? "none" : "none";
    if (prefix.startsWith(API_ERROR_MESSAGE_PREFIX)) {
      return null;
    }
    if (prefix === "command_injection_detected") {
      return { commandInjectionDetected: true };
    }
    if (prefix === "git") {
      return {
        commandPrefix: null,
        commandInjectionDetected: false
      };
    }
    if (prefix === "none") {
      return {
        commandPrefix: null,
        commandInjectionDetected: false
      };
    }
    return {
      commandPrefix: prefix,
      commandInjectionDetected: false
    };
  },
  (command3) => command3
  // memoize by command only
);
var COMMAND_LIST_SEPARATORS = /* @__PURE__ */ new Set([
  "&&",
  "||",
  ";",
  ";;"
]);
function isCommandList(command3) {
  for (const part of parse(
    command3.replaceAll('"', `"${DOUBLE_QUOTE}`).replaceAll("'", `'${SINGLE_QUOTE}`),
    // parse() strips out quotes :P
    (varName) => `$${varName}`
    // Preserve shell variables
  )) {
    if (typeof part === "string") {
      continue;
    }
    if ("comment" in part) {
      return false;
    }
    if ("op" in part) {
      if (part.op === "glob") {
        continue;
      } else if (COMMAND_LIST_SEPARATORS.has(part.op)) {
        continue;
      }
      return false;
    }
  }
  return true;
}
function isUnsafeCompoundCommand(command3) {
  return splitCommand(command3).length > 1 && !isCommandList(command3);
}

// src/tools/BashTool/BashTool.tsx
init_log();
init_PersistentShell();
init_state();

// src/tools/BashTool/BashToolResultMessage.tsx
import { Box as Box7, Text as Text13 } from "ink";

// src/tools/BashTool/OutputLine.tsx
import { Box as Box6, Text as Text12 } from "ink";
import * as React13 from "react";

// src/tools/AgentTool/constants.ts
var TOOL_NAME = "dispatch_agent";

// src/tools/FileReadTool/FileReadTool.tsx
import { existsSync as existsSync12, readFileSync as readFileSync10, statSync as statSync2 } from "fs";
import { Box as Box4, Text as Text10 } from "ink";
import * as path4 from "path";
import { extname as extname4, relative as relative3 } from "path";
import * as React11 from "react";
import { z as z2 } from "zod";

// src/components/HighlightedCode.tsx
init_log();
import { highlight, supportsLanguage } from "cli-highlight";
import { Text as Text8 } from "ink";
import React9, { useMemo } from "react";
function HighlightedCode({ code, language }) {
  const highlightedCode = useMemo(() => {
    try {
      if (supportsLanguage(language)) {
        return highlight(code, { language });
      } else {
        logError(
          `Language not supported while highlighting code, falling back to markdown: ${language}`
        );
        return highlight(code, { language: "markdown" });
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Unknown language")) {
        logError(
          `Language not supported while highlighting code, falling back to markdown: ${e}`
        );
        return highlight(code, { language: "markdown" });
      }
    }
  }, [code, language]);
  return /* @__PURE__ */ React9.createElement(Text8, null, highlightedCode);
}

// src/tools/FileReadTool/FileReadTool.tsx
init_state();
init_log();

// src/tools/NotebookReadTool/NotebookReadTool.tsx
import { existsSync as existsSync11, readFileSync as readFileSync9 } from "fs";
import { Text as Text9 } from "ink";
import { extname as extname2, isAbsolute as isAbsolute4, relative as relative2, resolve as resolve7 } from "path";
import * as React10 from "react";
import { z } from "zod";

// src/tools/BashTool/utils.ts
function formatOutput(content) {
  if (content.length <= MAX_OUTPUT_LENGTH) {
    return {
      totalLines: content.split("\n").length,
      truncatedContent: content
    };
  }
  const halfLength = MAX_OUTPUT_LENGTH / 2;
  const start = content.slice(0, halfLength);
  const end = content.slice(-halfLength);
  const truncated = `${start}

... [${content.slice(halfLength, -halfLength).split("\n").length} lines truncated] ...

${end}`;
  return {
    totalLines: content.split("\n").length,
    truncatedContent: truncated
  };
}
async function getCommandFilePaths(command3, output) {
  const response = await queryHaiku({
    systemPrompt: [
      `Extract any file paths that this command reads or modifies. For commands like "git diff" and "cat", include the paths of files being shown. Use paths verbatim -- don't add any slashes or try to resolve them. Do not try to infer paths that were not explicitly listed in the command output.
Format your response as:
<filepaths>
path/to/file1
path/to/file2
</filepaths>

If no files are read or modified, return empty filepaths tags:
<filepaths>
</filepaths>

Do not include any other text in your response.`
    ],
    userPrompt: `Command: ${command3}
Output: ${output}`,
    enablePromptCaching: true
  });
  const content = response.message.content.filter((_) => _.type === "text").map((_) => _.text).join("");
  return extractTag(content, "filepaths")?.trim().split("\n").filter(Boolean) || [];
}

// src/tools/NotebookReadTool/NotebookReadTool.tsx
init_state();

// src/tools/NotebookReadTool/prompt.ts
var DESCRIPTION = "Extract and read source code from all code cells in a Jupyter notebook.";
var PROMPT = `Reads a Jupyter notebook (.ipynb file) and returns all of the cells with their outputs. Jupyter notebooks are interactive documents that combine code, text, and visualizations, commonly used for data analysis and scientific computing. The notebook_path parameter must be an absolute path, not a relative path.`;

// src/utils/permissions/filesystem.ts
init_state();
import { isAbsolute as isAbsolute3, resolve as resolve6 } from "path";
var readFileAllowedDirectories = /* @__PURE__ */ new Set();
var writeFileAllowedDirectories = /* @__PURE__ */ new Set();
function toAbsolutePath(path7) {
  return isAbsolute3(path7) ? resolve6(path7) : resolve6(getCwd(), path7);
}
function pathInOriginalCwd(path7) {
  const absolutePath = toAbsolutePath(path7);
  return absolutePath.startsWith(toAbsolutePath(getOriginalCwd()));
}
function hasReadPermission(directory) {
  const absolutePath = toAbsolutePath(directory);
  for (const allowedPath of readFileAllowedDirectories) {
    if (absolutePath.startsWith(allowedPath)) {
      return true;
    }
  }
  return false;
}
function hasWritePermission(directory) {
  const absolutePath = toAbsolutePath(directory);
  for (const allowedPath of writeFileAllowedDirectories) {
    if (absolutePath.startsWith(allowedPath)) {
      return true;
    }
  }
  return false;
}
function saveReadPermission(directory) {
  const absolutePath = toAbsolutePath(directory);
  for (const allowedPath of readFileAllowedDirectories) {
    if (allowedPath.startsWith(absolutePath)) {
      readFileAllowedDirectories.delete(allowedPath);
    }
  }
  readFileAllowedDirectories.add(absolutePath);
}
function grantReadPermissionForOriginalDir() {
  const originalProjectDir = getOriginalCwd();
  saveReadPermission(originalProjectDir);
}
function saveWritePermission(directory) {
  const absolutePath = toAbsolutePath(directory);
  for (const allowedPath of writeFileAllowedDirectories) {
    if (allowedPath.startsWith(absolutePath)) {
      writeFileAllowedDirectories.delete(allowedPath);
    }
  }
  writeFileAllowedDirectories.add(absolutePath);
}
function grantWritePermissionForOriginalDir() {
  const originalProjectDir = getOriginalCwd();
  saveWritePermission(originalProjectDir);
}

// src/tools/NotebookReadTool/NotebookReadTool.tsx
var inputSchema = z.strictObject({
  notebook_path: z.string().describe(
    "The absolute path to the Jupyter notebook file to read (must be absolute, not relative)"
  )
});
function renderResultForAssistant(data) {
  const allResults = data.flatMap(getToolResultFromCell);
  return allResults.reduce(
    (acc, curr) => {
      if (acc.length === 0) return [curr];
      const prev = acc[acc.length - 1];
      if (prev && prev.type === "text" && curr.type === "text") {
        prev.text += "\n" + curr.text;
        return acc;
      }
      return [...acc, curr];
    },
    []
  );
}
var NotebookReadTool = {
  name: "ReadNotebook",
  async description() {
    return DESCRIPTION;
  },
  async prompt() {
    return PROMPT;
  },
  isReadOnly() {
    return true;
  },
  inputSchema,
  userFacingName() {
    return "Read Notebook";
  },
  async isEnabled() {
    return true;
  },
  needsPermissions({ notebook_path }) {
    return !hasReadPermission(notebook_path);
  },
  async validateInput({ notebook_path }) {
    const fullFilePath = isAbsolute4(notebook_path) ? notebook_path : resolve7(getCwd(), notebook_path);
    if (!existsSync11(fullFilePath)) {
      const similarFilename = findSimilarFile(fullFilePath);
      let message = "File does not exist.";
      if (similarFilename) {
        message += ` Did you mean ${similarFilename}?`;
      }
      return {
        result: false,
        message
      };
    }
    if (extname2(fullFilePath) !== ".ipynb") {
      return {
        result: false,
        message: "File must be a Jupyter notebook (.ipynb file)."
      };
    }
    return { result: true };
  },
  renderToolUseMessage(input, { verbose }) {
    return `notebook_path: ${verbose ? input.notebook_path : relative2(getCwd(), input.notebook_path)}`;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React10.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(content) {
    if (!content) {
      return /* @__PURE__ */ React10.createElement(Text9, null, "No cells found in notebook");
    }
    if (content.length < 1 || !content[0]) {
      return /* @__PURE__ */ React10.createElement(Text9, null, "No cells found in notebook");
    }
    return /* @__PURE__ */ React10.createElement(Text9, null, "Read ", content.length, " cells");
  },
  async *call({ notebook_path }) {
    const fullPath = isAbsolute4(notebook_path) ? notebook_path : resolve7(getCwd(), notebook_path);
    const content = readFileSync9(fullPath, "utf-8");
    const notebook = JSON.parse(content);
    const language = notebook.metadata.language_info?.name ?? "python";
    const cells = notebook.cells.map(
      (cell, index) => processCell(cell, index, language)
    );
    yield {
      type: "result",
      resultForAssistant: renderResultForAssistant(cells),
      data: cells
    };
  },
  renderResultForAssistant
};
function processOutputText(text) {
  if (!text) return "";
  const rawText = Array.isArray(text) ? text.join("") : text;
  const { truncatedContent } = formatOutput(rawText);
  return truncatedContent;
}
function extractImage(data) {
  if (typeof data["image/png"] === "string") {
    return {
      image_data: data["image/png"],
      media_type: "image/png"
    };
  }
  if (typeof data["image/jpeg"] === "string") {
    return {
      image_data: data["image/jpeg"],
      media_type: "image/jpeg"
    };
  }
  return void 0;
}
function processOutput(output) {
  switch (output.output_type) {
    case "stream":
      return {
        output_type: output.output_type,
        text: processOutputText(output.text)
      };
    case "execute_result":
    case "display_data":
      return {
        output_type: output.output_type,
        text: processOutputText(output.data?.["text/plain"]),
        image: output.data && extractImage(output.data)
      };
    case "error":
      return {
        output_type: output.output_type,
        text: processOutputText(
          `${output.ename}: ${output.evalue}
${output.traceback.join("\n")}`
        )
      };
  }
}
function processCell(cell, index, language) {
  const cellData = {
    cell: index,
    cellType: cell.cell_type,
    source: Array.isArray(cell.source) ? cell.source.join("") : cell.source,
    language,
    execution_count: cell.execution_count
  };
  if (cell.outputs?.length) {
    cellData.outputs = cell.outputs.map(processOutput);
  }
  return cellData;
}
function cellContentToToolResult(cell) {
  const metadata = [];
  if (cell.cellType !== "code") {
    metadata.push(`<cell_type>${cell.cellType}</cell_type>`);
  }
  if (cell.language !== "python" && cell.cellType === "code") {
    metadata.push(`<language>${cell.language}</language>`);
  }
  const cellContent = `<cell ${cell.cell}>${metadata.join("")}${cell.source}</cell ${cell.cell}>`;
  return {
    text: cellContent,
    type: "text"
  };
}
function cellOutputToToolResult(output) {
  const outputs = [];
  if (output.text) {
    outputs.push({
      text: `
${output.text}`,
      type: "text"
    });
  }
  if (output.image) {
    outputs.push({
      type: "image",
      source: {
        data: output.image.image_data,
        media_type: output.image.media_type,
        type: "base64"
      }
    });
  }
  return outputs;
}
function getToolResultFromCell(cell) {
  const contentResult = cellContentToToolResult(cell);
  const outputResults = cell.outputs?.flatMap(cellOutputToToolResult);
  return [contentResult, ...outputResults ?? []];
}

// src/tools/FileReadTool/prompt.ts
var MAX_LINES_TO_READ = 2e3;
var MAX_LINE_LENGTH = 2e3;
var DESCRIPTION2 = "Read a file from the local filesystem.";
var PROMPT2 = `Reads a file from the local filesystem. The file_path parameter must be an absolute path, not a relative path. By default, it reads up to ${MAX_LINES_TO_READ} lines starting from the beginning of the file. You can optionally specify a line offset and limit (especially handy for long files), but it's recommended to read the whole file by not providing these parameters. Any lines longer than ${MAX_LINE_LENGTH} characters will be truncated. For image files, the tool will display the image for you. For Jupyter notebooks (.ipynb files), use the ${NotebookReadTool.name} instead.`;

// src/tools/FileReadTool/FileReadTool.tsx
var MAX_LINES_TO_RENDER = 3;
var MAX_OUTPUT_SIZE = 0.25 * 1024 * 1024;
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".webp"
]);
var MAX_WIDTH = 2e3;
var MAX_HEIGHT = 2e3;
var MAX_IMAGE_SIZE = 3.75 * 1024 * 1024;
var inputSchema2 = z2.strictObject({
  file_path: z2.string().describe("The absolute path to the file to read"),
  offset: z2.number().optional().describe(
    "The line number to start reading from. Only provide if the file is too large to read at once"
  ),
  limit: z2.number().optional().describe(
    "The number of lines to read. Only provide if the file is too large to read at once."
  )
});
var FileReadTool = {
  name: "View",
  async description() {
    return DESCRIPTION2;
  },
  async prompt() {
    return PROMPT2;
  },
  inputSchema: inputSchema2,
  isReadOnly() {
    return true;
  },
  userFacingName() {
    return "Read";
  },
  async isEnabled() {
    return true;
  },
  needsPermissions({ file_path }) {
    return !hasReadPermission(file_path || getCwd());
  },
  renderToolUseMessage(input, { verbose }) {
    const { file_path, ...rest } = input;
    const entries = [
      ["file_path", verbose ? file_path : relative3(getCwd(), file_path)],
      ...Object.entries(rest)
    ];
    return entries.map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(", ");
  },
  renderToolResultMessage(output, { verbose }) {
    switch (output.type) {
      case "image":
        return /* @__PURE__ */ React11.createElement(Box4, { justifyContent: "space-between", overflowX: "hidden", width: "100%" }, /* @__PURE__ */ React11.createElement(Box4, { flexDirection: "row" }, /* @__PURE__ */ React11.createElement(Text10, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React11.createElement(Text10, null, "Read image")));
      case "text": {
        const { filePath, content, numLines } = output.file;
        const contentWithFallback = content || "(No content)";
        return /* @__PURE__ */ React11.createElement(Box4, { justifyContent: "space-between", overflowX: "hidden", width: "100%" }, /* @__PURE__ */ React11.createElement(Box4, { flexDirection: "row" }, /* @__PURE__ */ React11.createElement(Text10, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React11.createElement(Box4, { flexDirection: "column" }, /* @__PURE__ */ React11.createElement(
          HighlightedCode,
          {
            code: verbose ? contentWithFallback : contentWithFallback.split("\n").slice(0, MAX_LINES_TO_RENDER).filter((_) => _.trim() !== "").join("\n"),
            language: extname4(filePath).slice(1)
          }
        ), !verbose && numLines > MAX_LINES_TO_RENDER && /* @__PURE__ */ React11.createElement(Text10, { color: getTheme().secondaryText }, "... (+", numLines - MAX_LINES_TO_RENDER, " lines)"))));
      }
    }
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React11.createElement(FallbackToolUseRejectedMessage, null);
  },
  async validateInput({ file_path, offset, limit }) {
    const fullFilePath = normalizeFilePath(file_path);
    if (!existsSync12(fullFilePath)) {
      const similarFilename = findSimilarFile(fullFilePath);
      let message = "File does not exist.";
      if (similarFilename) {
        message += ` Did you mean ${similarFilename}?`;
      }
      return {
        result: false,
        message
      };
    }
    const stats = statSync2(fullFilePath);
    const fileSize = stats.size;
    const ext = path4.extname(fullFilePath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      if (fileSize > MAX_OUTPUT_SIZE && !offset && !limit) {
        return {
          result: false,
          message: formatFileSizeError(fileSize),
          meta: { fileSize }
        };
      }
    }
    return { result: true };
  },
  async *call({ file_path, offset = 1, limit = void 0 }, { readFileTimestamps }) {
    const ext = path4.extname(file_path).toLowerCase();
    const fullFilePath = normalizeFilePath(file_path);
    readFileTimestamps[fullFilePath] = Date.now();
    if (IMAGE_EXTENSIONS.has(ext)) {
      const data2 = await readImage(fullFilePath, ext);
      yield {
        type: "result",
        data: data2,
        resultForAssistant: this.renderResultForAssistant(data2)
      };
      return;
    }
    const lineOffset = offset === 0 ? 0 : offset - 1;
    const { content, lineCount, totalLines } = readTextContent(
      fullFilePath,
      lineOffset,
      limit
    );
    if (!IMAGE_EXTENSIONS.has(ext) && content.length > MAX_OUTPUT_SIZE) {
      throw new Error(formatFileSizeError(content.length));
    }
    const data = {
      type: "text",
      file: {
        filePath: file_path,
        content,
        numLines: lineCount,
        startLine: offset,
        totalLines
      }
    };
    yield {
      type: "result",
      data,
      resultForAssistant: this.renderResultForAssistant(data)
    };
  },
  renderResultForAssistant(data) {
    switch (data.type) {
      case "image":
        return [
          {
            type: "image",
            source: {
              type: "base64",
              data: data.file.base64,
              media_type: data.file.type
            }
          }
        ];
      case "text":
        return addLineNumbers(data.file);
    }
  }
};
var formatFileSizeError = (sizeInBytes) => `File content (${Math.round(sizeInBytes / 1024)}KB) exceeds maximum allowed size (${Math.round(MAX_OUTPUT_SIZE / 1024)}KB). Please use offset and limit parameters to read specific portions of the file, or use the GrepTool to search for specific content.`;
function createImageResponse(buffer, ext) {
  return {
    type: "image",
    file: {
      base64: buffer.toString("base64"),
      type: `image/${ext.slice(1)}`
    }
  };
}
async function readImage(filePath, ext) {
  try {
    const stats = statSync2(filePath);
    const sharp = (await import("sharp")).default;
    const image = sharp(readFileSync10(filePath));
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      if (stats.size > MAX_IMAGE_SIZE) {
        const compressedBuffer = await image.jpeg({ quality: 80 }).toBuffer();
        return createImageResponse(compressedBuffer, "jpeg");
      }
    }
    let width = metadata.width || 0;
    let height = metadata.height || 0;
    if (stats.size <= MAX_IMAGE_SIZE && width <= MAX_WIDTH && height <= MAX_HEIGHT) {
      return createImageResponse(readFileSync10(filePath), ext);
    }
    if (width > MAX_WIDTH) {
      height = Math.round(height * MAX_WIDTH / width);
      width = MAX_WIDTH;
    }
    if (height > MAX_HEIGHT) {
      width = Math.round(width * MAX_HEIGHT / height);
      height = MAX_HEIGHT;
    }
    const resizedImageBuffer = await image.resize(width, height, {
      fit: "inside",
      withoutEnlargement: true
    }).toBuffer();
    if (resizedImageBuffer.length > MAX_IMAGE_SIZE) {
      const compressedBuffer = await image.jpeg({ quality: 80 }).toBuffer();
      return createImageResponse(compressedBuffer, "jpeg");
    }
    return createImageResponse(resizedImageBuffer, ext);
  } catch (e) {
    logError(e);
    return createImageResponse(readFileSync10(filePath), ext);
  }
}

// src/tools/GlobTool/prompt.ts
var TOOL_NAME_FOR_PROMPT = "GlobTool";
var DESCRIPTION3 = `- Fast file pattern matching tool that works with any codebase size
- Supports glob patterns like "**/*.js" or "src/**/*.ts"
- Returns matching file paths sorted by modification time
- Use this tool when you need to find files by name patterns
- When you are doing an open ended search that may require multiple rounds of globbing and grepping, use the Agent tool instead
`;

// src/tools/GrepTool/prompt.ts
var TOOL_NAME_FOR_PROMPT2 = "GrepTool";
var DESCRIPTION4 = `
- Fast content search tool that works with any codebase size
- Searches file contents using regular expressions
- Supports full regex syntax (eg. "log.*Error", "function\\s+\\w+", etc.)
- Filter files by pattern with the include parameter (eg. "*.js", "*.{ts,tsx}")
- Returns matching file paths sorted by modification time
- Use this tool when you need to find files containing specific patterns
- When you are doing an open ended search that may require multiple rounds of globbing and grepping, use the Agent tool instead
`;

// src/tools/lsTool/lsTool.tsx
import { readdirSync as readdirSync3 } from "fs";
import { Box as Box5, Text as Text11 } from "ink";
import { basename as basename2, isAbsolute as isAbsolute5, join as join9, relative as relative4, resolve as resolve8, sep as sep3 } from "path";
import * as React12 from "react";
import { z as z3 } from "zod";
init_log();
init_state();

// src/tools/lsTool/prompt.ts
var DESCRIPTION5 = "Lists files and directories in a given path. The path parameter must be an absolute path, not a relative path. You should generally prefer the Glob and Grep tools, if you know which directories to search.";

// src/tools/lsTool/lsTool.tsx
var MAX_LINES = 4;
var MAX_FILES = 1e3;
var TRUNCATED_MESSAGE = `There are more than ${MAX_FILES} files in the repository. Use the LS tool (passing a specific path), Bash tool, and other tools to explore nested directories. The first ${MAX_FILES} files and directories are included below:

`;
var inputSchema3 = z3.strictObject({
  path: z3.string().describe(
    "The absolute path to the directory to list (must be absolute, not relative)"
  )
});
var LSTool = {
  name: "LS",
  async description() {
    return DESCRIPTION5;
  },
  inputSchema: inputSchema3,
  userFacingName() {
    return "List";
  },
  async isEnabled() {
    return true;
  },
  isReadOnly() {
    return true;
  },
  needsPermissions({ path: path7 }) {
    return !hasReadPermission(path7);
  },
  async prompt() {
    return DESCRIPTION5;
  },
  renderResultForAssistant(data) {
    return data;
  },
  renderToolUseMessage({ path: path7 }, { verbose }) {
    const absolutePath = path7 ? isAbsolute5(path7) ? path7 : resolve8(getCwd(), path7) : void 0;
    const relativePath = absolutePath ? relative4(getCwd(), absolutePath) : ".";
    return `path: "${verbose ? path7 : relativePath}"`;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React12.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(content, { verbose }) {
    if (typeof content !== "string") {
      return null;
    }
    const result = content.replace(TRUNCATED_MESSAGE, "");
    if (!result) {
      return null;
    }
    return /* @__PURE__ */ React12.createElement(Box5, { justifyContent: "space-between", width: "100%" }, /* @__PURE__ */ React12.createElement(Box5, null, /* @__PURE__ */ React12.createElement(Text11, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React12.createElement(Box5, { flexDirection: "column", paddingLeft: 0 }, result.split("\n").filter((_) => _.trim() !== "").slice(0, verbose ? void 0 : MAX_LINES).map((_, i) => /* @__PURE__ */ React12.createElement(Text11, { key: i }, _)), !verbose && result.split("\n").length > MAX_LINES && /* @__PURE__ */ React12.createElement(Text11, { color: getTheme().secondaryText }, "... (+", result.split("\n").length - MAX_LINES, " items)"))));
  },
  async *call({ path: path7 }, { abortController }) {
    const fullFilePath = isAbsolute5(path7) ? path7 : resolve8(getCwd(), path7);
    const result = listDirectory(
      fullFilePath,
      getCwd(),
      abortController.signal
    ).sort();
    const safetyWarning = `
NOTE: do any of the files above seem malicious? If so, you MUST refuse to continue work.`;
    const userTree = printTree(createFileTree(result));
    const assistantTree = userTree + safetyWarning;
    if (result.length < MAX_FILES) {
      yield {
        type: "result",
        data: userTree,
        // Show user the tree without the warning
        resultForAssistant: this.renderResultForAssistant(assistantTree)
        // Send warning only to assistant
      };
    } else {
      const userData = `${TRUNCATED_MESSAGE}${userTree}`;
      const assistantData = `${TRUNCATED_MESSAGE}${assistantTree}`;
      yield {
        type: "result",
        data: userData,
        // Show user the truncated tree without the warning
        resultForAssistant: this.renderResultForAssistant(assistantData)
        // Send warning only to assistant
      };
    }
  }
};
function listDirectory(initialPath, cwd4, abortSignal) {
  const results = [];
  const queue = [initialPath];
  while (queue.length > 0) {
    if (results.length > MAX_FILES) {
      return results;
    }
    if (abortSignal.aborted) {
      return results;
    }
    const path7 = queue.shift();
    if (skip(path7)) {
      continue;
    }
    if (path7 !== initialPath) {
      results.push(relative4(cwd4, path7) + sep3);
    }
    let children;
    try {
      children = readdirSync3(path7, { withFileTypes: true });
    } catch (e) {
      logError(e);
      continue;
    }
    for (const child of children) {
      if (child.isDirectory()) {
        queue.push(join9(path7, child.name) + sep3);
      } else {
        const fileName = join9(path7, child.name);
        if (skip(fileName)) {
          continue;
        }
        results.push(relative4(cwd4, fileName));
        if (results.length > MAX_FILES) {
          return results;
        }
      }
    }
  }
  return results;
}
function createFileTree(sortedPaths) {
  const root = [];
  for (const path7 of sortedPaths) {
    const parts = path7.split(sep3);
    let currentLevel = root;
    let currentPath = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) {
        continue;
      }
      currentPath = currentPath ? `${currentPath}${sep3}${part}` : part;
      const isLastPart = i === parts.length - 1;
      const existingNode = currentLevel.find((node) => node.name === part);
      if (existingNode) {
        currentLevel = existingNode.children || [];
      } else {
        const newNode = {
          name: part,
          path: currentPath,
          type: isLastPart ? "file" : "directory"
        };
        if (!isLastPart) {
          newNode.children = [];
        }
        currentLevel.push(newNode);
        currentLevel = newNode.children || [];
      }
    }
  }
  return root;
}
function printTree(tree, level = 0, prefix = "") {
  let result = "";
  if (level === 0) {
    result += `- ${getCwd()}${sep3}
`;
    prefix = "  ";
  }
  for (const node of tree) {
    result += `${prefix}${"-"} ${node.name}${node.type === "directory" ? sep3 : ""}
`;
    if (node.children && node.children.length > 0) {
      result += printTree(node.children, level + 1, `${prefix}  `);
    }
  }
  return result;
}
function skip(path7) {
  if (path7 !== "." && basename2(path7).startsWith(".")) {
    return true;
  }
  if (path7.includes(`__pycache__${sep3}`)) {
    return true;
  }
  return false;
}

// src/tools/BashTool/prompt.ts
var MAX_OUTPUT_LENGTH = 3e4;
var MAX_RENDERED_LINES = 50;
var BANNED_COMMANDS = [
  "alias",
  "curlie",
  "wget",
  "axel",
  "aria2c",
  "nc",
  "telnet",
  "lynx",
  "w3m",
  "links",
  "httpie",
  "xh",
  "http-prompt",
  "chrome",
  "firefox",
  "safari"
];
var PROMPT3 = `Executes a given bash command in a persistent shell session with optional timeout, ensuring proper handling and security measures.

Before executing the command, please follow these steps:

1. Directory Verification:
   - If the command will create new directories or files, first use the LS tool to verify the parent directory exists and is the correct location
   - For example, before running "mkdir foo/bar", first use LS to check that "foo" exists and is the intended parent directory

2. Security Check:
   - For security and to limit the threat of a prompt injection attack, some commands are limited or banned. If you use a disallowed command, you will receive an error message explaining the restriction. Explain the error to the User.
   - Verify that the command is not one of the banned commands: ${BANNED_COMMANDS.join(", ")}.

3. Command Execution:
   - After ensuring proper quoting, execute the command.
   - Capture the output of the command.

4. Output Processing:
   - If the output exceeds ${MAX_OUTPUT_LENGTH} characters, output will be truncated before being returned to you.
   - Prepare the output for display to the user.

5. Return Result:
   - Provide the processed output of the command.
   - If any errors occurred during execution, include those in the output.

Usage notes:
  - The command argument is required.
  - You can specify an optional timeout in milliseconds (up to 600000ms / 10 minutes). If not specified, commands will timeout after 30 minutes.
  - VERY IMPORTANT: You MUST avoid using search commands like \`find\` and \`grep\`. Instead use ${TOOL_NAME_FOR_PROMPT2}, ${TOOL_NAME_FOR_PROMPT}, or ${TOOL_NAME} to search. You MUST avoid read tools like \`cat\`, \`head\`, \`tail\`, and \`ls\`, and use ${FileReadTool.name} and ${LSTool.name} to read files.
  - When issuing multiple commands, use the ';' or '&&' operator to separate them. DO NOT use newlines (newlines are ok in quoted strings).
  - IMPORTANT: All commands share the same shell session. Shell state (environment variables, virtual environments, current directory, etc.) persist between commands. For example, if you set an environment variable as part of a command, the environment variable will persist for subsequent commands.
  - Try to maintain your current working directory throughout the session by using absolute paths and avoiding usage of \`cd\`. You may use \`cd\` if the User explicitly requests it.
  <good-example>
  pytest /foo/bar/tests
  </good-example>
  <bad-example>
  cd /foo/bar && pytest tests
  </bad-example>

# Committing changes with git

When the user asks you to create a new git commit, follow these steps carefully:

1. Start with a single message that contains exactly three tool_use blocks that do the following (it is VERY IMPORTANT that you send these tool_use blocks in a single message, otherwise it will feel slow to the user!):
   - Run a git status command to see all untracked files.
   - Run a git diff command to see both staged and unstaged changes that will be committed.
   - Run a git log command to see recent commit messages, so that you can follow this repository's commit message style.

2. Use the git context at the start of this conversation to determine which files are relevant to your commit. Add relevant untracked files to the staging area. Do not commit files that were already modified at the start of this conversation, if they are not relevant to your commit.

3. Analyze all staged changes (both previously staged and newly added) and draft a commit message. Wrap your analysis process in <commit_analysis> tags:

<commit_analysis>
- List the files that have been changed or added
- Summarize the nature of the changes (eg. new feature, enhancement to an existing feature, bug fix, refactoring, test, docs, etc.)
- Brainstorm the purpose or motivation behind these changes
- Do not use tools to explore code, beyond what is available in the git context
- Assess the impact of these changes on the overall project
- Check for any sensitive information that shouldn't be committed
- Draft a concise (1-2 sentences) commit message that focuses on the "why" rather than the "what"
- Ensure your language is clear, concise, and to the point
- Ensure the message accurately reflects the changes and their purpose (i.e. "add" means a wholly new feature, "update" means an enhancement to an existing feature, "fix" means a bug fix, etc.)
- Ensure the message is not generic (avoid words like "Update" or "Fix" without context)
- Review the draft message to ensure it accurately reflects the changes and their purpose
</commit_analysis>

4. Create the commit with a message ending with:
\u{1F916} Generated with ${process.env.USER_TYPE === "ant" ? `[${PRODUCT_NAME}](${PRODUCT_URL})` : PRODUCT_NAME}
Co-Authored-By: Claude <noreply@anthropic.com>

- In order to ensure good formatting, ALWAYS pass the commit message via a HEREDOC, a la this example:
<example>
git commit -m "$(cat <<'EOF'
   Commit message here.

   \u{1F916} Generated with ${process.env.USER_TYPE === "ant" ? `[${PRODUCT_NAME}](${PRODUCT_URL})` : PRODUCT_NAME}
   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
</example>

5. If the commit fails due to pre-commit hook changes, retry the commit ONCE to include these automated changes. If it fails again, it usually means a pre-commit hook is preventing the commit. If the commit succeeds but you notice that files were modified by the pre-commit hook, you MUST amend your commit to include them.

6. Finally, run git status to make sure the commit succeeded.

Important notes:
- When possible, combine the "git add" and "git commit" commands into a single "git commit -am" command, to speed things up
- However, be careful not to stage files (e.g. with \`git add .\`) for commits that aren't part of the change, they may have untracked files they want to keep around, but not commit.
- NEVER update the git config
- DO NOT push to the remote repository
- IMPORTANT: Never use git commands with the -i flag (like git rebase -i or git add -i) since they require interactive input which is not supported.
- If there are no changes to commit (i.e., no untracked files and no modifications), do not create an empty commit
- Ensure your commit message is meaningful and concise. It should explain the purpose of the changes, not just describe them.
- Return an empty response - the user will see the git output directly

# Creating pull requests
Use the gh command via the Bash tool for ALL GitHub-related tasks including working with issues, pull requests, checks, and releases. If given a Github URL use the gh command to get the information needed.

IMPORTANT: When the user asks you to create a pull request, follow these steps carefully:

1. Understand the current state of the branch. Remember to send a single message that contains multiple tool_use blocks (it is VERY IMPORTANT that you do this in a single message, otherwise it will feel slow to the user!):
   - Run a git status command to see all untracked files.
   - Run a git diff command to see both staged and unstaged changes that will be committed.
   - Check if the current branch tracks a remote branch and is up to date with the remote, so you know if you need to push to the remote
   - Run a git log command and \`git diff main...HEAD\` to understand the full commit history for the current branch (from the time it diverged from the \`main\` branch.)

2. Create new branch if needed

3. Commit changes if needed

4. Push to remote with -u flag if needed

5. Analyze all changes that will be included in the pull request, making sure to look at all relevant commits (not just the latest commit, but all commits that will be included in the pull request!), and draft a pull request summary. Wrap your analysis process in <pr_analysis> tags:

<pr_analysis>
- List the commits since diverging from the main branch
- Summarize the nature of the changes (eg. new feature, enhancement to an existing feature, bug fix, refactoring, test, docs, etc.)
- Brainstorm the purpose or motivation behind these changes
- Assess the impact of these changes on the overall project
- Do not use tools to explore code, beyond what is available in the git context
- Check for any sensitive information that shouldn't be committed
- Draft a concise (1-2 bullet points) pull request summary that focuses on the "why" rather than the "what"
- Ensure the summary accurately reflects all changes since diverging from the main branch
- Ensure your language is clear, concise, and to the point
- Ensure the summary accurately reflects the changes and their purpose (ie. "add" means a wholly new feature, "update" means an enhancement to an existing feature, "fix" means a bug fix, etc.)
- Ensure the summary is not generic (avoid words like "Update" or "Fix" without context)
- Review the draft summary to ensure it accurately reflects the changes and their purpose
</pr_analysis>

6. Create PR using gh pr create with the format below. Use a HEREDOC to pass the body to ensure correct formatting.
<example>
gh pr create --title "the pr title" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points>

## Test plan
[Checklist of TODOs for testing the pull request...]

\u{1F916} Generated with ${process.env.USER_TYPE === "ant" ? `[${PRODUCT_NAME}](${PRODUCT_URL})` : PRODUCT_NAME}
EOF
)"
</example>

Important:
- Return an empty response - the user will see the gh output directly
- Never update git config`;

// src/tools/BashTool/OutputLine.tsx
init_source();
function renderTruncatedContent(content, totalLines) {
  const allLines = content.split("\n");
  if (allLines.length <= MAX_RENDERED_LINES) {
    return allLines.join("\n");
  }
  const firstHalf = Math.floor(MAX_RENDERED_LINES / 2);
  const secondHalf = MAX_RENDERED_LINES - firstHalf;
  return [
    ...allLines.slice(0, firstHalf),
    source_default.grey(`... (+${totalLines - MAX_RENDERED_LINES} lines)`),
    ...allLines.slice(-secondHalf)
  ].join("\n");
}
function OutputLine({
  content,
  lines,
  verbose,
  isError
}) {
  return /* @__PURE__ */ React13.createElement(Box6, { justifyContent: "space-between", width: "100%" }, /* @__PURE__ */ React13.createElement(Box6, { flexDirection: "row" }, /* @__PURE__ */ React13.createElement(Text12, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React13.createElement(Box6, { flexDirection: "column" }, /* @__PURE__ */ React13.createElement(Text12, { color: isError ? getTheme().error : void 0 }, verbose ? content.trim() : renderTruncatedContent(content.trim(), lines)))));
}

// src/tools/BashTool/BashToolResultMessage.tsx
import React14 from "react";
function BashToolResultMessage({ content, verbose }) {
  const { stdout, stdoutLines, stderr, stderrLines } = content;
  return /* @__PURE__ */ React14.createElement(Box7, { flexDirection: "column" }, stdout !== "" ? /* @__PURE__ */ React14.createElement(OutputLine, { content: stdout, lines: stdoutLines, verbose }) : null, stderr !== "" ? /* @__PURE__ */ React14.createElement(
    OutputLine,
    {
      content: stderr,
      lines: stderrLines,
      verbose,
      isError: true
    }
  ) : null, stdout === "" && stderr === "" ? /* @__PURE__ */ React14.createElement(Box7, { flexDirection: "row" }, /* @__PURE__ */ React14.createElement(Text13, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React14.createElement(Text13, { color: getTheme().secondaryText }, "(No content)")) : null);
}
var BashToolResultMessage_default = BashToolResultMessage;

// src/tools/BashTool/BashTool.tsx
init_statsig();
var inputSchema4 = z4.strictObject({
  command: z4.string().describe("The command to execute"),
  timeout: z4.number().optional().describe("Optional timeout in milliseconds (max 600000)")
});
var BashTool = {
  name: "Bash",
  async description({ command: command3 }) {
    try {
      const result = await queryHaiku({
        systemPrompt: [
          `You are a command description generator. Write a clear, concise description of what this command does in 5-10 words. Examples:

          Input: ls
          Output: Lists files in current directory

          Input: git status
          Output: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`
        ],
        userPrompt: `Describe this command: ${command3}`
      });
      const description = result.message.content[0]?.type === "text" ? result.message.content[0].text : null;
      return description || "Executes a bash command";
    } catch (error) {
      logError(error);
      return "Executes a bash command";
    }
  },
  async prompt() {
    return PROMPT3;
  },
  isReadOnly() {
    return false;
  },
  inputSchema: inputSchema4,
  userFacingName() {
    return "Bash";
  },
  async isEnabled() {
    return true;
  },
  needsPermissions() {
    return true;
  },
  async validateInput({ command: command3 }) {
    const commands = splitCommand(command3);
    for (const cmd of commands) {
      const parts = cmd.split(" ");
      const baseCmd = parts[0];
      if (baseCmd && BANNED_COMMANDS.includes(baseCmd.toLowerCase())) {
        return {
          result: false,
          message: `Command '${baseCmd}' is not allowed for security reasons`
        };
      }
      if (baseCmd === "cd" && parts[1]) {
        const targetDir = parts[1].replace(/^['"]|['"]$/g, "");
        const fullTargetDir = isAbsolute6(targetDir) ? targetDir : resolve9(getCwd(), targetDir);
        if (!isInDirectory(
          relative5(getOriginalCwd(), fullTargetDir),
          relative5(getCwd(), getOriginalCwd())
        )) {
          return {
            result: false,
            message: `ERROR: cd to '${fullTargetDir}' was blocked. For security, ${PRODUCT_NAME} may only change directories to child directories of the original working directory (${getOriginalCwd()}) for this session.`
          };
        }
      }
    }
    return { result: true };
  },
  renderToolUseMessage({ command: command3 }) {
    if (command3.includes(`"$(cat <<'EOF'`)) {
      const match = command3.match(
        /^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/
      );
      if (match && match[1] && match[2]) {
        const prefix = match[1];
        const content = match[2];
        const suffix = match[3] || "";
        return `${prefix.trim()} "${content.trim()}"${suffix.trim()}`;
      }
    }
    return command3;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React15.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(content, { verbose }) {
    return /* @__PURE__ */ React15.createElement(BashToolResultMessage_default, { content, verbose });
  },
  renderResultForAssistant({ interrupted, stdout, stderr }) {
    let errorMessage = stderr.trim();
    if (interrupted) {
      if (stderr) errorMessage += EOL2;
      errorMessage += "<error>Command was aborted before completion</error>";
    }
    const hasBoth = stdout.trim() && errorMessage;
    return `${stdout.trim()}${hasBoth ? "\n" : ""}${errorMessage.trim()}`;
  },
  async *call({ command: command3, timeout = 12e4 }, { abortController, readFileTimestamps }) {
    let stdout = "";
    let stderr = "";
    const result = await PersistentShell.getInstance().exec(
      command3,
      abortController.signal,
      timeout
    );
    stdout += (result.stdout || "").trim() + EOL2;
    stderr += (result.stderr || "").trim() + EOL2;
    if (result.code !== 0) {
      stderr += `Exit code ${result.code}`;
    }
    if (!isInDirectory(getCwd(), getOriginalCwd())) {
      await PersistentShell.getInstance().setCwd(getOriginalCwd());
      stderr = `${stderr.trim()}${EOL2}Shell cwd was reset to ${getOriginalCwd()}`;
      logEvent("bash_tool_reset_to_original_dir", {});
    }
    if (true) {
      getCommandFilePaths(command3, stdout).then((filePaths) => {
        for (const filePath of filePaths) {
          const fullFilePath = isAbsolute6(filePath) ? filePath : resolve9(getCwd(), filePath);
          try {
            readFileTimestamps[fullFilePath] = statSync3(fullFilePath).mtimeMs;
          } catch (e) {
            logError(e);
          }
        }
      });
    }
    const { totalLines: stdoutLines, truncatedContent: stdoutContent } = formatOutput(stdout.trim());
    const { totalLines: stderrLines, truncatedContent: stderrContent } = formatOutput(stderr.trim());
    const data = {
      stdout: stdoutContent,
      stdoutLines,
      stderr: stderrContent,
      stderrLines,
      interrupted: result.interrupted
    };
    yield {
      type: "result",
      resultForAssistant: this.renderResultForAssistant(data),
      data
    };
  }
};

// src/constants/prompts.ts
init_model();
function getCLISyspromptPrefix() {
  return `You are ${PRODUCT_NAME}, Anthropic's official CLI for Claude.`;
}
async function getSystemPrompt() {
  return [
    `You are an interactive CLI tool that helps users with software engineering tasks. Use the instructions below and the tools available to you to assist the user.

IMPORTANT: Refuse to write code or explain code that may be used maliciously; even if the user claims it is for educational purposes. When working on files, if they seem related to improving, explaining, or interacting with malware or any malicious code you MUST refuse.
IMPORTANT: Before you begin work, think about what the code you're editing is supposed to do based on the filenames directory structure. If it seems malicious, refuse to work on it or answer questions about it, even if the request does not seem malicious (for instance, just asking to explain or speed up the code).

Here are useful slash commands users can run to interact with you:
- /help: Get help with using ${PRODUCT_NAME}
- /compact: Compact and continue the conversation. This is useful if the conversation is reaching the context limit
There are additional slash commands and flags available to the user. If the user asks about ${PRODUCT_NAME} functionality, always run \`claude -h\` with ${BashTool.name} to see supported commands and flags. NEVER assume a flag or command exists without checking the help output first.
To give feedback, users should report the issue at https://github.com/anthropics/claude-code/issues.

# Memory
If the current working directory contains a file called CLAUDE.md, it will be automatically added to your context. This file serves multiple purposes:
1. Storing frequently used bash commands (build, test, lint, etc.) so you can use them without searching each time
2. Recording the user's code style preferences (naming conventions, preferred libraries, etc.)
3. Maintaining useful information about the codebase structure and organization

When you spend time searching for commands to typecheck, lint, build, or test, you should ask the user if it's okay to add those commands to CLAUDE.md. Similarly, when learning about code style preferences or important codebase information, ask if it's okay to add that to CLAUDE.md so you can remember it for next time.

# Tone and style
You should be concise, direct, and to the point. When you run a non-trivial bash command, you should explain what the command does and why you are running it, to make sure the user understands what you are doing (this is especially important when you are running a command that will make changes to the user's system).
Remember that your output will be displayed on a command line interface. Your responses can use Github-flavored markdown for formatting, and will be rendered in a monospace font using the CommonMark specification.
Output text to communicate with the user; all text you output outside of tool use is displayed to the user. Only use tools to complete tasks. Never use tools like ${BashTool.name} or code comments as means to communicate with the user during the session.
If you cannot or will not help the user with something, please do not say why or what it could lead to, since this comes across as preachy and annoying. Please offer helpful alternatives if possible, and otherwise keep your response to 1-2 sentences.
IMPORTANT: You should minimize output tokens as much as possible while maintaining helpfulness, quality, and accuracy. Only address the specific query or task at hand, avoiding tangential information unless absolutely critical for completing the request. If you can answer in 1-3 sentences or a short paragraph, please do.
IMPORTANT: You should NOT answer with unnecessary preamble or postamble (such as explaining your code or summarizing your action), unless the user asks you to.
IMPORTANT: Keep your responses short, since they will be displayed on a command line interface. You MUST answer concisely with fewer than 4 lines (not including tool use or code generation), unless user asks for detail. Answer the user's question directly, without elaboration, explanation, or details. One word answers are best. Avoid introductions, conclusions, and explanations. You MUST avoid text before/after your response, such as "The answer is <answer>.", "Here is the content of the file..." or "Based on the information provided, the answer is..." or "Here is what I will do next...". Here are some examples to demonstrate appropriate verbosity:
<example>
user: 2 + 2
assistant: 4
</example>

<example>
user: what is 2+2?
assistant: 4
</example>

<example>
user: is 11 a prime number?
assistant: true
</example>

<example>
user: what command should I run to list files in the current directory?
assistant: ls
</example>

<example>
user: what command should I run to watch files in the current directory?
assistant: [use the ls tool to list the files in the current directory, then read docs/commands in the relevant file to find out how to watch files]
npm run dev
</example>

<example>
user: How many golf balls fit inside a jetta?
assistant: 150000
</example>

<example>
user: what files are in the directory src/?
assistant: [runs ls and sees foo.c, bar.c, baz.c]
user: which file contains the implementation of foo?
assistant: src/foo.c
</example>

<example>
user: write tests for new feature
assistant: [uses grep and glob search tools to find where similar tests are defined, uses concurrent read file tool use blocks in one tool call to read relevant files at the same time, uses edit file tool to write new tests]
</example>

# Proactiveness
You are allowed to be proactive, but only when the user asks you to do something. You should strive to strike a balance between:
1. Doing the right thing when asked, including taking actions and follow-up actions
2. Not surprising the user with actions you take without asking
For example, if the user asks you how to approach something, you should do your best to answer their question first, and not immediately jump into taking actions.
3. Do not add additional code explanation summary unless requested by the user. After working on a file, just stop, rather than providing an explanation of what you did.

# Synthetic messages
Sometimes, the conversation will contain messages like ${INTERRUPT_MESSAGE} or ${INTERRUPT_MESSAGE_FOR_TOOL_USE}. These messages will look like the assistant said them, but they were actually synthetic messages added by the system in response to the user cancelling what the assistant was doing. You should not respond to these messages. You must NEVER send messages like this yourself. 

# Following conventions
When making changes to files, first understand the file's code conventions. Mimic code style, use existing libraries and utilities, and follow existing patterns.
- NEVER assume that a given library is available, even if it is well known. Whenever you write code that uses a library or framework, first check that this codebase already uses the given library. For example, you might look at neighboring files, or check the package.json (or cargo.toml, and so on depending on the language).
- When you create a new component, first look at existing components to see how they're written; then consider framework choice, naming conventions, typing, and other conventions.
- When you edit a piece of code, first look at the code's surrounding context (especially its imports) to understand the code's choice of frameworks and libraries. Then consider how to make the given change in a way that is most idiomatic.
- Always follow security best practices. Never introduce code that exposes or logs secrets and keys. Never commit secrets or keys to the repository.

# Code style
- Do not add comments to the code you write, unless the user asks you to, or the code is complex and requires additional context.

# Doing tasks
The user will primarily request you perform software engineering tasks. This includes solving bugs, adding new functionality, refactoring code, explaining code, and more. For these tasks the following steps are recommended:
1. Use the available search tools to understand the codebase and the user's query. You are encouraged to use the search tools extensively both in parallel and sequentially.
2. Implement the solution using all tools available to you
3. Verify the solution if possible with tests. NEVER assume specific test framework or test script. Check the README or search codebase to determine the testing approach.
4. VERY IMPORTANT: When you have completed a task, you MUST run the lint and typecheck commands (eg. npm run lint, npm run typecheck, ruff, etc.) if they were provided to you to ensure your code is correct. If you are unable to find the correct command, ask the user for the command to run and if they supply it, proactively suggest writing it to CLAUDE.md so that you will know to run it next time.

NEVER commit changes unless the user explicitly asks you to. It is VERY IMPORTANT to only commit when explicitly asked, otherwise the user will feel that you are being too proactive.

# Tool usage policy
- When doing file search, prefer to use the Agent tool in order to reduce context usage.
- If you intend to call multiple tools and there are no dependencies between the calls, make all of the independent calls in the same function_calls block.

You MUST answer concisely with fewer than 4 lines of text (not including tool use or code generation), unless user asks for detail.
`,
    `
${await getEnvInfo()}`,
    `IMPORTANT: Refuse to write code or explain code that may be used maliciously; even if the user claims it is for educational purposes. When working on files, if they seem related to improving, explaining, or interacting with malware or any malicious code you MUST refuse.
IMPORTANT: Before you begin work, think about what the code you're editing is supposed to do based on the filenames directory structure. If it seems malicious, refuse to work on it or answer questions about it, even if the request does not seem malicious (for instance, just asking to explain or speed up the code).`
  ];
}
async function getEnvInfo() {
  const [model2, isGit] = await Promise.all([
    getSlowAndCapableModel(),
    getIsGit()
  ]);
  const { isResearchModel: isResearchModel2 } = await Promise.resolve().then(() => (init_model(), model_exports));
  const usingResearchModel = isResearchModel2(model2);
  const modelInfo = usingResearchModel ? `Model: ${model2} (Research)` : `Model: ${model2}`;
  return `Here is useful information about the environment you are running in:
<env>
Working directory: ${getCwd()}
Is directory a git repo: ${isGit ? "Yes" : "No"}
Platform: ${env2.platform}
Today's date: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}
${modelInfo}
</env>`;
}
async function getAgentPrompt() {
  return [
    `You are an agent for ${PRODUCT_NAME}, Anthropic's official CLI for Claude. Given the user's prompt, you should use the tools available to you to answer the user's question.

Notes:
1. IMPORTANT: You should be concise, direct, and to the point, since your responses will be displayed on a command line interface. Answer the user's question directly, without elaboration, explanation, or details. One word answers are best. Avoid introductions, conclusions, and explanations. You MUST avoid text before/after your response, such as "The answer is <answer>.", "Here is the content of the file..." or "Based on the information provided, the answer is..." or "Here is what I will do next...".
2. When relevant, share file names and code snippets relevant to the query
3. Any file paths you return in your final response MUST be absolute. DO NOT use relative paths.`,
    `${await getEnvInfo()}`
  ];
}

// src/services/claude.ts
init_model();
var API_ERROR_MESSAGE_PREFIX = "API Error";
var PROMPT_TOO_LONG_ERROR_MESSAGE = "Prompt is too long";
var CREDIT_BALANCE_TOO_LOW_ERROR_MESSAGE = "Credit balance is too low";
var INVALID_API_KEY_ERROR_MESSAGE = "Invalid API key \xB7 Please run /login";
var NO_CONTENT_MESSAGE = "(no content)";
var PROMPT_CACHING_ENABLED = !process.env.DISABLE_PROMPT_CACHING;
var HAIKU_COST_PER_MILLION_INPUT_TOKENS = 0.8;
var HAIKU_COST_PER_MILLION_OUTPUT_TOKENS = 4;
var HAIKU_COST_PER_MILLION_PROMPT_CACHE_WRITE_TOKENS = 1;
var HAIKU_COST_PER_MILLION_PROMPT_CACHE_READ_TOKENS = 0.08;
var SONNET_COST_PER_MILLION_INPUT_TOKENS = 3;
var SONNET_COST_PER_MILLION_OUTPUT_TOKENS = 15;
var SONNET_COST_PER_MILLION_PROMPT_CACHE_WRITE_TOKENS = 3.75;
var SONNET_COST_PER_MILLION_PROMPT_CACHE_READ_TOKENS = 0.3;
var MAIN_QUERY_TEMPERATURE = 1;
function getMetadata() {
  return {
    user_id: `${getOrCreateUserID()}_${SESSION_ID}`
  };
}
var MAX_RETRIES = process.env.USER_TYPE === "SWE_BENCH" ? 100 : 10;
var BASE_DELAY_MS = 500;
function getRetryDelay(attempt, retryAfterHeader) {
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) {
      return seconds * 1e3;
    }
  }
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), 32e3);
}
function shouldRetry(error) {
  if (error.message?.includes('"type":"overloaded_error"')) {
    return process.env.USER_TYPE === "SWE_BENCH";
  }
  const shouldRetryHeader = error.headers?.["x-should-retry"];
  if (shouldRetryHeader === "true") return true;
  if (shouldRetryHeader === "false") return false;
  if (error instanceof APIConnectionError) {
    return true;
  }
  if (!error.status) return false;
  if (error.status === 408) return true;
  if (error.status === 409) return true;
  if (error.status === 429) return true;
  if (error.status && error.status >= 500) return true;
  return false;
}
async function withRetry(operation, options = {}) {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  let lastError;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (attempt > maxRetries || !(error instanceof APIError) || !shouldRetry(error)) {
        throw error;
      }
      const retryAfter = error.headers?.["retry-after"] ?? null;
      const delayMs = getRetryDelay(attempt, retryAfter);
      console.log(
        `  \u23BF  ${source_default.red(`API ${error.name} (${error.message}) \xB7 Retrying in ${Math.round(delayMs / 1e3)} seconds\u2026 (attempt ${attempt}/${maxRetries})`)}`
      );
      logEvent("tengu_api_retry", {
        attempt: String(attempt),
        delayMs: String(delayMs),
        error: error.message,
        status: String(error.status),
        provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
      });
      await new Promise((resolve16) => setTimeout(resolve16, delayMs));
    }
  }
  throw lastError;
}
async function verifyApiKey(apiKey) {
  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    maxRetries: 3,
    defaultHeaders: {
      "User-Agent": USER_AGENT
    }
  });
  try {
    await withRetry(
      async () => {
        const model2 = SMALL_FAST_MODEL;
        const messages = [{ role: "user", content: "test" }];
        await anthropic.messages.create({
          model: model2,
          max_tokens: 1,
          messages,
          temperature: 0,
          metadata: getMetadata()
        });
        return true;
      },
      { maxRetries: 2 }
      // Use fewer retries for API key verification
    );
    return true;
  } catch (error) {
    logError(error);
    if (error instanceof Error && error.message.includes(
      '{"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}'
    )) {
      return false;
    }
    throw error;
  }
}
async function handleMessageStream(stream) {
  const streamStartTime = Date.now();
  let ttftMs;
  for await (const part of stream) {
    if (part.type === "message_start") {
      ttftMs = Date.now() - streamStartTime;
    }
  }
  const finalResponse = await stream.finalMessage();
  return {
    ...finalResponse,
    ttftMs
  };
}
var anthropicClient = null;
function getAnthropicClient(model2) {
  if (anthropicClient) {
    return anthropicClient;
  }
  const region = getVertexRegionForModel(model2);
  const defaultHeaders = {
    "x-app": "cli",
    "User-Agent": USER_AGENT
  };
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    defaultHeaders["Authorization"] = `Bearer ${process.env.ANTHROPIC_AUTH_TOKEN}`;
  }
  const ARGS = {
    defaultHeaders,
    maxRetries: 0,
    // Disabled auto-retry in favor of manual implementation
    timeout: parseInt(process.env.API_TIMEOUT_MS || String(60 * 1e3), 10)
  };
  if (USE_BEDROCK) {
    const client2 = new AnthropicBedrock(ARGS);
    anthropicClient = client2;
    return client2;
  }
  if (USE_VERTEX) {
    const vertexArgs = {
      ...ARGS,
      region: region || process.env.CLOUD_ML_REGION || "us-east5"
    };
    const client2 = new AnthropicVertex(vertexArgs);
    anthropicClient = client2;
    return client2;
  }
  const apiKey = getAnthropicApiKey();
  if (process.env.USER_TYPE === "ant" && !apiKey) {
    console.error(
      source_default.red(
        "[ANT-ONLY] Please set the ANTHROPIC_API_KEY environment variable to use the CLI. To create a new key, go to https://console.anthropic.com/settings/keys."
      )
    );
  }
  anthropicClient = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    ...ARGS
  });
  return anthropicClient;
}
function resetAnthropicClient() {
  anthropicClient = null;
}
function userMessageToMessageParam(message, addCache = false) {
  if (addCache) {
    if (typeof message.message.content === "string") {
      return {
        role: "user",
        content: [
          {
            type: "text",
            text: message.message.content,
            ...PROMPT_CACHING_ENABLED ? { cache_control: { type: "ephemeral" } } : {}
          }
        ]
      };
    } else {
      return {
        role: "user",
        content: message.message.content.map((_, i) => ({
          ..._,
          ...i === message.message.content.length - 1 ? PROMPT_CACHING_ENABLED ? { cache_control: { type: "ephemeral" } } : {} : {}
        }))
      };
    }
  }
  return {
    role: "user",
    content: message.message.content
  };
}
function assistantMessageToMessageParam(message, addCache = false) {
  if (addCache) {
    if (typeof message.message.content === "string") {
      return {
        role: "assistant",
        content: [
          {
            type: "text",
            text: message.message.content,
            ...PROMPT_CACHING_ENABLED ? { cache_control: { type: "ephemeral" } } : {}
          }
        ]
      };
    } else {
      return {
        role: "assistant",
        content: message.message.content.map((_, i) => ({
          ..._,
          ...i === message.message.content.length - 1 && _.type !== "thinking" && _.type !== "redacted_thinking" ? PROMPT_CACHING_ENABLED ? { cache_control: { type: "ephemeral" } } : {} : {}
        }))
      };
    }
  }
  return {
    role: "assistant",
    content: message.message.content
  };
}
function splitSysPromptPrefix(systemPrompt) {
  const systemPromptFirstBlock = systemPrompt[0] || "";
  const systemPromptRest = systemPrompt.slice(1);
  return [systemPromptFirstBlock, systemPromptRest.join("\n")].filter(Boolean);
}
async function querySonnet(messages, systemPrompt, maxThinkingTokens, tools, signal, options) {
  return await withVCR(
    messages,
    () => querySonnetWithPromptCaching(
      messages,
      systemPrompt,
      maxThinkingTokens,
      tools,
      signal,
      options
    )
  );
}
function formatSystemPromptWithContext(systemPrompt, context) {
  if (Object.entries(context).length === 0) {
    return systemPrompt;
  }
  return [
    ...systemPrompt,
    `
As you answer the user's questions, you can use the following context:
`,
    ...Object.entries(context).map(
      ([key, value]) => `<context name="${key}">${value}</context>`
    )
  ];
}
async function querySonnetWithPromptCaching(messages, systemPrompt, maxThinkingTokens, tools, signal, options) {
  const anthropic = await getAnthropicClient(options.model);
  if (options.prependCLISysprompt) {
    const [firstSyspromptBlock] = splitSysPromptPrefix(systemPrompt);
    logEvent("tengu_sysprompt_block", {
      snippet: firstSyspromptBlock?.slice(0, 20),
      length: String(firstSyspromptBlock?.length ?? 0),
      hash: firstSyspromptBlock ? createHash2("sha256").update(firstSyspromptBlock).digest("hex") : ""
    });
    systemPrompt = [getCLISyspromptPrefix(), ...systemPrompt];
  }
  const system = splitSysPromptPrefix(systemPrompt).map(
    (_) => ({
      ...PROMPT_CACHING_ENABLED ? { cache_control: { type: "ephemeral" } } : {},
      text: _,
      type: "text"
    })
  );
  const toolSchemas = await Promise.all(
    tools.map(async (_) => ({
      name: _.name,
      description: await _.prompt({
        dangerouslySkipPermissions: options.dangerouslySkipPermissions
      }),
      // Use tool's JSON schema directly if provided, otherwise convert Zod schema
      input_schema: "inputJSONSchema" in _ && _.inputJSONSchema ? _.inputJSONSchema : zodToJsonSchema(_.inputSchema)
    }))
  );
  const betas = await getBetas();
  const useBetas = PROMPT_CACHING_ENABLED && betas.length > 0;
  logEvent("tengu_api_query", {
    model: options.model,
    messagesLength: String(
      JSON.stringify([...system, ...messages, ...toolSchemas]).length
    ),
    temperature: String(MAIN_QUERY_TEMPERATURE),
    provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p",
    ...useBetas ? { betas: betas.join(",") } : {}
  });
  const startIncludingRetries = Date.now();
  let start = Date.now();
  let attemptNumber = 0;
  let response;
  let stream = void 0;
  try {
    response = await withRetry(async (attempt) => {
      attemptNumber = attempt;
      start = Date.now();
      const s = anthropic.beta.messages.stream(
        {
          model: options.model,
          max_tokens: Math.max(
            maxThinkingTokens + 1,
            getMaxTokensForModel(options.model)
          ),
          messages: addCacheBreakpoints(messages),
          temperature: MAIN_QUERY_TEMPERATURE,
          system,
          tools: toolSchemas,
          ...useBetas ? { betas } : {},
          metadata: getMetadata(),
          ...process.env.USER_TYPE === "ant" && maxThinkingTokens > 0 ? {
            thinking: {
              budget_tokens: maxThinkingTokens,
              type: "enabled"
            }
          } : {}
        },
        { signal }
      );
      stream = s;
      return handleMessageStream(s);
    });
  } catch (error) {
    logError(error);
    logEvent("tengu_api_error", {
      model: options.model,
      error: error instanceof Error ? error.message : String(error),
      status: error instanceof APIError ? String(error.status) : void 0,
      messageCount: String(messages.length),
      messageTokens: String(countTokens(messages)),
      durationMs: String(Date.now() - start),
      durationMsIncludingRetries: String(Date.now() - startIncludingRetries),
      attempt: String(attemptNumber),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p",
      requestId: stream?.request_id ?? void 0
    });
    return getAssistantMessageFromError(error);
  }
  const durationMs = Date.now() - start;
  const durationMsIncludingRetries = Date.now() - startIncludingRetries;
  logEvent("tengu_api_success", {
    model: options.model,
    messageCount: String(messages.length),
    messageTokens: String(countTokens(messages)),
    inputTokens: String(response.usage.input_tokens),
    outputTokens: String(response.usage.output_tokens),
    cachedInputTokens: String(
      response.usage.cache_read_input_tokens ?? 0
    ),
    uncachedInputTokens: String(
      response.usage.cache_creation_input_tokens ?? 0
    ),
    durationMs: String(durationMs),
    durationMsIncludingRetries: String(durationMsIncludingRetries),
    attempt: String(attemptNumber),
    ttftMs: String(response.ttftMs),
    provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p",
    requestId: stream?.request_id ?? void 0,
    stop_reason: response.stop_reason ?? void 0
  });
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cacheReadInputTokens = response.usage.cache_read_input_tokens ?? 0;
  const cacheCreationInputTokens = response.usage.cache_creation_input_tokens ?? 0;
  const costUSD = inputTokens / 1e6 * SONNET_COST_PER_MILLION_INPUT_TOKENS + outputTokens / 1e6 * SONNET_COST_PER_MILLION_OUTPUT_TOKENS + cacheReadInputTokens / 1e6 * SONNET_COST_PER_MILLION_PROMPT_CACHE_READ_TOKENS + cacheCreationInputTokens / 1e6 * SONNET_COST_PER_MILLION_PROMPT_CACHE_WRITE_TOKENS;
  addToTotalCost(costUSD, durationMsIncludingRetries);
  const cachedTokens = (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0);
  addToTotalTokens(inputTokens, outputTokens, cachedTokens);
  return {
    message: {
      ...response,
      content: normalizeContentFromAPI(response.content),
      usage: {
        ...response.usage,
        cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
        cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0
      }
    },
    costUSD,
    durationMs,
    type: "assistant",
    uuid: randomUUID2()
  };
}
function getAssistantMessageFromError(error) {
  if (error instanceof Error && error.message.includes("prompt is too long")) {
    return createAssistantAPIErrorMessage(PROMPT_TOO_LONG_ERROR_MESSAGE);
  }
  if (error instanceof Error && error.message.includes("Your credit balance is too low")) {
    return createAssistantAPIErrorMessage(CREDIT_BALANCE_TOO_LOW_ERROR_MESSAGE);
  }
  if (error instanceof Error && error.message.toLowerCase().includes("x-api-key")) {
    return createAssistantAPIErrorMessage(INVALID_API_KEY_ERROR_MESSAGE);
  }
  if (error instanceof Error) {
    return createAssistantAPIErrorMessage(
      `${API_ERROR_MESSAGE_PREFIX}: ${error.message}`
    );
  }
  return createAssistantAPIErrorMessage(API_ERROR_MESSAGE_PREFIX);
}
function addCacheBreakpoints(messages) {
  return messages.map((msg, index) => {
    return msg.type === "user" ? userMessageToMessageParam(msg, index > messages.length - 3) : assistantMessageToMessageParam(msg, index > messages.length - 3);
  });
}
async function queryHaikuWithPromptCaching({
  systemPrompt,
  userPrompt,
  assistantPrompt,
  signal
}) {
  const anthropic = await getAnthropicClient(SMALL_FAST_MODEL);
  const model2 = SMALL_FAST_MODEL;
  const messages = [
    {
      role: "user",
      content: userPrompt
    },
    ...assistantPrompt ? [{ role: "assistant", content: assistantPrompt }] : []
  ];
  const system = splitSysPromptPrefix(systemPrompt).map(
    (_) => ({
      ...PROMPT_CACHING_ENABLED ? { cache_control: { type: "ephemeral" } } : {},
      text: _,
      type: "text"
    })
  );
  logEvent("tengu_api_query", {
    model: model2,
    messagesLength: String(JSON.stringify([...system, ...messages]).length),
    provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
  });
  let attemptNumber = 0;
  let start = Date.now();
  const startIncludingRetries = Date.now();
  let response;
  let stream = void 0;
  try {
    response = await withRetry(async (attempt) => {
      attemptNumber = attempt;
      start = Date.now();
      const s = anthropic.beta.messages.stream(
        {
          model: model2,
          max_tokens: 512,
          messages,
          system,
          temperature: 0,
          metadata: getMetadata(),
          stream: true
        },
        { signal }
      );
      stream = s;
      return await handleMessageStream(s);
    });
  } catch (error) {
    logError(error);
    logEvent("tengu_api_error", {
      error: error instanceof Error ? error.message : String(error),
      status: error instanceof APIError ? String(error.status) : void 0,
      model: SMALL_FAST_MODEL,
      messageCount: String(assistantPrompt ? 2 : 1),
      durationMs: String(Date.now() - start),
      durationMsIncludingRetries: String(Date.now() - startIncludingRetries),
      attempt: String(attemptNumber),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p",
      requestId: stream?.request_id ?? void 0
    });
    return getAssistantMessageFromError(error);
  }
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cacheReadInputTokens = response.usage.cache_read_input_tokens ?? 0;
  const cacheCreationInputTokens = response.usage.cache_creation_input_tokens ?? 0;
  const costUSD = inputTokens / 1e6 * HAIKU_COST_PER_MILLION_INPUT_TOKENS + outputTokens / 1e6 * HAIKU_COST_PER_MILLION_OUTPUT_TOKENS + cacheReadInputTokens / 1e6 * HAIKU_COST_PER_MILLION_PROMPT_CACHE_READ_TOKENS + cacheCreationInputTokens / 1e6 * HAIKU_COST_PER_MILLION_PROMPT_CACHE_WRITE_TOKENS;
  const durationMs = Date.now() - start;
  const durationMsIncludingRetries = Date.now() - startIncludingRetries;
  addToTotalCost(costUSD, durationMsIncludingRetries);
  const cachedTokens = (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0);
  addToTotalTokens(response.usage.input_tokens, response.usage.output_tokens, cachedTokens);
  const assistantMessage = {
    durationMs,
    message: {
      ...response,
      content: normalizeContentFromAPI(response.content)
    },
    costUSD,
    uuid: randomUUID2(),
    type: "assistant"
  };
  logEvent("tengu_api_success", {
    model: SMALL_FAST_MODEL,
    messageCount: String(assistantPrompt ? 2 : 1),
    inputTokens: String(inputTokens),
    outputTokens: String(response.usage.output_tokens),
    cachedInputTokens: String(response.usage.cache_read_input_tokens ?? 0),
    uncachedInputTokens: String(
      response.usage.cache_creation_input_tokens ?? 0
    ),
    durationMs: String(durationMs),
    durationMsIncludingRetries: String(durationMsIncludingRetries),
    ttftMs: String(response.ttftMs),
    provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p",
    requestId: stream?.request_id ?? void 0,
    stop_reason: response.stop_reason ?? void 0
  });
  return assistantMessage;
}
async function queryHaikuWithoutPromptCaching({
  systemPrompt,
  userPrompt,
  assistantPrompt,
  signal
}) {
  const anthropic = await getAnthropicClient(SMALL_FAST_MODEL);
  const model2 = SMALL_FAST_MODEL;
  const messages = [
    { role: "user", content: userPrompt },
    ...assistantPrompt ? [{ role: "assistant", content: assistantPrompt }] : []
  ];
  logEvent("tengu_api_query", {
    model: model2,
    messagesLength: String(
      JSON.stringify([{ systemPrompt }, ...messages]).length
    ),
    provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
  });
  let attemptNumber = 0;
  let start = Date.now();
  const startIncludingRetries = Date.now();
  let response;
  let stream = void 0;
  try {
    response = await withRetry(async (attempt) => {
      attemptNumber = attempt;
      start = Date.now();
      const s = anthropic.beta.messages.stream(
        {
          model: model2,
          max_tokens: 512,
          messages,
          system: splitSysPromptPrefix(systemPrompt).map((text) => ({
            type: "text",
            text
          })),
          temperature: 0,
          metadata: getMetadata(),
          stream: true
        },
        { signal }
      );
      stream = s;
      return await handleMessageStream(s);
    });
  } catch (error) {
    logError(error);
    logEvent("tengu_api_error", {
      error: error instanceof Error ? error.message : String(error),
      status: error instanceof APIError ? String(error.status) : void 0,
      model: SMALL_FAST_MODEL,
      messageCount: String(assistantPrompt ? 2 : 1),
      durationMs: String(Date.now() - start),
      durationMsIncludingRetries: String(Date.now() - startIncludingRetries),
      attempt: String(attemptNumber),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p",
      requestId: stream?.request_id ?? void 0
    });
    return getAssistantMessageFromError(error);
  }
  const durationMs = Date.now() - start;
  const durationMsIncludingRetries = Date.now() - startIncludingRetries;
  logEvent("tengu_api_success", {
    model: SMALL_FAST_MODEL,
    messageCount: String(assistantPrompt ? 2 : 1),
    inputTokens: String(response.usage.input_tokens),
    outputTokens: String(response.usage.output_tokens),
    durationMs: String(durationMs),
    durationMsIncludingRetries: String(durationMsIncludingRetries),
    attempt: String(attemptNumber),
    provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p",
    requestId: stream?.request_id ?? void 0,
    stop_reason: response.stop_reason ?? void 0
  });
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const costUSD = inputTokens / 1e6 * HAIKU_COST_PER_MILLION_INPUT_TOKENS + outputTokens / 1e6 * HAIKU_COST_PER_MILLION_OUTPUT_TOKENS;
  addToTotalCost(costUSD, durationMs);
  addToTotalTokens(inputTokens, outputTokens, 0);
  const assistantMessage = {
    durationMs,
    message: {
      ...response,
      content: normalizeContentFromAPI(response.content),
      usage: {
        ...response.usage,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 0
      }
    },
    costUSD,
    type: "assistant",
    uuid: randomUUID2()
  };
  return assistantMessage;
}
async function queryHaiku({
  systemPrompt = [],
  userPrompt,
  assistantPrompt,
  enablePromptCaching = false,
  signal
}) {
  return await withVCR(
    [
      {
        message: {
          role: "user",
          content: systemPrompt.map((text) => ({ type: "text", text }))
        },
        type: "user",
        uuid: randomUUID2()
      },
      {
        message: { role: "user", content: userPrompt },
        type: "user",
        uuid: randomUUID2()
      }
    ],
    () => {
      return enablePromptCaching ? queryHaikuWithPromptCaching({
        systemPrompt,
        userPrompt,
        assistantPrompt,
        signal
      }) : queryHaikuWithoutPromptCaching({
        systemPrompt,
        userPrompt,
        assistantPrompt,
        signal
      });
    }
  );
}
function getMaxTokensForModel(model2) {
  if (model2.includes("3-5")) {
    return 8192;
  }
  if (model2.includes("haiku")) {
    return 8192;
  }
  return 2e4;
}

// src/utils/browser.ts
init_execFileNoThrow();
async function openBrowser(url2) {
  const platform4 = process.platform;
  const command3 = platform4 === "win32" ? "start" : platform4 === "darwin" ? "open" : "xdg-open";
  try {
    const { code } = await execFileNoThrow(command3, [url2]);
    return code === 0;
  } catch (_) {
    return false;
  }
}

// src/hooks/useExitOnCtrlCD.ts
import { useInput as useInput3 } from "ink";
import { useState as useState3 } from "react";
function useExitOnCtrlCD(onExit) {
  const [exitState, setExitState] = useState3({
    pending: false,
    keyName: null
  });
  const handleCtrlC = useDoublePress(
    (pending) => setExitState({ pending, keyName: "Ctrl-C" }),
    onExit
  );
  const handleCtrlD = useDoublePress(
    (pending) => setExitState({ pending, keyName: "Ctrl-D" }),
    onExit
  );
  useInput3((input, key) => {
    if (key.ctrl && input === "c") handleCtrlC();
    if (key.ctrl && input === "d") handleCtrlD();
  });
  return exitState;
}

// src/components/Bug.tsx
var GITHUB_ISSUES_REPO_URL = "https://github.com/anthropics/claude-code/issues";
function Bug({ onDone }) {
  const [step, setStep] = useState4("userInput");
  const [cursorOffset, setCursorOffset] = useState4(0);
  const [description, setDescription] = useState4("");
  const [feedbackId, setFeedbackId] = useState4(null);
  const [error, setError] = useState4(null);
  const [envInfo, setEnvInfo] = useState4({ isGit: false, gitState: null });
  const [title, setTitle] = useState4(null);
  const textInputColumns = useTerminalSize().columns - 4;
  const messages = getMessagesGetter()();
  useEffect4(() => {
    async function loadEnvInfo() {
      const isGit = await getIsGit();
      let gitState = null;
      if (isGit) {
        gitState = await getGitState();
      }
      setEnvInfo({ isGit, gitState });
    }
    void loadEnvInfo();
  }, []);
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  const submitReport = useCallback(async () => {
    setStep("submitting");
    setError(null);
    setFeedbackId(null);
    const reportData = {
      message_count: messages.length,
      datetime: (/* @__PURE__ */ new Date()).toISOString(),
      description,
      platform: env2.platform,
      gitRepo: envInfo.isGit,
      terminal: env2.terminal,
      version: "0.2.8",
      transcript: messages,
      errors: getInMemoryErrors()
    };
    const [result, t] = await Promise.all([
      submitFeedback(reportData),
      generateTitle(description)
    ]);
    setTitle(t);
    if (result.success) {
      if (result.feedbackId) {
        setFeedbackId(result.feedbackId);
        logEvent("tengu_bug_report_submitted", {
          feedback_id: result.feedbackId
        });
      }
      setStep("done");
    } else {
      setError("Could not submit feedback. Please try again later.");
      setStep("userInput");
    }
  }, [description, envInfo.isGit, messages]);
  useInput4((input, key) => {
    if (step === "done") {
      if (key.return && feedbackId && title) {
        const issueUrl = createGitHubIssueUrl(feedbackId, title, description);
        void openBrowser(issueUrl);
      }
      onDone("<bash-stdout>Bug report submitted</bash-stdout>");
      return;
    }
    if (error) {
      onDone("<bash-stderr>Error submitting bug report</bash-stderr>");
      return;
    }
    if (key.escape) {
      onDone("<bash-stderr>Bug report cancelled</bash-stderr>");
      return;
    }
    if (step === "consent" && (key.return || input === " ")) {
      void submitReport();
    }
  });
  const theme = getTheme();
  return /* @__PURE__ */ React16.createElement(React16.Fragment, null, /* @__PURE__ */ React16.createElement(
    Box8,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: theme.permission,
      paddingX: 1,
      paddingBottom: 1,
      gap: 1
    },
    /* @__PURE__ */ React16.createElement(Text14, { bold: true, color: theme.permission }, "Submit Bug Report"),
    step === "userInput" && /* @__PURE__ */ React16.createElement(Box8, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React16.createElement(Text14, null, "Describe the issue below:"), /* @__PURE__ */ React16.createElement(
      TextInput,
      {
        value: description,
        onChange: setDescription,
        columns: textInputColumns,
        onSubmit: () => setStep("consent"),
        onExitMessage: () => onDone("<bash-stderr>Bug report cancelled</bash-stderr>"),
        cursorOffset,
        onChangeCursorOffset: setCursorOffset
      }
    ), error && /* @__PURE__ */ React16.createElement(Box8, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React16.createElement(Text14, { color: "red" }, error), /* @__PURE__ */ React16.createElement(Text14, { dimColor: true }, "Press any key to close"))),
    step === "consent" && /* @__PURE__ */ React16.createElement(Box8, { flexDirection: "column" }, /* @__PURE__ */ React16.createElement(Text14, null, "This report will include:"), /* @__PURE__ */ React16.createElement(Box8, { marginLeft: 2, flexDirection: "column" }, /* @__PURE__ */ React16.createElement(Text14, null, "- Your bug description: ", /* @__PURE__ */ React16.createElement(Text14, { dimColor: true }, description)), /* @__PURE__ */ React16.createElement(Text14, null, "- Environment info:", " ", /* @__PURE__ */ React16.createElement(Text14, { dimColor: true }, env2.platform, ", ", env2.terminal, ", v", "0.2.8")), envInfo.gitState && /* @__PURE__ */ React16.createElement(Text14, null, "- Git repo metadata:", " ", /* @__PURE__ */ React16.createElement(Text14, { dimColor: true }, envInfo.gitState.branchName, envInfo.gitState.commitHash ? `, ${envInfo.gitState.commitHash.slice(0, 7)}` : "", envInfo.gitState.remoteUrl ? ` @ ${envInfo.gitState.remoteUrl}` : "", !envInfo.gitState.isHeadOnRemote && ", not synced", !envInfo.gitState.isClean && ", has local changes")), /* @__PURE__ */ React16.createElement(Text14, null, "- Current session transcript")), /* @__PURE__ */ React16.createElement(Box8, { marginTop: 1 }, /* @__PURE__ */ React16.createElement(Text14, { wrap: "wrap", dimColor: true }, "We will use your feedback to debug related issues or to improve", " ", PRODUCT_NAME, "'s functionality (eg. to reduce the risk of bugs occurring in the future). Anthropic will not train generative models using feedback from ", PRODUCT_NAME, ".")), /* @__PURE__ */ React16.createElement(Box8, { marginTop: 1 }, /* @__PURE__ */ React16.createElement(Text14, null, "Press ", /* @__PURE__ */ React16.createElement(Text14, { bold: true }, "Enter"), " to confirm and submit."))),
    step === "submitting" && /* @__PURE__ */ React16.createElement(Box8, { flexDirection: "row", gap: 1 }, /* @__PURE__ */ React16.createElement(Text14, null, "Submitting report\u2026")),
    step === "done" && /* @__PURE__ */ React16.createElement(Box8, { flexDirection: "column" }, /* @__PURE__ */ React16.createElement(Text14, { color: getTheme().success }, "Thank you for your report!"), feedbackId && /* @__PURE__ */ React16.createElement(Text14, { dimColor: true }, "Feedback ID: ", feedbackId), /* @__PURE__ */ React16.createElement(Box8, { marginTop: 1 }, /* @__PURE__ */ React16.createElement(Text14, null, "Press "), /* @__PURE__ */ React16.createElement(Text14, { bold: true }, "Enter "), /* @__PURE__ */ React16.createElement(Text14, null, "to also create a GitHub issue, or any other key to close.")))
  ), /* @__PURE__ */ React16.createElement(Box8, { marginLeft: 3 }, /* @__PURE__ */ React16.createElement(Text14, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React16.createElement(React16.Fragment, null, "Press ", exitState.keyName, " again to exit") : step === "userInput" ? /* @__PURE__ */ React16.createElement(React16.Fragment, null, "Enter to continue \xB7 Esc to cancel") : step === "consent" ? /* @__PURE__ */ React16.createElement(React16.Fragment, null, "Enter to submit \xB7 Esc to cancel") : null)));
}
function createGitHubIssueUrl(feedbackId, title, description) {
  const body = encodeURIComponent(
    `**Bug Description**
${description}

**Environment Info**
- Platform: ${env2.platform}
- Terminal: ${env2.terminal}
- Version: ${"0.2.8"}
- Feedback ID: ${feedbackId}
`
  );
  return `${GITHUB_ISSUES_REPO_URL}/new?title=${encodeURIComponent(title)}&body=${body}&labels=user-reported,bug`;
}
async function generateTitle(description) {
  const response = await queryHaiku({
    systemPrompt: [
      'Generate a concise issue title (max 80 chars) that captures the key point of this feedback. Do not include quotes or prefixes like "Feedback:" or "Issue:". If you cannot generate a title, just use "User Feedback".'
    ],
    userPrompt: description
  });
  const title = response.message.content[0]?.type === "text" ? response.message.content[0].text : "Bug Report";
  if (title.startsWith(API_ERROR_MESSAGE_PREFIX)) {
    return `Bug Report: ${description.slice(0, 60)}${description.length > 60 ? "..." : ""}`;
  }
  return title;
}
async function submitFeedback(data) {
  try {
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return { success: false };
    }
    const response = await fetch(
      "https://api.anthropic.com/api/claude_cli_feedback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          content: JSON.stringify(data)
        })
      }
    );
    if (response.ok) {
      const result = await response.json();
      if (result?.feedback_id) {
        return { success: true, feedbackId: result.feedback_id };
      }
      logError("Failed to submit feedback: request did not return feedback_id");
      return { success: false };
    }
    logError("Failed to submit feedback:" + response.status);
    return { success: false };
  } catch (err) {
    logError(
      "Error submitting feedback: " + (err instanceof Error ? err.message : "Unknown error")
    );
    return { success: false };
  }
}

// src/commands/bug.tsx
import * as React17 from "react";
var bug = {
  type: "local-jsx",
  name: "bug",
  description: `Submit feedback about ${PRODUCT_NAME}`,
  isEnabled: true,
  isHidden: false,
  async call(onDone) {
    return /* @__PURE__ */ React17.createElement(Bug, { onDone });
  },
  userFacingName() {
    return "bug";
  }
};
var bug_default = bug;

// src/context.ts
init_config();
init_log();

// src/utils/style.ts
init_state();
import { existsSync as existsSync13, readFileSync as readFileSync11 } from "fs";
import { join as join10, parse as parse2, dirname as dirname4 } from "path";
import { memoize as memoize10 } from "lodash-es";
var STYLE_PROMPT = "The codebase follows strict style guidelines shown below. All code changes must strictly adhere to these guidelines to maintain consistency and quality.";
var getCodeStyle = memoize10(() => {
  const styles4 = [];
  let currentDir = getCwd();
  while (currentDir !== parse2(currentDir).root) {
    const stylePath = join10(currentDir, "CLAUDE.md");
    if (existsSync13(stylePath)) {
      styles4.push(
        `Contents of ${stylePath}:

${readFileSync11(stylePath, "utf-8")}`
      );
    }
    currentDir = dirname4(currentDir);
  }
  if (styles4.length === 0) {
    return "";
  }
  return `${STYLE_PROMPT}

${styles4.reverse().join("\n\n")}`;
});

// src/context.ts
init_state();
import { memoize as memoize11, omit } from "lodash-es";
init_git();
init_execFileNoThrow();
init_model();
import * as path5 from "path";
import { join as join12 } from "path";
import { readFile } from "fs/promises";
import { existsSync as existsSync14 } from "fs";

// src/utils/generators.ts
var NO_VALUE = Symbol("NO_VALUE");
async function lastX(as) {
  let lastValue = NO_VALUE;
  for await (const a of as) {
    lastValue = a;
  }
  if (lastValue === NO_VALUE) {
    throw new Error("No items in generator");
  }
  return lastValue;
}
async function* all(generators, concurrencyCap = Infinity) {
  const next = (generator) => {
    const promise = generator.next().then(({ done, value }) => ({
      done,
      value,
      generator,
      promise
    }));
    return promise;
  };
  const waiting = [...generators];
  const promises = /* @__PURE__ */ new Set();
  while (promises.size < concurrencyCap && waiting.length > 0) {
    const gen = waiting.shift();
    promises.add(next(gen));
  }
  while (promises.size > 0) {
    const { done, value, generator, promise } = await Promise.race(promises);
    promises.delete(promise);
    if (!done) {
      promises.add(next(generator));
      if (value !== void 0) {
        yield value;
      }
    } else if (waiting.length > 0) {
      const nextGen = waiting.shift();
      promises.add(next(nextGen));
    }
  }
}

// src/context.ts
init_user();
async function getClaudeFiles() {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 3e3);
  try {
    const files = await ripGrep(
      ["--files", "--glob", join12("**", "*", "CLAUDE.md")],
      getCwd(),
      abortController.signal
    );
    if (!files.length) {
      return null;
    }
    return `NOTE: Additional CLAUDE.md files were found. When working in these directories, make sure to read and follow the instructions in the corresponding CLAUDE.md file:
${files.map((_) => path5.join(getCwd(), _)).map((_) => `- ${_}`).join("\n")}`;
  } catch (error) {
    logError(error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
function setContext(key, value) {
  const projectConfig = getCurrentProjectConfig();
  const context = omit(
    { ...projectConfig.context, [key]: value },
    "codeStyle",
    "directoryStructure"
  );
  saveCurrentProjectConfig({ ...projectConfig, context });
}
function removeContext(key) {
  const projectConfig = getCurrentProjectConfig();
  const context = omit(
    projectConfig.context,
    key,
    "codeStyle",
    "directoryStructure"
  );
  saveCurrentProjectConfig({ ...projectConfig, context });
}
var getReadme = memoize11(async () => {
  try {
    const readmePath = join12(getCwd(), "README.md");
    if (!existsSync14(readmePath)) {
      return null;
    }
    const content = await readFile(readmePath, "utf-8");
    return content;
  } catch (e) {
    logError(e);
    return null;
  }
});
var getGitStatus = memoize11(async () => {
  if (false) {
    return null;
  }
  if (!await getIsGit()) {
    return null;
  }
  try {
    const [branch, mainBranch, status, log, authorLog] = await Promise.all([
      execFileNoThrow(
        "git",
        ["branch", "--show-current"],
        void 0,
        void 0,
        false
      ).then(({ stdout }) => stdout.trim()),
      execFileNoThrow(
        "git",
        ["rev-parse", "--abbrev-ref", "origin/HEAD"],
        void 0,
        void 0,
        false
      ).then(({ stdout }) => stdout.replace("origin/", "").trim()),
      execFileNoThrow(
        "git",
        ["status", "--short"],
        void 0,
        void 0,
        false
      ).then(({ stdout }) => stdout.trim()),
      execFileNoThrow(
        "git",
        ["log", "--oneline", "-n", "5"],
        void 0,
        void 0,
        false
      ).then(({ stdout }) => stdout.trim()),
      execFileNoThrow(
        "git",
        [
          "log",
          "--oneline",
          "-n",
          "5",
          "--author",
          await getGitEmail() || ""
        ],
        void 0,
        void 0,
        false
      ).then(({ stdout }) => stdout.trim())
    ]);
    const statusLines = status.split("\n").length;
    const truncatedStatus = statusLines > 200 ? status.split("\n").slice(0, 200).join("\n") + '\n... (truncated because there are more than 200 lines. If you need more information, run "git status" using BashTool)' : status;
    return `This is the git status at the start of the conversation. Note that this status is a snapshot in time, and will not update during the conversation.
Current branch: ${branch}

Main branch (you will usually use this for PRs): ${mainBranch}

Status:
${truncatedStatus || "(clean)"}

Recent commits:
${log}

Your recent commits:
${authorLog || "(no recent commits)"}`;
  } catch (error) {
    logError(error);
    return null;
  }
});
var getContext = memoize11(
  async () => {
    const codeStyle = getCodeStyle();
    const projectConfig = getCurrentProjectConfig();
    const dontCrawl = projectConfig.dontCrawlDirectory;
    const [gitStatus, directoryStructure, claudeFiles, readme] = await Promise.all([
      getGitStatus(),
      dontCrawl ? Promise.resolve("") : getDirectoryStructure(),
      dontCrawl ? Promise.resolve("") : getClaudeFiles(),
      getReadme()
    ]);
    return {
      ...projectConfig.context,
      ...directoryStructure ? { directoryStructure } : {},
      ...gitStatus ? { gitStatus } : {},
      ...codeStyle ? { codeStyle } : {},
      ...claudeFiles ? { claudeFiles } : {},
      ...readme ? { readme } : {}
    };
  }
);
var getDirectoryStructure = memoize11(
  async function() {
    let lines;
    try {
      const abortController = new AbortController();
      setTimeout(() => {
        abortController.abort();
      }, 1e3);
      const model2 = await getSlowAndCapableModel();
      const resultsGen = LSTool.call(
        {
          path: "."
        },
        {
          abortController,
          options: {
            commands: [],
            tools: [],
            slowAndCapableModel: model2,
            forkNumber: 0,
            messageLogName: "unused",
            maxThinkingTokens: 0
          },
          messageId: void 0,
          readFileTimestamps: {}
        }
      );
      const result = await lastX(resultsGen);
      lines = result.data;
    } catch (error) {
      logError(error);
      return "";
    }
    return `Below is a snapshot of this project's file structure at the start of the conversation. This snapshot will NOT update during the conversation.

${lines}`;
  }
);

// src/utils/terminal.ts
init_json();
init_log();
function setTerminalTitle(title) {
  if (process.platform === "win32") {
    process.title = title ? `\u2733 ${title}` : title;
  } else {
    process.stdout.write(`\x1B]0;${title ? `\u2733 ${title}` : ""}\x07`);
  }
}
async function updateTerminalTitle(message) {
  try {
    const result = await queryHaiku({
      systemPrompt: [
        "Analyze if this message indicates a new conversation topic. If it does, extract a 2-3 word title that captures the new topic. Format your response as a JSON object with two fields: 'isNewTopic' (boolean) and 'title' (string, or null if isNewTopic is false). Only include these fields, no other text."
      ],
      userPrompt: message,
      enablePromptCaching: true
    });
    const content = result.message.content.filter((_) => _.type === "text").map((_) => _.text).join("");
    const response = safeParseJSON(content);
    if (response && typeof response === "object" && "isNewTopic" in response && "title" in response) {
      if (response.isNewTopic && response.title) {
        setTerminalTitle(response.title);
      }
    }
  } catch (error) {
    logError(error);
  }
}
function clearTerminal() {
  return new Promise((resolve16) => {
    process.stdout.write("\x1B[2J\x1B[3J\x1B[H", () => {
      resolve16();
    });
  });
}

// src/commands/clear.ts
init_state();
async function clearConversation(context) {
  await clearTerminal();
  getMessagesSetter()([]);
  context.setForkConvoWithMessagesOnTheNextRender([]);
  getContext.cache.clear?.();
  getCodeStyle.cache.clear?.();
  await setCwd(getOriginalCwd());
}
var clear = {
  type: "local",
  name: "clear",
  description: "Clear conversation history and free up context",
  isEnabled: true,
  isHidden: false,
  async call(_, context) {
    clearConversation(context);
    return "";
  },
  userFacingName() {
    return "clear";
  }
};
var clear_default = clear;

// src/commands/compact.ts
var compact = {
  type: "local",
  name: "compact",
  description: "Clear conversation history but keep a summary in context",
  isEnabled: true,
  isHidden: false,
  async call(_, {
    options: { tools, slowAndCapableModel },
    abortController,
    setForkConvoWithMessagesOnTheNextRender
  }) {
    const messages = getMessagesGetter()();
    const summaryRequest = createUserMessage(
      "Provide a detailed but concise summary of our conversation above. Focus on information that would be helpful for continuing the conversation, including what we did, what we're doing, which files we're working on, and what we're going to do next."
    );
    const summaryResponse = await querySonnet(
      normalizeMessagesForAPI([...messages, summaryRequest]),
      ["You are a helpful AI assistant tasked with summarizing conversations."],
      0,
      tools,
      abortController.signal,
      {
        dangerouslySkipPermissions: false,
        model: slowAndCapableModel,
        prependCLISysprompt: true
      }
    );
    const content = summaryResponse.message.content;
    const summary = typeof content === "string" ? content : content.length > 0 && content[0]?.type === "text" ? content[0].text : null;
    if (!summary) {
      throw new Error(
        `Failed to generate conversation summary - response did not contain valid text content - ${summaryResponse}`
      );
    } else if (summary.startsWith(API_ERROR_MESSAGE_PREFIX)) {
      throw new Error(summary);
    }
    summaryResponse.message.usage = {
      input_tokens: 0,
      output_tokens: summaryResponse.message.usage.output_tokens,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0
    };
    await clearTerminal();
    getMessagesSetter()([]);
    setForkConvoWithMessagesOnTheNextRender([
      createUserMessage(
        `Use the /compact command to clear the conversation history, and start a new conversation with the summary in context.`
      ),
      summaryResponse
    ]);
    getContext.cache.clear?.();
    getCodeStyle.cache.clear?.();
    return "";
  },
  userFacingName() {
    return "compact";
  }
};
var compact_default = compact;

// src/components/Config.tsx
import { Box as Box9, Text as Text15, useInput as useInput5 } from "ink";
import * as React18 from "react";
import { useState as useState5 } from "react";
import figures from "figures";
init_config();
init_config();
init_source();
function Config({ onClose }) {
  const [globalConfig, setGlobalConfig] = useState5(getGlobalConfig());
  const initialConfig = React18.useRef(getGlobalConfig());
  const [selectedIndex, setSelectedIndex] = useState5(0);
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  const settings = [
    // Global settings
    ...process.env.ANTHROPIC_API_KEY ? [
      {
        id: "apiKey",
        label: `Use custom API key: ${source_default.bold(normalizeApiKeyForConfig(process.env.ANTHROPIC_API_KEY))}`,
        value: Boolean(
          process.env.ANTHROPIC_API_KEY && globalConfig.customApiKeyResponses?.approved?.includes(
            normalizeApiKeyForConfig(process.env.ANTHROPIC_API_KEY)
          )
        ),
        type: "boolean",
        onChange(useCustomKey) {
          const config3 = { ...getGlobalConfig() };
          if (!config3.customApiKeyResponses) {
            config3.customApiKeyResponses = {
              approved: [],
              rejected: []
            };
          }
          if (!config3.customApiKeyResponses.approved) {
            config3.customApiKeyResponses.approved = [];
          }
          if (!config3.customApiKeyResponses.rejected) {
            config3.customApiKeyResponses.rejected = [];
          }
          if (process.env.ANTHROPIC_API_KEY) {
            const truncatedKey = normalizeApiKeyForConfig(
              process.env.ANTHROPIC_API_KEY
            );
            if (useCustomKey) {
              config3.customApiKeyResponses.approved = [
                ...config3.customApiKeyResponses.approved.filter(
                  (k) => k !== truncatedKey
                ),
                truncatedKey
              ];
              config3.customApiKeyResponses.rejected = config3.customApiKeyResponses.rejected.filter(
                (k) => k !== truncatedKey
              );
            } else {
              config3.customApiKeyResponses.approved = config3.customApiKeyResponses.approved.filter(
                (k) => k !== truncatedKey
              );
              config3.customApiKeyResponses.rejected = [
                ...config3.customApiKeyResponses.rejected.filter(
                  (k) => k !== truncatedKey
                ),
                truncatedKey
              ];
            }
          }
          saveGlobalConfig(config3);
          setGlobalConfig(config3);
        }
      }
    ] : [],
    {
      id: "verbose",
      label: "Verbose output",
      value: globalConfig.verbose,
      type: "boolean",
      onChange(verbose) {
        const config3 = { ...getGlobalConfig(), verbose };
        saveGlobalConfig(config3);
        setGlobalConfig(config3);
      }
    },
    {
      id: "theme",
      label: "Theme",
      value: globalConfig.theme,
      options: ["light", "dark", "light-daltonized", "dark-daltonized"],
      type: "enum",
      onChange(theme) {
        const config3 = { ...getGlobalConfig(), theme };
        saveGlobalConfig(config3);
        setGlobalConfig(config3);
      }
    },
    {
      id: "notifChannel",
      label: "Notifications",
      value: globalConfig.preferredNotifChannel,
      options: [
        "iterm2",
        "terminal_bell",
        "iterm2_with_bell",
        "notifications_disabled"
      ],
      type: "enum",
      onChange(notifChannel) {
        const config3 = {
          ...getGlobalConfig(),
          preferredNotifChannel: notifChannel
        };
        saveGlobalConfig(config3);
        setGlobalConfig(config3);
      }
    }
  ];
  useInput5((input, key) => {
    if (key.escape) {
      const changes = [];
      const initialUsingCustomKey = Boolean(
        process.env.ANTHROPIC_API_KEY && initialConfig.current.customApiKeyResponses?.approved?.includes(
          normalizeApiKeyForConfig(process.env.ANTHROPIC_API_KEY)
        )
      );
      const currentUsingCustomKey = Boolean(
        process.env.ANTHROPIC_API_KEY && globalConfig.customApiKeyResponses?.approved?.includes(
          normalizeApiKeyForConfig(process.env.ANTHROPIC_API_KEY)
        )
      );
      if (initialUsingCustomKey !== currentUsingCustomKey) {
        changes.push(
          `  \u23BF  ${currentUsingCustomKey ? "Enabled" : "Disabled"} custom API key`
        );
      }
      if (globalConfig.verbose !== initialConfig.current.verbose) {
        changes.push(`  \u23BF  Set verbose to ${source_default.bold(globalConfig.verbose)}`);
      }
      if (globalConfig.theme !== initialConfig.current.theme) {
        changes.push(`  \u23BF  Set theme to ${source_default.bold(globalConfig.theme)}`);
      }
      if (globalConfig.preferredNotifChannel !== initialConfig.current.preferredNotifChannel) {
        changes.push(
          `  \u23BF  Set notifications to ${source_default.bold(globalConfig.preferredNotifChannel)}`
        );
      }
      if (changes.length > 0) {
        console.log(source_default.gray(changes.join("\n")));
      }
      onClose();
      return;
    }
    function toggleSetting() {
      const setting = settings[selectedIndex];
      if (!setting || !setting.onChange) {
        return;
      }
      if (setting.type === "boolean") {
        setting.onChange(!setting.value);
        return;
      }
      if (setting.type === "enum") {
        const currentIndex = setting.options.indexOf(setting.value);
        const nextIndex = (currentIndex + 1) % setting.options.length;
        setting.onChange(setting.options[nextIndex]);
        return;
      }
    }
    if (key.return || input === " ") {
      toggleSetting();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(settings.length - 1, prev + 1));
    }
  });
  return /* @__PURE__ */ React18.createElement(React18.Fragment, null, /* @__PURE__ */ React18.createElement(
    Box9,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: getTheme().secondaryBorder,
      paddingX: 1,
      marginTop: 1
    },
    /* @__PURE__ */ React18.createElement(Box9, { flexDirection: "column", minHeight: 2, marginBottom: 1 }, /* @__PURE__ */ React18.createElement(Text15, { bold: true }, "Settings"), /* @__PURE__ */ React18.createElement(Text15, { dimColor: true }, "Configure ", PRODUCT_NAME, " preferences")),
    settings.map((setting, i) => {
      const isSelected = i === selectedIndex;
      return /* @__PURE__ */ React18.createElement(Box9, { key: setting.id, height: 2, minHeight: 2 }, /* @__PURE__ */ React18.createElement(Box9, { width: 44 }, /* @__PURE__ */ React18.createElement(Text15, { color: isSelected ? "blue" : void 0 }, isSelected ? figures.pointer : " ", " ", setting.label)), /* @__PURE__ */ React18.createElement(Box9, null, setting.type === "boolean" ? /* @__PURE__ */ React18.createElement(Text15, { color: isSelected ? "blue" : void 0 }, setting.value.toString()) : /* @__PURE__ */ React18.createElement(Text15, { color: isSelected ? "blue" : void 0 }, setting.value.toString())));
    })
  ), /* @__PURE__ */ React18.createElement(Box9, { marginLeft: 3 }, /* @__PURE__ */ React18.createElement(Text15, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React18.createElement(React18.Fragment, null, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React18.createElement(React18.Fragment, null, "\u2191/\u2193 to select \xB7 Enter/Space to change \xB7 Esc to close"))));
}

// src/commands/config.tsx
import * as React19 from "react";
var config2 = {
  type: "local-jsx",
  name: "config",
  description: "Open config panel",
  isEnabled: true,
  isHidden: false,
  async call(onDone) {
    return /* @__PURE__ */ React19.createElement(Config, { onClose: onDone });
  },
  userFacingName() {
    return "config";
  }
};
var config_default = config2;

// src/commands/cost.ts
var cost = {
  type: "local",
  name: "cost",
  description: "Show the total cost and duration of the current session",
  isEnabled: true,
  isHidden: false,
  async call() {
    return formatTotalCost();
  },
  userFacingName() {
    return "cost";
  }
};
var cost_default = cost;

// src/commands/ctx_viz.ts
import Table from "cli-table3";
import { zodToJsonSchema as zodToJsonSchema2 } from "zod-to-json-schema";
var BYTES_PER_TOKEN = 4;
function getContextSections(text) {
  const sections = [];
  const firstContextIndex = text.indexOf("<context");
  if (firstContextIndex > 0) {
    const coreSysprompt = text.slice(0, firstContextIndex).trim();
    if (coreSysprompt) {
      sections.push({
        title: "Core Sysprompt",
        content: coreSysprompt
      });
    }
  }
  let currentPos = firstContextIndex;
  let nonContextContent = "";
  const regex2 = /<context\s+name="([^"]*)">([\s\S]*?)<\/context>/g;
  let match;
  while ((match = regex2.exec(text)) !== null) {
    if (match.index > currentPos) {
      nonContextContent += text.slice(currentPos, match.index);
    }
    const [, name = "Unnamed Section", content = ""] = match;
    sections.push({
      title: name === "codeStyle" ? "CodeStyle + CLAUDE.md's" : name,
      content: content.trim()
    });
    currentPos = match.index + match[0].length;
  }
  if (currentPos < text.length) {
    nonContextContent += text.slice(currentPos);
  }
  const trimmedNonContext = nonContextContent.trim();
  if (trimmedNonContext) {
    sections.push({
      title: "Non-contextualized Content",
      content: trimmedNonContext
    });
  }
  return sections;
}
function formatTokenCount(bytes) {
  const tokens = bytes / BYTES_PER_TOKEN;
  const k = tokens / 1e3;
  return `${Math.round(k * 10) / 10}k`;
}
function formatByteCount(bytes) {
  const kb = bytes / 1024;
  return `${Math.round(kb * 10) / 10}kb`;
}
function createSummaryTable(systemText, systemSections, tools, messages) {
  const table = new Table({
    head: ["Component", "Tokens", "Size", "% Used"],
    style: { head: ["bold"] },
    chars: {
      mid: "\u2500",
      "left-mid": "\u251C",
      "mid-mid": "\u253C",
      "right-mid": "\u2524"
    }
  });
  const messagesStr = JSON.stringify(messages);
  const toolsStr = JSON.stringify(tools);
  const total = systemText.length + toolsStr.length + messagesStr.length;
  const getPercentage = (n) => `${Math.round(n / total * 100)}%`;
  table.push([
    "System prompt",
    formatTokenCount(systemText.length),
    formatByteCount(systemText.length),
    getPercentage(systemText.length)
  ]);
  for (const section of systemSections) {
    table.push([
      `  ${section.title}`,
      formatTokenCount(section.content.length),
      formatByteCount(section.content.length),
      getPercentage(section.content.length)
    ]);
  }
  table.push([
    "Tool definitions",
    formatTokenCount(toolsStr.length),
    formatByteCount(toolsStr.length),
    getPercentage(toolsStr.length)
  ]);
  for (const tool of tools) {
    table.push([
      `  ${tool.name}`,
      formatTokenCount(tool.description.length),
      formatByteCount(tool.description.length),
      getPercentage(tool.description.length)
    ]);
  }
  table.push(
    [
      "Messages",
      formatTokenCount(messagesStr.length),
      formatByteCount(messagesStr.length),
      getPercentage(messagesStr.length)
    ],
    ["Total", formatTokenCount(total), formatByteCount(total), "100%"]
  );
  return table.toString();
}
var command = {
  name: "ctx-viz",
  description: "[ANT-ONLY] Show token usage breakdown for the current conversation context",
  isEnabled: process.env.USER_TYPE === "ant",
  isHidden: false,
  type: "local",
  userFacingName() {
    return this.name;
  },
  async call(_args, cmdContext) {
    const [systemPromptRaw, sysContext] = await Promise.all([
      getSystemPrompt(),
      getContext()
    ]);
    const rawTools = cmdContext.options.tools;
    let systemPrompt = systemPromptRaw.join("\n");
    for (const [name, content] of Object.entries(sysContext)) {
      systemPrompt += `
<context name="${name}">${content}</context>`;
    }
    const tools = rawTools.map((t) => {
      const fullPrompt = t.prompt({ dangerouslySkipPermissions: false });
      const schema = JSON.stringify(
        "inputJSONSchema" in t && t.inputJSONSchema ? t.inputJSONSchema : zodToJsonSchema2(t.inputSchema)
      );
      return {
        name: t.name,
        description: `${fullPrompt}

Schema:
${schema}`
      };
    });
    const messages = getMessagesGetter()();
    const sections = getContextSections(systemPrompt);
    return createSummaryTable(systemPrompt, sections, tools, messages);
  }
};
var ctx_viz_default = command;

// src/commands/doctor.ts
import React24 from "react";

// src/screens/Doctor.tsx
import React23, { useCallback as useCallback2, useEffect as useEffect6, useState as useState8 } from "react";
import { Box as Box12, Text as Text19, useInput as useInput6 } from "ink";
import { Select as Select3 } from "@inkjs/ui";

// src/screens/ConfigureNpmPrefix.tsx
import React21, { useState as useState7 } from "react";
import { Box as Box11, Text as Text17 } from "ink";
import { Select as Select2 } from "@inkjs/ui";

// src/components/Spinner.tsx
import { Box as Box10, Text as Text16 } from "ink";
import * as React20 from "react";
import { useEffect as useEffect5, useRef as useRef3, useState as useState6 } from "react";
import { sample } from "lodash-es";
var CHARACTERS = process.platform === "darwin" ? ["\xB7", "\u2722", "\u2733", "\u2217", "\u273B", "\u273D"] : ["\xB7", "\u2722", "*", "\u2217", "\u273B", "\u273D"];
var MESSAGES = [
  "Accomplishing",
  "Actioning",
  "Actualizing",
  "Baking",
  "Brewing",
  "Calculating",
  "Cerebrating",
  "Churning",
  "Clauding",
  "Coalescing",
  "Cogitating",
  "Computing",
  "Conjuring",
  "Considering",
  "Cooking",
  "Crafting",
  "Creating",
  "Crunching",
  "Deliberating",
  "Determining",
  "Doing",
  "Effecting",
  "Finagling",
  "Forging",
  "Forming",
  "Generating",
  "Hatching",
  "Herding",
  "Honking",
  "Hustling",
  "Ideating",
  "Inferring",
  "Manifesting",
  "Marinating",
  "Moseying",
  "Mulling",
  "Mustering",
  "Musing",
  "Noodling",
  "Percolating",
  "Pondering",
  "Processing",
  "Puttering",
  "Reticulating",
  "Ruminating",
  "Schlepping",
  "Shucking",
  "Simmering",
  "Smooshing",
  "Spinning",
  "Stewing",
  "Synthesizing",
  "Thinking",
  "Transmuting",
  "Vibing",
  "Working"
];
function Spinner() {
  const frames = [...CHARACTERS, ...[...CHARACTERS].reverse()];
  const [frame, setFrame] = useState6(0);
  const [elapsedTime, setElapsedTime] = useState6(0);
  const message = useRef3(sample(MESSAGES));
  const startTime = useRef3(Date.now());
  useEffect5(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 120);
    return () => clearInterval(timer);
  }, [frames.length]);
  useEffect5(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.current) / 1e3));
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  return /* @__PURE__ */ React20.createElement(Box10, { flexDirection: "row", marginTop: 1 }, /* @__PURE__ */ React20.createElement(Box10, { flexWrap: "nowrap", height: 1, width: 2 }, /* @__PURE__ */ React20.createElement(Text16, { color: getTheme().claude }, frames[frame])), /* @__PURE__ */ React20.createElement(Text16, { color: getTheme().claude }, message.current, "\u2026 "), /* @__PURE__ */ React20.createElement(Text16, { color: getTheme().secondaryText }, "(", elapsedTime, "s \xB7 ", /* @__PURE__ */ React20.createElement(Text16, { bold: true }, "esc"), " to interrupt)"));
}
function SimpleSpinner() {
  const frames = [...CHARACTERS, ...[...CHARACTERS].reverse()];
  const [frame, setFrame] = useState6(0);
  useEffect5(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 120);
    return () => clearInterval(timer);
  }, [frames.length]);
  return /* @__PURE__ */ React20.createElement(Box10, { flexWrap: "nowrap", height: 1, width: 2 }, /* @__PURE__ */ React20.createElement(Text16, { color: getTheme().claude }, frames[frame]));
}

// src/utils/autoUpdater.ts
init_execFileNoThrow();
init_log();
init_env();
init_statsig();
var import_semver2 = __toESM(require_semver2(), 1);
import { homedir as homedir7 } from "os";
import { join as join13 } from "path";
import {
  existsSync as existsSync15,
  mkdirSync as mkdirSync4,
  appendFileSync,
  readFileSync as readFileSync12,
  constants,
  writeFileSync as writeFileSync8,
  unlinkSync as unlinkSync3,
  statSync as statSync4
} from "fs";
import { platform as platform2 } from "process";
import { accessSync } from "fs";
async function assertMinVersion() {
  try {
    const versionConfig = await getDynamicConfig(
      "tengu_version_config",
      { minVersion: "0.0.0" }
    );
    if (versionConfig.minVersion && (0, import_semver2.lt)("0.2.8", versionConfig.minVersion)) {
      console.error(`
It looks like your version of Claude Code (${"0.2.8"}) needs an update.
A newer version (${versionConfig.minVersion} or higher) is required to continue.

To update, please run:
    claude update

This will ensure you have access to the latest features and improvements.
`);
      process.exit(1);
    }
  } catch (error) {
    logError(`Error checking minimum version: ${error}`);
  }
}
var LOCK_FILE_PATH = join13(CLAUDE_BASE_DIR, ".update.lock");
var LOCK_TIMEOUT_MS = 5 * 60 * 1e3;
function acquireLock() {
  try {
    if (!existsSync15(CLAUDE_BASE_DIR)) {
      mkdirSync4(CLAUDE_BASE_DIR, { recursive: true });
    }
    if (existsSync15(LOCK_FILE_PATH)) {
      const stats = statSync4(LOCK_FILE_PATH);
      const age = Date.now() - stats.mtimeMs;
      if (age < LOCK_TIMEOUT_MS) {
        return false;
      }
      try {
        unlinkSync3(LOCK_FILE_PATH);
      } catch (err) {
        logError(`Failed to remove stale lock file: ${err}`);
        return false;
      }
    }
    writeFileSync8(LOCK_FILE_PATH, `${process.pid}`, "utf8");
    return true;
  } catch (err) {
    logError(`Failed to acquire lock: ${err}`);
    return false;
  }
}
function releaseLock() {
  try {
    if (existsSync15(LOCK_FILE_PATH)) {
      const lockData = readFileSync12(LOCK_FILE_PATH, "utf8");
      if (lockData === `${process.pid}`) {
        unlinkSync3(LOCK_FILE_PATH);
      }
    }
  } catch (err) {
    logError(`Failed to release lock: ${err}`);
  }
}
async function checkNpmPermissions() {
  try {
    const prefixResult = await execFileNoThrow("npm", [
      "-g",
      "config",
      "get",
      "prefix"
    ]);
    if (prefixResult.code !== 0) {
      logError("Failed to check npm permissions");
      return { hasPermissions: false, npmPrefix: null };
    }
    const prefix = prefixResult.stdout.trim();
    let testWriteResult = false;
    try {
      accessSync(prefix, constants.W_OK);
      testWriteResult = true;
    } catch {
      testWriteResult = false;
    }
    if (testWriteResult) {
      return { hasPermissions: true, npmPrefix: prefix };
    }
    logError("Insufficient permissions for global npm install.");
    return { hasPermissions: false, npmPrefix: prefix };
  } catch (error) {
    logError(`Failed to verify npm global install permissions: ${error}`);
    return { hasPermissions: false, npmPrefix: null };
  }
}
async function setupNewPrefix(prefix) {
  if (!acquireLock()) {
    logEvent("tengu_auto_updater_prefix_lock_contention", {
      pid: String(process.pid),
      currentVersion: "0.2.8",
      prefix
    });
    throw new Error("Another process is currently setting up npm prefix");
  }
  try {
    if (!existsSync15(prefix)) {
      mkdirSync4(prefix, { recursive: true });
    }
    const setPrefix = await execFileNoThrow("npm", [
      "-g",
      "config",
      "set",
      "prefix",
      prefix
    ]);
    if (setPrefix.code !== 0) {
      throw new Error(`Failed to set npm prefix: ${setPrefix.stderr}`);
    }
    const pathUpdate = `
# npm global path
export PATH="${prefix}/bin:$PATH"
`;
    if (platform2 === "win32") {
      const setxResult = await execFileNoThrow("setx", [
        "PATH",
        `${process.env.PATH};${prefix}`
      ]);
      if (setxResult.code !== 0) {
        throw new Error(
          `Failed to update PATH on Windows: ${setxResult.stderr}`
        );
      }
    } else {
      const shellConfigs = [
        // Bash
        join13(homedir7(), ".bashrc"),
        join13(homedir7(), ".bash_profile"),
        // Zsh
        join13(homedir7(), ".zshrc"),
        // Fish
        join13(homedir7(), ".config", "fish", "config.fish")
      ];
      for (const config3 of shellConfigs) {
        if (existsSync15(config3)) {
          try {
            const content = readFileSync12(config3, "utf8");
            if (!content.includes(prefix)) {
              if (config3.includes("fish")) {
                const fishPath = `
# npm global path
set -gx PATH ${prefix}/bin $PATH
`;
                appendFileSync(config3, fishPath);
              } else {
                appendFileSync(config3, pathUpdate);
              }
              logEvent("npm_prefix_path_updated", {
                configPath: config3
              });
            }
          } catch (err) {
            logEvent("npm_prefix_path_update_failed", {
              configPath: config3,
              error: err instanceof Error ? err.message.slice(0, 200) : String(err).slice(0, 200)
            });
            logError(`Failed to update shell config ${config3}: ${err}`);
          }
        }
      }
    }
  } finally {
    releaseLock();
  }
}
function getDefaultNpmPrefix() {
  return join13(homedir7(), ".npm-global");
}
function getPermissionsCommand(npmPrefix) {
  const windowsCommand = `icacls "${npmPrefix}" /grant "%USERNAME%:(OI)(CI)F"`;
  const prefixPath = npmPrefix || "$(npm -g config get prefix)";
  const unixCommand = `sudo chown -R $USER:$(id -gn) ${prefixPath} && sudo chmod -R u+w ${prefixPath}`;
  return platform2 === "win32" ? windowsCommand : unixCommand;
}
async function getLatestVersion() {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), 5e3);
  const result = await execFileNoThrow(
    "npm",
    ["view", "claude-code", "version"],
    abortController.signal
  );
  if (result.code !== 0) {
    return null;
  }
  return result.stdout.trim();
}
async function installGlobalPackage() {
  if (!acquireLock()) {
    logError("Another process is currently installing an update");
    logEvent("tengu_auto_updater_lock_contention", {
      pid: String(process.pid),
      currentVersion: "0.2.8"
    });
    return "in_progress";
  }
  try {
    const { hasPermissions } = await checkNpmPermissions();
    if (!hasPermissions) {
      return "no_permissions";
    }
    const installResult = await execFileNoThrow("npm", [
      "install",
      "-g",
      "claude-code"
    ]);
    if (installResult.code !== 0) {
      logError(
        `Failed to install new version of claude: ${installResult.stdout} ${installResult.stderr}`
      );
      return "install_failed";
    }
    return "success";
  } finally {
    releaseLock();
  }
}

// src/screens/ConfigureNpmPrefix.tsx
init_log();
init_statsig();
function ConfigureNpmPrefix({
  customPrefix,
  onCustomPrefixChange,
  onSuccess,
  onCancel
}) {
  const [cursorOffset, setCursorOffset] = useState7(customPrefix.length);
  const [showConfirmation, setShowConfirmation] = useState7(false);
  const [isSettingUpPrefix, setIsSettingUpPrefix] = useState7(false);
  const [error, setError] = useState7(null);
  const [stepsStatus, setStepsStatus] = useState7({
    completeSteps: [false, false, false, false],
    inProgressStep: null
  });
  const textInputColumns = useTerminalSize().columns - 6;
  const theme = getTheme();
  async function handleSetupNewPrefix(prefix) {
    setIsSettingUpPrefix(true);
    setError(null);
    try {
      setStepsStatus({
        completeSteps: [false, false, false, false],
        inProgressStep: 0
      });
      await setupNewPrefix(prefix);
      setStepsStatus({
        completeSteps: [true, true, true, false],
        inProgressStep: 3
      });
      await installGlobalPackage();
      setStepsStatus({
        completeSteps: [true, true, true, true],
        inProgressStep: null
      });
      logEvent("tengu_auto_updater_config_complete", {
        finalStatus: "enabled",
        method: "prefix",
        success: "true"
      });
      onSuccess();
    } catch (err) {
      logError(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to setup npm prefix";
      setError(errorMessage);
      setIsSettingUpPrefix(false);
      logEvent("tengu_auto_updater_config_complete", {
        finalStatus: "not_configured",
        method: "prefix",
        success: "false",
        error: errorMessage
      });
    }
  }
  const installSteps = [
    {
      label: "Create new directory for npm global packages",
      command: `mkdir -p ${customPrefix}`
    },
    {
      label: "Configure npm to use new location",
      command: `npm -g config set prefix ${customPrefix}`
    },
    {
      label: "Update shell PATH configuration",
      command: `export PATH=${customPrefix}/bin:$PATH`
    },
    {
      label: `Reinstall ${PRODUCT_NAME} globally`,
      command: `npm install -g ${"claude-code"}`
    }
  ];
  return /* @__PURE__ */ React21.createElement(Box11, { marginLeft: 2, flexDirection: "column" }, /* @__PURE__ */ React21.createElement(Box11, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React21.createElement(Text17, null, "\u26A0\uFE0F Warning: This will modify your global npm configuration and can be dangerous. The following changes will be made:"), installSteps.map((step, index) => /* @__PURE__ */ React21.createElement(Box11, { key: index, flexDirection: "column" }, /* @__PURE__ */ React21.createElement(Box11, { flexDirection: "row" }, /* @__PURE__ */ React21.createElement(
    Text17,
    {
      color: stepsStatus.completeSteps[index] ? theme.success : void 0
    },
    isSettingUpPrefix ? stepsStatus.completeSteps[index] ? "\u2713" : " " : `${index + 1}.`
  ), /* @__PURE__ */ React21.createElement(Box11, { width: 2 }, stepsStatus.inProgressStep === index && /* @__PURE__ */ React21.createElement(SimpleSpinner, null)), /* @__PURE__ */ React21.createElement(
    Text17,
    {
      color: stepsStatus.completeSteps[index] ? theme.success : void 0
    },
    step.label
  )), step.command && /* @__PURE__ */ React21.createElement(Box11, { marginLeft: 2 }, /* @__PURE__ */ React21.createElement(Text17, { color: theme.suggestion, dimColor: true }, "$ ", step.command)))), /* @__PURE__ */ React21.createElement(Text17, { color: theme.suggestion }, "Note: You'll need to restart your terminal after this change"), /* @__PURE__ */ React21.createElement(Text17, { color: theme.warning }, "Important: Any existing global npm packages may need to be reinstalled")), !isSettingUpPrefix && /* @__PURE__ */ React21.createElement(Box11, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React21.createElement(Text17, null, "Enter prefix path:"), /* @__PURE__ */ React21.createElement(Box11, { flexDirection: "row", gap: 1 }, /* @__PURE__ */ React21.createElement(Text17, null, ">"), /* @__PURE__ */ React21.createElement(
    TextInput,
    {
      placeholder: customPrefix,
      value: customPrefix,
      onChange: onCustomPrefixChange,
      onSubmit: () => setShowConfirmation(true),
      columns: textInputColumns,
      cursorOffset,
      onChangeCursorOffset: setCursorOffset
    }
  )), showConfirmation && /* @__PURE__ */ React21.createElement(Box11, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React21.createElement(Text17, null, "Are you sure you want to continue with prefix: ", customPrefix, "?"), /* @__PURE__ */ React21.createElement(
    Select2,
    {
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" }
      ],
      onChange: (value) => {
        setShowConfirmation(false);
        if (value === "yes") {
          handleSetupNewPrefix(customPrefix);
        } else {
          onCancel();
        }
      }
    }
  ))), error && /* @__PURE__ */ React21.createElement(Text17, { color: theme.error }, "Error: ", error));
}

// src/screens/Doctor.tsx
import { platform as platform3 } from "process";
init_config();
init_statsig();

// src/components/PressEnterToContinue.tsx
import * as React22 from "react";
import { Text as Text18 } from "ink";
function PressEnterToContinue() {
  return /* @__PURE__ */ React22.createElement(Text18, { color: getTheme().permission }, "Press ", /* @__PURE__ */ React22.createElement(Text18, { bold: true }, "Enter"), " to continue\u2026");
}

// src/screens/Doctor.tsx
init_env();
function Doctor({ onDone, doctorMode = false }) {
  const [hasPermissions, setHasPermissions] = useState8(null);
  const [npmPrefix, setNpmPrefix] = useState8(null);
  const [selectedOption, setSelectedOption] = useState8(
    null
  );
  const [customPrefix, setCustomPrefix] = useState8(
    getDefaultNpmPrefix()
  );
  const theme = getTheme();
  const [showingPermissionsMessage, setShowingPermissionsMessage] = useState8(false);
  const options = [
    {
      label: `Manually fix permissions on current npm prefix (Recommended)`,
      value: "manual",
      description: platform3 === "win32" ? "Uses icacls to grant write permissions" : "Uses sudo to change ownership"
    },
    {
      label: "Create new npm prefix directory",
      value: "auto",
      description: "Creates a new directory for global npm packages in your home directory"
    },
    {
      label: "Skip configuration until next session",
      value: "ignore",
      description: "Skip this warning (you will be reminded again later)"
    }
  ];
  const checkPermissions = useCallback2(async () => {
    const result = await checkNpmPermissions();
    logEvent("tengu_auto_updater_permissions_check", {
      hasPermissions: result.hasPermissions.toString(),
      npmPrefix: result.npmPrefix ?? "null"
    });
    setHasPermissions(result.hasPermissions);
    if (result.npmPrefix) {
      setNpmPrefix(result.npmPrefix);
    }
    if (result.hasPermissions) {
      const config3 = getGlobalConfig();
      saveGlobalConfig({
        ...config3,
        autoUpdaterStatus: "enabled"
      });
      if (!doctorMode) {
        onDone();
      }
    }
  }, [onDone, doctorMode]);
  useEffect6(() => {
    logEvent("tengu_auto_updater_config_start", {});
    checkPermissions();
  }, [checkPermissions]);
  useInput6(
    (_input, key) => {
      if ((showingPermissionsMessage || doctorMode && hasPermissions === true) && key.return) {
        onDone();
      }
    },
    {
      isActive: showingPermissionsMessage || doctorMode && hasPermissions === true
    }
  );
  if (hasPermissions === null) {
    return /* @__PURE__ */ React23.createElement(Box12, { paddingX: 1, paddingTop: 1 }, /* @__PURE__ */ React23.createElement(Text19, { color: theme.secondaryText }, "Checking npm permissions\u2026"));
  }
  if (hasPermissions === true) {
    if (doctorMode) {
      const researchToolsInfo = getResearchToolsEnvInfo();
      return /* @__PURE__ */ React23.createElement(Box12, { flexDirection: "column", gap: 1, paddingX: 1, paddingTop: 1 }, /* @__PURE__ */ React23.createElement(Text19, { color: theme.success }, "\u2713 npm permissions: OK"), /* @__PURE__ */ React23.createElement(Text19, null, "Your installation is healthy and ready for auto-updates."), /* @__PURE__ */ React23.createElement(Text19, { bold: true }, "Research Tools Environment:"), /* @__PURE__ */ React23.createElement(Box12, { flexDirection: "column", marginLeft: 2 }, /* @__PURE__ */ React23.createElement(Box12, null, /* @__PURE__ */ React23.createElement(Text19, null, "Lotus API Key: "), /* @__PURE__ */ React23.createElement(Text19, { color: researchToolsInfo.lotus.apiKeyAvailable ? theme.success : theme.suggestion }, researchToolsInfo.lotus.apiKeyAvailable ? "Available" : "Not configured", /* @__PURE__ */ React23.createElement(Text19, { color: theme.secondaryText }, " (", researchToolsInfo.lotus.apiKeySource, ")"))), /* @__PURE__ */ React23.createElement(Box12, null, /* @__PURE__ */ React23.createElement(Text19, null, "DocETL API Key: "), /* @__PURE__ */ React23.createElement(Text19, { color: researchToolsInfo.docETL.apiKeyAvailable ? theme.success : theme.suggestion }, researchToolsInfo.docETL.apiKeyAvailable ? "Available" : "Not configured", /* @__PURE__ */ React23.createElement(Text19, { color: theme.secondaryText }, " (", researchToolsInfo.docETL.apiKeySource, ")"))), /* @__PURE__ */ React23.createElement(Box12, null, /* @__PURE__ */ React23.createElement(Text19, null, "DocETL Model: "), /* @__PURE__ */ React23.createElement(Text19, { color: theme.success }, researchToolsInfo.docETL.model)), /* @__PURE__ */ React23.createElement(Box12, null, /* @__PURE__ */ React23.createElement(Text19, null, "Debug Mode: "), /* @__PURE__ */ React23.createElement(Text19, { color: researchToolsInfo.debug ? theme.warning : theme.secondaryText }, researchToolsInfo.debug ? "Enabled" : "Disabled"))), /* @__PURE__ */ React23.createElement(PressEnterToContinue, null));
    }
    return /* @__PURE__ */ React23.createElement(Box12, { paddingX: 1, paddingTop: 1 }, /* @__PURE__ */ React23.createElement(Text19, { color: theme.success }, "\u2713 Auto-updates enabled"));
  }
  return /* @__PURE__ */ React23.createElement(
    Box12,
    {
      borderColor: theme.permission,
      borderStyle: "round",
      flexDirection: "column",
      gap: 1,
      paddingX: 1,
      paddingTop: 1
    },
    /* @__PURE__ */ React23.createElement(Text19, { bold: true, color: theme.permission }, "Enable automatic updates?"),
    /* @__PURE__ */ React23.createElement(Text19, null, PRODUCT_NAME, " can't update itself because it doesn't have permissions. Do you want to fix this to get automatic updates?"),
    /* @__PURE__ */ React23.createElement(Box12, { flexDirection: "column" }, !selectedOption && /* @__PURE__ */ React23.createElement(Box12, { marginLeft: 2 }, /* @__PURE__ */ React23.createElement(Text19, null, "Select an option below to fix the permissions issue:"), /* @__PURE__ */ React23.createElement(
      Select3,
      {
        options,
        onChange: (value) => {
          if (value !== "auto" && value !== "manual" && value !== "ignore")
            return;
          setSelectedOption(value);
          logEvent("tengu_auto_updater_config_option_selected", {
            option: value,
            npmPrefix: npmPrefix ?? "null"
          });
          if (value === "manual") {
            const config3 = getGlobalConfig();
            saveGlobalConfig({
              ...config3,
              autoUpdaterStatus: "not_configured"
            });
            setShowingPermissionsMessage(true);
          } else if (value === "ignore") {
            const config3 = getGlobalConfig();
            saveGlobalConfig({
              ...config3,
              autoUpdaterStatus: "not_configured"
            });
            onDone();
          }
        }
      }
    )), selectedOption === "auto" && /* @__PURE__ */ React23.createElement(Box12, { marginLeft: 2 }, /* @__PURE__ */ React23.createElement(
      ConfigureNpmPrefix,
      {
        customPrefix,
        onCustomPrefixChange: setCustomPrefix,
        onSuccess: checkPermissions,
        onCancel: onDone
      }
    )), selectedOption === "manual" && /* @__PURE__ */ React23.createElement(React23.Fragment, null, /* @__PURE__ */ React23.createElement(Box12, { marginLeft: 4, flexDirection: "column" }, /* @__PURE__ */ React23.createElement(Text19, null, "Run this command in your terminal:"), /* @__PURE__ */ React23.createElement(Box12, { flexDirection: "row", gap: 1 }, /* @__PURE__ */ React23.createElement(Text19, { color: theme.warning }, getPermissionsCommand(npmPrefix ?? ""))), /* @__PURE__ */ React23.createElement(Box12, { flexDirection: "row", gap: 1 }, /* @__PURE__ */ React23.createElement(Text19, { color: theme.suggestion }, "After running the command, restart ", PRODUCT_NAME))), /* @__PURE__ */ React23.createElement(PressEnterToContinue, null)))
  );
}

// src/commands/doctor.ts
var doctor = {
  name: "doctor",
  description: "Checks the health of your Claude Code installation",
  isEnabled: true,
  isHidden: false,
  userFacingName() {
    return "doctor";
  },
  type: "local-jsx",
  call(onDone) {
    const element = React24.createElement(Doctor, {
      onDone,
      doctorMode: true
    });
    return Promise.resolve(element);
  }
};
var doctor_default = doctor;

// src/commands/experimental_resume.tsx
import * as React25 from "react";
import { Box as Box13, Text as Text20 } from "ink";
import { render } from "ink";
var experimental_resume_default = {
  type: "local-jsx",
  name: "experimental-resume",
  description: "[ANT-ONLY] Enhanced resume with experimental checkpoint features",
  isEnabled: process.env.USER_TYPE === "ant",
  isHidden: process.env.USER_TYPE !== "ant",
  userFacingName() {
    return "experimental-resume";
  },
  async call(onDone) {
    render(
      /* @__PURE__ */ React25.createElement(Box13, { flexDirection: "column", padding: 1 }, /* @__PURE__ */ React25.createElement(Text20, { bold: true }, "\u{1F9EA} Experimental Checkpoint Mode"), /* @__PURE__ */ React25.createElement(Text20, null, "Enhanced conversation resumption with advanced features:"), /* @__PURE__ */ React25.createElement(Box13, { marginLeft: 2, flexDirection: "column" }, /* @__PURE__ */ React25.createElement(Text20, null, "\u2022 Access to development snapshots"), /* @__PURE__ */ React25.createElement(Text20, null, "\u2022 Conversation branches and merging"), /* @__PURE__ */ React25.createElement(Text20, null, "\u2022 Deep context recovery"), /* @__PURE__ */ React25.createElement(Text20, null, "\u2022 State preservation across sessions")), /* @__PURE__ */ React25.createElement(Box13, { marginTop: 1 }, /* @__PURE__ */ React25.createElement(Text20, null, "Note: This feature is under active development.")), /* @__PURE__ */ React25.createElement(Box13, { marginTop: 2 }, /* @__PURE__ */ React25.createElement(Text20, null, "Press Enter to continue...")))
    );
    setTimeout(() => {
      onDone("Experimental resume feature activated");
    }, 2e3);
    return null;
  }
};

// src/components/Help.tsx
import * as React26 from "react";
import { Box as Box14, Text as Text21, useInput as useInput7 } from "ink";
function Help({
  commands,
  onClose
}) {
  const theme = getTheme();
  const isInternal = process.env.USER_TYPE === "ant";
  const moreHelp = isInternal ? "[ANT-ONLY] For more help: go/claude-cli or #claude-cli-feedback" : `Learn more at: ${MACRO.README_URL}`;
  const filteredCommands = commands.filter((cmd) => !cmd.isHidden);
  const [count, setCount] = React26.useState(0);
  React26.useEffect(() => {
    const timer = setTimeout(() => {
      if (count < 3) {
        setCount(count + 1);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [count]);
  useInput7((_, key) => {
    if (key.return) onClose();
  });
  return /* @__PURE__ */ React26.createElement(Box14, { flexDirection: "column", padding: 1 }, /* @__PURE__ */ React26.createElement(Text21, { bold: true, color: theme.claude }, `${PRODUCT_NAME} v${"0.2.8"}`), /* @__PURE__ */ React26.createElement(Box14, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React26.createElement(Text21, null, PRODUCT_NAME, " is a beta research preview. Always review Claude's responses, especially when running code. Claude has read access to files in the current directory and can run commands and edit files with your permission.")), count >= 1 && /* @__PURE__ */ React26.createElement(Box14, { flexDirection: "column", marginTop: 1 }, /* @__PURE__ */ React26.createElement(Text21, { bold: true }, "Usage Modes:"), /* @__PURE__ */ React26.createElement(Text21, null, "\u2022 REPL: ", /* @__PURE__ */ React26.createElement(Text21, { bold: true }, "claude"), " (interactive session)"), /* @__PURE__ */ React26.createElement(Text21, null, "\u2022 Non-interactive: ", /* @__PURE__ */ React26.createElement(Text21, { bold: true }, 'claude -p "question"')), /* @__PURE__ */ React26.createElement(Box14, { marginTop: 1 }, /* @__PURE__ */ React26.createElement(Text21, null, "Run ", /* @__PURE__ */ React26.createElement(Text21, { bold: true }, "claude -h"), " for all command line options"))), count >= 2 && /* @__PURE__ */ React26.createElement(Box14, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React26.createElement(Text21, { bold: true }, "Common Tasks:"), /* @__PURE__ */ React26.createElement(Text21, null, "\u2022 Ask questions about your codebase", " ", /* @__PURE__ */ React26.createElement(Text21, { color: getTheme().secondaryText }, "> How does foo.py work?")), /* @__PURE__ */ React26.createElement(Text21, null, "\u2022 Edit files", " ", /* @__PURE__ */ React26.createElement(Text21, { color: getTheme().secondaryText }, "> Update bar.ts to...")), /* @__PURE__ */ React26.createElement(Text21, null, "\u2022 Fix errors", " ", /* @__PURE__ */ React26.createElement(Text21, { color: getTheme().secondaryText }, "> cargo build")), /* @__PURE__ */ React26.createElement(Text21, null, "\u2022 Run commands", " ", /* @__PURE__ */ React26.createElement(Text21, { color: getTheme().secondaryText }, "> /help")), /* @__PURE__ */ React26.createElement(Text21, null, "\u2022 Run bash commands", " ", /* @__PURE__ */ React26.createElement(Text21, { color: getTheme().secondaryText }, "> !ls"))), count >= 3 && /* @__PURE__ */ React26.createElement(Box14, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React26.createElement(Text21, { bold: true }, "Interactive Mode Commands:"), /* @__PURE__ */ React26.createElement(Box14, { flexDirection: "column" }, filteredCommands.map((cmd, i) => /* @__PURE__ */ React26.createElement(Box14, { key: i, marginLeft: 1 }, /* @__PURE__ */ React26.createElement(Text21, { bold: true }, `/${cmd.name}`), /* @__PURE__ */ React26.createElement(Text21, null, " - ", cmd.description))))), /* @__PURE__ */ React26.createElement(Box14, { marginTop: 1 }, /* @__PURE__ */ React26.createElement(Text21, { color: theme.secondaryText }, moreHelp)), /* @__PURE__ */ React26.createElement(Box14, { marginTop: 2 }, /* @__PURE__ */ React26.createElement(PressEnterToContinue, null)));
}

// src/commands/help.tsx
import * as React27 from "react";
var help = {
  type: "local-jsx",
  name: "help",
  description: "Show help and available commands",
  isEnabled: true,
  isHidden: false,
  async call(onDone, { options: { commands } }) {
    return /* @__PURE__ */ React27.createElement(Help, { commands, onClose: onDone });
  },
  userFacingName() {
    return "help";
  }
};
var help_default = help;

// src/commands/init.ts
var command2 = {
  type: "prompt",
  name: "init",
  description: "Initialize a new CLAUDE.md file with codebase documentation",
  isEnabled: true,
  isHidden: false,
  progressMessage: "analyzing your codebase",
  userFacingName() {
    return "init";
  },
  async getPromptForCommand(_args) {
    markProjectOnboardingComplete();
    return [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please analyze this codebase and create a CLAUDE.md file containing:
1. Build/lint/test commands - especially for running a single test
2. Code style guidelines including imports, formatting, types, naming conventions, error handling, etc.

The file you create will be given to agentic coding agents (such as yourself) that operate in this repository. Make it about 20 lines long.
If there's already a CLAUDE.md, improve it.
If there are Cursor rules (in .cursor/rules/ or .cursorrules) or Copilot rules (in .github/copilot-instructions.md), make sure to include them.`
          }
        ]
      }
    ];
  }
};
var init_default = command2;

// src/commands/listen.ts
init_log();
init_execFileNoThrow();
var isEnabled = process.platform === "darwin" && ["iTerm.app", "Apple_Terminal"].includes(process.env.TERM_PROGRAM || "");
var listen = {
  type: "local",
  name: "listen",
  description: "Activates speech recognition and transcribes speech to text",
  isEnabled,
  isHidden: isEnabled,
  userFacingName() {
    return "listen";
  },
  async call(_, { abortController }) {
    const script = `tell application "System Events" to tell \xAC
(the first process whose frontmost is true) to tell \xAC
menu bar 1 to tell \xAC
menu bar item "Edit" to tell \xAC
menu "Edit" to tell \xAC
menu item "Start Dictation" to \xAC
if exists then click it`;
    const { stderr, code } = await execFileNoThrow(
      "osascript",
      ["-e", script],
      abortController.signal
    );
    if (code !== 0) {
      logError(`Failed to start dictation: ${stderr}`);
      return "Failed to start dictation";
    }
    return "Dictation started. Press esc to stop.";
  }
};
var listen_default = listen;

// src/commands/login.tsx
import * as React33 from "react";

// src/components/ConsoleOAuthFlow.tsx
import React32, { useEffect as useEffect8, useState as useState11, useCallback as useCallback3 } from "react";
import { Static, Box as Box19, Text as Text26, useInput as useInput9 } from "ink";

// src/services/oauth.ts
import * as crypto from "crypto";
import * as http from "http";
import * as url from "url";

// src/constants/oauth.ts
var BASE_CONFIG = {
  REDIRECT_PORT: 54545,
  MANUAL_REDIRECT_URL: "/oauth/code/callback",
  SCOPES: ["org:create_api_key", "user:profile"]
};
var PROD_OAUTH_CONFIG = {
  ...BASE_CONFIG,
  AUTHORIZE_URL: "https://console.anthropic.com/oauth/authorize",
  TOKEN_URL: "https://console.anthropic.com/v1/oauth/token",
  API_KEY_URL: "https://api.anthropic.com/api/oauth/claude_cli/create_api_key",
  SUCCESS_URL: "https://console.anthropic.com/buy_credits?returnUrl=/oauth/code/success",
  CLIENT_ID: "9d1c250a-e61b-44d9-88ed-5944d1962f5e"
};
var STAGING_OAUTH_CONFIG = process.env.USER_TYPE === "ant" && process.env.USE_STAGING_OAUTH === "1" ? {
  ...BASE_CONFIG,
  AUTHORIZE_URL: "https://console.staging.ant.dev/oauth/authorize",
  TOKEN_URL: "https://console.staging.ant.dev/v1/oauth/token",
  API_KEY_URL: "https://api-staging.anthropic.com/api/oauth/claude_cli/create_api_key",
  SUCCESS_URL: "https://console.staging.ant.dev/buy_credits?returnUrl=/oauth/code/success",
  CLIENT_ID: "22422756-60c9-4084-8eb7-27705fd5cf9a"
} : void 0;
var TEST_OAUTH_CONFIG = false ? {
  ...BASE_CONFIG,
  AUTHORIZE_URL: "http://localhost:3456/oauth/authorize",
  TOKEN_URL: "http://localhost:3456/oauth/token",
  API_KEY_URL: "",
  SUCCESS_URL: "http://localhost:3456/buy_credits?returnUrl=/oauth/code/success",
  REDIRECT_PORT: 7777,
  CLIENT_ID: "9d1c250a-e61b-44d9-88ed-5944d1962f5e"
} : void 0;
var OAUTH_CONFIG = process.env.USER_TYPE === "ant" && process.env.USE_STAGING_OAUTH === "1" && STAGING_OAUTH_CONFIG || PROD_OAUTH_CONFIG;

// src/services/oauth.ts
init_statsig();
init_log();
init_config();
function base64URLEncode(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(Buffer.from(digest));
}
var OAuthService = class {
  constructor() {
    this.server = null;
    this.expectedState = null;
    this.pendingCodePromise = null;
    this.codeVerifier = generateCodeVerifier();
  }
  generateAuthUrls(codeChallenge, state2) {
    function makeUrl(isManual) {
      const authUrl = new URL(OAUTH_CONFIG.AUTHORIZE_URL);
      authUrl.searchParams.append("client_id", OAUTH_CONFIG.CLIENT_ID);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append(
        "redirect_uri",
        isManual ? OAUTH_CONFIG.MANUAL_REDIRECT_URL : `http://localhost:${OAUTH_CONFIG.REDIRECT_PORT}/callback`
      );
      authUrl.searchParams.append("scope", OAUTH_CONFIG.SCOPES.join(" "));
      authUrl.searchParams.append("code_challenge", codeChallenge);
      authUrl.searchParams.append("code_challenge_method", "S256");
      authUrl.searchParams.append("state", state2);
      return authUrl.toString();
    }
    return {
      autoUrl: makeUrl(false),
      manualUrl: makeUrl(true)
    };
  }
  async startOAuthFlow(authURLHandler) {
    const codeChallenge = await generateCodeChallenge(this.codeVerifier);
    const state2 = base64URLEncode(crypto.randomBytes(32));
    this.expectedState = state2;
    const { autoUrl, manualUrl } = this.generateAuthUrls(codeChallenge, state2);
    const onReady = async () => {
      await authURLHandler(manualUrl);
      await openBrowser(autoUrl);
    };
    const { authorizationCode, useManualRedirect } = await new Promise((resolve16, reject) => {
      this.pendingCodePromise = { resolve: resolve16, reject };
      this.startLocalServer(state2, onReady);
    });
    const {
      access_token: accessToken,
      account,
      organization
    } = await this.exchangeCodeForTokens(
      authorizationCode,
      state2,
      useManualRedirect
    );
    if (account) {
      const accountInfo = {
        accountUuid: account.uuid,
        emailAddress: account.email_address,
        organizationUuid: organization?.uuid
      };
      const config3 = getGlobalConfig();
      config3.oauthAccount = accountInfo;
      saveGlobalConfig(config3);
    }
    return { accessToken };
  }
  startLocalServer(state2, onReady) {
    if (this.server) {
      this.closeServer();
    }
    this.server = http.createServer(
      (req, res) => {
        const parsedUrl = url.parse(req.url || "", true);
        if (parsedUrl.pathname === "/callback") {
          const authorizationCode = parsedUrl.query.code;
          const returnedState = parsedUrl.query.state;
          if (!authorizationCode) {
            res.writeHead(400);
            res.end("Authorization code not found");
            if (this.pendingCodePromise) {
              this.pendingCodePromise.reject(
                new Error("No authorization code received")
              );
            }
            return;
          }
          if (returnedState !== state2) {
            res.writeHead(400);
            res.end("Invalid state parameter");
            if (this.pendingCodePromise) {
              this.pendingCodePromise.reject(
                new Error("Invalid state parameter")
                // Possible CSRF attack
              );
            }
            return;
          }
          res.writeHead(302, {
            Location: OAUTH_CONFIG.SUCCESS_URL
          });
          res.end();
          logEvent("tengu_oauth_automatic_redirect", {});
          this.processCallback({
            authorizationCode,
            state: state2,
            useManualRedirect: false
          });
        } else {
          res.writeHead(404);
          res.end();
        }
      }
    );
    this.server.listen(OAUTH_CONFIG.REDIRECT_PORT, async () => {
      onReady?.();
    });
    this.server.on("error", (err) => {
      const portError = err;
      if (portError.code === "EADDRINUSE") {
        const error = new Error(
          `Port ${OAUTH_CONFIG.REDIRECT_PORT} is already in use. Please ensure no other applications are using this port.`
        );
        logError(error);
        this.closeServer();
        if (this.pendingCodePromise) {
          this.pendingCodePromise.reject(error);
        }
        return;
      } else {
        logError(err);
        this.closeServer();
        if (this.pendingCodePromise) {
          this.pendingCodePromise.reject(err);
        }
        return;
      }
    });
  }
  async exchangeCodeForTokens(authorizationCode, state2, useManualRedirect = false) {
    const requestBody = {
      grant_type: "authorization_code",
      code: authorizationCode,
      redirect_uri: useManualRedirect ? OAUTH_CONFIG.MANUAL_REDIRECT_URL : `http://localhost:${OAUTH_CONFIG.REDIRECT_PORT}/callback`,
      client_id: OAUTH_CONFIG.CLIENT_ID,
      code_verifier: this.codeVerifier,
      state: state2
    };
    const response = await fetch(OAUTH_CONFIG.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  }
  processCallback({
    authorizationCode,
    state: state2,
    useManualRedirect
  }) {
    this.closeServer();
    if (state2 !== this.expectedState) {
      if (this.pendingCodePromise) {
        this.pendingCodePromise.reject(
          new Error("Invalid state parameter")
          // Possible CSRF attack
        );
        this.pendingCodePromise = null;
      }
      return;
    }
    if (this.pendingCodePromise) {
      this.pendingCodePromise.resolve({ authorizationCode, useManualRedirect });
      this.pendingCodePromise = null;
    }
  }
  closeServer() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
};
async function createAndStoreApiKey(accessToken) {
  try {
    const createApiKeyResp = await fetch(OAUTH_CONFIG.API_KEY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    let apiKeyData;
    let errorText = "";
    try {
      apiKeyData = await createApiKeyResp.json();
    } catch (_e) {
      errorText = await createApiKeyResp.text();
    }
    logEvent("tengu_oauth_api_key", {
      status: createApiKeyResp.ok ? "success" : "failure",
      statusCode: createApiKeyResp.status.toString(),
      error: createApiKeyResp.ok ? "" : errorText || JSON.stringify(apiKeyData)
    });
    if (createApiKeyResp.ok && apiKeyData && apiKeyData.raw_key) {
      const apiKey = apiKeyData.raw_key;
      const config3 = getGlobalConfig();
      config3.primaryApiKey = apiKey;
      if (!config3.customApiKeyResponses) {
        config3.customApiKeyResponses = { approved: [], rejected: [] };
      }
      if (!config3.customApiKeyResponses.approved) {
        config3.customApiKeyResponses.approved = [];
      }
      const normalizedKey = normalizeApiKeyForConfig(apiKey);
      if (!config3.customApiKeyResponses.approved.includes(normalizedKey)) {
        config3.customApiKeyResponses.approved.push(normalizedKey);
      }
      saveGlobalConfig(config3);
      resetAnthropicClient();
      return apiKey;
    }
    return null;
  } catch (error) {
    logEvent("tengu_oauth_api_key", {
      status: "failure",
      statusCode: "exception",
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// src/components/ConsoleOAuthFlow.tsx
init_statsig();

// src/components/AsciiLogo.tsx
import { Box as Box15, Text as Text22 } from "ink";
import React28 from "react";
function AsciiLogo() {
  const theme = getTheme();
  return /* @__PURE__ */ React28.createElement(Box15, { flexDirection: "column", alignItems: "flex-start" }, /* @__PURE__ */ React28.createElement(Text22, { color: theme.claude }, ` \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2557      \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2557   \u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D
\u2588\u2588\u2551     \u2588\u2588\u2551     \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  
\u2588\u2588\u2551     \u2588\u2588\u2551     \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255D  
\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557
 \u255A\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u255D  \u255A\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D
 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557                
\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D                
\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557                  
\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255D                  
\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557                
 \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u255D \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D`));
}

// src/components/ConsoleOAuthFlow.tsx
init_log();

// src/components/Onboarding.tsx
import React31, { useMemo as useMemo3, useState as useState10 } from "react";

// package.json
var version = "0.2.8";

// src/constants/macros.ts
var MACRO2 = {
  VERSION: version,
  README_URL: PRODUCT_URL
};

// src/components/Onboarding.tsx
init_config();
import { Box as Box18, Newline, Text as Text25, useInput as useInput8 } from "ink";
import { OrderedList as OrderedList2 } from "@inkjs/ui";

// src/components/ApproveApiKey.tsx
init_config();
import React29 from "react";
import { Box as Box16, Text as Text23 } from "ink";
import { Select as Select4 } from "@inkjs/ui";
init_source();
function ApproveApiKey({
  customApiKeyTruncated,
  onDone
}) {
  const theme = getTheme();
  function onChange(value) {
    const config3 = getGlobalConfig();
    switch (value) {
      case "yes": {
        saveGlobalConfig({
          ...config3,
          customApiKeyResponses: {
            ...config3.customApiKeyResponses,
            approved: [
              ...config3.customApiKeyResponses?.approved ?? [],
              customApiKeyTruncated
            ]
          }
        });
        onDone();
        break;
      }
      case "no": {
        saveGlobalConfig({
          ...config3,
          customApiKeyResponses: {
            ...config3.customApiKeyResponses,
            rejected: [
              ...config3.customApiKeyResponses?.rejected ?? [],
              customApiKeyTruncated
            ]
          }
        });
        onDone();
        break;
      }
    }
  }
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  return /* @__PURE__ */ React29.createElement(React29.Fragment, null, /* @__PURE__ */ React29.createElement(
    Box16,
    {
      flexDirection: "column",
      gap: 1,
      padding: 1,
      borderStyle: "round",
      borderColor: theme.warning
    },
    /* @__PURE__ */ React29.createElement(Text23, { bold: true, color: theme.warning }, "Detected a custom API key in your environment"),
    /* @__PURE__ */ React29.createElement(Text23, null, "Your environment sets", " ", /* @__PURE__ */ React29.createElement(Text23, { color: theme.warning }, "ANTHROPIC_API_KEY"), ":", " ", /* @__PURE__ */ React29.createElement(Text23, { bold: true }, "sk-ant-...", customApiKeyTruncated)),
    /* @__PURE__ */ React29.createElement(Text23, null, "Do you want to use this API key?"),
    /* @__PURE__ */ React29.createElement(
      Select4,
      {
        options: [
          { label: `No (${source_default.bold("recommended")})`, value: "no" },
          { label: "Yes", value: "yes" }
        ],
        onChange: (value) => onChange(value)
      }
    )
  ), /* @__PURE__ */ React29.createElement(Box16, { marginLeft: 3 }, /* @__PURE__ */ React29.createElement(Text23, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React29.createElement(React29.Fragment, null, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React29.createElement(React29.Fragment, null, "Enter to confirm"))));
}

// src/components/StructuredDiff.tsx
import { Box as Box17, Text as Text24 } from "ink";
import * as React30 from "react";
import { useMemo as useMemo2 } from "react";
function StructuredDiff({
  patch,
  dim,
  width,
  overrideTheme
}) {
  const diff = useMemo2(
    () => formatDiff(patch.lines, patch.oldStart, width, dim, overrideTheme),
    [patch.lines, patch.oldStart, width, dim, overrideTheme]
  );
  return diff.map((_, i) => /* @__PURE__ */ React30.createElement(Box17, { key: i }, _));
}
function formatDiff(lines, startingLineNumber, width, dim, overrideTheme) {
  const theme = getTheme(overrideTheme);
  const ls = numberDiffLines(
    lines.map((code) => {
      if (code.startsWith("+")) {
        return {
          code: " " + code.slice(1),
          i: 0,
          type: "add"
        };
      }
      if (code.startsWith("-")) {
        return {
          code: " " + code.slice(1),
          i: 0,
          type: "remove"
        };
      }
      return { code, i: 0, type: "nochange" };
    }),
    startingLineNumber
  );
  const maxLineNumber = Math.max(...ls.map(({ i }) => i));
  const maxWidth = maxLineNumber.toString().length;
  return ls.flatMap(({ type, code, i }) => {
    const wrappedLines = wrapText(code, width - maxWidth);
    return wrappedLines.map((line, lineIndex) => {
      const key = `${type}-${i}-${lineIndex}`;
      switch (type) {
        case "add":
          return /* @__PURE__ */ React30.createElement(Text24, { key }, /* @__PURE__ */ React30.createElement(
            LineNumber,
            {
              i: lineIndex === 0 ? i : void 0,
              width: maxWidth
            }
          ), /* @__PURE__ */ React30.createElement(
            Text24,
            {
              color: overrideTheme ? theme.text : void 0,
              backgroundColor: dim ? theme.diff.addedDimmed : theme.diff.added,
              dimColor: dim
            },
            line
          ));
        case "remove":
          return /* @__PURE__ */ React30.createElement(Text24, { key }, /* @__PURE__ */ React30.createElement(
            LineNumber,
            {
              i: lineIndex === 0 ? i : void 0,
              width: maxWidth
            }
          ), /* @__PURE__ */ React30.createElement(
            Text24,
            {
              color: overrideTheme ? theme.text : void 0,
              backgroundColor: dim ? theme.diff.removedDimmed : theme.diff.removed,
              dimColor: dim
            },
            line
          ));
        case "nochange":
          return /* @__PURE__ */ React30.createElement(Text24, { key }, /* @__PURE__ */ React30.createElement(
            LineNumber,
            {
              i: lineIndex === 0 ? i : void 0,
              width: maxWidth
            }
          ), /* @__PURE__ */ React30.createElement(
            Text24,
            {
              color: overrideTheme ? theme.text : void 0,
              dimColor: dim
            },
            line
          ));
      }
    });
  });
}
function LineNumber({
  i,
  width
}) {
  return /* @__PURE__ */ React30.createElement(Text24, { color: getTheme().secondaryText }, i !== void 0 ? i.toString().padStart(width) : " ".repeat(width), " ");
}
function numberDiffLines(diff, startLine) {
  let i = startLine;
  const result = [];
  const queue = [...diff];
  while (queue.length > 0) {
    const { code, type } = queue.shift();
    const line = {
      code,
      type,
      i
    };
    switch (type) {
      case "nochange":
        i++;
        result.push(line);
        break;
      case "add":
        i++;
        result.push(line);
        break;
      case "remove": {
        result.push(line);
        let numRemoved = 0;
        while (queue[0]?.type === "remove") {
          i++;
          const { code: code2, type: type2 } = queue.shift();
          const line2 = {
            code: code2,
            type: type2,
            i
          };
          result.push(line2);
          numRemoved++;
        }
        i -= numRemoved;
        break;
      }
    }
  }
  return result;
}

// src/utils/auth.ts
init_model();
init_config();
function isAnthropicAuthEnabled() {
  return !(USE_BEDROCK || USE_VERTEX);
}
function isLoggedInToAnthropic() {
  const config3 = getGlobalConfig();
  return !!config3.primaryApiKey;
}

// src/components/Onboarding.tsx
function Onboarding({ onDone }) {
  const [currentStepIndex, setCurrentStepIndex] = useState10(0);
  const config3 = getGlobalConfig();
  const oauthEnabled = isAnthropicAuthEnabled();
  const [selectedTheme, setSelectedTheme] = useState10(
    DEFAULT_GLOBAL_CONFIG.theme
  );
  const theme = getTheme();
  function goToNextStep() {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
    }
  }
  function handleThemeSelection(newTheme) {
    saveGlobalConfig({
      ...config3,
      theme: newTheme
    });
    goToNextStep();
  }
  function handleThemePreview(newTheme) {
    setSelectedTheme(newTheme);
  }
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  useInput8(async (_, key) => {
    const currentStep = steps[currentStepIndex];
    if (key.return && currentStep && ["usage", "security"].includes(currentStep.id)) {
      if (currentStepIndex === steps.length - 1) {
        onDone();
      } else {
        if (currentStep.id === "security") {
          await clearTerminal();
        }
        goToNextStep();
      }
    }
  });
  const themeStep = /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column", gap: 1, paddingLeft: 1 }, /* @__PURE__ */ React31.createElement(Text25, null, "Let's get started."), /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column" }, /* @__PURE__ */ React31.createElement(Text25, { bold: true }, "Choose the option that looks best when you select it:"), /* @__PURE__ */ React31.createElement(Text25, { dimColor: true }, "To change this later, run /config")), /* @__PURE__ */ React31.createElement(
    Select,
    {
      options: [
        { label: "Light text", value: "dark" },
        { label: "Dark text", value: "light" },
        {
          label: "Light text (colorblind-friendly)",
          value: "dark-daltonized"
        },
        {
          label: "Dark text (colorblind-friendly)",
          value: "light-daltonized"
        }
      ],
      onFocus: handleThemePreview,
      onChange: handleThemeSelection
    }
  ), /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column" }, /* @__PURE__ */ React31.createElement(
    Box18,
    {
      paddingLeft: 1,
      marginRight: 1,
      borderStyle: "round",
      borderColor: "gray",
      flexDirection: "column"
    },
    /* @__PURE__ */ React31.createElement(
      StructuredDiff,
      {
        patch: {
          oldStart: 1,
          newStart: 1,
          oldLines: 3,
          newLines: 3,
          lines: [
            "function greet() {",
            '-  console.log("Hello, World!");',
            '+  console.log("Hello, Claude!");',
            "}"
          ]
        },
        dim: false,
        width: 40,
        overrideTheme: selectedTheme
      }
    )
  )));
  const securityStep = /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column", gap: 1, paddingLeft: 1 }, /* @__PURE__ */ React31.createElement(Text25, { bold: true }, "Security notes:"), /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column", width: 70 }, /* @__PURE__ */ React31.createElement(OrderedList2, null, /* @__PURE__ */ React31.createElement(OrderedList2.Item, null, /* @__PURE__ */ React31.createElement(Text25, null, "Claude Code is currently in research preview"), /* @__PURE__ */ React31.createElement(Text25, { color: theme.secondaryText, wrap: "wrap" }, "This beta version may have limitations or unexpected behaviors.", /* @__PURE__ */ React31.createElement(Newline, null), "Run /bug at any time to report issues.", /* @__PURE__ */ React31.createElement(Newline, null))), /* @__PURE__ */ React31.createElement(OrderedList2.Item, null, /* @__PURE__ */ React31.createElement(Text25, null, "Claude can make mistakes"), /* @__PURE__ */ React31.createElement(Text25, { color: theme.secondaryText, wrap: "wrap" }, "You should always review Claude's responses, especially when", /* @__PURE__ */ React31.createElement(Newline, null), "running code.", /* @__PURE__ */ React31.createElement(Newline, null))), /* @__PURE__ */ React31.createElement(OrderedList2.Item, null, /* @__PURE__ */ React31.createElement(Text25, null, "Due to prompt injection risks, only use it with code you trust"), /* @__PURE__ */ React31.createElement(Text25, { color: theme.secondaryText, wrap: "wrap" }, "For more details see:", /* @__PURE__ */ React31.createElement(Newline, null), /* @__PURE__ */ React31.createElement(Link, { url: "https://docs.anthropic.com/s/claude-code-security" }))))), /* @__PURE__ */ React31.createElement(PressEnterToContinue, null));
  const usageStep = /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column", gap: 1, paddingLeft: 1 }, /* @__PURE__ */ React31.createElement(Text25, { bold: true }, "Using ", PRODUCT_NAME, " effectively:"), /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column", width: 70 }, /* @__PURE__ */ React31.createElement(OrderedList2, null, /* @__PURE__ */ React31.createElement(OrderedList2.Item, null, /* @__PURE__ */ React31.createElement(Text25, null, "Start in your project directory", /* @__PURE__ */ React31.createElement(Newline, null), /* @__PURE__ */ React31.createElement(Text25, { color: theme.secondaryText }, "Files are automatically added to context when needed."), /* @__PURE__ */ React31.createElement(Newline, null))), /* @__PURE__ */ React31.createElement(OrderedList2.Item, null, /* @__PURE__ */ React31.createElement(Text25, null, "Use ", PRODUCT_NAME, " as a development partner", /* @__PURE__ */ React31.createElement(Newline, null), /* @__PURE__ */ React31.createElement(Text25, { color: theme.secondaryText }, "Get help with file analysis, editing, bash commands,", /* @__PURE__ */ React31.createElement(Newline, null), "and git history.", /* @__PURE__ */ React31.createElement(Newline, null)))), /* @__PURE__ */ React31.createElement(OrderedList2.Item, null, /* @__PURE__ */ React31.createElement(Text25, null, "Provide clear context", /* @__PURE__ */ React31.createElement(Newline, null), /* @__PURE__ */ React31.createElement(Text25, { color: theme.secondaryText }, "Be as specific as you would with another engineer. ", /* @__PURE__ */ React31.createElement(Newline, null), "The better the context, the better the results. ", /* @__PURE__ */ React31.createElement(Newline, null))))), /* @__PURE__ */ React31.createElement(Box18, null, /* @__PURE__ */ React31.createElement(Text25, null, "For more details on ", PRODUCT_NAME, ", see:", /* @__PURE__ */ React31.createElement(Newline, null), /* @__PURE__ */ React31.createElement(Link, { url: MACRO2.README_URL })))), /* @__PURE__ */ React31.createElement(PressEnterToContinue, null));
  const apiKeyNeedingApproval = useMemo3(() => {
    if (process.env.USER_TYPE !== "ant") {
      return "";
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return "";
    }
    const customApiKeyTruncated = normalizeApiKeyForConfig(
      process.env.ANTHROPIC_API_KEY
    );
    if (getCustomApiKeyStatus(customApiKeyTruncated) === "new") {
      return customApiKeyTruncated;
    }
  }, []);
  const steps = [];
  steps.push({ id: "theme", component: themeStep });
  if (oauthEnabled) {
    steps.push({
      id: "oauth",
      component: /* @__PURE__ */ React31.createElement(ConsoleOAuthFlow, { onDone: goToNextStep })
    });
  }
  if (apiKeyNeedingApproval) {
    steps.push({
      id: "api-key",
      component: /* @__PURE__ */ React31.createElement(
        ApproveApiKey,
        {
          customApiKeyTruncated: apiKeyNeedingApproval,
          onDone: goToNextStep
        }
      )
    });
  }
  steps.push({ id: "security", component: securityStep });
  steps.push({ id: "usage", component: usageStep });
  return /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column", gap: 1 }, steps[currentStepIndex]?.id !== "oauth" && /* @__PURE__ */ React31.createElement(WelcomeBox, null), /* @__PURE__ */ React31.createElement(Box18, { flexDirection: "column", padding: 0, gap: 0 }, steps[currentStepIndex]?.component, exitState.pending && /* @__PURE__ */ React31.createElement(Box18, { padding: 1 }, /* @__PURE__ */ React31.createElement(Text25, { dimColor: true }, "Press ", exitState.keyName, " again to exit"))));
}
function WelcomeBox() {
  const theme = getTheme();
  return /* @__PURE__ */ React31.createElement(
    Box18,
    {
      borderColor: theme.claude,
      borderStyle: "round",
      paddingX: 1,
      width: MIN_LOGO_WIDTH
    },
    /* @__PURE__ */ React31.createElement(Text25, null, /* @__PURE__ */ React31.createElement(Text25, { color: theme.claude }, "\u273B"), " Welcome to", " ", /* @__PURE__ */ React31.createElement(Text25, { bold: true }, PRODUCT_NAME), " research preview!")
  );
}

// src/services/notifier.ts
init_config();
function sendITerm2Notification({ message, title }) {
  const displayString = title ? `${title}:
${message}` : message;
  try {
    process.stdout.write(`\x1B]9;

${displayString}\x07`);
  } catch {
  }
}
function sendTerminalBell() {
  process.stdout.write("\x07");
}
async function sendNotification(notif) {
  const channel = getGlobalConfig().preferredNotifChannel;
  switch (channel) {
    case "iterm2":
      sendITerm2Notification(notif);
      break;
    case "terminal_bell":
      sendTerminalBell();
      break;
    case "iterm2_with_bell":
      sendITerm2Notification(notif);
      sendTerminalBell();
      break;
    case "notifications_disabled":
      break;
  }
}

// src/components/ConsoleOAuthFlow.tsx
var PASTE_HERE_MSG = "Paste code here if prompted > ";
function ConsoleOAuthFlow({ onDone }) {
  const [oauthStatus, setOAuthStatus] = useState11({
    state: "idle"
  });
  const theme = getTheme();
  const [pastedCode, setPastedCode] = useState11("");
  const [cursorOffset, setCursorOffset] = useState11(0);
  const [oauthService] = useState11(() => new OAuthService());
  const [showPastePrompt, setShowPastePrompt] = useState11(false);
  const [isClearing, setIsClearing] = useState11(false);
  const textInputColumns = useTerminalSize().columns - PASTE_HERE_MSG.length - 1;
  useEffect8(() => {
    if (isClearing) {
      clearTerminal();
      setIsClearing(false);
    }
  }, [isClearing]);
  useEffect8(() => {
    if (oauthStatus.state === "about_to_retry") {
      setIsClearing(true);
      setTimeout(() => {
        setOAuthStatus(oauthStatus.nextState);
      }, 1e3);
    }
  }, [oauthStatus]);
  useInput9(async (_, key) => {
    if (key.return) {
      if (oauthStatus.state === "idle") {
        logEvent("tengu_oauth_start", {});
        setOAuthStatus({ state: "ready_to_start" });
      } else if (oauthStatus.state === "success") {
        logEvent("tengu_oauth_success", {});
        await clearTerminal();
        onDone();
      } else if (oauthStatus.state === "error" && oauthStatus.toRetry) {
        setPastedCode("");
        setOAuthStatus({
          state: "about_to_retry",
          nextState: oauthStatus.toRetry
        });
      }
    }
  });
  async function handleSubmitCode(value, url2) {
    try {
      const [authorizationCode, state2] = value.split("#");
      if (!authorizationCode || !state2) {
        setOAuthStatus({
          state: "error",
          message: "Invalid code. Please make sure the full code was copied",
          toRetry: { state: "waiting_for_login", url: url2 }
        });
        return;
      }
      logEvent("tengu_oauth_manual_entry", {});
      oauthService.processCallback({
        authorizationCode,
        state: state2,
        useManualRedirect: true
      });
    } catch (err) {
      logError(err);
      setOAuthStatus({
        state: "error",
        message: err.message,
        toRetry: { state: "waiting_for_login", url: url2 }
      });
    }
  }
  const startOAuth = useCallback3(async () => {
    try {
      const result = await oauthService.startOAuthFlow(async (url2) => {
        setOAuthStatus({ state: "waiting_for_login", url: url2 });
        setTimeout(() => setShowPastePrompt(true), 3e3);
      }).catch((err) => {
        if (err.message.includes("Token exchange failed")) {
          setOAuthStatus({
            state: "error",
            message: "Failed to exchange authorization code for access token. Please try again.",
            toRetry: { state: "ready_to_start" }
          });
          logEvent("tengu_oauth_token_exchange_error", { error: err.message });
        } else {
          setOAuthStatus({
            state: "error",
            message: err.message,
            toRetry: { state: "ready_to_start" }
          });
        }
        throw err;
      });
      setOAuthStatus({ state: "creating_api_key" });
      const apiKey = await createAndStoreApiKey(result.accessToken).catch(
        (err) => {
          setOAuthStatus({
            state: "error",
            message: "Failed to create API key: " + err.message,
            toRetry: { state: "ready_to_start" }
          });
          logEvent("tengu_oauth_api_key_error", { error: err.message });
          throw err;
        }
      );
      if (apiKey) {
        setOAuthStatus({ state: "success", apiKey });
        sendNotification({ message: "Claude Code login successful" });
      } else {
        setOAuthStatus({
          state: "error",
          message: "Unable to create API key. The server accepted the request but didn't return a key.",
          toRetry: { state: "ready_to_start" }
        });
        logEvent("tengu_oauth_api_key_error", {
          error: "server_returned_no_key"
        });
      }
    } catch (err) {
      const errorMessage = err.message;
      logEvent("tengu_oauth_error", { error: errorMessage });
    }
  }, [oauthService, setShowPastePrompt]);
  useEffect8(() => {
    if (oauthStatus.state === "ready_to_start") {
      startOAuth();
    }
  }, [oauthStatus.state, startOAuth]);
  function renderStatusMessage() {
    switch (oauthStatus.state) {
      case "idle":
        return /* @__PURE__ */ React32.createElement(Box19, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React32.createElement(Text26, { bold: true }, PRODUCT_NAME, " is billed based on API usage through your Anthropic Console account."), /* @__PURE__ */ React32.createElement(Box19, null, /* @__PURE__ */ React32.createElement(Text26, null, "Pricing may evolve as we move towards general availability.")), /* @__PURE__ */ React32.createElement(Box19, { marginTop: 1 }, /* @__PURE__ */ React32.createElement(Text26, { color: theme.permission }, "Press ", /* @__PURE__ */ React32.createElement(Text26, { bold: true }, "Enter"), " to login to your Anthropic Console account\u2026")));
      case "waiting_for_login":
        return /* @__PURE__ */ React32.createElement(Box19, { flexDirection: "column", gap: 1 }, !showPastePrompt && /* @__PURE__ */ React32.createElement(Box19, null, /* @__PURE__ */ React32.createElement(SimpleSpinner, null), /* @__PURE__ */ React32.createElement(Text26, null, "Opening browser to sign in\u2026")), showPastePrompt && /* @__PURE__ */ React32.createElement(Box19, null, /* @__PURE__ */ React32.createElement(Text26, null, PASTE_HERE_MSG), /* @__PURE__ */ React32.createElement(
          TextInput,
          {
            value: pastedCode,
            onChange: setPastedCode,
            onSubmit: (value) => handleSubmitCode(value, oauthStatus.url),
            cursorOffset,
            onChangeCursorOffset: setCursorOffset,
            columns: textInputColumns
          }
        )));
      case "creating_api_key":
        return /* @__PURE__ */ React32.createElement(Box19, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React32.createElement(Box19, null, /* @__PURE__ */ React32.createElement(SimpleSpinner, null), /* @__PURE__ */ React32.createElement(Text26, null, "Creating API key for Claude Code\u2026")));
      case "about_to_retry":
        return /* @__PURE__ */ React32.createElement(Box19, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React32.createElement(Text26, { color: theme.permission }, "Retrying\u2026"));
      case "success":
        return /* @__PURE__ */ React32.createElement(Box19, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React32.createElement(Text26, { color: theme.success }, "Login successful. Press ", /* @__PURE__ */ React32.createElement(Text26, { bold: true }, "Enter"), " to continue\u2026"));
      case "error":
        return /* @__PURE__ */ React32.createElement(Box19, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React32.createElement(Text26, { color: theme.error }, "OAuth error: ", oauthStatus.message), oauthStatus.toRetry && /* @__PURE__ */ React32.createElement(Box19, { marginTop: 1 }, /* @__PURE__ */ React32.createElement(Text26, { color: theme.permission }, "Press ", /* @__PURE__ */ React32.createElement(Text26, { bold: true }, "Enter"), " to retry.")));
      default:
        return null;
    }
  }
  const staticItems = {};
  if (!isClearing) {
    staticItems.header = /* @__PURE__ */ React32.createElement(Box19, { key: "header", flexDirection: "column", gap: 1 }, /* @__PURE__ */ React32.createElement(WelcomeBox, null), /* @__PURE__ */ React32.createElement(Box19, { paddingBottom: 1, paddingLeft: 1 }, /* @__PURE__ */ React32.createElement(AsciiLogo, null)));
  }
  if (oauthStatus.state === "waiting_for_login" && showPastePrompt) {
    staticItems.urlToCopy = /* @__PURE__ */ React32.createElement(Box19, { flexDirection: "column", key: "urlToCopy", gap: 1, paddingBottom: 1 }, /* @__PURE__ */ React32.createElement(Box19, { paddingX: 1 }, /* @__PURE__ */ React32.createElement(Text26, { dimColor: true }, "Browser didn't open? Use the url below to sign in:")), /* @__PURE__ */ React32.createElement(Box19, { width: 1e3 }, /* @__PURE__ */ React32.createElement(Text26, { dimColor: true }, oauthStatus.url)));
  }
  return /* @__PURE__ */ React32.createElement(Box19, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React32.createElement(Static, { items: Object.keys(staticItems) }, (item) => staticItems[item]), /* @__PURE__ */ React32.createElement(Box19, { paddingLeft: 1, flexDirection: "column", gap: 1 }, renderStatusMessage()));
}

// src/commands/login.tsx
import { Box as Box20, Text as Text27 } from "ink";
var login_default = () => ({
  type: "local-jsx",
  name: "login",
  description: isLoggedInToAnthropic() ? "Switch Anthropic accounts" : "Sign in with your Anthropic account",
  isEnabled: true,
  isHidden: false,
  async call(onDone, context) {
    await clearTerminal();
    return /* @__PURE__ */ React33.createElement(
      Login,
      {
        onDone: async () => {
          clearConversation(context);
          onDone();
        }
      }
    );
  },
  userFacingName() {
    return "login";
  }
});
function Login(props) {
  const exitState = useExitOnCtrlCD(props.onDone);
  return /* @__PURE__ */ React33.createElement(Box20, { flexDirection: "column" }, /* @__PURE__ */ React33.createElement(ConsoleOAuthFlow, { onDone: props.onDone }), /* @__PURE__ */ React33.createElement(Box20, { marginLeft: 3 }, /* @__PURE__ */ React33.createElement(Text27, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React33.createElement(React33.Fragment, null, "Press ", exitState.keyName, " again to exit") : "")));
}

// src/commands/logout.tsx
init_config();
import * as React34 from "react";
import { Text as Text28 } from "ink";
var logout_default = {
  type: "local-jsx",
  name: "logout",
  description: "Sign out from your Anthropic account",
  isEnabled: true,
  isHidden: false,
  async call() {
    await clearTerminal();
    const config3 = getGlobalConfig();
    config3.oauthAccount = void 0;
    config3.primaryApiKey = void 0;
    config3.hasCompletedOnboarding = false;
    if (config3.customApiKeyResponses?.approved) {
      config3.customApiKeyResponses.approved = [];
    }
    saveGlobalConfig(config3);
    const message = /* @__PURE__ */ React34.createElement(Text28, null, "Successfully logged out from your Anthropic account.");
    setTimeout(() => {
      process.exit(0);
    }, 200);
    return message;
  },
  userFacingName() {
    return "logout";
  }
};

// src/commands/mcp.tsx
init_state();
import React35 from "react";
import { Text as Text29, Box as Box21 } from "ink";
import fs3 from "fs";
import path6 from "path";
import { spawn as spawn2 } from "child_process";
function MCPCommand() {
  return /* @__PURE__ */ React35.createElement(Box21, { flexDirection: "column" }, /* @__PURE__ */ React35.createElement(Text29, null, "Use the command line interface to manage MCP servers:"), /* @__PURE__ */ React35.createElement(Text29, null, "  claude mcp list - List all configured servers"), /* @__PURE__ */ React35.createElement(Text29, null, "  claude mcp install [server] - Install a specific server"), /* @__PURE__ */ React35.createElement(Text29, null, "  claude mcp start [server] - Start a specific server"), /* @__PURE__ */ React35.createElement(Text29, null, "  claude mcp stop [server] - Stop a specific server"), /* @__PURE__ */ React35.createElement(Text29, null, "  claude mcp add [server] - Add a new server configuration"));
}

// src/tools/MemoryReadTool/MemoryReadTool.tsx
import { existsSync as existsSync16, lstatSync, mkdirSync as mkdirSync5, readdirSync as readdirSync4, readFileSync as readFileSync13 } from "fs";
import { Box as Box22, Text as Text30 } from "ink";
import { join as join14 } from "path";
import * as React36 from "react";
import { z as z5 } from "zod";
init_env();

// src/tools/MemoryReadTool/prompt.js
var DESCRIPTION6 = "Memory Read Tool";
var PROMPT4 = "Use this tool to read from memory.";

// src/tools/MemoryReadTool/MemoryReadTool.tsx
var inputSchema5 = z5.strictObject({
  file_path: z5.string().optional().describe("Optional path to a specific memory file to read"),
  key: z5.string().optional().describe("Key name of the memory item to read")
});
var MemoryReadTool = {
  name: "MemoryRead",
  async description() {
    return DESCRIPTION6;
  },
  async prompt() {
    return PROMPT4;
  },
  inputSchema: inputSchema5,
  userFacingName() {
    return "Read Memory";
  },
  async isEnabled() {
    return process.env.USER_TYPE === "ant";
  },
  isReadOnly() {
    return true;
  },
  needsPermissions() {
    return false;
  },
  renderResultForAssistant({ content }) {
    return content;
  },
  renderToolUseMessage(input) {
    return Object.entries(input).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(", ");
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React36.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(output) {
    return /* @__PURE__ */ React36.createElement(Box22, { justifyContent: "space-between", overflowX: "hidden", width: "100%" }, /* @__PURE__ */ React36.createElement(Box22, { flexDirection: "row" }, /* @__PURE__ */ React36.createElement(Text30, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React36.createElement(Text30, null, output.content)));
  },
  async validateInput({ file_path, key }) {
    if (file_path) {
      const fullPath = join14(MEMORY_DIR, file_path);
      if (!fullPath.startsWith(MEMORY_DIR)) {
        return { result: false, message: "Invalid memory file path" };
      }
      if (!existsSync16(fullPath)) {
        return { result: false, message: "Memory file does not exist" };
      }
    }
    if (key) {
      const fullPath = join14(MEMORY_DIR, key);
      if (!fullPath.startsWith(MEMORY_DIR)) {
        return { result: false, message: "Invalid memory key" };
      }
      if (!existsSync16(fullPath)) {
        return { result: false, message: `Memory key "${key}" does not exist` };
      }
    }
    if (!file_path && !key && !process.env.LIST_ALL_MEMORY) {
      return { result: true };
    }
    return { result: true };
  },
  async *call({ file_path, key }) {
    mkdirSync5(MEMORY_DIR, { recursive: true });
    const usedFilePath = file_path || key;
    if (usedFilePath) {
      const fullPath = join14(MEMORY_DIR, usedFilePath);
      if (!existsSync16(fullPath)) {
        throw new Error(`Memory file does not exist: ${usedFilePath}`);
      }
      const content2 = readFileSync13(fullPath, "utf-8");
      yield {
        type: "result",
        data: {
          content: content2,
          value: content2
          // Add this for backward compatibility
        },
        resultForAssistant: this.renderResultForAssistant({ content: content2 })
      };
      return;
    }
    const files = readdirSync4(MEMORY_DIR, { recursive: true }).map((f) => join14(MEMORY_DIR, f.toString())).filter((f) => !lstatSync(f).isDirectory()).map((f) => `- ${f}`).join("\n");
    const indexPath = join14(MEMORY_DIR, "index.md");
    const index = existsSync16(indexPath) ? readFileSync13(indexPath, "utf-8") : "";
    const quotes = "'''";
    const content = `Here are the contents of the root memory file, \`${indexPath}\`:
${quotes}
${index}
${quotes}

Files in the memory directory:
${files}`;
    yield {
      type: "result",
      data: { content },
      resultForAssistant: this.renderResultForAssistant({ content })
    };
  }
};

// src/commands/memory_read.ts
var memory_read_default = {
  type: "local",
  name: "memory-read",
  description: "Read from persistent memory across conversations",
  isEnabled: true,
  isHidden: process.env.USER_TYPE !== "ant",
  userFacingName() {
    return "memory-read";
  },
  async call(args, context) {
    const keyMatch = args.match(/key\s*=\s*["']?([\w\-_]+)["']?/);
    if (!keyMatch) {
      return `Error: Missing required parameter 'key'. Usage: /memory-read key="your_key"`;
    }
    const key = keyMatch[1];
    try {
      let result;
      for await (const toolResult of MemoryReadTool.call({ key }, {
        ...context,
        messageId: void 0,
        readFileTimestamps: {}
      })) {
        if (toolResult.type === "result") {
          result = toolResult.data;
          break;
        }
      }
      if (result && result.content) {
        try {
          const parsed = JSON.parse(result.content);
          return `Memory value for key "${key}":

${JSON.stringify(parsed, null, 2)}`;
        } catch {
          return `Memory value for key "${key}":

${result.content}`;
        }
      } else {
        return `No value found for key "${key}"`;
      }
    } catch (error) {
      return `Error reading from memory: ${error.message}`;
    }
  }
};

// src/tools/MemoryWriteTool/MemoryWriteTool.tsx
import { mkdirSync as mkdirSync6, writeFileSync as writeFileSync9 } from "fs";
import { Box as Box23, Text as Text31 } from "ink";
import { dirname as dirname5, join as join15 } from "path";
import * as React37 from "react";
import { z as z6 } from "zod";
init_env();

// src/tools/MemoryWriteTool/prompt.js
var DESCRIPTION7 = "Memory Write Tool";
var PROMPT5 = "Use this tool to write to memory.";

// src/tools/MemoryWriteTool/MemoryWriteTool.tsx
var inputSchema6 = z6.strictObject({
  file_path: z6.string().optional().describe("Path to the memory file to write"),
  content: z6.string().optional().describe("Content to write to the file"),
  key: z6.string().optional().describe("Key to use as the filename for the memory item"),
  value: z6.string().optional().describe("Value to store in the memory file")
}).refine((data) => !!data.file_path && !!data.content || !!data.key && !!data.value, {
  message: "Either file_path+content OR key+value must be provided"
});
var MemoryWriteTool = {
  name: "MemoryWrite",
  async description() {
    return DESCRIPTION7;
  },
  async prompt() {
    return PROMPT5;
  },
  inputSchema: inputSchema6,
  userFacingName() {
    return "Write Memory";
  },
  async isEnabled() {
    return process.env.USER_TYPE === "ant";
  },
  isReadOnly() {
    return false;
  },
  needsPermissions() {
    return false;
  },
  renderResultForAssistant(content) {
    console.log("Memory write successful");
    return content;
  },
  renderToolUseMessage(input) {
    return Object.entries(input).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(", ");
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React37.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage() {
    return /* @__PURE__ */ React37.createElement(Box23, { justifyContent: "space-between", overflowX: "hidden", width: "100%" }, /* @__PURE__ */ React37.createElement(Box23, { flexDirection: "row" }, /* @__PURE__ */ React37.createElement(Text31, null, "  ", "\u23BF Updated memory")));
  },
  async validateInput({ file_path, key }) {
    if (file_path) {
      const fullPath = join15(MEMORY_DIR, file_path);
      if (!fullPath.startsWith(MEMORY_DIR)) {
        return { result: false, message: "Invalid memory file path" };
      }
    }
    if (!file_path && !key) {
      return { result: false, message: "Either file_path or key must be provided" };
    }
    return { result: true };
  },
  async *call({ file_path, content, key, value }) {
    const usedFilePath = file_path || key;
    const usedContent = content || value;
    if (!usedFilePath) {
      throw new Error("Either file_path or key must be provided");
    }
    if (usedContent === void 0) {
      throw new Error("Either content or value must be provided");
    }
    const fullPath = join15(MEMORY_DIR, usedFilePath);
    mkdirSync6(dirname5(fullPath), { recursive: true });
    writeFileSync9(fullPath, usedContent, "utf-8");
    yield {
      type: "result",
      data: "Saved",
      resultForAssistant: "Saved"
    };
  }
};

// src/commands/memory_write.ts
var memory_write_default = {
  type: "local",
  name: "memory-write",
  description: "Store information persistently across sessions",
  isEnabled: true,
  isHidden: process.env.USER_TYPE !== "ant",
  userFacingName() {
    return "memory-write";
  },
  async call(args, context) {
    const keyMatch = args.match(/key\s*=\s*["']?([\w\-_]+)["']?/);
    const valueMatch = args.match(/value\s*=\s*["']?([^"']+)["']?/);
    if (!keyMatch) {
      return `Error: Missing required parameter 'key'. Usage: /memory-write key="your_key" value="your_value"`;
    }
    if (!valueMatch) {
      return `Error: Missing required parameter 'value'. Usage: /memory-write key="your_key" value="your_value"`;
    }
    const key = keyMatch[1];
    const value = valueMatch[1];
    try {
      let result;
      for await (const toolResult of MemoryWriteTool.call({ key, value }, {
        ...context,
        messageId: void 0,
        readFileTimestamps: {}
      })) {
        if (toolResult.type === "result") {
          result = toolResult.data;
          break;
        }
      }
      return `Successfully stored value for key "${key}"`;
    } catch (error) {
      return `Error writing to memory: ${error.message}`;
    }
  }
};

// src/commands/model.tsx
import * as React38 from "react";
import { Box as Box24, Text as Text32, useInput as useInput10 } from "ink";
import { useState as useState12 } from "react";
import figures2 from "figures";
init_config();
init_source();
function ModelSelector({ onClose }) {
  const [globalConfig, setGlobalConfig] = useState12(getGlobalConfig());
  const initialConfig = React38.useRef(getGlobalConfig());
  const [selectedIndex, setSelectedIndex] = useState12(0);
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  const modelOptions = [
    {
      id: "claude-3-7-sonnet-20250219",
      name: "Claude 3.7 Sonnet (default)",
      description: "Balanced for performance and cost"
    },
    {
      id: "claude-3-5-sonnet-20240620",
      name: "Claude 3.5 Sonnet",
      description: "Well-balanced model"
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
      description: "Fast and efficient model"
    }
  ];
  const currentModel = globalConfig.preferredModel || "claude-3-7-sonnet-20250219";
  React38.useEffect(() => {
    const currentModelIndex = modelOptions.findIndex((option) => option.id === currentModel);
    if (currentModelIndex >= 0) {
      setSelectedIndex(currentModelIndex);
    }
  }, [currentModel]);
  useInput10((input, key) => {
    if (key.escape) {
      if (globalConfig.preferredModel !== initialConfig.current.preferredModel) {
        console.log(source_default.gray(`  \u23BF  Switched to model: ${source_default.bold(globalConfig.preferredModel || "default")}`));
      }
      onClose();
      return;
    }
    function selectModel() {
      const selectedModel = modelOptions[selectedIndex];
      if (!selectedModel) return;
      const config3 = { ...getGlobalConfig(), preferredModel: selectedModel.id };
      saveGlobalConfig(config3);
      setGlobalConfig(config3);
    }
    if (key.return || input === " ") {
      selectModel();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(modelOptions.length - 1, prev + 1));
    }
  });
  return /* @__PURE__ */ React38.createElement(React38.Fragment, null, /* @__PURE__ */ React38.createElement(
    Box24,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: getTheme().secondaryBorder,
      paddingX: 1,
      marginTop: 1
    },
    /* @__PURE__ */ React38.createElement(Box24, { flexDirection: "column", minHeight: 2, marginBottom: 1 }, /* @__PURE__ */ React38.createElement(Text32, { bold: true }, "Model Selection"), /* @__PURE__ */ React38.createElement(Text32, { dimColor: true }, "Choose which Claude model to use")),
    modelOptions.map((model2, i) => {
      const isSelected = i === selectedIndex;
      const isActive = model2.id === globalConfig.preferredModel;
      return /* @__PURE__ */ React38.createElement(Box24, { key: model2.id, flexDirection: "column", paddingY: 1 }, /* @__PURE__ */ React38.createElement(Box24, null, /* @__PURE__ */ React38.createElement(Text32, { color: isSelected ? "blue" : void 0 }, isSelected ? figures2.pointer : " ", " ", model2.name, isActive && !isSelected ? " " + figures2.radioOn : "")), /* @__PURE__ */ React38.createElement(Box24, { marginLeft: 2 }, /* @__PURE__ */ React38.createElement(Text32, { color: isSelected ? "blue" : void 0, dimColor: !isSelected }, model2.description)));
    })
  ), /* @__PURE__ */ React38.createElement(Box24, { marginLeft: 3 }, /* @__PURE__ */ React38.createElement(Text32, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React38.createElement(React38.Fragment, null, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React38.createElement(React38.Fragment, null, "\u2191/\u2193 to select \xB7 Enter/Space to choose \xB7 Esc to close"))));
}
var model = {
  type: "local-jsx",
  name: "model",
  description: "Select which Claude model to use",
  isEnabled: true,
  isHidden: false,
  async call(onDone) {
    return /* @__PURE__ */ React38.createElement(ModelSelector, { onClose: onDone });
  },
  userFacingName() {
    return "model";
  }
};
var model_default = model;

// src/commands/onboarding.tsx
import * as React39 from "react";
init_config();
var onboarding_default = {
  type: "local-jsx",
  name: "onboarding",
  description: "[ANT-ONLY] Run through the onboarding flow",
  isEnabled: process.env.USER_TYPE === "ant",
  isHidden: false,
  async call(onDone, context) {
    await clearTerminal();
    const config3 = getGlobalConfig();
    saveGlobalConfig({
      ...config3,
      theme: "dark"
    });
    return /* @__PURE__ */ React39.createElement(
      Onboarding,
      {
        onDone: async () => {
          clearConversation(context);
          onDone();
        }
      }
    );
  },
  userFacingName() {
    return "onboarding";
  }
};

// src/commands/pr_comments.ts
var pr_comments_default = {
  type: "prompt",
  name: "pr-comments",
  description: "Get comments from a GitHub pull request",
  progressMessage: "fetching PR comments",
  isEnabled: true,
  isHidden: false,
  userFacingName() {
    return "pr-comments";
  },
  async getPromptForCommand(args) {
    return [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are an AI assistant integrated into a git-based version control system. Your task is to fetch and display comments from a GitHub pull request.

Follow these steps:

1. Use \`gh pr view --json number,headRepository\` to get the PR number and repository info
2. Use \`gh api /repos/{owner}/{repo}/issues/{number}/comments\` to get PR-level comments
3. Use \`gh api /repos/{owner}/{repo}/pulls/{number}/comments\` to get review comments. Pay particular attention to the following fields: \`body\`, \`diff_hunk\`, \`path\`, \`line\`, etc. If the comment references some code, consider fetching it using eg \`gh api /repos/{owner}/{repo}/contents/{path}?ref={branch} | jq .content -r | base64 -d\`
4. Parse and format all comments in a readable way
5. Return ONLY the formatted comments, with no additional text

Format the comments as:

## Comments

[For each comment thread:]
- @author file.ts#line:
  \`\`\`diff
  [diff_hunk from the API response]
  \`\`\`
  > quoted comment text
  
  [any replies indented]

If there are no comments, return "No comments found."

Remember:
1. Only show the actual comments, no explanatory text
2. Include both PR-level and code review comments
3. Preserve the threading/nesting of comment replies
4. Show the file and line number context for code review comments
5. Use jq to parse the JSON responses from the GitHub API

${args ? "Additional user input: " + args : ""}
`
          }
        ]
      }
    ];
  }
};

// src/commands/release-notes.ts
var releaseNotes = {
  description: "Show release notes for the current or specified version",
  isEnabled: false,
  isHidden: false,
  name: "release-notes",
  userFacingName() {
    return "release-notes";
  },
  type: "local",
  async call(args) {
    const currentVersion = "0.2.8";
    const requestedVersion = args ? args.trim() : currentVersion;
    const notes = RELEASE_NOTES[requestedVersion];
    if (!notes || notes.length === 0) {
      return `No release notes available for version ${requestedVersion}.`;
    }
    const header = `Release notes for version ${requestedVersion}:`;
    const formattedNotes = notes.map((note) => `\u2022 ${note}`).join("\n");
    return `${header}

${formattedNotes}`;
  }
};
var release_notes_default = releaseNotes;

// src/commands/resume.tsx
import * as React42 from "react";
import { Box as Box26, Text as Text34 } from "ink";

// src/screens/ResumeConversation.tsx
import React41 from "react";
import { render as render2 } from "ink";

// src/utils/conversationRecovery.js
function loadMessagesFromLog(logPath, tools) {
  return Promise.resolve([]);
}
function deserializeMessages(messages) {
  return messages;
}

// src/components/LogSelector.tsx
import React40 from "react";
import { Box as Box25, Text as Text33 } from "ink";
import { Select as Select5 } from "@inkjs/ui";
init_log();
function LogSelector({
  logs,
  onSelect
}) {
  const { rows, columns } = useTerminalSize();
  if (logs.length === 0) {
    return null;
  }
  const visibleCount = rows - 3;
  const hiddenCount = Math.max(0, logs.length - visibleCount);
  const indexWidth = 7;
  const modifiedWidth = 21;
  const createdWidth = 21;
  const countWidth = 9;
  const options = logs.map((log, i) => {
    const index = `[${i}]`.padEnd(indexWidth);
    const modified = formatDate(log.modified).padEnd(modifiedWidth);
    const created = formatDate(log.created).padEnd(createdWidth);
    const msgCount = `${log.messageCount}`.padStart(countWidth);
    const prompt = log.firstPrompt;
    let branchInfo = "";
    if (log.forkNumber) branchInfo += ` (fork #${log.forkNumber})`;
    if (log.sidechainNumber)
      branchInfo += ` (sidechain #${log.sidechainNumber})`;
    const labelTxt = `${index}${modified}${created}${msgCount} ${prompt}${branchInfo}`;
    const truncated = labelTxt.length > columns - 2 ? `${labelTxt.slice(0, columns - 5)}...` : labelTxt;
    return {
      label: truncated,
      value: log.value.toString()
    };
  });
  return /* @__PURE__ */ React40.createElement(Box25, { flexDirection: "column", height: "100%", width: "100%" }, /* @__PURE__ */ React40.createElement(Box25, { paddingLeft: 9 }, /* @__PURE__ */ React40.createElement(Text33, { bold: true, color: getTheme().text }, "Modified"), /* @__PURE__ */ React40.createElement(Text33, null, "             "), /* @__PURE__ */ React40.createElement(Text33, { bold: true, color: getTheme().text }, "Created"), /* @__PURE__ */ React40.createElement(Text33, null, "             "), /* @__PURE__ */ React40.createElement(Text33, { bold: true, color: getTheme().text }, "# Messages"), /* @__PURE__ */ React40.createElement(Text33, null, " "), /* @__PURE__ */ React40.createElement(Text33, { bold: true, color: getTheme().text }, "First message")), /* @__PURE__ */ React40.createElement(
    Select5,
    {
      options,
      onChange: (index) => onSelect(parseInt(index, 10)),
      visibleOptionCount: visibleCount
    }
  ), hiddenCount > 0 && /* @__PURE__ */ React40.createElement(Box25, { paddingLeft: 2 }, /* @__PURE__ */ React40.createElement(Text33, { color: getTheme().secondaryText }, "and ", hiddenCount, " more\u2026")));
}

// src/screens/ResumeConversation.tsx
init_log();
init_model();
function ResumeConversation({
  context,
  commands,
  logs,
  tools,
  verbose
}) {
  async function onSelect(index) {
    const log = logs[index];
    if (!log) {
      return;
    }
    try {
      context.unmount?.();
      const isDefaultModel = await isDefaultSlowAndCapableModel();
      render2(
        /* @__PURE__ */ React41.createElement(
          REPL,
          {
            messageLogName: log.date,
            initialPrompt: "",
            shouldShowPromptInput: true,
            verbose,
            commands,
            tools,
            initialMessages: deserializeMessages(log.messages, tools),
            initialForkNumber: getNextAvailableLogForkNumber(
              log.date,
              log.forkNumber ?? 1,
              0
            ),
            isDefaultModel
          }
        ),
        {
          exitOnCtrlC: false
        }
      );
    } catch (e) {
      logError(`Failed to load conversation: ${e}`);
      throw e;
    }
  }
  return /* @__PURE__ */ React41.createElement(LogSelector, { logs, onSelect });
}

// src/commands/resume.tsx
init_log();
import { render as render3 } from "ink";
var resume_default = {
  type: "local-jsx",
  name: "resume",
  description: "[ANT-ONLY] Resume a previous conversation. Set CLAUDE_EXPERIMENTAL=1 for experimental features.",
  isEnabled: process.env.USER_TYPE === "ant",
  isHidden: process.env.USER_TYPE !== "ant",
  userFacingName() {
    return "resume";
  },
  async call(onDone, { options: { commands, tools, verbose } }) {
    const isExperimental = process.env.CLAUDE_EXPERIMENTAL === "1";
    if (isExperimental) {
      render3(
        /* @__PURE__ */ React42.createElement(Box26, { flexDirection: "column" }, /* @__PURE__ */ React42.createElement(Text34, { bold: true }, "\u{1F9EA} Experimental Checkpoint Mode"), /* @__PURE__ */ React42.createElement(Text34, null, "Enhanced conversation resumption with advanced features:"), /* @__PURE__ */ React42.createElement(Text34, null, "- Access to development snapshots"), /* @__PURE__ */ React42.createElement(Text34, null, "- Conversation branches and merging"), /* @__PURE__ */ React42.createElement(Text34, null, "- Deep context recovery"), /* @__PURE__ */ React42.createElement(Text34, null, "- State preservation across sessions"), /* @__PURE__ */ React42.createElement(Text34, null, "Note: This feature is under active development."))
      );
      setTimeout(() => {
        onDone();
      }, 4e3);
      return null;
    }
    const logs = await loadLogList(CACHE_PATHS.messages());
    render3(
      /* @__PURE__ */ React42.createElement(
        ResumeConversation,
        {
          commands,
          context: { unmount: onDone },
          logs,
          tools,
          verbose
        }
      )
    );
    return null;
  }
};

// src/commands/review.ts
var review_default = {
  type: "prompt",
  name: "review",
  description: "Review a pull request",
  isEnabled: true,
  isHidden: false,
  progressMessage: "reviewing pull request",
  userFacingName() {
    return "review";
  },
  async getPromptForCommand(args) {
    return [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
      You are an expert code reviewer. Follow these steps:

      1. If no PR number is provided in the args, use ${BashTool.name}("gh pr list") to show open PRs
      2. If a PR number is provided, use ${BashTool.name}("gh pr view <number>") to get PR details
      3. Use ${BashTool.name}("gh pr diff <number>") to get the diff
      4. Analyze the changes and provide a thorough code review that includes:
         - Overview of what the PR does
         - Analysis of code quality and style
         - Specific suggestions for improvements
         - Any potential issues or risks
      
      Keep your review concise but thorough. Focus on:
      - Code correctness
      - Following project conventions
      - Performance implications
      - Test coverage
      - Security considerations

      Format your review with clear sections and bullet points.

      PR number: ${args}
    `
          }
        ]
      }
    ];
  }
};

// src/tools/SelfImproveTool/SelfImproveTool.tsx
import { Box as Box31, Text as Text39 } from "ink";
import React47 from "react";
import { z as z10 } from "zod";

// src/components/Cost.tsx
import * as React43 from "react";
import { Box as Box27, Text as Text35 } from "ink";
function Cost({ costUSD, durationMs, debug: debug2 }) {
  if (!debug2) {
    return null;
  }
  const durationInSeconds = (durationMs / 1e3).toFixed(1);
  return /* @__PURE__ */ React43.createElement(Box27, { flexDirection: "column", minWidth: 23, width: 23 }, /* @__PURE__ */ React43.createElement(Text35, { dimColor: true }, "Cost: $", costUSD.toFixed(4), " (", durationInSeconds, "s)"));
}

// src/tools/SelfImproveTool/SelfImproveTool.tsx
init_state();
init_log();

// src/tools/SelfImproveTool/prompt.ts
var DESCRIPTION8 = `
- Meta-programming tool for analyzing and improving Claude Code's own codebase
- Combines Lotus and DocETL to understand code architecture and patterns
- Identifies optimization opportunities and suggests improvements
- Generates comprehensive code analysis reports
- Discovers implementation patterns for new features
- Works directly with the codebase to understand itself
- Supports various analysis types: architecture, performance, extensibility
- Customizable analysis depth and scope
- Multiple output formats (markdown, JSON, YAML)
- Caches analysis results for improved performance
`;
var CAPABILITIES = `
Core Capabilities of SelfImproveTool:

1. Meta-Analysis:
   - Analyze Claude Code's own architecture and patterns
   - Identify core components and their relationships
   - Map how tools integrate with the main application
   - Discover architectural patterns used across the codebase
   - Generate comprehensive codebase documentation

2. Self-Improvement:
   - Identify optimization opportunities
   - Locate potential performance bottlenecks
   - Suggest code structure improvements
   - Discover patterns for implementing new features
   - Analyze extensibility points in the codebase

3. Implementation Guidance:
   - Provide patterns for adding new tools
   - Identify integration approaches for new commands
   - Suggest best practices based on existing code
   - Generate scaffolding for new features
   - Recommend architecture for extensions

4. Knowledge Discovery:
   - Uncover hidden patterns in the codebase
   - Map relationships between components
   - Document architectural decisions
   - Extract coding conventions
   - Identify common patterns across similar components

5. Report Generation:
   - Create architecture diagrams and maps
   - Generate component relationship graphs
   - Document code flow and execution patterns
   - Produce markdown, JSON, or YAML reports
   - Provide different levels of analysis detail
`;
var USAGE_EXAMPLES = `
Example Usage Patterns:

1. Architecture Analysis:
   - "Analyze how tools are integrated into Claude Code"
   - "Map the relationship between commands and tools"
   - "Identify the core architectural patterns in our CLI application"
   - "Generate a component dependency graph for the codebase"
   - "Discover how different parts of the codebase communicate"

2. Performance Analysis:
   - "Identify potential performance bottlenecks in our codebase"
   - "Analyze file I/O patterns for optimization opportunities"
   - "Discover redundant operations that could be optimized"
   - "Find areas where caching could improve performance"
   - "Analyze initialization patterns for optimization"

3. Extensibility Analysis:
   - "How should I implement a new tool similar to LotusTool?"
   - "What patterns should I follow when adding a new command?"
   - "Identify extension points for adding new functionality"
   - "Generate a scaffold for implementing a new MCP server"
   - "Discover how to add new tool types to the system"

4. Custom Analysis:
   - "Analyze error handling patterns across the codebase"
   - "How does Claude Code manage permissions for different tools?"
   - "Map the user interaction flow from input to execution"
   - "Analyze how configuration is managed throughout the app"
   - "Identify patterns for handling asynchronous operations"

5. Report Generation:
   - "Generate a comprehensive markdown report about our architecture"
   - "Create a JSON representation of our component relationships"
   - "Produce a deep analysis of the tools subsystem"
   - "Generate a high-level overview of the entire codebase"
   - "Create documentation for how to implement new features"
`;

// src/tools/LotusTool/LotusTool.tsx
import { Box as Box28, Text as Text36 } from "ink";
import React44 from "react";
import { z as z7 } from "zod";

// src/tools/LotusTool/prompt.ts
var TOOL_NAME_FOR_PROMPT3 = "LotusTool";
var DESCRIPTION9 = `
- Natural language interface for data exploration and discovery
- Query and explore data using everyday language instead of code
- Find semantically relevant information without exact keyword matching
- Understand relationships and patterns through conversational queries
- Connect related concepts and discover insights across your data
- Interpret your intent rather than requiring precise syntax
- Bridge the gap between human language and structured data
- Work with documents, datasets, and knowledge bases naturally
- Understand context and conceptual similarities in your data
- Integrate seamlessly with code search and navigation tools
`;
var CAPABILITIES2 = `
Core Capabilities of Lotus:

1. Semantic Understanding:
   - Interpret natural language queries about your data and code
   - Understand concepts and intentions, not just keywords
   - Recognize related topics and ideas without exact matches
   - Grasp the meaning behind your questions about complex codebases

2. Content Discovery:
   - Find relevant information based on meaning, not just syntax
   - Discover connections between related concepts in your codebase
   - Surface similar documents or code implementations
   - Identify conceptual relationships across different files

3. Natural Query Processing:
   - Translate human questions into data operations
   - Find information without needing to know exact file names or function names
   - Search through codebases using conversational language
   - Filter and explore without complex regex or formal query syntax

4. Semantic Operations:
   - Semantic search: Find code or content similar in meaning, not just keywords
   - Semantic clustering: Group items by conceptual similarity
   - Semantic filtering: Select items based on meaning and context
   - Semantic joining: Connect related information across repositories

5. Contextual Understanding:
   - Maintain context across queries and conversations
   - Understand code in relation to your specific domain
   - Recognize specialized terminology in your field
   - Adapt to the unique patterns in your codebase

6. Code and Documentation Alignment:
   - Connect code implementations with their documentation
   - Link concepts in research papers to their implementations
   - Bridge the gap between high-level designs and actual code
   - Provide unified understanding across entire repositories
`;
var USAGE_EXAMPLES2 = `
Example Usage Patterns:

1. Code Search and Understanding:
   - "Find code implementing authentication across our repositories"
   - "Which parts of our codebase relate to the ideas in this research paper?"
   - "Show me how error handling is implemented in our backend services"
   - "Find all code related to database connection management"

2. Knowledge Connections:
   - "Show me documentation related to this code implementation"
   - "Find connections between these different technical concepts"
   - "Which parts of our codebase relate to this architectural pattern?"
   - "Discover how this algorithm is used throughout our codebase"

3. Natural Code Discovery:
   - "Find implementations similar to this code snippet"
   - "Show me examples of React components that handle form validation"
   - "Where do we use this design pattern in our codebase?"
   - "Find similar error handling approaches across our services"

4. Research Implementation:
   - "Find implementations of algorithms described in these papers"
   - "How does our code implement the concepts from this research?"
   - "Show me where we've applied this machine learning technique"
   - "Find code that matches the approach described in this architecture document"

5. Technical Concept Analysis:
   - "Analyze how authentication flows through our system"
   - "Find codepaths related to payment processing"
   - "Show me the relationship between these different modules"
   - "Discover dependencies between our microservices"
`;

// src/tools/LotusTool/LotusTool.tsx
import "dotenv/config";
var lotusPackageAvailable = false;
var lotusInitialized = false;
var Lotus = null;
var LOTUS_API_KEY = process.env.LOTUS_API_KEY || process.env.OPENAI_API_KEY;
async function initializeLotusEnvironment() {
  if (lotusInitialized) return;
  if (!LOTUS_API_KEY) {
    console.warn("No LOTUS_API_KEY or OPENAI_API_KEY found in environment. Lotus will use simulation mode.");
    return;
  }
  try {
    process.env.LOTUS_API_KEY = LOTUS_API_KEY;
    try {
      const execModule = await import("child_process");
      const pathModule = await import("path");
      const { execSync: execSync3 } = execModule;
      const { join: join19 } = pathModule;
      const fs5 = await import("fs");
      const modulePath = new URL(import.meta.url).pathname;
      const scriptDir = pathModule.dirname(modulePath);
      const bridgeScript = join19(scriptDir, "LotusPythonBridge.py");
      console.log(`Looking for bridge script at: ${bridgeScript}`);
      if (!fs5.existsSync(bridgeScript)) {
        console.warn(`Lotus Python bridge script not found at: ${bridgeScript}`);
        throw new Error(`Bridge script not found: ${bridgeScript}`);
      }
      const testResult = execSync3(`python3 "${bridgeScript}" '{"test": true}'`).toString();
      const testJson = JSON.parse(testResult);
      if (testJson.status === "ok") {
        Lotus = {
          // This is our bridge to the Python implementation
          Client: class LotusBridge {
            constructor(options) {
              this.options = options;
            }
            async executeQuery(query2) {
              try {
                const { execSync: execSync4 } = await import("child_process");
                const pathModule2 = await import("path");
                const { join: join20, dirname: dirname8 } = pathModule2;
                const modulePath2 = new URL(import.meta.url).pathname;
                const scriptDir2 = dirname8(modulePath2);
                const bridgeScript2 = join20(scriptDir2, "LotusPythonBridge.py");
                const args = {
                  query: query2,
                  data_path: this.options.dataPath,
                  // Match parameter names with Python bridge
                  dataSource: this.options.dataSource,
                  visualization: this.options.includeVisualization,
                  semantic_search: this.options.useSemanticSearch
                  // Match parameter names with Python bridge
                };
                console.log(`Executing Lotus query: ${query2}`);
                console.log(`Data path: ${this.options.dataPath}`);
                const result = execSync4(`python3 "${bridgeScript2}" '${JSON.stringify(args).replace(/'/g, "\\'")}'`).toString();
                console.log("Lotus bridge executed successfully");
                try {
                  const resultJson = JSON.parse(result);
                  if (resultJson.status === "error") {
                    throw new Error(resultJson.message);
                  }
                  return resultJson;
                } catch (parseError) {
                  console.error("Error parsing bridge result:", parseError);
                  console.log("Raw bridge output:", result);
                  throw new Error(`Failed to parse bridge result: ${parseError.message}`);
                }
              } catch (error) {
                console.error("Error executing Python bridge:", error);
                throw new Error(`Failed to execute Lotus query: ${error.message}`);
              }
            }
          }
        };
        lotusPackageAvailable = true;
        console.log("Lotus Python bridge loaded successfully");
      } else {
        console.warn("Lotus Python bridge test failed, using simulated results:", testJson.message);
      }
    } catch (error) {
      console.warn("Lotus Python bridge not available, using simulated results:", error.message);
    }
    lotusInitialized = true;
  } catch (error) {
    console.error("Failed to initialize Lotus environment:", error);
  }
}
(async () => {
  try {
    await initializeLotusEnvironment();
    if (!lotusInitialized) {
      console.log("Lotus environment initialized");
      lotusInitialized = true;
    }
  } catch (error) {
    console.error("Failed to initialize Lotus environment:", error);
  }
})();
var inputSchema7 = z7.strictObject({
  query: z7.string().describe("The natural language query to execute against your data"),
  dataPath: z7.string().optional().describe("Path to data file or directory"),
  dataSource: z7.string().optional().describe("Type of data source (csv, json, sql, etc.)"),
  visualization: z7.boolean().optional().describe("Whether to include visualization in results"),
  semanticSearch: z7.boolean().optional().describe("Whether to use semantic search capabilities")
});
var LotusTool = {
  name: TOOL_NAME_FOR_PROMPT3,
  async description() {
    return `${DESCRIPTION9}

${CAPABILITIES2}

${USAGE_EXAMPLES2}`;
  },
  userFacingName() {
    return "Lotus";
  },
  inputSchema: inputSchema7,
  isReadOnly() {
    return true;
  },
  async isEnabled() {
    try {
      if (lotusPackageAvailable) {
        return true;
      }
      try {
        const execModule = await import("child_process");
        const pathModule = await import("path");
        const fs5 = await import("fs");
        const { execSync: execSync3 } = execModule;
        const { join: join19, dirname: dirname8 } = pathModule;
        const modulePath = new URL(import.meta.url).pathname;
        const scriptDir = dirname8(modulePath);
        const bridgeScript = join19(scriptDir, "LotusPythonBridge.py");
        if (!fs5.existsSync(bridgeScript)) {
          console.warn(`Lotus Python bridge script not found at: ${bridgeScript}`);
          throw new Error("Bridge script not found");
        }
        const testResult = execSync3(`python3 "${bridgeScript}" '{"test": true}'`).toString();
        const testJson = JSON.parse(testResult);
        if (testJson.status === "ok") {
          console.log("Lotus Python bridge is available");
          lotusPackageAvailable = true;
          return true;
        }
      } catch (error) {
        console.warn(`Lotus Python bridge test failed: ${error.message}`);
      }
      try {
        const execModule = await import("child_process");
        const { execSync: execSync3 } = execModule;
        const pythonVersionResult = execSync3(`python3 -c "import pandas; import numpy; print('Python libraries available')"`).toString();
        if (pythonVersionResult.includes("Python libraries available")) {
          console.log("Python with required libraries is available - using simulated mode");
          return true;
        }
      } catch (error) {
        console.warn(`Python check failed: ${error.message}`);
      }
      console.warn("No Lotus implementation found. Tool will be disabled.");
      return false;
    } catch (error) {
      console.warn(`Error checking Lotus availability: ${error.message}`);
      return false;
    }
  },
  needsPermissions({ dataPath }) {
    return dataPath ? !hasReadPermission2(dataPath) : false;
  },
  async prompt() {
    return `${DESCRIPTION9}

Use natural language to explore and discover insights in your data and code:
- "Find documents that discuss similar concepts to this one, even with different terminology"
- "Which parts of our codebase relate to the ideas in this research paper?"
- "Discover connections between these technical concepts across our documentation"
- "Find implementations that match the approach described in this architecture"`;
  },
  renderToolUseMessage({ query: query2, dataPath, dataSource, visualization, semanticSearch }, { verbose }) {
    let message = `query: "${query2}"`;
    if (dataPath) {
      const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(dataPath);
      message += `, dataPath: "${verbose ? absolutePath : relativePath}"`;
    }
    if (dataSource) {
      message += `, dataSource: "${dataSource}"`;
    }
    if (visualization !== void 0) {
      message += `, visualization: ${visualization}`;
    }
    if (semanticSearch !== void 0) {
      message += `, semanticSearch: ${semanticSearch}`;
    }
    return message;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React44.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(output) {
    if (typeof output === "string") {
      output = JSON.parse(output);
    }
    return /* @__PURE__ */ React44.createElement(Box28, { justifyContent: "space-between", width: "100%" }, /* @__PURE__ */ React44.createElement(Box28, { flexDirection: "row" }, /* @__PURE__ */ React44.createElement(Text36, null, "\xA0\xA0\u23BF \xA0Query processed: "), /* @__PURE__ */ React44.createElement(Text36, { bold: true }, output.summary)), /* @__PURE__ */ React44.createElement(Cost, { costUSD: 0, durationMs: output.durationMs, debug: false }));
  },
  renderResultForAssistant(output) {
    try {
      if (typeof output.result === "string") {
        return output.result;
      } else {
        return JSON.stringify(output.result, null, 2);
      }
    } catch (error) {
      return `Error formatting result: ${error.message}`;
    }
  },
  async *call({ query: query2, dataPath, dataSource, visualization, semanticSearch }, { abortController }) {
    const start = Date.now();
    try {
      if (!lotusInitialized) {
        await initializeLotusEnvironment();
        lotusInitialized = true;
      }
      const debugInfo = {
        lotusPackageAvailable,
        lotusInitialized,
        apiKeyAvailable: !!LOTUS_API_KEY,
        query: query2,
        dataPath: dataPath || "none",
        dataSource: dataSource || "none",
        visualization: visualization || false,
        semanticSearch: semanticSearch || false
      };
      console.log("Lotus Tool Debug Info:", JSON.stringify(debugInfo, null, 2));
      let result;
      try {
        console.log("Attempting to use Python bridge to Lotus...");
        const execModule = await import("child_process");
        const pathModule = await import("path");
        const fs5 = await import("fs");
        const { execSync: execSync3 } = execModule;
        const { join: join19, dirname: dirname8 } = pathModule;
        const modulePath = new URL(import.meta.url).pathname;
        const scriptDir = dirname8(modulePath);
        const bridgeScript = join19(scriptDir, "LotusPythonBridge.py");
        if (!fs5.existsSync(bridgeScript)) {
          throw new Error(`Bridge script not found: ${bridgeScript}`);
        }
        if (dataPath) {
          const absolutePath = getAbsolutePath(dataPath);
          if (!await fileExists(absolutePath)) {
            throw new Error(`Data file not found: ${dataPath}`);
          }
          console.log(`Data file validated: ${absolutePath}`);
        } else {
          throw new Error("No data path provided for Lotus query");
        }
        const args = {
          query: query2,
          data_path: getAbsolutePath(dataPath),
          dataSource,
          visualization: visualization || false,
          semantic_search: semanticSearch || false
        };
        console.log("Executing Python bridge with options:", JSON.stringify({
          ...args,
          data_path: args.data_path
          // Show the path, it's not sensitive
        }, null, 2));
        const bridgeResult = execSync3(`python3 "${bridgeScript}" '${JSON.stringify(args).replace(/'/g, "\\'")}'`).toString();
        console.log("Python bridge executed successfully");
        try {
          const lines = bridgeResult.trim().split("\n");
          const lastLine = lines[lines.length - 1];
          result = JSON.parse(lastLine);
          result = {
            ...result,
            metadata: {
              ...result.metadata || {},
              implementation: "python_bridge",
              dataSource: dataPath,
              processingTime: `${Date.now() - start}ms`,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            }
          };
          console.log("Successfully parsed Python bridge result");
        } catch (parseError) {
          console.error("Error parsing Python bridge result:", parseError);
          console.log("Raw bridge output:", bridgeResult);
          throw new Error(`Failed to parse bridge result: ${parseError.message}`);
        }
      } catch (bridgeError) {
        console.warn("Python bridge failed, trying next approach:", bridgeError.message);
        if (lotusPackageAvailable && Lotus && LOTUS_API_KEY) {
          try {
            console.log("Attempting to use native Lotus NPM package...");
            const options = {
              apiKey: LOTUS_API_KEY,
              dataPath: dataPath ? getAbsolutePath(dataPath) : void 0,
              dataSource,
              includeVisualization: visualization || false,
              useSemanticSearch: semanticSearch || false
            };
            const lotusClient = new Lotus.Client(options);
            console.log(`Executing query via NPM package: "${query2}"`);
            result = await lotusClient.executeQuery(query2);
            console.log("Query executed successfully with NPM package");
            result = {
              ...result,
              metadata: {
                ...result.metadata || {},
                implementation: "npm_package",
                dataSource: dataSource || (dataPath ? dataPath : "default"),
                processingTime: `${Date.now() - start}ms`,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              }
            };
          } catch (npmError) {
            console.warn("Native NPM package failed:", npmError.message);
            throw npmError;
          }
        } else {
          console.warn("NPM package not available, falling back to simulation");
          throw bridgeError;
        }
      }
      if (!result) {
        console.log("All integration approaches failed");
        throw new Error("Failed to execute Lotus query with real implementation. Please check that Lotus is properly configured.");
      }
      const output = {
        result,
        summary: `Executed query: ${query2}`,
        durationMs: Date.now() - start
      };
      yield {
        type: "result",
        resultForAssistant: this.renderResultForAssistant(output),
        data: output
      };
    } catch (error) {
      console.error("Critical error in Lotus tool:", error);
      console.error("Error in Lotus tool:", error);
      yield {
        type: "result",
        resultForAssistant: `Error executing query: ${error.message}`,
        data: {
          error: error.message,
          summary: `Failed to execute: ${query2}`,
          durationMs: Date.now() - start
        }
      };
    }
  }
};
function hasReadPermission2(path7) {
  return true;
}

// src/tools/DocETLTool/DocETLTool.tsx
import { Box as Box29, Text as Text37 } from "ink";
import React45 from "react";
import { z as z8 } from "zod";

// src/tools/DocETLTool/prompt.ts
var TOOL_NAME_FOR_PROMPT4 = "DocETLTool";
var DESCRIPTION10 = `
- LLM-powered document processing pipeline tool for complex document analysis
- Define and execute multi-stage data transformation workflows
- Process unstructured text into structured, normalized data
- Extract entities, relationships, and insights from document collections
- Supports document splitting, entity resolution, and semantic joining
- Integrate with Lotus for advanced data analysis on extracted information
- Process research papers, medical records, legal documents, and more
- Execute pipelines defined in YAML configuration files
- Supports both rule-based and LLM-powered data transformations
- Optimizes large document processing through chunking and parallel processing
`;
var CAPABILITIES3 = `
Core Capabilities of DocETL:

1. Document Processing Operations:
   - Map: Transform individual documents using LLM reasoning
   - Reduce: Combine multiple documents into aggregated insights
   - Resolve: Perform entity resolution across documents
   - Filter: Select documents based on LLM-powered criteria
   - Split/Gather: Process large documents in manageable chunks

2. Research Paper Analysis:
   - Extract methodologies, results, and conclusions from papers
   - Identify algorithms and technical approaches
   - Convert mathematical notation to executable code
   - Standardize terminology across different papers
   - Aggregate findings from multiple related papers

3. Code Documentation:
   - Extract functions, classes, and interfaces from code
   - Generate comprehensive documentation from code comments
   - Link documentation to specific code implementations
   - Identify dependencies and relationships between components
   - Create standardized API documentation

4. Technical Content Processing:
   - Extract key concepts and definitions from technical documents
   - Identify relationships between technical concepts
   - Convert technical descriptions to structured data
   - Standardize terminology across different sources
   - Generate summaries at different levels of technical depth

5. Pipeline Configuration:
   - YAML-based workflow definition for reproducible processing
   - Jinja2 templates for dynamic prompting
   - Schema validation for structured outputs
   - Multi-stage processing with intermediate results
   - Optimization for large document collections
`;
var USAGE_EXAMPLES3 = `
Example Usage Patterns:

1. Research Paper Implementation:
   - "Extract algorithms from this research paper and convert to Python code"
   - "Analyze the methodology section of these papers and identify common techniques"
   - "Convert the mathematical formulas in this paper to executable code"
   - "Extract the evaluation metrics and benchmark results from these papers"
   - "Identify the key innovations across this collection of papers"

2. Technical Documentation:
   - "Generate API documentation from our codebase"
   - "Extract class hierarchies and relationships from our source code"
   - "Create a technical glossary from our documentation"
   - "Identify inconsistencies in terminology across our technical docs"
   - "Generate a high-level architecture document from our code comments"

3. Knowledge Extraction:
   - "Extract the key concepts and definitions from this technical document"
   - "Identify relationships between different components in our architecture"
   - "Create a structured knowledge graph from our unstructured documentation"
   - "Extract implementation details from these design documents"
   - "Generate a technical specification from these requirements documents"

4. Code Analysis:
   - "Analyze our codebase and extract design patterns"
   - "Identify security vulnerabilities in our code"
   - "Extract the data models and schemas from our database code"
   - "Generate sequence diagrams from our code flow"
   - "Extract test cases and scenarios from our test suite"

5. Pipeline Definition:
   - "Create a DocETL pipeline to process our research papers"
   - "Optimize our existing document processing pipeline"
   - "Define a workflow to extract entities from our technical docs"
   - "Create a pipeline to convert our documentation to a structured format"
   - "Design a multi-stage workflow to analyze our codebase"
`;

// src/tools/DocETLTool/DocETLTool.tsx
init_log();
import "dotenv/config";
var docETLPackageAvailable = false;
var docETLInitialized = false;
var DocETL = null;
var DOCETL_API_KEY = process.env.DOCETL_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
var DOCETL_MODEL = process.env.DOCETL_MODEL || "gpt-4";
function initializeDocETLEnvironment() {
  if (docETLInitialized) return;
  if (!DOCETL_API_KEY) {
    console.warn("No DOCETL_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY found in environment. DocETL will use simulation mode.");
    return;
  }
  try {
    process.env.DOCETL_API_KEY = DOCETL_API_KEY;
    process.env.DOCETL_MODEL = DOCETL_MODEL;
    try {
      DocETL = __require("docetl");
      docETLPackageAvailable = true;
      console.log("DocETL package loaded successfully");
    } catch (error) {
      console.warn("DocETL package not available, using simulated results");
    }
    docETLInitialized = true;
  } catch (error) {
    console.error("Failed to initialize DocETL environment:", error);
  }
}
if (!docETLInitialized) {
  initializeDocETLEnvironment();
}
var inputSchema8 = z8.strictObject({
  operation: z8.string().describe("The DocETL operation to perform (map, reduce, resolve, filter, etc.)"),
  pipelinePath: z8.string().optional().describe("Path to YAML pipeline definition file"),
  dataPath: z8.string().optional().describe("Path to input data file or directory"),
  outputPath: z8.string().optional().describe("Path to write output data"),
  prompt: z8.string().optional().describe("Custom prompt to use for the operation"),
  schema: z8.string().optional().describe("Output schema definition in JSON format"),
  optimize: z8.boolean().optional().describe("Whether to optimize the pipeline")
});
var DocETLTool = {
  name: TOOL_NAME_FOR_PROMPT4,
  async description() {
    return `${DESCRIPTION10}

${CAPABILITIES3}

${USAGE_EXAMPLES3}`;
  },
  userFacingName() {
    return "DocProcessor";
  },
  inputSchema: inputSchema8,
  isReadOnly() {
    return false;
  },
  async isEnabled() {
    if (docETLPackageAvailable) {
      return true;
    }
    try {
      const { execSync: execSync3 } = __require("child_process");
      try {
        const output = execSync3("ls -la ~/Desktop/claudecode/custom-claude-cli/claude-code/docetl-env311").toString();
        console.log("DocETL virtual environment found, checking if docetl is installed");
        const docetlVersion = execSync3('source ~/Desktop/claudecode/custom-claude-cli/claude-code/docetl-env311/bin/activate && python -c "import docetl; print(docetl.__version__)"').toString().trim();
        console.log(`DocETL package found, version: ${docetlVersion}`);
        docETLPackageAvailable = true;
        return true;
      } catch (error) {
        console.warn(`DocETL Python environment check failed: ${error.message}`);
        return false;
      }
    } catch (error) {
      if (!docETLInitialized) {
        console.warn("DocETL package not available. Tool will be disabled.");
      }
      return false;
    }
  },
  needsPermissions({ dataPath, outputPath, pipelinePath }) {
    const paths2 = [dataPath, outputPath, pipelinePath].filter(Boolean);
    return paths2.some((path7) => !hasReadPermission3(path7));
  },
  async prompt() {
    return DESCRIPTION10;
  },
  renderToolUseMessage({ operation, pipelinePath, dataPath, outputPath, prompt, schema, optimize }, { verbose }) {
    let message = `operation: "${operation}"`;
    if (pipelinePath) {
      const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(pipelinePath);
      message += `, pipelinePath: "${verbose ? absolutePath : relativePath}"`;
    }
    if (dataPath) {
      const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(dataPath);
      message += `, dataPath: "${verbose ? absolutePath : relativePath}"`;
    }
    if (outputPath) {
      const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(outputPath);
      message += `, outputPath: "${verbose ? absolutePath : relativePath}"`;
    }
    if (prompt) {
      message += `, prompt: "${prompt.substring(0, 30)}${prompt.length > 30 ? "..." : ""}"`;
    }
    if (schema) {
      message += `, schema: defined`;
    }
    if (optimize !== void 0) {
      message += `, optimize: ${optimize}`;
    }
    return message;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React45.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(output) {
    if (typeof output === "string") {
      output = JSON.parse(output);
    }
    return /* @__PURE__ */ React45.createElement(Box29, { justifyContent: "space-between", width: "100%" }, /* @__PURE__ */ React45.createElement(Box29, { flexDirection: "row" }, /* @__PURE__ */ React45.createElement(Text37, null, "\xA0\xA0\u23BF \xA0DocETL operation: "), /* @__PURE__ */ React45.createElement(Text37, { bold: true }, output.summary)), /* @__PURE__ */ React45.createElement(Cost, { costUSD: 0, durationMs: output.durationMs, debug: false }));
  },
  renderResultForAssistant(output) {
    try {
      if (typeof output.result === "string") {
        return output.result;
      } else {
        return JSON.stringify(output.result, null, 2);
      }
    } catch (error) {
      return `Error formatting result: ${error.message}`;
    }
  },
  async *call({ operation, pipelinePath, dataPath, outputPath, prompt, schema, optimize }, { abortController }) {
    const start = Date.now();
    try {
      if (!docETLInitialized) {
        initializeDocETLEnvironment();
        docETLInitialized = true;
      }
      const debugInfo = {
        docETLPackageAvailable,
        docETLInitialized,
        apiKeyAvailable: !!DOCETL_API_KEY,
        model: DOCETL_MODEL,
        operation,
        pipelinePath: pipelinePath || "none",
        dataPath: dataPath || "none",
        outputPath: outputPath || "none",
        hasPrompt: !!prompt,
        hasSchema: !!schema,
        optimize: optimize || false
      };
      console.log("DocETL Tool Debug Info:", JSON.stringify(debugInfo, null, 2));
      let result;
      if (docETLPackageAvailable && DocETL && DOCETL_API_KEY) {
        try {
          console.log("Attempting to use real DocETL implementation...");
          const pathsToCheck = [dataPath, pipelinePath].filter(Boolean);
          for (const path7 of pathsToCheck) {
            const absolutePath = getAbsolutePath(path7);
            if (!await fileExists(absolutePath)) {
              throw new Error(`File not found: ${path7}`);
            }
            console.log(`File validated: ${absolutePath}`);
          }
          const options = {
            apiKey: DOCETL_API_KEY,
            model: DOCETL_MODEL,
            operation: operation.toLowerCase(),
            pipelineFile: pipelinePath ? getAbsolutePath(pipelinePath) : void 0,
            dataPath: dataPath ? getAbsolutePath(dataPath) : void 0,
            outputPath: outputPath ? getAbsolutePath(outputPath) : void 0,
            optimizePipeline: optimize || false
          };
          console.log("Creating DocETL client with options:", JSON.stringify({
            ...options,
            apiKey: options.apiKey ? "[REDACTED]" : void 0
          }, null, 2));
          const docETLClient = new DocETL.Client(options);
          if (prompt) {
            console.log(`Setting custom prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}"`);
            docETLClient.setPrompt(prompt);
          }
          if (schema) {
            console.log("Setting custom schema");
            docETLClient.setSchema(schema);
          }
          console.log(`Executing operation: "${operation}"`);
          result = await docETLClient.execute();
          console.log("Operation executed successfully with real implementation");
          result = {
            ...result,
            metadata: {
              ...result.metadata || {},
              implementation: "real",
              duration: Date.now() - start
            }
          };
        } catch (docETLError) {
          console.error("Error using real DocETL implementation:", docETLError);
          logError(`Error using real DocETL implementation: ${docETLError.message}.`);
          docETLError.stack && logError(docETLError.stack);
          throw docETLError;
        }
      } else {
        console.log("Trying to use DocETL virtual environment");
        try {
          const { execSync: execSync3 } = __require("child_process");
          const fs5 = __require("fs");
          const path7 = __require("path");
          const pathsToCheck = [dataPath, pipelinePath].filter(Boolean);
          for (const p of pathsToCheck) {
            const absolutePath = path7.resolve(p);
            if (!fs5.existsSync(absolutePath)) {
              throw new Error(`File not found: ${p}`);
            }
            console.log(`File validated: ${absolutePath}`);
          }
          let tempPipelineFile = null;
          if (!pipelinePath) {
            tempPipelineFile = `/tmp/docetl_pipeline_${Date.now()}.yaml`;
            const pipelineContent = `
default_model: ${DOCETL_MODEL || "gpt-4o-mini"}

datasets:
  documents:
    path: "${dataPath ? path7.resolve(dataPath) : "data.json"}"
    type: file

operations:
  - name: process_documents
    type: ${operation.toLowerCase()}
    ${optimize ? "optimize: true" : ""}
    ${prompt ? `prompt: |
      ${prompt.replace(/\n/g, "\n      ")}` : ""}
    ${schema ? `output:
      schema: ${schema}` : ""}

pipeline:
  steps:
    - name: document_processing
      input: documents
      operations:
        - process_documents
  output:
    type: file
    path: ${outputPath || "docetl_output.json"}
    intermediate_dir: intermediate_results
`;
            fs5.writeFileSync(tempPipelineFile, pipelineContent);
            console.log(`Created temporary pipeline file: ${tempPipelineFile}`);
            pipelinePath = tempPipelineFile;
          }
          console.log("Running DocETL command with virtual environment");
          const cmd = `source ~/Desktop/claudecode/custom-claude-cli/claude-code/docetl-env311/bin/activate && DOCETL_MODEL=${DOCETL_MODEL || "gpt-4o-mini"} OPENAI_API_KEY=${DOCETL_API_KEY} docetl run "${pipelinePath}"`;
          console.log(`Executing: ${cmd.replace(DOCETL_API_KEY, "[REDACTED]")}`);
          const output2 = execSync3(cmd).toString();
          console.log("DocETL command executed successfully");
          let resultFile = outputPath;
          if (!resultFile) {
            resultFile = "docetl_output.json";
          }
          if (fs5.existsSync(resultFile)) {
            const resultContent = fs5.readFileSync(resultFile, "utf-8");
            result = JSON.parse(resultContent);
            console.log(`Read results from ${resultFile}`);
          } else {
            result = {
              operation,
              success: true,
              output: output2,
              metadata: {
                implementation: "python_env",
                duration: Date.now() - start
              }
            };
          }
          if (tempPipelineFile && fs5.existsSync(tempPipelineFile)) {
            fs5.unlinkSync(tempPipelineFile);
            console.log(`Removed temporary pipeline file: ${tempPipelineFile}`);
          }
        } catch (error) {
          console.error("Error using DocETL virtual environment:", error);
          throw new Error(`Failed to execute DocETL operation: ${error.message}`);
        }
      }
      const output = {
        result,
        summary: `Executed ${operation} operation on ${result.documentsProcessed || "multiple"} documents`,
        durationMs: Date.now() - start
      };
      yield {
        type: "result",
        resultForAssistant: this.renderResultForAssistant(output),
        data: output
      };
    } catch (error) {
      console.error("Critical error in DocETL tool:", error);
      yield {
        type: "result",
        resultForAssistant: `Error executing DocETL operation: ${error.message}`,
        data: {
          error: error.message,
          summary: `Failed to execute ${operation} operation`,
          durationMs: Date.now() - start
        }
      };
    }
  }
};
function hasReadPermission3(path7) {
  return true;
}

// src/tools/GlobTool/GlobTool.tsx
import { Box as Box30, Text as Text38 } from "ink";
import React46 from "react";
import { z as z9 } from "zod";
init_state();
import { isAbsolute as isAbsolute7, relative as relative6, resolve as resolve10 } from "path";
var inputSchema9 = z9.strictObject({
  pattern: z9.string().describe("The glob pattern to match files against"),
  path: z9.string().optional().describe(
    "The directory to search in. Defaults to the current working directory."
  )
});
var GlobTool = {
  name: TOOL_NAME_FOR_PROMPT,
  async description() {
    return DESCRIPTION3;
  },
  userFacingName() {
    return "Search";
  },
  inputSchema: inputSchema9,
  async isEnabled() {
    return true;
  },
  isReadOnly() {
    return true;
  },
  needsPermissions({ path: path7 }) {
    return !hasReadPermission(path7 || getCwd());
  },
  async prompt() {
    return DESCRIPTION3;
  },
  renderToolUseMessage({ pattern, path: path7 }, { verbose }) {
    const absolutePath = path7 ? isAbsolute7(path7) ? path7 : resolve10(getCwd(), path7) : void 0;
    const relativePath = absolutePath ? relative6(getCwd(), absolutePath) : void 0;
    return `pattern: "${pattern}"${relativePath || verbose ? `, path: "${verbose ? absolutePath : relativePath}"` : ""}`;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React46.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(output) {
    if (typeof output === "string") {
      output = JSON.parse(output);
    }
    return /* @__PURE__ */ React46.createElement(Box30, { justifyContent: "space-between", width: "100%" }, /* @__PURE__ */ React46.createElement(Box30, { flexDirection: "row" }, /* @__PURE__ */ React46.createElement(Text38, null, "\xA0\xA0\u23BF \xA0Found "), /* @__PURE__ */ React46.createElement(Text38, { bold: true }, output.numFiles, " "), /* @__PURE__ */ React46.createElement(Text38, null, output.numFiles === 0 || output.numFiles > 1 ? "files" : "file")), /* @__PURE__ */ React46.createElement(Cost, { costUSD: 0, durationMs: output.durationMs, debug: false }));
  },
  async *call({ pattern, path: path7 }, { abortController }) {
    const start = Date.now();
    const { files, truncated } = await glob(
      pattern,
      path7 ?? getCwd(),
      { limit: 100, offset: 0 },
      abortController.signal
    );
    const output = {
      filenames: files,
      durationMs: Date.now() - start,
      numFiles: files.length,
      truncated
    };
    yield {
      type: "result",
      resultForAssistant: this.renderResultForAssistant(output),
      data: output
    };
  },
  renderResultForAssistant(output) {
    let result = output.filenames.join("\n");
    if (output.filenames.length === 0) {
      result = "No files found";
    } else if (output.truncated) {
      result += "\n(Results are truncated. Consider using a more specific path or pattern.)";
    }
    return result;
  }
};

// src/tools/SelfImproveTool/SelfImproveTool.tsx
init_config();
import { join as join16 } from "path";
import { randomUUID as randomUUID3 } from "crypto";
import { writeFileSync as writeFileSync10, readFileSync as readFileSync14, existsSync as existsSync17, mkdirSync as mkdirSync7 } from "fs";
var inputSchema10 = z10.strictObject({
  analysisType: z10.enum(["codebase", "architecture", "performance", "extensibility", "custom"]),
  targetPath: z10.string().optional().describe("Path to analyze, defaults to current directory"),
  customPrompt: z10.string().optional().describe("Custom analysis prompt when using the custom analysis type"),
  outputFormat: z10.enum(["json", "markdown", "yaml"]).optional().default("markdown"),
  depthLevel: z10.enum(["shallow", "medium", "deep"]).optional().default("medium"),
  scope: z10.string().optional().describe('Optional scope to limit analysis, e.g. "tools", "commands"')
});
var CACHE_DIR = join16(getCwd(), ".claude-analysis-cache");
var SelfImproveTool = {
  name: "SelfImproveTool",
  async description() {
    return `${DESCRIPTION8}

${CAPABILITIES}

${USAGE_EXAMPLES}`;
  },
  userFacingName() {
    return "SelfImprove";
  },
  inputSchema: inputSchema10,
  isReadOnly() {
    return true;
  },
  async isEnabled() {
    try {
      const apiKey = getAnthropicApiKey();
      const lotusEnabled = await LotusTool.isEnabled();
      const docETLEnabled = await DocETLTool.isEnabled();
      return !!apiKey && lotusEnabled && docETLEnabled;
    } catch (error) {
      logError(`Error checking SelfImproveTool availability: ${error}`);
      return false;
    }
  },
  needsPermissions({ targetPath }) {
    return targetPath ? !hasReadPermission4(targetPath) : false;
  },
  async prompt() {
    return `Use this tool to analyze and improve Claude Code's own codebase. It leverages Lotus and DocETL to understand code architecture, identify patterns, and suggest improvements.

Key capabilities:
- Analyzing codebase architecture and patterns
- Identifying optimization opportunities
- Suggesting feature extensions
- Discovering implementation patterns for new features

Example usage:
- "Analyze the tools integration architecture in our codebase"
- "Identify bottlenecks in our error handling system"
- "Discover patterns for implementing new CLI commands"
- "Generate a self-improvement plan for Claude Code"
`;
  },
  renderToolUseMessage({ analysisType, targetPath, customPrompt, outputFormat, depthLevel, scope }, { verbose }) {
    let message = `analysis: "${analysisType}"`;
    if (targetPath) {
      message += `, targetPath: "${targetPath}"`;
    }
    if (customPrompt) {
      message += `, customPrompt: "${customPrompt}"`;
    }
    if (outputFormat !== "markdown") {
      message += `, outputFormat: "${outputFormat}"`;
    }
    if (depthLevel !== "medium") {
      message += `, depthLevel: "${depthLevel}"`;
    }
    if (scope) {
      message += `, scope: "${scope}"`;
    }
    return message;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React47.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(output) {
    if (typeof output === "string") {
      output = JSON.parse(output);
    }
    return /* @__PURE__ */ React47.createElement(Box31, { justifyContent: "space-between", width: "100%" }, /* @__PURE__ */ React47.createElement(Box31, { flexDirection: "row" }, /* @__PURE__ */ React47.createElement(Text39, null, "\xA0\xA0\u23BF \xA0Analysis complete: "), /* @__PURE__ */ React47.createElement(Text39, { bold: true }, output.summary)), /* @__PURE__ */ React47.createElement(Cost, { costUSD: 0, durationMs: output.durationMs, debug: false }));
  },
  renderResultForAssistant(output) {
    try {
      if (typeof output.result === "string") {
        return output.result;
      } else {
        return JSON.stringify(output.result, null, 2);
      }
    } catch (error) {
      return `Error formatting result: ${error.message}`;
    }
  },
  async *call(input, context) {
    const start = Date.now();
    try {
      if (!existsSync17(CACHE_DIR)) {
        mkdirSync7(CACHE_DIR, { recursive: true });
      }
      const targetPath = input.targetPath ? getAbsolutePath(input.targetPath) : getCwd();
      const cacheKey = `${input.analysisType}-${input.depthLevel}-${input.scope || "all"}-${input.outputFormat}`;
      const cacheFile = join16(CACHE_DIR, `${cacheKey}.json`);
      if (existsSync17(cacheFile)) {
        const stats = existsSync17(cacheFile) ? new Date(readFileSync14(cacheFile).mtime) : null;
        const cacheAge = stats ? Date.now() - stats.getTime() : Infinity;
        const MAX_CACHE_AGE = 24 * 60 * 60 * 1e3;
        if (cacheAge < MAX_CACHE_AGE) {
          const cachedResult = JSON.parse(readFileSync14(cacheFile, "utf8"));
          yield {
            type: "result",
            resultForAssistant: this.renderResultForAssistant(cachedResult),
            data: cachedResult
          };
          return;
        }
      }
      const globResults = await collectFilesForAnalysis(input, targetPath, context);
      const lotusResults = await analyzeLotusPatterns(input, targetPath, context);
      const docETLResults = await analyzeThroughDocETL(input, targetPath, context);
      const combinedResults = await processResults(input, globResults, lotusResults, docETLResults);
      writeFileSync10(cacheFile, JSON.stringify(combinedResults, null, 2));
      const output = {
        result: combinedResults,
        summary: `Completed ${input.analysisType} analysis at ${input.depthLevel} depth`,
        durationMs: Date.now() - start
      };
      yield {
        type: "result",
        resultForAssistant: this.renderResultForAssistant(output),
        data: output
      };
    } catch (error) {
      logError(`Error in SelfImproveTool: ${error}`);
      yield {
        type: "result",
        resultForAssistant: `Error performing analysis: ${error.message}`,
        data: {
          error: error.message,
          summary: `Failed to complete ${input.analysisType} analysis`,
          durationMs: Date.now() - start
        }
      };
    }
  }
};
function hasReadPermission4(path7) {
  try {
    return existsSync17(path7) && true;
  } catch {
    return false;
  }
}
async function collectFilesForAnalysis(input, targetPath, context) {
  const patterns = [];
  if (input.scope) {
    patterns.push(`**/${input.scope}/**/*.(ts|tsx|js|jsx)`);
  } else {
    patterns.push("**/*.(ts|tsx|js|jsx)");
  }
  const excludePatterns = ["**/node_modules/**", "**/dist/**", "**/build/**"];
  const files = [];
  for (const pattern of patterns) {
    for await (const result of GlobTool.call({ pattern, path: targetPath }, context)) {
      if (result.type === "result" && result.data.files) {
        files.push(...result.data.files);
      }
    }
  }
  return files;
}
async function analyzeLotusPatterns(input, targetPath, context) {
  let query2;
  switch (input.analysisType) {
    case "codebase":
      query2 = "Analyze the overall codebase architecture and identify core components and their relationships";
      break;
    case "architecture":
      query2 = "Identify the key architectural patterns used in the codebase, focusing on how components interact";
      break;
    case "performance":
      query2 = "Locate potential performance bottlenecks and optimization opportunities in the codebase";
      break;
    case "extensibility":
      query2 = "Analyze how the codebase can be extended and identify patterns for adding new features";
      break;
    case "custom":
      query2 = input.customPrompt || "Analyze the codebase";
      break;
  }
  if (input.scope) {
    query2 += ` (focusing on the ${input.scope} area)`;
  }
  if (input.depthLevel === "shallow") {
    query2 += " (high-level overview)";
  } else if (input.depthLevel === "deep") {
    query2 += " (detailed in-depth analysis)";
  }
  const lotusResults = [];
  for await (const result of LotusTool.call({
    query: query2,
    dataPath: targetPath,
    semanticSearch: true
  }, context)) {
    if (result.type === "result" && result.data) {
      lotusResults.push(result.data);
    }
  }
  return lotusResults;
}
async function analyzeThroughDocETL(input, targetPath, context) {
  const pipelinePath = join16(CACHE_DIR, `pipeline-${randomUUID3()}.yaml`);
  const pipelineContent = generateDocETLPipeline(input);
  writeFileSync10(pipelinePath, pipelineContent);
  const docETLResults = [];
  for await (const result of DocETLTool.call({
    operation: "run",
    dataPath: targetPath,
    pipelinePath,
    optimize: true
  }, context)) {
    if (result.type === "result" && result.data) {
      docETLResults.push(result.data);
    }
  }
  return docETLResults;
}
function generateDocETLPipeline(input) {
  const depth = input.depthLevel === "shallow" ? "Overview" : input.depthLevel === "deep" ? "Detailed" : "Standard";
  const analysisType = input.analysisType === "custom" ? "Custom" : input.analysisType.charAt(0).toUpperCase() + input.analysisType.slice(1);
  const prompt = input.customPrompt || `Analyze the codebase for ${analysisType} insights`;
  return `
default_model: claude-3-7-sonnet-20250219

datasets:
  code:
    path: ./
    type: directory

operations:
  - name: extract_structure
    type: map
    optimize: true
    output:
      schema:
        components: "list[{name: string, type: string, responsibility: string}]"
        architecture: "object"
        patterns: "list[string]"
    prompt: |
      Analyze this code and extract the key components, architecture and patterns:
      {{ input.text }}

  - name: identify_integration_points
    type: map
    input: extract_structure.output
    output:
      schema:
        integration_points: "list[{source: string, target: string, relationship: string}]"
        improvement_opportunities: "list[string]"
    prompt: |
      Based on this code analysis, identify the integration points between components
      and potential improvement opportunities:
      {{ input }}

  - name: generate_${input.outputFormat}_report
    type: reduce
    input: identify_integration_points.output
    output:
      format: ${input.outputFormat}
    prompt: |
      Create a ${depth} ${analysisType} Analysis report that explains how the components integrate
      and identifies improvement opportunities:
      
      Analysis depth: ${input.depthLevel}
      ${input.scope ? `Analysis scope: ${input.scope}` : ""}
      
      ${prompt}
      
      Input: {{ input }}
`;
}
async function processResults(input, globResults, lotusResults, docETLResults) {
  switch (input.outputFormat) {
    case "json":
      return {
        analysisType: input.analysisType,
        depthLevel: input.depthLevel,
        scope: input.scope || "all",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        filesAnalyzed: globResults.length,
        lotusInsights: lotusResults,
        docETLAnalysis: docETLResults
      };
    case "yaml":
      return {
        analysisType: input.analysisType,
        depthLevel: input.depthLevel,
        scope: input.scope || "all",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        filesAnalyzed: globResults.length,
        lotusInsights: lotusResults,
        docETLAnalysis: docETLResults
      };
    case "markdown":
    default:
      let markdown = `# ${input.analysisType.charAt(0).toUpperCase() + input.analysisType.slice(1)} Analysis Report

`;
      markdown += `- **Analysis Type:** ${input.analysisType}
`;
      markdown += `- **Depth Level:** ${input.depthLevel}
`;
      markdown += `- **Scope:** ${input.scope || "Full Codebase"}
`;
      markdown += `- **Files Analyzed:** ${globResults.length}
`;
      markdown += `- **Timestamp:** ${(/* @__PURE__ */ new Date()).toISOString()}

`;
      markdown += `## Key Insights

`;
      if (lotusResults.length > 0) {
        markdown += `### Semantic Analysis

`;
        lotusResults.forEach((result) => {
          if (typeof result === "object") {
            markdown += JSON.stringify(result, null, 2) + "\n\n";
          } else {
            markdown += result + "\n\n";
          }
        });
      }
      if (docETLResults.length > 0) {
        markdown += `### Structural Analysis

`;
        docETLResults.forEach((result) => {
          if (typeof result === "object") {
            markdown += JSON.stringify(result, null, 2) + "\n\n";
          } else {
            markdown += result + "\n\n";
          }
        });
      }
      return markdown;
  }
}

// src/commands/self_improve.ts
var self_improve_default = {
  type: "local",
  name: "self-improve",
  description: "Meta-programming for analyzing and improving Claude Code",
  isEnabled: true,
  isHidden: process.env.USER_TYPE !== "ant",
  userFacingName() {
    return "self-improve";
  },
  async call(args, context) {
    const analysisMatch = args.match(/analysis\s*=\s*["']?(codebase|architecture|performance|extensibility|custom)["']?/);
    const scopeMatch = args.match(/scope\s*=\s*["']?([\w\-_\/]+)["']?/);
    const depthMatch = args.match(/depth\s*=\s*["']?(shallow|medium|deep)["']?/);
    const customPromptMatch = args.match(/prompt\s*=\s*["']?([^"']+)["']?/);
    const outputFormatMatch = args.match(/format\s*=\s*["']?(markdown|json|yaml)["']?/);
    if (!analysisMatch) {
      return `Error: Missing required parameter 'analysis'. Usage: /self-improve analysis="architecture" [scope="tools"] [depth="medium"] [format="markdown"] [prompt="custom prompt"]`;
    }
    const analysisType = analysisMatch[1];
    const scope = scopeMatch ? scopeMatch[1] : void 0;
    const depthLevel = depthMatch ? depthMatch[1] : "medium";
    const customPrompt = customPromptMatch ? customPromptMatch[1] : void 0;
    const outputFormat = outputFormatMatch ? outputFormatMatch[1] : "markdown";
    try {
      console.log(`Starting ${analysisType} analysis with ${depthLevel} depth...`);
      let result;
      for await (const toolResult of SelfImproveTool.call({
        analysisType,
        scope,
        depthLevel,
        customPrompt,
        outputFormat
      }, {
        ...context,
        messageId: void 0,
        readFileTimestamps: {}
      })) {
        if (toolResult.type === "result") {
          result = toolResult.data;
          break;
        }
      }
      if (result && result.result) {
        if (typeof result.result === "object") {
          return `Analysis complete in ${result.durationMs}ms:

${JSON.stringify(result.result, null, 2)}`;
        } else {
          return `Analysis complete in ${result.durationMs}ms:

${result.result}`;
        }
      } else {
        return `Analysis failed or returned empty results.`;
      }
    } catch (error) {
      return `Error performing analysis: ${error.message}`;
    }
  }
};

// src/commands/mcp_add.tsx
import React51 from "react";
import { render as render4 } from "ink";

// src/components/MCPServerWizard.tsx
import React50, { useState as useState13 } from "react";
import { Box as Box33, Text as Text42, useInput as useInput11 } from "ink";
import { Select as Select6 } from "@inkjs/ui";

// src/services/mcpClient.ts
init_config();
init_state();
init_json();
import { zipObject } from "lodash-es";
import { existsSync as existsSync18, readFileSync as readFileSync15, writeFileSync as writeFileSync11 } from "fs";
import { join as join17 } from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  CallToolResultSchema,
  ListPromptsResultSchema,
  ListToolsResultSchema
} from "@modelcontextprotocol/sdk/types.js";
import { memoize as memoize12, pickBy } from "lodash-es";

// src/tools/MCPTool/MCPTool.tsx
import { Box as Box32, Text as Text40 } from "ink";
import * as React48 from "react";
import { z as z11 } from "zod";

// src/tools/MCPTool/prompt.ts
var PROMPT6 = "";
var DESCRIPTION11 = "";

// src/tools/MCPTool/MCPTool.tsx
var inputSchema11 = z11.object({}).passthrough();
var MCPTool = {
  async isEnabled() {
    return true;
  },
  isReadOnly() {
    return false;
  },
  // Overridden in mcpClient.ts
  name: "mcp",
  // Overridden in mcpClient.ts
  async description() {
    return DESCRIPTION11;
  },
  // Overridden in mcpClient.ts
  async prompt() {
    return PROMPT6;
  },
  inputSchema: inputSchema11,
  // Overridden in mcpClient.ts
  async *call() {
    yield {
      type: "result",
      data: "",
      resultForAssistant: ""
    };
  },
  needsPermissions() {
    return true;
  },
  renderToolUseMessage(input) {
    return Object.entries(input).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(", ");
  },
  // Overridden in mcpClient.ts
  userFacingName: () => "mcp",
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React48.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(output, { verbose }) {
    if (Array.isArray(output)) {
      return /* @__PURE__ */ React48.createElement(Box32, { flexDirection: "column" }, output.map((item, i) => {
        if (item.type === "image") {
          return /* @__PURE__ */ React48.createElement(
            Box32,
            {
              key: i,
              justifyContent: "space-between",
              overflowX: "hidden",
              width: "100%"
            },
            /* @__PURE__ */ React48.createElement(Box32, { flexDirection: "row" }, /* @__PURE__ */ React48.createElement(Text40, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React48.createElement(Text40, null, "[Image]"))
          );
        }
        const lines2 = item.text.split("\n").length;
        return /* @__PURE__ */ React48.createElement(
          OutputLine,
          {
            key: i,
            content: item.text,
            lines: lines2,
            verbose
          }
        );
      }));
    }
    if (!output) {
      return /* @__PURE__ */ React48.createElement(Box32, { justifyContent: "space-between", overflowX: "hidden", width: "100%" }, /* @__PURE__ */ React48.createElement(Box32, { flexDirection: "row" }, /* @__PURE__ */ React48.createElement(Text40, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React48.createElement(Text40, { color: getTheme().secondaryText }, "(No content)")));
    }
    const lines = output.split("\n").length;
    return /* @__PURE__ */ React48.createElement(OutputLine, { content: output, lines, verbose });
  },
  renderResultForAssistant(content) {
    return content;
  }
};

// src/services/mcpClient.ts
init_log();
init_statsig();
function parseEnvVars(rawEnvArgs) {
  const parsedEnv = {};
  if (rawEnvArgs) {
    for (const envStr of rawEnvArgs) {
      const [key, ...valueParts] = envStr.split("=");
      if (!key || valueParts.length === 0) {
        throw new Error(
          `Invalid environment variable format: ${envStr}, environment variables should be added as: -e KEY1=value1 -e KEY2=value2`
        );
      }
      parsedEnv[key] = valueParts.join("=");
    }
  }
  return parsedEnv;
}
var VALID_SCOPES = ["project", "global", "mcprc"];
var EXTERNAL_SCOPES = ["project", "global"];
function ensureConfigScope(scope) {
  if (!scope) return "project";
  const scopesToCheck = process.env.USER_TYPE === "external" ? EXTERNAL_SCOPES : VALID_SCOPES;
  if (!scopesToCheck.includes(scope)) {
    throw new Error(
      `Invalid scope: ${scope}. Must be one of: ${scopesToCheck.join(", ")}`
    );
  }
  return scope;
}
function addMcpServer(name, server, scope = "project") {
  if (scope === "mcprc") {
    if (false) {
      addMcprcServerForTesting(name, server);
    } else {
      const mcprcPath = join17(getCwd(), ".mcprc");
      let mcprcConfig = {};
      if (existsSync18(mcprcPath)) {
        try {
          const mcprcContent = readFileSync15(mcprcPath, "utf-8");
          const existingConfig = safeParseJSON(mcprcContent);
          if (existingConfig && typeof existingConfig === "object") {
            mcprcConfig = existingConfig;
          }
        } catch {
        }
      }
      mcprcConfig[name] = server;
      try {
        writeFileSync11(mcprcPath, JSON.stringify(mcprcConfig, null, 2), "utf-8");
      } catch (error) {
        throw new Error(`Failed to write to .mcprc: ${error}`);
      }
    }
  } else if (scope === "global") {
    const config3 = getGlobalConfig();
    if (!config3.mcpServers) {
      config3.mcpServers = {};
    }
    config3.mcpServers[name] = server;
    saveGlobalConfig(config3);
  } else {
    const config3 = getCurrentProjectConfig();
    if (!config3.mcpServers) {
      config3.mcpServers = {};
    }
    config3.mcpServers[name] = server;
    saveCurrentProjectConfig(config3);
  }
}
function removeMcpServer(name, scope = "project") {
  if (scope === "mcprc") {
    if (false) {
      removeMcprcServerForTesting(name);
    } else {
      const mcprcPath = join17(getCwd(), ".mcprc");
      if (!existsSync18(mcprcPath)) {
        throw new Error("No .mcprc file found in this directory");
      }
      try {
        const mcprcContent = readFileSync15(mcprcPath, "utf-8");
        const mcprcConfig = safeParseJSON(mcprcContent);
        if (!mcprcConfig || typeof mcprcConfig !== "object" || !mcprcConfig[name]) {
          throw new Error(`No MCP server found with name: ${name} in .mcprc`);
        }
        delete mcprcConfig[name];
        writeFileSync11(mcprcPath, JSON.stringify(mcprcConfig, null, 2), "utf-8");
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Failed to remove from .mcprc: ${error}`);
      }
    }
  } else if (scope === "global") {
    const config3 = getGlobalConfig();
    if (!config3.mcpServers?.[name]) {
      throw new Error(`No global MCP server found with name: ${name}`);
    }
    delete config3.mcpServers[name];
    saveGlobalConfig(config3);
  } else {
    const config3 = getCurrentProjectConfig();
    if (!config3.mcpServers?.[name]) {
      throw new Error(`No local MCP server found with name: ${name}`);
    }
    delete config3.mcpServers[name];
    saveCurrentProjectConfig(config3);
  }
}
function listMCPServers() {
  const globalConfig = getGlobalConfig();
  const mcprcConfig = getMcprcConfig();
  const projectConfig = getCurrentProjectConfig();
  return {
    ...globalConfig.mcpServers ?? {},
    ...mcprcConfig ?? {},
    // mcprc configs override global ones
    ...projectConfig.mcpServers ?? {}
    // Project configs override mcprc ones
  };
}
function getMcpServer(name) {
  const projectConfig = getCurrentProjectConfig();
  const mcprcConfig = getMcprcConfig();
  const globalConfig = getGlobalConfig();
  if (projectConfig.mcpServers?.[name]) {
    return { ...projectConfig.mcpServers[name], scope: "project" };
  }
  if (mcprcConfig?.[name]) {
    return { ...mcprcConfig[name], scope: "mcprc" };
  }
  if (globalConfig.mcpServers?.[name]) {
    return { ...globalConfig.mcpServers[name], scope: "global" };
  }
  return void 0;
}
async function connectToServer(name, serverRef) {
  const transport = serverRef.type === "sse" ? new SSEClientTransport(new URL(serverRef.url)) : new StdioClientTransport({
    command: serverRef.command,
    args: serverRef.args,
    env: {
      ...process.env,
      ...serverRef.env
    },
    stderr: "pipe"
    // prevents error output from the MCP server from printing to the UI
  });
  const client2 = new Client(
    {
      name: "claude",
      version: "0.1.0"
    },
    {
      capabilities: {}
    }
  );
  const CONNECTION_TIMEOUT_MS = 5e3;
  const connectPromise = client2.connect(transport);
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new Error(
          `Connection to MCP server "${name}" timed out after ${CONNECTION_TIMEOUT_MS}ms`
        )
      );
    }, CONNECTION_TIMEOUT_MS);
    connectPromise.then(
      () => clearTimeout(timeoutId),
      () => clearTimeout(timeoutId)
    );
  });
  await Promise.race([connectPromise, timeoutPromise]);
  if (serverRef.type === "stdio") {
    ;
    transport.stderr?.on("data", (data) => {
      const errorText = data.toString().trim();
      if (errorText) {
        logMCPError(name, `Server stderr: ${errorText}`);
      }
    });
  }
  return client2;
}
function getMcprcServerStatus(serverName) {
  const config3 = getCurrentProjectConfig();
  if (config3.approvedMcprcServers?.includes(serverName)) {
    return "approved";
  }
  if (config3.rejectedMcprcServers?.includes(serverName)) {
    return "rejected";
  }
  return "pending";
}
var getClients = memoize12(async () => {
  if (process.env.CI && true) {
    return [];
  }
  const globalServers = getGlobalConfig().mcpServers ?? {};
  const mcprcServers = getMcprcConfig();
  const projectServers = getCurrentProjectConfig().mcpServers ?? {};
  const approvedMcprcServers = pickBy(
    mcprcServers,
    (_, name) => getMcprcServerStatus(name) === "approved"
  );
  const allServers = {
    ...globalServers,
    ...approvedMcprcServers,
    // Approved .mcprc servers override global ones
    ...projectServers
    // Project servers take highest precedence
  };
  return await Promise.all(
    Object.entries(allServers).map(async ([name, serverRef]) => {
      try {
        const client2 = await connectToServer(name, serverRef);
        logEvent("tengu_mcp_server_connection_succeeded", {});
        return { name, client: client2, type: "connected" };
      } catch (error) {
        logEvent("tengu_mcp_server_connection_failed", {});
        logMCPError(
          name,
          `Connection failed: ${error instanceof Error ? error.message : String(error)}`
        );
        return { name, type: "failed" };
      }
    })
  );
});
async function requestAll(req, resultSchema, requiredCapability) {
  const clients = await getClients();
  const results = await Promise.allSettled(
    clients.map(async (client2) => {
      if (client2.type === "failed") return null;
      try {
        const capabilities = await client2.client.getServerCapabilities();
        if (!capabilities?.[requiredCapability]) {
          return null;
        }
        return {
          client: client2,
          result: await client2.client.request(req, resultSchema)
        };
      } catch (error) {
        if (client2.type === "connected") {
          logMCPError(
            client2.name,
            `Failed to request '${req.method}': ${error instanceof Error ? error.message : String(error)}`
          );
        }
        return null;
      }
    })
  );
  return results.filter(
    (result) => result.status === "fulfilled"
  ).map((result) => result.value).filter(
    (result) => result !== null
  );
}
var getMCPTools = memoize12(async () => {
  const toolsList = await requestAll(
    {
      method: "tools/list"
    },
    ListToolsResultSchema,
    "tools"
  );
  return toolsList.flatMap(
    ({ client: client2, result: { tools } }) => tools.map(
      (tool) => ({
        ...MCPTool,
        name: "mcp__" + client2.name + "__" + tool.name,
        async description() {
          return tool.description ?? "";
        },
        async prompt() {
          return tool.description ?? "";
        },
        inputJSONSchema: tool.inputSchema,
        async *call(args) {
          const data = await callMCPTool({ client: client2, tool: tool.name, args });
          yield {
            type: "result",
            data,
            resultForAssistant: data
          };
        },
        userFacingName() {
          return `${client2.name}:${tool.name} (MCP)`;
        }
      })
    )
  );
});
async function callMCPTool({
  client: { client: client2, name },
  tool,
  args
}) {
  const result = await client2.callTool(
    {
      name: tool,
      arguments: args
    },
    CallToolResultSchema
  );
  if ("isError" in result && result.isError) {
    const errorMessage = `Error calling tool ${tool}: ${result.error}`;
    logMCPError(name, errorMessage);
    throw Error(errorMessage);
  }
  if ("toolResult" in result) {
    return String(result.toolResult);
  }
  if ("content" in result && Array.isArray(result.content)) {
    return result.content.map((item) => {
      if (item.type === "image") {
        return {
          type: "image",
          source: {
            type: "base64",
            data: String(item.data),
            media_type: item.mimeType
          }
        };
      }
      return item;
    });
  }
  throw Error(`Unexpected response format from tool ${tool}`);
}
var getMCPCommands = memoize12(async () => {
  const results = await requestAll(
    {
      method: "prompts/list"
    },
    ListPromptsResultSchema,
    "prompts"
  );
  return results.flatMap(
    ({ client: client2, result }) => result.prompts?.map((_) => {
      const argNames = Object.values(_.arguments ?? {}).map((k) => k.name);
      return {
        type: "prompt",
        name: "mcp__" + client2.name + "__" + _.name,
        description: _.description ?? "",
        isEnabled: true,
        isHidden: false,
        progressMessage: "running",
        userFacingName() {
          return `${client2.name}:${_.name} (MCP)`;
        },
        argNames,
        async getPromptForCommand(args) {
          const argsArray = args.split(" ");
          return await runCommand(
            { name: _.name, client: client2 },
            zipObject(argNames, argsArray)
          );
        }
      };
    })
  );
});
async function runCommand({ name, client: client2 }, args) {
  try {
    const result = await client2.client.getPrompt({ name, arguments: args });
    return result.messages.map(
      (message) => ({
        role: message.role,
        content: [
          message.content.type === "text" ? {
            type: "text",
            text: message.content.text
          } : {
            type: "image",
            source: {
              data: String(message.content.data),
              media_type: message.content.mimeType,
              type: "base64"
            }
          }
        ]
      })
    );
  } catch (error) {
    logMCPError(
      client2.name,
      `Error running command '${name}': ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

// src/components/MCPServerDialogCopy.tsx
import React49 from "react";
import { Text as Text41 } from "ink";
import Link2 from "ink-link";
function MCPServerDialogCopy() {
  return /* @__PURE__ */ React49.createElement(React49.Fragment, null, /* @__PURE__ */ React49.createElement(Text41, null, "MCP servers provide additional functionality to Claude. They may execute code, make network requests, or access system resources via tool calls. All tool calls will require your explicit approval before execution. For more information, see", " ", /* @__PURE__ */ React49.createElement(Link2, { url: "https://docs.anthropic.com/s/claude-code-mcp" }, "MCP documentation")), /* @__PURE__ */ React49.createElement(Text41, { dimColor: true }, "Remember: You can always change these choices later by running `claude mcp reset-mcprc-choices`"));
}

// src/components/MCPServerWizard.tsx
function ModeSelection({ onSelect, onCancel }) {
  useInput11((_input, key) => {
    if (key.escape) {
      onCancel();
    }
  });
  return /* @__PURE__ */ React50.createElement(Box33, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React50.createElement(Text42, { bold: true }, "Select MCP Server Type"), /* @__PURE__ */ React50.createElement(Text42, null, "Choose the type of MCP server you want to add:"), /* @__PURE__ */ React50.createElement(
    Select6,
    {
      options: [
        { label: "Standard I/O (stdio) - Run local command", value: "stdio" },
        { label: "Server-Sent Events (SSE) - Connect to remote endpoint", value: "sse" }
      ],
      onChange: (value) => onSelect(value)
    }
  ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Enter to confirm \xB7 Esc to cancel"));
}
function StdioSetup({ onSubmit, onBack, onCancel }) {
  const [step, setStep] = useState13("name");
  const [name, setName] = useState13("");
  const [command3, setCommand] = useState13("");
  const [args, setArgs] = useState13("");
  const [env3, setEnv] = useState13("");
  useInput11((_input, key) => {
    if (key.escape) {
      if (step === "name") {
        onBack();
      } else {
        onCancel();
      }
    }
  });
  const handleNext = () => {
    if (step === "name" && name.trim()) {
      setStep("command");
    } else if (step === "command" && command3.trim()) {
      setStep("args");
    } else if (step === "args") {
      setStep("env");
    } else if (step === "env") {
      const envVars = {};
      env3.split(",").forEach((pair) => {
        const [key, value] = pair.split("=").map((s) => s.trim());
        if (key && value) {
          envVars[key] = value;
        }
      });
      const argArray = args.trim() ? args.split(" ") : [];
      onSubmit(name, command3, argArray, envVars);
    }
  };
  const theme = getTheme();
  return /* @__PURE__ */ React50.createElement(Box33, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React50.createElement(Text42, { bold: true }, "Add Standard I/O (stdio) MCP Server"), step === "name" && /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(Text42, null, "Enter a name for this MCP server:"), /* @__PURE__ */ React50.createElement(
    TextInput,
    {
      value: name,
      onChange: setName,
      onSubmit: handleNext,
      placeholder: "my-server"
    }
  ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Enter to continue \xB7 Esc to go back")), step === "command" && /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(Text42, null, "Enter the command to execute:"), /* @__PURE__ */ React50.createElement(
    TextInput,
    {
      value: command3,
      onChange: setCommand,
      onSubmit: handleNext,
      placeholder: "python server.py"
    }
  ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Enter to continue \xB7 Esc to cancel")), step === "args" && /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(Text42, null, "Enter any command arguments (space-separated):"), /* @__PURE__ */ React50.createElement(
    TextInput,
    {
      value: args,
      onChange: setArgs,
      onSubmit: handleNext,
      placeholder: "--port 8000 --debug"
    }
  ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Enter to continue \xB7 Esc to cancel")), step === "env" && /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(Text42, null, "Enter environment variables (comma-separated KEY=VALUE pairs):"), /* @__PURE__ */ React50.createElement(
    TextInput,
    {
      value: env3,
      onChange: setEnv,
      onSubmit: handleNext,
      placeholder: "API_KEY=xyz123,DEBUG=true"
    }
  ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Enter to finish \xB7 Esc to cancel")), /* @__PURE__ */ React50.createElement(Box33, { marginY: 1 }, /* @__PURE__ */ React50.createElement(Text42, { color: theme.dimmed }, step === "name" ? "\u25CF \u25CB \u25CB \u25CB" : step === "command" ? "\u25CB \u25CF \u25CB \u25CB" : step === "args" ? "\u25CB \u25CB \u25CF \u25CB" : "\u25CB \u25CB \u25CB \u25CF")));
}
function SseSetup({ onSubmit, onBack, onCancel }) {
  const [step, setStep] = useState13("name");
  const [name, setName] = useState13("");
  const [url2, setUrl] = useState13("");
  useInput11((_input, key) => {
    if (key.escape) {
      if (step === "name") {
        onBack();
      } else {
        onCancel();
      }
    }
  });
  const handleNext = () => {
    if (step === "name" && name.trim()) {
      setStep("url");
    } else if (step === "url" && url2.trim()) {
      onSubmit(name, url2);
    }
  };
  const theme = getTheme();
  return /* @__PURE__ */ React50.createElement(Box33, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React50.createElement(Text42, { bold: true }, "Add Server-Sent Events (SSE) MCP Server"), step === "name" && /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(Text42, null, "Enter a name for this MCP server:"), /* @__PURE__ */ React50.createElement(
    TextInput,
    {
      value: name,
      onChange: setName,
      onSubmit: handleNext,
      placeholder: "my-sse-server"
    }
  ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Enter to continue \xB7 Esc to go back")), step === "url" && /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(Text42, null, "Enter the SSE endpoint URL:"), /* @__PURE__ */ React50.createElement(
    TextInput,
    {
      value: url2,
      onChange: setUrl,
      onSubmit: handleNext,
      placeholder: "http://localhost:8000/sse"
    }
  ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Enter to finish \xB7 Esc to cancel")), /* @__PURE__ */ React50.createElement(Box33, { marginY: 1 }, /* @__PURE__ */ React50.createElement(Text42, { color: theme.dimmed }, step === "name" ? "\u25CF \u25CB" : "\u25CB \u25CF")));
}
function ScopeSelection({ onSelect, onCancel }) {
  useInput11((_input, key) => {
    if (key.escape) {
      onCancel();
    }
  });
  return /* @__PURE__ */ React50.createElement(Box33, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React50.createElement(Text42, { bold: true }, "Select Configuration Scope"), /* @__PURE__ */ React50.createElement(Text42, null, "Where should this MCP server configuration be saved?"), /* @__PURE__ */ React50.createElement(
    Select6,
    {
      options: [
        { label: "Project (local to current directory)", value: "project" },
        { label: "Global (available in all projects)", value: "global" }
      ],
      onChange: (value) => onSelect(value)
    }
  ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Enter to confirm \xB7 Esc to cancel"));
}
function SuccessMessage({ name, serverType, scope, onDone }) {
  const theme = getTheme();
  useInput11((_input, key) => {
    if (key.return || key.escape) {
      onDone();
    }
  });
  return /* @__PURE__ */ React50.createElement(Box33, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React50.createElement(Text42, { bold: true, color: theme.success }, "Success!"), /* @__PURE__ */ React50.createElement(Text42, null, serverType === "stdio" ? `Added stdio MCP server "${name}" to ${scope} configuration.` : `Added SSE MCP server "${name}" to ${scope} configuration.`), /* @__PURE__ */ React50.createElement(Text42, null, "You can now use this server with Claude Code."), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, "Press Enter to finish"));
}
function MCPServerWizard({ onDone }) {
  const [stage, setStage] = useState13("intro");
  const [serverType, setServerType] = useState13("stdio");
  const [scope, setScope] = useState13("project");
  const [serverName, setServerName] = useState13("");
  const theme = getTheme();
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  useInput11((_input, key) => {
    if (key.escape && stage === "intro") {
      onDone();
    }
  });
  const handleAddStdioServer = (name, command3, args, env3) => {
    try {
      setServerName(name);
      const configScope = ensureConfigScope(scope);
      addMcpServer(
        name,
        { type: "stdio", command: command3, args, env: env3 },
        configScope
      );
      setStage("success");
    } catch (error) {
      console.error(error.message);
      onDone();
    }
  };
  const handleAddSseServer = (name, url2) => {
    try {
      setServerName(name);
      const configScope = ensureConfigScope(scope);
      addMcpServer(
        name,
        { type: "sse", url: url2 },
        configScope
      );
      setStage("success");
    } catch (error) {
      console.error(error.message);
      onDone();
    }
  };
  return /* @__PURE__ */ React50.createElement(
    Box33,
    {
      flexDirection: "column",
      gap: 1,
      padding: 1,
      borderStyle: "round",
      borderColor: theme.primary
    },
    stage === "intro" && /* @__PURE__ */ React50.createElement(React50.Fragment, null, /* @__PURE__ */ React50.createElement(Text42, { bold: true, color: theme.primary }, "MCP Server Setup Wizard"), /* @__PURE__ */ React50.createElement(Text42, null, "This wizard will help you configure a new Model Context Protocol (MCP) server."), /* @__PURE__ */ React50.createElement(MCPServerDialogCopy, null), /* @__PURE__ */ React50.createElement(Text42, null, "Ready to set up a new MCP server?"), /* @__PURE__ */ React50.createElement(
      Select6,
      {
        options: [
          { label: "Yes, continue", value: "continue" },
          { label: "No, cancel", value: "cancel" }
        ],
        onChange: (value) => {
          if (value === "continue") {
            setStage("mode");
          } else {
            onDone();
          }
        }
      }
    ), /* @__PURE__ */ React50.createElement(Text42, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React50.createElement(React50.Fragment, null, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React50.createElement(React50.Fragment, null, "Enter to continue \xB7 Esc to cancel"))),
    stage === "mode" && /* @__PURE__ */ React50.createElement(
      ModeSelection,
      {
        onSelect: (mode) => {
          setServerType(mode);
          setStage("scope");
        },
        onCancel: onDone
      }
    ),
    stage === "scope" && /* @__PURE__ */ React50.createElement(
      ScopeSelection,
      {
        onSelect: (selectedScope) => {
          setScope(selectedScope);
          setStage(serverType === "stdio" ? "stdio" : "sse");
        },
        onCancel: onDone
      }
    ),
    stage === "stdio" && /* @__PURE__ */ React50.createElement(
      StdioSetup,
      {
        onSubmit: handleAddStdioServer,
        onBack: () => setStage("mode"),
        onCancel: onDone
      }
    ),
    stage === "sse" && /* @__PURE__ */ React50.createElement(
      SseSetup,
      {
        onSubmit: handleAddSseServer,
        onBack: () => setStage("mode"),
        onCancel: onDone
      }
    ),
    stage === "success" && /* @__PURE__ */ React50.createElement(
      SuccessMessage,
      {
        name: serverName,
        serverType,
        scope,
        onDone
      }
    )
  );
}

// src/commands/mcp_add.tsx
init_statsig();
var mcpAddCommand = {
  type: "wizard",
  name: "mcp_add",
  description: "Interactive wizard to add a new MCP server",
  userFacingName: () => "mcp add",
  progressMessage: "Setting up MCP server",
  isEnabled: true,
  isHidden: false,
  async getComponentForCommand() {
    return new Promise((resolve16) => {
      logEvent("tengu_mcp_add_wizard", {});
      const handleDone = () => {
        result.unmount();
        resolve16(null);
      };
      const result = render4(
        /* @__PURE__ */ React51.createElement(MCPServerWizard, { onDone: handleDone }),
        { exitOnCtrlC: false }
      );
    });
  }
};

// src/commands.ts
import { memoize as memoize13 } from "lodash-es";
var INTERNAL_ONLY_COMMANDS = [
  ctx_viz_default,
  resume_default,
  experimental_resume_default,
  listen_default,
  memory_read_default,
  memory_write_default,
  self_improve_default
];
var COMMANDS = memoize13(() => [
  clear_default,
  compact_default,
  config_default,
  cost_default,
  doctor_default,
  help_default,
  init_default,
  MCPCommand,
  model_default,
  onboarding_default,
  pr_comments_default,
  release_notes_default,
  bug_default,
  review_default,
  terminalSetup_default,
  mcpAddCommand,
  ...isAnthropicAuthEnabled() ? [logout_default, login_default()] : [],
  ...process.env.USER_TYPE === "ant" ? INTERNAL_ONLY_COMMANDS : []
]);
var getCommands = memoize13(async () => {
  return [...await getMCPCommands(), ...COMMANDS()].filter((_) => _.isEnabled);
});
function hasCommand(commandName, commands) {
  return commands.some(
    (_) => _.userFacingName() === commandName || _.aliases?.includes(commandName)
  );
}
function getCommand(commandName, commands) {
  const command3 = commands.find(
    (_) => _.userFacingName() === commandName || _.aliases?.includes(commandName)
  );
  if (!command3) {
    throw ReferenceError(
      `Command ${commandName} not found. Available commands: ${commands.map((_) => {
        const name = _.userFacingName();
        return _.aliases ? `${name} (aliases: ${_.aliases.join(", ")})` : name;
      }).join(", ")}`
    );
  }
  return command3;
}

// src/utils/messages.tsx
init_errors();
init_log();
init_statsig();
import { resolve as resolve11 } from "path";
import { last, memoize as memoize14 } from "lodash-es";
init_state();
init_state();
init_source();
import * as React53 from "react";

// src/components/messages/UserBashInputMessage.tsx
import { Box as Box34, Text as Text43 } from "ink";
import * as React52 from "react";
function UserBashInputMessage({
  param: { text },
  addMargin
}) {
  const input = extractTag(text, "bash-input");
  if (!input) {
    return null;
  }
  return /* @__PURE__ */ React52.createElement(Box34, { flexDirection: "column", marginTop: addMargin ? 1 : 0, width: "100%" }, /* @__PURE__ */ React52.createElement(Box34, null, /* @__PURE__ */ React52.createElement(Text43, { color: getTheme().bashBorder }, "!"), /* @__PURE__ */ React52.createElement(Text43, { color: getTheme().secondaryText }, " ", input)));
}

// src/utils/messages.tsx
var INTERRUPT_MESSAGE = "[Request interrupted by user]";
var INTERRUPT_MESSAGE_FOR_TOOL_USE = "[Request interrupted by user for tool use]";
var CANCEL_MESSAGE = "The user doesn't want to take this action right now. STOP what you are doing and wait for the user to tell you how to proceed.";
var REJECT_MESSAGE = "The user doesn't want to proceed with this tool use. The tool use was rejected (eg. if it was a file edit, the new_string was NOT written to the file). STOP what you are doing and wait for the user to tell you how to proceed.";
var NO_RESPONSE_REQUESTED = "No response requested.";
var SYNTHETIC_ASSISTANT_MESSAGES = /* @__PURE__ */ new Set([
  INTERRUPT_MESSAGE,
  INTERRUPT_MESSAGE_FOR_TOOL_USE,
  CANCEL_MESSAGE,
  REJECT_MESSAGE,
  NO_RESPONSE_REQUESTED
]);
function baseCreateAssistantMessage(content, extra) {
  return {
    type: "assistant",
    costUSD: 0,
    durationMs: 0,
    uuid: randomUUID4(),
    message: {
      id: randomUUID4(),
      model: "<synthetic>",
      role: "assistant",
      stop_reason: "stop_sequence",
      stop_sequence: "",
      type: "message",
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0
      },
      content
    },
    ...extra
  };
}
function createAssistantMessage(content) {
  return baseCreateAssistantMessage([
    {
      type: "text",
      text: content === "" ? NO_CONTENT_MESSAGE : content,
      citations: []
    }
  ]);
}
function createAssistantAPIErrorMessage(content) {
  return baseCreateAssistantMessage(
    [
      {
        type: "text",
        text: content === "" ? NO_CONTENT_MESSAGE : content,
        citations: []
      }
    ],
    { isApiErrorMessage: true }
  );
}
function createUserMessage(content, toolUseResult) {
  const m = {
    type: "user",
    message: {
      role: "user",
      content
    },
    uuid: randomUUID4(),
    toolUseResult
  };
  return m;
}
function createProgressMessage(toolUseID, siblingToolUseIDs, content, normalizedMessages, tools) {
  return {
    type: "progress",
    content,
    normalizedMessages,
    siblingToolUseIDs,
    tools,
    toolUseID,
    uuid: randomUUID4()
  };
}
function createToolResultStopMessage(toolUseID) {
  return {
    type: "tool_result",
    content: CANCEL_MESSAGE,
    is_error: true,
    tool_use_id: toolUseID
  };
}
async function processUserInput(input, mode, setToolJSX, context, pastedImage) {
  if (mode === "bash") {
    logEvent("tengu_input_bash", {});
    const userMessage = createUserMessage(`<bash-input>${input}</bash-input>`);
    if (input.startsWith("cd ")) {
      const oldCwd = getCwd();
      const newCwd = resolve11(oldCwd, input.slice(3));
      try {
        await setCwd(newCwd);
        return [
          userMessage,
          createAssistantMessage(
            `<bash-stdout>Changed directory to ${source_default.bold(`${newCwd}/`)}</bash-stdout>`
          )
        ];
      } catch (e) {
        logError(e);
        return [
          userMessage,
          createAssistantMessage(
            `<bash-stderr>cwd error: ${e instanceof Error ? e.message : String(e)}</bash-stderr>`
          )
        ];
      }
    }
    setToolJSX({
      jsx: /* @__PURE__ */ React53.createElement(Box35, { flexDirection: "column", marginTop: 1 }, /* @__PURE__ */ React53.createElement(
        UserBashInputMessage,
        {
          addMargin: false,
          param: { text: `<bash-input>${input}</bash-input>`, type: "text" }
        }
      ), /* @__PURE__ */ React53.createElement(Spinner, null)),
      shouldHidePromptInput: false
    });
    try {
      const validationResult = await BashTool.validateInput({
        command: input
      });
      if (!validationResult.result) {
        return [userMessage, createAssistantMessage(validationResult.message)];
      }
      const { data } = await lastX(BashTool.call({ command: input }, context));
      return [
        userMessage,
        createAssistantMessage(
          `<bash-stdout>${data.stdout}</bash-stdout><bash-stderr>${data.stderr}</bash-stderr>`
        )
      ];
    } catch (e) {
      return [
        userMessage,
        createAssistantMessage(
          `<bash-stderr>Command failed: ${e instanceof Error ? e.message : String(e)}</bash-stderr>`
        )
      ];
    } finally {
      setToolJSX(null);
    }
  }
  if (input.startsWith("/")) {
    const words = input.slice(1).split(" ");
    let commandName = words[0];
    if (words.length > 1 && words[1] === "(MCP)") {
      commandName = commandName + " (MCP)";
    }
    if (!commandName) {
      logEvent("tengu_input_slash_missing", { input });
      return [
        createAssistantMessage("Commands are in the form `/command [args]`")
      ];
    }
    if (!hasCommand(commandName, context.options.commands)) {
      logEvent("tengu_input_prompt", {});
      return [createUserMessage(input)];
    }
    const args = input.slice(commandName.length + 2);
    const newMessages = await getMessagesForSlashCommand(
      commandName,
      args,
      setToolJSX,
      context
    );
    if (newMessages.length === 0) {
      logEvent("tengu_input_command", { input });
      return [];
    }
    if (newMessages.length === 2 && newMessages[0].type === "user" && newMessages[1].type === "assistant" && typeof newMessages[1].message.content === "string" && // @ts-expect-error: TODO: this is probably a bug
    newMessages[1].message.content.startsWith("Unknown command:")) {
      logEvent("tengu_input_slash_invalid", { input });
      return newMessages;
    }
    if (newMessages.length === 2) {
      logEvent("tengu_input_command", { input });
      return newMessages;
    }
    logEvent("tengu_input_command", { input });
    return newMessages;
  }
  logEvent("tengu_input_prompt", {});
  if (pastedImage) {
    return [
      createUserMessage([
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: pastedImage
          }
        },
        {
          type: "text",
          text: input
        }
      ])
    ];
  }
  return [createUserMessage(input)];
}
async function getMessagesForSlashCommand(commandName, args, setToolJSX, context) {
  try {
    const command3 = getCommand(commandName, context.options.commands);
    switch (command3.type) {
      case "wizard": {
        return new Promise((resolve16) => {
          command3.getComponentForCommand().then((jsx) => {
            if (jsx) {
              setToolJSX({
                jsx,
                shouldHidePromptInput: true
              });
            } else {
              setToolJSX(null);
              resolve16([
                createUserMessage(`<command-name>${command3.userFacingName()}</command-name>
                  <command-message>${command3.userFacingName()}</command-message>
                  <command-args>${args}</command-args>`),
                createAssistantMessage(NO_RESPONSE_REQUESTED)
              ]);
            }
          }).catch((error) => {
            logError(error);
            setToolJSX(null);
            resolve16([
              createUserMessage(`<command-name>${command3.userFacingName()}</command-name>
                <command-message>${command3.userFacingName()}</command-message>
                <command-args>${args}</command-args>`),
              createAssistantMessage(
                `<local-command-stderr>Error: ${error.message || String(error)}</local-command-stderr>`
              )
            ]);
          });
        });
      }
      case "local-jsx": {
        return new Promise((resolve16) => {
          command3.call((r) => {
            setToolJSX(null);
            resolve16([
              createUserMessage(`<command-name>${command3.userFacingName()}</command-name>
          <command-message>${command3.userFacingName()}</command-message>
          <command-args>${args}</command-args>`),
              r ? createAssistantMessage(r) : createAssistantMessage(NO_RESPONSE_REQUESTED)
            ]);
          }, context).then((jsx) => {
            setToolJSX({
              jsx,
              shouldHidePromptInput: true
            });
          });
        });
      }
      case "local": {
        const userMessage = createUserMessage(`<command-name>${command3.userFacingName()}</command-name>
        <command-message>${command3.userFacingName()}</command-message>
        <command-args>${args}</command-args>`);
        try {
          const result = await command3.call(args, context);
          return [
            userMessage,
            createAssistantMessage(
              `<local-command-stdout>${result}</local-command-stdout>`
            )
          ];
        } catch (e) {
          logError(e);
          return [
            userMessage,
            createAssistantMessage(
              `<local-command-stderr>${String(e)}</local-command-stderr>`
            )
          ];
        }
      }
      case "prompt": {
        const prompt = await command3.getPromptForCommand(args);
        return prompt.map((_) => {
          if (typeof _.content === "string") {
            return {
              message: {
                role: _.role,
                content: `<command-message>${command3.userFacingName()} is ${command3.progressMessage}\u2026</command-message>
                    <command-name>${command3.userFacingName()}</command-name>
                    <command-args>${args}</command-args>
                    <command-contents>${JSON.stringify(
                  _.content,
                  null,
                  2
                )}</command-contents>`
              },
              type: "user",
              uuid: randomUUID4()
            };
          }
          return {
            message: {
              role: _.role,
              content: _.content.map((_2) => {
                switch (_2.type) {
                  case "text":
                    return {
                      ..._2,
                      text: `
                        <command-message>${command3.userFacingName()} is ${command3.progressMessage}\u2026</command-message>
                        <command-name>${command3.userFacingName()}</command-name>
                        <command-args>${args}</command-args>
                        <command-contents>${JSON.stringify(
                        _2,
                        null,
                        2
                      )}</command-contents>
                      `
                    };
                  // TODO: These won't render properly
                  default:
                    return _2;
                }
              })
            },
            type: "user",
            uuid: randomUUID4()
          };
        });
      }
    }
  } catch (e) {
    if (e instanceof MalformedCommandError) {
      return [createAssistantMessage(e.message)];
    }
    throw e;
  }
}
function extractTag(html, tagName) {
  if (!html.trim() || !tagName.trim()) {
    return null;
  }
  const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<${escapedTag}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
    // Closing tag
    "gi"
  );
  let match;
  let depth = 0;
  let lastIndex = 0;
  const openingTag = new RegExp(`<${escapedTag}(?:\\s+[^>]*?)?>`, "gi");
  const closingTag = new RegExp(`<\\/${escapedTag}>`, "gi");
  while ((match = pattern.exec(html)) !== null) {
    const content = match[1];
    const beforeMatch = html.slice(lastIndex, match.index);
    depth = 0;
    openingTag.lastIndex = 0;
    while (openingTag.exec(beforeMatch) !== null) {
      depth++;
    }
    closingTag.lastIndex = 0;
    while (closingTag.exec(beforeMatch) !== null) {
      depth--;
    }
    if (depth === 0 && content) {
      return content;
    }
    lastIndex = match.index + match[0].length;
  }
  return null;
}
function isNotEmptyMessage(message) {
  if (message.type === "progress") {
    return true;
  }
  if (typeof message.message.content === "string") {
    return message.message.content.trim().length > 0;
  }
  if (message.message.content.length === 0) {
    return false;
  }
  if (message.message.content.length > 1) {
    return true;
  }
  if (message.message.content[0].type !== "text") {
    return true;
  }
  return message.message.content[0].text.trim().length > 0 && message.message.content[0].text !== NO_CONTENT_MESSAGE && message.message.content[0].text !== INTERRUPT_MESSAGE_FOR_TOOL_USE;
}
function normalizeMessages(messages) {
  return messages.flatMap((message) => {
    if (message.type === "progress") {
      return [message];
    }
    if (typeof message.message.content === "string") {
      return [message];
    }
    return message.message.content.map((_) => {
      switch (message.type) {
        case "assistant":
          return {
            type: "assistant",
            uuid: randomUUID4(),
            message: {
              ...message.message,
              content: [_]
            },
            costUSD: message.costUSD / message.message.content.length,
            durationMs: message.durationMs
          };
        case "user":
          return message;
      }
    });
  });
}
function isToolUseRequestMessage(message) {
  return message.type === "assistant" && "costUSD" in message && // Note: stop_reason === 'tool_use' is unreliable -- it's not always set correctly
  message.message.content.some((_) => _.type === "tool_use");
}
function reorderMessages(messages) {
  const ms = [];
  const toolUseMessages = [];
  for (const message of messages) {
    if (isToolUseRequestMessage(message)) {
      toolUseMessages.push(message);
    }
    if (message.type === "progress") {
      const existingProgressMessage = ms.find(
        (_) => _.type === "progress" && _.toolUseID === message.toolUseID
      );
      if (existingProgressMessage) {
        ms[ms.indexOf(existingProgressMessage)] = message;
        continue;
      }
      const toolUseMessage = toolUseMessages.find(
        (_) => _.message.content[0]?.id === message.toolUseID
      );
      if (toolUseMessage) {
        ms.splice(ms.indexOf(toolUseMessage) + 1, 0, message);
        continue;
      }
    }
    if (message.type === "user" && Array.isArray(message.message.content) && message.message.content[0]?.type === "tool_result") {
      const toolUseID = message.message.content[0]?.tool_use_id;
      const lastProgressMessage = ms.find(
        (_) => _.type === "progress" && _.toolUseID === toolUseID
      );
      if (lastProgressMessage) {
        ms.splice(ms.indexOf(lastProgressMessage) + 1, 0, message);
        continue;
      }
      const toolUseMessage = toolUseMessages.find(
        (_) => _.message.content[0]?.id === toolUseID
      );
      if (toolUseMessage) {
        ms.splice(ms.indexOf(toolUseMessage) + 1, 0, message);
        continue;
      }
    } else {
      ms.push(message);
    }
  }
  return ms;
}
var getToolResultIDs = memoize14(
  (normalizedMessages) => Object.fromEntries(
    normalizedMessages.flatMap(
      (_) => _.type === "user" && _.message.content[0]?.type === "tool_result" ? [
        [
          _.message.content[0].tool_use_id,
          _.message.content[0].is_error ?? false
        ]
      ] : []
    )
  )
);
function getUnresolvedToolUseIDs(normalizedMessages) {
  const toolResults = getToolResultIDs(normalizedMessages);
  return new Set(
    normalizedMessages.filter(
      (_) => _.type === "assistant" && Array.isArray(_.message.content) && _.message.content[0]?.type === "tool_use" && !(_.message.content[0]?.id in toolResults)
    ).map((_) => _.message.content[0].id)
  );
}
function getInProgressToolUseIDs(normalizedMessages) {
  const unresolvedToolUseIDs = getUnresolvedToolUseIDs(normalizedMessages);
  const toolUseIDsThatHaveProgressMessages = new Set(
    normalizedMessages.filter((_) => _.type === "progress").map((_) => _.toolUseID)
  );
  return new Set(
    normalizedMessages.filter((_) => {
      if (_.type !== "assistant") {
        return false;
      }
      if (_.message.content[0]?.type !== "tool_use") {
        return false;
      }
      const toolUseID = _.message.content[0].id;
      if (toolUseID === unresolvedToolUseIDs.values().next().value) {
        return true;
      }
      if (toolUseIDsThatHaveProgressMessages.has(toolUseID) && unresolvedToolUseIDs.has(toolUseID)) {
        return true;
      }
      return false;
    }).map((_) => _.message.content[0].id)
  );
}
function getErroredToolUseMessages(normalizedMessages) {
  const toolResults = getToolResultIDs(normalizedMessages);
  return normalizedMessages.filter(
    (_) => _.type === "assistant" && Array.isArray(_.message.content) && _.message.content[0]?.type === "tool_use" && _.message.content[0]?.id in toolResults && toolResults[_.message.content[0]?.id]
  );
}
function normalizeMessagesForAPI(messages) {
  const result = [];
  messages.filter((_) => _.type !== "progress").forEach((message) => {
    switch (message.type) {
      case "user": {
        if (!Array.isArray(message.message.content) || message.message.content[0]?.type !== "tool_result") {
          result.push(message);
          return;
        }
        const lastMessage = last(result);
        if (!lastMessage || lastMessage?.type === "assistant" || !Array.isArray(lastMessage.message.content) || lastMessage.message.content[0]?.type !== "tool_result") {
          result.push(message);
          return;
        }
        result[result.indexOf(lastMessage)] = {
          ...lastMessage,
          message: {
            ...lastMessage.message,
            content: [
              ...lastMessage.message.content,
              ...message.message.content
            ]
          }
        };
        return;
      }
      case "assistant":
        result.push(message);
        return;
    }
  });
  return result;
}
function normalizeContentFromAPI(content) {
  const filteredContent = content.filter(
    (_) => _.type !== "text" || _.text.trim().length > 0
  );
  if (filteredContent.length === 0) {
    return [{ type: "text", text: NO_CONTENT_MESSAGE, citations: [] }];
  }
  return filteredContent;
}
function isEmptyMessageText(text) {
  return stripSystemMessages(text).trim() === "" || text.trim() === NO_CONTENT_MESSAGE;
}
var STRIPPED_TAGS = [
  "commit_analysis",
  "context",
  "function_analysis",
  "pr_analysis"
];
function stripSystemMessages(content) {
  const regex2 = new RegExp(`<(${STRIPPED_TAGS.join("|")})>.*?</\\1>
?`, "gs");
  return content.replace(regex2, "").trim();
}
function getToolUseID(message) {
  switch (message.type) {
    case "assistant":
      if (message.message.content[0]?.type !== "tool_use") {
        return null;
      }
      return message.message.content[0].id;
    case "user":
      if (message.message.content[0]?.type !== "tool_result") {
        return null;
      }
      return message.message.content[0].tool_use_id;
    case "progress":
      return message.toolUseID;
  }
}
function getLastAssistantMessageId(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message && message.type === "assistant") {
      return message.message.id;
    }
  }
  return void 0;
}

// src/components/messages/UserToolResultMessage/UserToolCanceledMessage.tsx
import { Text as Text44 } from "ink";
import * as React54 from "react";
function UserToolCanceledMessage() {
  return /* @__PURE__ */ React54.createElement(Text44, null, "\xA0\xA0\u23BF \xA0", /* @__PURE__ */ React54.createElement(Text44, { color: getTheme().error }, "Interrupted by user"));
}

// src/components/messages/UserToolResultMessage/UserToolErrorMessage.tsx
import { Box as Box36, Text as Text45 } from "ink";
import * as React55 from "react";
var MAX_RENDERED_LINES2 = 10;
function UserToolErrorMessage({
  param,
  verbose
}) {
  const error = typeof param.content === "string" ? param.content.trim() : "Error";
  return /* @__PURE__ */ React55.createElement(Box36, { flexDirection: "row", width: "100%" }, /* @__PURE__ */ React55.createElement(Text45, null, "\xA0\xA0\u23BF \xA0"), /* @__PURE__ */ React55.createElement(Box36, { flexDirection: "column" }, /* @__PURE__ */ React55.createElement(Text45, { color: getTheme().error }, verbose ? error : error.split("\n").slice(0, MAX_RENDERED_LINES2).join("\n") || ""), !verbose && error.split("\n").length > MAX_RENDERED_LINES2 && /* @__PURE__ */ React55.createElement(Text45, { color: getTheme().secondaryText }, "... (+", error.split("\n").length - MAX_RENDERED_LINES2, " lines)")));
}

// src/components/messages/UserToolResultMessage/UserToolRejectMessage.tsx
import * as React57 from "react";

// src/components/messages/UserToolResultMessage/utils.tsx
import { useMemo as useMemo4 } from "react";

// src/tools/GrepTool/GrepTool.tsx
import { stat } from "fs/promises";
import { Box as Box37, Text as Text46 } from "ink";
import React56 from "react";
import { z as z12 } from "zod";
init_state();
var inputSchema12 = z12.strictObject({
  pattern: z12.string().describe("The regular expression pattern to search for in file contents"),
  path: z12.string().optional().describe(
    "The directory to search in. Defaults to the current working directory."
  ),
  include: z12.string().optional().describe(
    'File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")'
  )
});
var MAX_RESULTS = 100;
var GrepTool = {
  name: TOOL_NAME_FOR_PROMPT2,
  async description() {
    return DESCRIPTION4;
  },
  userFacingName() {
    return "Search";
  },
  inputSchema: inputSchema12,
  isReadOnly() {
    return true;
  },
  async isEnabled() {
    return true;
  },
  needsPermissions({ path: path7 }) {
    return !hasReadPermission(path7 || getCwd());
  },
  async prompt() {
    return DESCRIPTION4;
  },
  renderToolUseMessage({ pattern, path: path7, include }, { verbose }) {
    const { absolutePath, relativePath } = getAbsoluteAndRelativePaths(path7);
    return `pattern: "${pattern}"${relativePath || verbose ? `, path: "${verbose ? absolutePath : relativePath}"` : ""}${include ? `, include: "${include}"` : ""}`;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React56.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage(output) {
    if (typeof output === "string") {
      output = output;
    }
    return /* @__PURE__ */ React56.createElement(Box37, { justifyContent: "space-between", width: "100%" }, /* @__PURE__ */ React56.createElement(Box37, { flexDirection: "row" }, /* @__PURE__ */ React56.createElement(Text46, null, "\xA0\xA0\u23BF \xA0Found "), /* @__PURE__ */ React56.createElement(Text46, { bold: true }, output.numFiles, " "), /* @__PURE__ */ React56.createElement(Text46, null, output.numFiles === 0 || output.numFiles > 1 ? "files" : "file")), /* @__PURE__ */ React56.createElement(Cost, { costUSD: 0, durationMs: output.durationMs, debug: false }));
  },
  renderResultForAssistant({ numFiles, filenames }) {
    if (numFiles === 0) {
      return "No files found";
    }
    let result = `Found ${numFiles} file${numFiles === 1 ? "" : "s"}
${filenames.slice(0, MAX_RESULTS).join("\n")}`;
    if (numFiles > MAX_RESULTS) {
      result += "\n(Results are truncated. Consider using a more specific path or pattern.)";
    }
    return result;
  },
  async *call({ pattern, path: path7, include }, { abortController }) {
    const start = Date.now();
    const absolutePath = getAbsolutePath(path7) || getCwd();
    const args = ["-li", pattern];
    if (include) {
      args.push("--glob", include);
    }
    const results = await ripGrep(args, absolutePath, abortController.signal);
    const stats = await Promise.all(results.map((_) => stat(_)));
    const matches = results.map((_, i) => [_, stats[i]]).sort((a, b) => {
      if (false) {
        return a[0].localeCompare(b[0]);
      }
      const timeComparison = (b[1].mtimeMs ?? 0) - (a[1].mtimeMs ?? 0);
      if (timeComparison === 0) {
        return a[0].localeCompare(b[0]);
      }
      return timeComparison;
    }).map((_) => _[0]);
    const output = {
      filenames: matches,
      durationMs: Date.now() - start,
      numFiles: matches.length
    };
    yield {
      type: "result",
      resultForAssistant: this.renderResultForAssistant(output),
      data: output
    };
  }
};

// src/components/messages/UserToolResultMessage/utils.tsx
init_statsig();
function getToolUseFromMessages(toolUseID, messages) {
  let toolUse = null;
  for (const message of messages) {
    if (message.type !== "assistant" || !Array.isArray(message.message.content)) {
      continue;
    }
    for (const content of message.message.content) {
      if (content.type === "tool_use" && content.id === toolUseID) {
        toolUse = content;
      }
    }
  }
  return toolUse;
}
function useGetToolFromMessages(toolUseID, tools, messages) {
  return useMemo4(() => {
    const toolUse = getToolUseFromMessages(toolUseID, messages);
    if (!toolUse) {
      throw new ReferenceError(
        `Tool use not found for tool_use_id ${toolUseID}`
      );
    }
    const tool = [...tools, GlobTool, GrepTool].find(
      (_) => _.name === toolUse.name
    );
    if (tool === GlobTool || tool === GrepTool) {
      logEvent("tengu_legacy_tool_lookup", {});
    }
    if (!tool) {
      throw new ReferenceError(`Tool not found for ${toolUse.name}`);
    }
    return { tool, toolUse };
  }, [toolUseID, messages, tools]);
}

// src/components/messages/UserToolResultMessage/UserToolRejectMessage.tsx
function UserToolRejectMessage({
  toolUseID,
  tools,
  messages,
  verbose
}) {
  const { columns } = useTerminalSize();
  const { tool, toolUse } = useGetToolFromMessages(toolUseID, tools, messages);
  const input = tool.inputSchema.safeParse(toolUse.input);
  if (input.success) {
    return tool.renderToolUseRejectedMessage(input.data, {
      columns,
      verbose
    });
  }
  return /* @__PURE__ */ React57.createElement(FallbackToolUseRejectedMessage, null);
}

// src/components/messages/UserToolResultMessage/UserToolSuccessMessage.tsx
import { Box as Box38 } from "ink";
import * as React58 from "react";
function UserToolSuccessMessage({
  param,
  message,
  messages,
  tools,
  verbose,
  width
}) {
  const { tool } = useGetToolFromMessages(param.tool_use_id, tools, messages);
  return (
    // TODO: Distinguish UserMessage from UserToolResultMessage
    /* @__PURE__ */ React58.createElement(Box38, { flexDirection: "column", width }, tool.renderToolResultMessage?.(message.toolUseResult.data, {
      verbose
    }))
  );
}

// src/components/messages/UserToolResultMessage/UserToolResultMessage.tsx
function UserToolResultMessage({
  param,
  message,
  messages,
  tools,
  verbose,
  width
}) {
  if (param.content === CANCEL_MESSAGE) {
    return /* @__PURE__ */ React59.createElement(UserToolCanceledMessage, null);
  }
  if (param.content === REJECT_MESSAGE) {
    return /* @__PURE__ */ React59.createElement(
      UserToolRejectMessage,
      {
        toolUseID: param.tool_use_id,
        tools,
        messages,
        verbose
      }
    );
  }
  if (param.is_error) {
    return /* @__PURE__ */ React59.createElement(UserToolErrorMessage, { param, verbose });
  }
  return /* @__PURE__ */ React59.createElement(
    UserToolSuccessMessage,
    {
      param,
      message,
      messages,
      tools,
      verbose,
      width
    }
  );
}

// src/components/messages/AssistantToolUseMessage.tsx
init_log();
import { Box as Box42, Text as Text51 } from "ink";
import React64 from "react";

// src/components/ToolUseLoader.tsx
import { Box as Box39, Text as Text47 } from "ink";
import React60 from "react";

// src/hooks/useInterval.ts
import { useEffect as useEffect10, useRef as useRef5 } from "react";
function useInterval(callback, delay) {
  const savedCallback = useRef5(callback);
  useEffect10(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect10(() => {
    function tick() {
      savedCallback.current();
    }
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

// src/constants/figures.ts
init_env();
var BLACK_CIRCLE = env2.platform === "macos" ? "\u23FA" : "\u25CF";

// src/components/ToolUseLoader.tsx
function ToolUseLoader({
  isError,
  isUnresolved,
  shouldAnimate
}) {
  const [isVisible, setIsVisible] = React60.useState(true);
  useInterval(() => {
    if (!shouldAnimate) {
      return;
    }
    setIsVisible((_) => !_);
  }, 600);
  const color = isUnresolved ? getTheme().secondaryText : isError ? getTheme().error : getTheme().success;
  return /* @__PURE__ */ React60.createElement(Box39, { minWidth: 2 }, /* @__PURE__ */ React60.createElement(Text47, { color }, isVisible ? BLACK_CIRCLE : "  "));
}

// src/tools/ThinkTool/ThinkTool.tsx
import { z as z13 } from "zod";
import React62 from "react";
import { Text as Text49 } from "ink";

// src/tools/ThinkTool/prompt.ts
var DESCRIPTION12 = "This is a no-op tool that logs a thought. It is inspired by the tau-bench think tool.";
var PROMPT7 = `Use the tool to think about something. It will not obtain new information or make any changes to the repository, but just log the thought. Use it when complex reasoning or brainstorming is needed. 

Common use cases:
1. When exploring a repository and discovering the source of a bug, call this tool to brainstorm several unique ways of fixing the bug, and assess which change(s) are likely to be simplest and most effective
2. After receiving test results, use this tool to brainstorm ways to fix failing tests
3. When planning a complex refactoring, use this tool to outline different approaches and their tradeoffs
4. When designing a new feature, use this tool to think through architecture decisions and implementation details
5. When debugging a complex issue, use this tool to organize your thoughts and hypotheses

The tool simply logs your thought process for better transparency and does not execute any code or make changes.`;

// src/components/MessageResponse.tsx
import { Box as Box40, Text as Text48 } from "ink";
import * as React61 from "react";
function MessageResponse({ children }) {
  return /* @__PURE__ */ React61.createElement(Box40, { flexDirection: "row", height: 1, overflow: "hidden" }, /* @__PURE__ */ React61.createElement(Text48, null, "  ", "\u23BF \xA0"), children);
}

// src/tools/ThinkTool/ThinkTool.tsx
init_statsig();
init_model();
var thinkToolSchema = z13.object({
  thought: z13.string().describe("Your thoughts.")
});
var ThinkTool = {
  name: "Think",
  userFacingName: () => "Think",
  description: async () => DESCRIPTION12,
  inputSchema: thinkToolSchema,
  isEnabled: async () => Boolean(process.env.THINK_TOOL) && await checkGate("tengu_think_tool"),
  isReadOnly: () => true,
  needsPermissions: () => false,
  prompt: async () => PROMPT7,
  async *call(input, { messageId }) {
    logEvent("tengu_thinking", {
      messageId,
      thoughtLength: input.thought.length.toString(),
      method: "tool",
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
    });
    yield {
      type: "result",
      resultForAssistant: "Your thought has been logged.",
      data: { thought: input.thought }
    };
  },
  // This is never called -- it's special-cased in AssistantToolUseMessage
  renderToolUseMessage(input) {
    return input.thought;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React62.createElement(MessageResponse, null, /* @__PURE__ */ React62.createElement(Text49, { color: getTheme().error }, "Thought cancelled"));
  },
  renderResultForAssistant: () => "Your thought has been logged."
};

// src/components/messages/AssistantThinkingMessage.tsx
import React63 from "react";
import { Box as Box41, Text as Text50 } from "ink";

// src/utils/markdown.ts
import { marked } from "marked";
init_source();
init_log();
import { EOL as EOL3 } from "os";
import { highlight as highlight2, supportsLanguage as supportsLanguage2 } from "cli-highlight";
function applyMarkdown(content) {
  return marked.lexer(stripSystemMessages(content)).map((_) => format(_)).join("").trim();
}
function format(token, listDepth = 0, orderedListNumber = null, parent = null) {
  switch (token.type) {
    case "blockquote":
      return source_default.dim.italic((token.tokens ?? []).map((_) => format(_)).join(""));
    case "code":
      if (token.lang && supportsLanguage2(token.lang)) {
        return highlight2(token.text, { language: token.lang }) + EOL3;
      } else {
        logError(
          `Language not supported while highlighting code, falling back to markdown: ${token.lang}`
        );
        return highlight2(token.text, { language: "markdown" }) + EOL3;
      }
    case "codespan":
      return source_default.blue(token.text);
    case "em":
      return source_default.italic((token.tokens ?? []).map((_) => format(_)).join(""));
    case "strong":
      return source_default.bold((token.tokens ?? []).map((_) => format(_)).join(""));
    case "heading":
      switch (token.depth) {
        case 1:
          return source_default.bold.italic.underline(
            (token.tokens ?? []).map((_) => format(_)).join("")
          ) + EOL3 + EOL3;
        case 2:
          return source_default.bold((token.tokens ?? []).map((_) => format(_)).join("")) + EOL3 + EOL3;
        default:
          return source_default.bold.dim((token.tokens ?? []).map((_) => format(_)).join("")) + EOL3 + EOL3;
      }
    case "hr":
      return "---";
    case "image":
      return `[Image: ${token.title}: ${token.href}]`;
    case "link":
      return source_default.blue(token.href);
    case "list": {
      return token.items.map(
        (_, index) => format(
          _,
          listDepth,
          token.ordered ? token.start + index : null,
          token
        )
      ).join("");
    }
    case "list_item":
      return (token.tokens ?? []).map(
        (_) => `${"  ".repeat(listDepth)}${format(_, listDepth + 1, orderedListNumber, token)}`
      ).join("");
    case "paragraph":
      return (token.tokens ?? []).map((_) => format(_)).join("") + EOL3;
    case "space":
      return EOL3;
    case "text":
      if (parent?.type === "list_item") {
        return `${orderedListNumber === null ? "-" : getListNumber(listDepth, orderedListNumber) + "."} ${token.tokens ? token.tokens.map((_) => format(_, listDepth, orderedListNumber, token)).join("") : token.text}${EOL3}`;
      } else {
        return token.text;
      }
  }
  return "";
}
var DEPTH_1_LIST_NUMBERS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "aa",
  "ab",
  "ac",
  "ad",
  "ae",
  "af",
  "ag",
  "ah",
  "ai",
  "aj",
  "ak",
  "al",
  "am",
  "an",
  "ao",
  "ap",
  "aq",
  "ar",
  "as",
  "at",
  "au",
  "av",
  "aw",
  "ax",
  "ay",
  "az"
];
var DEPTH_2_LIST_NUMBERS = [
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
  "xi",
  "xii",
  "xiii",
  "xiv",
  "xv",
  "xvi",
  "xvii",
  "xviii",
  "xix",
  "xx",
  "xxi",
  "xxii",
  "xxiii",
  "xxiv",
  "xxv",
  "xxvi",
  "xxvii",
  "xxviii",
  "xxix",
  "xxx",
  "xxxi",
  "xxxii",
  "xxxiii",
  "xxxiv",
  "xxxv",
  "xxxvi",
  "xxxvii",
  "xxxviii",
  "xxxix",
  "xl"
];
function getListNumber(listDepth, orderedListNumber) {
  switch (listDepth) {
    case 0:
    case 1:
      return orderedListNumber.toString();
    case 2:
      return DEPTH_1_LIST_NUMBERS[orderedListNumber - 1];
    // TODO: don't hard code the list
    case 3:
      return DEPTH_2_LIST_NUMBERS[orderedListNumber - 1];
    // TODO: don't hard code the list
    default:
      return orderedListNumber.toString();
  }
}

// src/components/messages/AssistantThinkingMessage.tsx
function AssistantThinkingMessage({
  param: { thinking },
  addMargin = false
}) {
  if (!thinking) {
    return null;
  }
  return /* @__PURE__ */ React63.createElement(
    Box41,
    {
      flexDirection: "column",
      gap: 1,
      marginTop: addMargin ? 1 : 0,
      width: "100%"
    },
    /* @__PURE__ */ React63.createElement(Text50, { color: getTheme().secondaryText, italic: true }, "\u273B Thinking\u2026"),
    /* @__PURE__ */ React63.createElement(Box41, { paddingLeft: 2 }, /* @__PURE__ */ React63.createElement(Text50, { color: getTheme().secondaryText, italic: true }, applyMarkdown(thinking)))
  );
}

// src/components/messages/AssistantToolUseMessage.tsx
function AssistantToolUseMessage({
  param,
  costUSD,
  durationMs,
  addMargin,
  tools,
  debug: debug2,
  verbose,
  erroredToolUseIDs,
  inProgressToolUseIDs,
  unresolvedToolUseIDs,
  shouldAnimate,
  shouldShowDot
}) {
  const tool = tools.find((_) => _.name === param.name);
  if (!tool) {
    logError(`Tool ${param.name} not found`);
    return null;
  }
  const isQueued = !inProgressToolUseIDs.has(param.id) && unresolvedToolUseIDs.has(param.id);
  const color = isQueued ? getTheme().secondaryText : void 0;
  if (tool === ThinkTool) {
    const { thought } = ThinkTool.inputSchema.parse(param.input);
    return /* @__PURE__ */ React64.createElement(
      AssistantThinkingMessage,
      {
        param: { thinking: thought, signature: "", type: "thinking" },
        addMargin
      }
    );
  }
  const userFacingToolName = tool.userFacingName(param.input);
  return /* @__PURE__ */ React64.createElement(
    Box42,
    {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: addMargin ? 1 : 0,
      width: "100%"
    },
    /* @__PURE__ */ React64.createElement(Box42, null, /* @__PURE__ */ React64.createElement(
      Box42,
      {
        flexWrap: "nowrap",
        minWidth: userFacingToolName.length + (shouldShowDot ? 2 : 0)
      },
      shouldShowDot && (isQueued ? /* @__PURE__ */ React64.createElement(Box42, { minWidth: 2 }, /* @__PURE__ */ React64.createElement(Text51, { color }, BLACK_CIRCLE)) : /* @__PURE__ */ React64.createElement(
        ToolUseLoader,
        {
          shouldAnimate,
          isUnresolved: unresolvedToolUseIDs.has(param.id),
          isError: erroredToolUseIDs.has(param.id)
        }
      )),
      /* @__PURE__ */ React64.createElement(Text51, { color, bold: !isQueued }, userFacingToolName)
    ), /* @__PURE__ */ React64.createElement(Box42, { flexWrap: "nowrap" }, Object.keys(param.input).length > 0 && /* @__PURE__ */ React64.createElement(Text51, { color }, "(", tool.renderToolUseMessage(param.input, {
      verbose
    }), ")"), /* @__PURE__ */ React64.createElement(Text51, { color }, "\u2026"))),
    /* @__PURE__ */ React64.createElement(Cost, { costUSD, durationMs, debug: debug2 })
  );
}

// src/components/messages/AssistantTextMessage.tsx
import React67 from "react";

// src/components/messages/AssistantBashOutputMessage.tsx
import * as React65 from "react";
function AssistantBashOutputMessage({
  content,
  verbose
}) {
  const stdout = extractTag(content, "bash-stdout") ?? "";
  const stderr = extractTag(content, "bash-stderr") ?? "";
  const stdoutLines = stdout.split("\n").length;
  const stderrLines = stderr.split("\n").length;
  return /* @__PURE__ */ React65.createElement(
    BashToolResultMessage_default,
    {
      content: { stdout, stdoutLines, stderr, stderrLines },
      verbose: !!verbose
    }
  );
}

// src/components/messages/AssistantLocalCommandOutputMessage.tsx
import * as React66 from "react";
import { Box as Box43, Text as Text52 } from "ink";
function AssistantLocalCommandOutputMessage({
  content
}) {
  const stdout = extractTag(content, "local-command-stdout");
  const stderr = extractTag(content, "local-command-stderr");
  if (!stdout && !stderr) {
    return [];
  }
  const theme = getTheme();
  let insides = [
    format2(stdout?.trim(), theme.text),
    format2(stderr?.trim(), theme.error)
  ].filter(Boolean);
  if (insides.length === 0) {
    insides = [/* @__PURE__ */ React66.createElement(Text52, { key: "0" }, "(No output)")];
  }
  return [
    /* @__PURE__ */ React66.createElement(Box43, { key: "0", gap: 1 }, /* @__PURE__ */ React66.createElement(Box43, null, /* @__PURE__ */ React66.createElement(Text52, { color: theme.secondaryText }, "  ", "\u23BF ")), insides.map((_, index) => /* @__PURE__ */ React66.createElement(Box43, { key: index, flexDirection: "column" }, _)))
  ];
}
function format2(content, color) {
  if (!content) {
    return null;
  }
  return /* @__PURE__ */ React66.createElement(Text52, { color }, content);
}

// src/components/messages/AssistantTextMessage.tsx
import { Box as Box44, Text as Text53 } from "ink";
function AssistantTextMessage({
  param: { text },
  costUSD,
  durationMs,
  debug: debug2,
  addMargin,
  shouldShowDot,
  verbose
}) {
  const { columns } = useTerminalSize();
  if (isEmptyMessageText(text)) {
    return null;
  }
  if (text.startsWith("<bash-stdout") || text.startsWith("<bash-stderr")) {
    return /* @__PURE__ */ React67.createElement(AssistantBashOutputMessage, { content: text, verbose });
  }
  if (text.startsWith("<local-command-stdout") || text.startsWith("<local-command-stderr")) {
    return /* @__PURE__ */ React67.createElement(AssistantLocalCommandOutputMessage, { content: text });
  }
  if (text.startsWith(API_ERROR_MESSAGE_PREFIX)) {
    return /* @__PURE__ */ React67.createElement(Text53, null, "\xA0\xA0\u23BF \xA0", /* @__PURE__ */ React67.createElement(Text53, { color: getTheme().error }, text === API_ERROR_MESSAGE_PREFIX ? `${API_ERROR_MESSAGE_PREFIX}: Please wait a moment and try again.` : text));
  }
  switch (text) {
    // Local JSX commands don't need a response, but we still want Claude to see them
    // Tool results render their own interrupt messages
    case NO_RESPONSE_REQUESTED:
    case INTERRUPT_MESSAGE_FOR_TOOL_USE:
      return null;
    case INTERRUPT_MESSAGE:
    case CANCEL_MESSAGE:
      return /* @__PURE__ */ React67.createElement(Text53, null, "\xA0\xA0\u23BF \xA0", /* @__PURE__ */ React67.createElement(Text53, { color: getTheme().error }, "Interrupted by user"));
    case PROMPT_TOO_LONG_ERROR_MESSAGE:
      return /* @__PURE__ */ React67.createElement(Text53, null, "\xA0\xA0\u23BF \xA0", /* @__PURE__ */ React67.createElement(Text53, { color: getTheme().error }, "Context low \xB7 Run /compact to compact & continue"));
    case CREDIT_BALANCE_TOO_LOW_ERROR_MESSAGE:
      return /* @__PURE__ */ React67.createElement(Text53, null, "\xA0\xA0\u23BF \xA0", /* @__PURE__ */ React67.createElement(Text53, { color: getTheme().error }, "Credit balance too low \xB7 Add funds: https://console.anthropic.com/settings/billing"));
    case INVALID_API_KEY_ERROR_MESSAGE:
      return /* @__PURE__ */ React67.createElement(Text53, null, "\xA0\xA0\u23BF \xA0", /* @__PURE__ */ React67.createElement(Text53, { color: getTheme().error }, INVALID_API_KEY_ERROR_MESSAGE));
    default:
      return /* @__PURE__ */ React67.createElement(
        Box44,
        {
          alignItems: "flex-start",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: addMargin ? 1 : 0,
          width: "100%"
        },
        /* @__PURE__ */ React67.createElement(Box44, { flexDirection: "row" }, shouldShowDot && /* @__PURE__ */ React67.createElement(Box44, { minWidth: 2 }, /* @__PURE__ */ React67.createElement(Text53, { color: getTheme().text }, BLACK_CIRCLE)), /* @__PURE__ */ React67.createElement(Box44, { flexDirection: "column", width: columns - 6 }, /* @__PURE__ */ React67.createElement(Text53, null, applyMarkdown(text)))),
        /* @__PURE__ */ React67.createElement(Cost, { costUSD, durationMs, debug: debug2 })
      );
  }
}

// src/components/messages/UserCommandMessage.tsx
import { Box as Box45, Text as Text54 } from "ink";
import * as React68 from "react";
function UserCommandMessage({
  addMargin,
  param: { text }
}) {
  const commandMessage = extractTag(text, "command-message");
  const args = extractTag(text, "command-args");
  if (!commandMessage) {
    return null;
  }
  const theme = getTheme();
  return /* @__PURE__ */ React68.createElement(Box45, { flexDirection: "column", marginTop: addMargin ? 1 : 0, width: "100%" }, /* @__PURE__ */ React68.createElement(Text54, { color: theme.secondaryText }, "> /", commandMessage, " ", args));
}

// src/components/messages/UserPromptMessage.tsx
import React69 from "react";
import { Box as Box46, Text as Text55 } from "ink";
init_log();
function UserPromptMessage({
  addMargin,
  param: { text }
}) {
  const { columns } = useTerminalSize();
  if (!text) {
    logError("No content found in user prompt message");
    return null;
  }
  return /* @__PURE__ */ React69.createElement(Box46, { flexDirection: "row", marginTop: addMargin ? 1 : 0, width: "100%" }, /* @__PURE__ */ React69.createElement(Box46, { minWidth: 2, width: 2 }, /* @__PURE__ */ React69.createElement(Text55, { color: getTheme().secondaryText }, ">")), /* @__PURE__ */ React69.createElement(Box46, { flexDirection: "column", width: columns - 4 }, /* @__PURE__ */ React69.createElement(Text55, { color: getTheme().secondaryText, wrap: "wrap" }, text)));
}

// src/components/messages/UserTextMessage.tsx
import * as React70 from "react";
function UserTextMessage({ addMargin, param }) {
  if (param.text.trim() === NO_CONTENT_MESSAGE) {
    return null;
  }
  if (param.text.includes("<bash-input>")) {
    return /* @__PURE__ */ React70.createElement(UserBashInputMessage, { addMargin, param });
  }
  if (param.text.includes("<command-name>") || param.text.includes("<command-message>")) {
    return /* @__PURE__ */ React70.createElement(UserCommandMessage, { addMargin, param });
  }
  return /* @__PURE__ */ React70.createElement(UserPromptMessage, { addMargin, param });
}

// src/components/messages/AssistantRedactedThinkingMessage.tsx
import React71 from "react";
import { Box as Box47, Text as Text56 } from "ink";
function AssistantRedactedThinkingMessage({
  addMargin = false
}) {
  return /* @__PURE__ */ React71.createElement(Box47, { marginTop: addMargin ? 1 : 0 }, /* @__PURE__ */ React71.createElement(Text56, { color: getTheme().secondaryText, italic: true }, "\u273B Thinking\u2026"));
}

// src/components/Message.tsx
function Message({
  message,
  messages,
  addMargin,
  tools,
  verbose,
  debug: debug2,
  erroredToolUseIDs,
  inProgressToolUseIDs,
  unresolvedToolUseIDs,
  shouldAnimate,
  shouldShowDot,
  width
}) {
  if (message.type === "assistant") {
    return /* @__PURE__ */ React72.createElement(Box48, { flexDirection: "column", width: "100%" }, message.message.content.map((_, index) => /* @__PURE__ */ React72.createElement(
      AssistantMessage,
      {
        key: index,
        param: _,
        costUSD: message.costUSD,
        durationMs: message.durationMs,
        addMargin,
        tools,
        debug: debug2,
        options: { verbose },
        erroredToolUseIDs,
        inProgressToolUseIDs,
        unresolvedToolUseIDs,
        shouldAnimate,
        shouldShowDot,
        width
      }
    )));
  }
  const content = typeof message.message.content === "string" ? [{ type: "text", text: message.message.content }] : message.message.content;
  return /* @__PURE__ */ React72.createElement(Box48, { flexDirection: "column", width: "100%" }, content.map((_, index) => /* @__PURE__ */ React72.createElement(
    UserMessage,
    {
      key: index,
      message,
      messages,
      addMargin,
      tools,
      param: _,
      options: { verbose }
    }
  )));
}
function UserMessage({
  message,
  messages,
  addMargin,
  tools,
  param,
  options: { verbose }
}) {
  const { columns } = useTerminalSize();
  switch (param.type) {
    case "text":
      return /* @__PURE__ */ React72.createElement(UserTextMessage, { addMargin, param });
    case "tool_result":
      return /* @__PURE__ */ React72.createElement(
        UserToolResultMessage,
        {
          param,
          message,
          messages,
          tools,
          verbose,
          width: columns - 5
        }
      );
  }
}
function AssistantMessage({
  param,
  costUSD,
  durationMs,
  addMargin,
  tools,
  debug: debug2,
  options: { verbose },
  erroredToolUseIDs,
  inProgressToolUseIDs,
  unresolvedToolUseIDs,
  shouldAnimate,
  shouldShowDot,
  width
}) {
  switch (param.type) {
    case "tool_use":
      return /* @__PURE__ */ React72.createElement(
        AssistantToolUseMessage,
        {
          param,
          costUSD,
          durationMs,
          addMargin,
          tools,
          debug: debug2,
          verbose,
          erroredToolUseIDs,
          inProgressToolUseIDs,
          unresolvedToolUseIDs,
          shouldAnimate,
          shouldShowDot
        }
      );
    case "text":
      return /* @__PURE__ */ React72.createElement(
        AssistantTextMessage,
        {
          param,
          costUSD,
          durationMs,
          debug: debug2,
          addMargin,
          shouldShowDot,
          verbose,
          width
        }
      );
    case "redacted_thinking":
      return /* @__PURE__ */ React72.createElement(AssistantRedactedThinkingMessage, { addMargin });
    case "thinking":
      return /* @__PURE__ */ React72.createElement(AssistantThinkingMessage, { addMargin, param });
    default:
      logError(`Unable to render message type: ${param.type}`);
      return null;
  }
}

// src/components/MessageSelector.tsx
import { Box as Box49, Text as Text57, useInput as useInput12 } from "ink";
import * as React73 from "react";
import { useMemo as useMemo5, useState as useState14, useEffect as useEffect11 } from "react";
import figures3 from "figures";
import { randomUUID as randomUUID5 } from "crypto";
init_statsig();
var MAX_VISIBLE_MESSAGES = 7;
function MessageSelector({
  erroredToolUseIDs,
  messages,
  onSelect,
  onEscape,
  tools,
  unresolvedToolUseIDs
}) {
  const currentUUID = useMemo5(randomUUID5, []);
  useEffect11(() => {
    logEvent("tengu_message_selector_opened", {});
  }, []);
  function handleSelect(message) {
    const indexFromEnd = messages.length - 1 - messages.indexOf(message);
    logEvent("tengu_message_selector_selected", {
      index_from_end: indexFromEnd.toString(),
      message_type: message.type,
      is_current_prompt: (message.uuid === currentUUID).toString()
    });
    onSelect(message);
  }
  function handleEscape() {
    logEvent("tengu_message_selector_cancelled", {});
    onEscape();
  }
  const allItems = useMemo5(
    () => [
      // Filter out tool results
      ...messages.filter(
        (_) => !(_.type === "user" && Array.isArray(_.message.content) && _.message.content[0]?.type === "tool_result")
      ).filter((_) => _.type !== "assistant"),
      { ...createUserMessage(""), uuid: currentUUID }
    ],
    [messages, currentUUID]
  );
  const [selectedIndex, setSelectedIndex] = useState14(allItems.length - 1);
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  useInput12((input, key) => {
    if (key.tab || key.escape) {
      handleEscape();
      return;
    }
    if (key.return) {
      handleSelect(allItems[selectedIndex]);
      return;
    }
    if (key.upArrow) {
      if (key.ctrl || key.shift || key.meta) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      }
    }
    if (key.downArrow) {
      if (key.ctrl || key.shift || key.meta) {
        setSelectedIndex(allItems.length - 1);
      } else {
        setSelectedIndex((prev) => Math.min(allItems.length - 1, prev + 1));
      }
    }
    const num = Number(input);
    if (!isNaN(num) && num >= 1 && num <= Math.min(9, allItems.length)) {
      if (!allItems[num - 1]) {
        return;
      }
      handleSelect(allItems[num - 1]);
    }
  });
  const firstVisibleIndex = Math.max(
    0,
    Math.min(
      selectedIndex - Math.floor(MAX_VISIBLE_MESSAGES / 2),
      allItems.length - MAX_VISIBLE_MESSAGES
    )
  );
  const normalizedMessages = useMemo5(
    () => normalizeMessages(messages).filter(isNotEmptyMessage),
    [messages]
  );
  return /* @__PURE__ */ React73.createElement(React73.Fragment, null, /* @__PURE__ */ React73.createElement(
    Box49,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: getTheme().secondaryBorder,
      height: 4 + Math.min(MAX_VISIBLE_MESSAGES, allItems.length) * 2,
      paddingX: 1,
      marginTop: 1
    },
    /* @__PURE__ */ React73.createElement(Box49, { flexDirection: "column", minHeight: 2, marginBottom: 1 }, /* @__PURE__ */ React73.createElement(Text57, { bold: true }, "Jump to a previous message"), /* @__PURE__ */ React73.createElement(Text57, { dimColor: true }, "This will fork the conversation")),
    allItems.slice(firstVisibleIndex, firstVisibleIndex + MAX_VISIBLE_MESSAGES).map((msg, index) => {
      const actualIndex = firstVisibleIndex + index;
      const isSelected = actualIndex === selectedIndex;
      const isCurrent = msg.uuid === currentUUID;
      return /* @__PURE__ */ React73.createElement(Box49, { key: msg.uuid, flexDirection: "row", height: 2, minHeight: 2 }, /* @__PURE__ */ React73.createElement(Box49, { width: 7 }, isSelected ? /* @__PURE__ */ React73.createElement(Text57, { color: "blue", bold: true }, figures3.pointer, " ", firstVisibleIndex + index + 1, " ") : /* @__PURE__ */ React73.createElement(Text57, null, "  ", firstVisibleIndex + index + 1, " ")), /* @__PURE__ */ React73.createElement(Box49, { height: 1, overflow: "hidden", width: 100 }, isCurrent ? /* @__PURE__ */ React73.createElement(Box49, { width: "100%" }, /* @__PURE__ */ React73.createElement(Text57, { dimColor: true, italic: true }, "(current)")) : Array.isArray(msg.message.content) && msg.message.content[0]?.type === "text" && isEmptyMessageText(msg.message.content[0].text) ? /* @__PURE__ */ React73.createElement(Text57, { dimColor: true, italic: true }, "(empty message)") : /* @__PURE__ */ React73.createElement(
        Message,
        {
          message: msg,
          messages: normalizedMessages,
          addMargin: false,
          tools,
          verbose: false,
          debug: false,
          erroredToolUseIDs,
          inProgressToolUseIDs: /* @__PURE__ */ new Set(),
          unresolvedToolUseIDs,
          shouldAnimate: false,
          shouldShowDot: false
        }
      )));
    })
  ), /* @__PURE__ */ React73.createElement(Box49, { marginLeft: 3 }, /* @__PURE__ */ React73.createElement(Text57, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React73.createElement(React73.Fragment, null, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React73.createElement(React73.Fragment, null, "\u2191/\u2193 to select \xB7 Enter to confirm \xB7 Tab/Esc to cancel"))));
}

// src/components/permissions/PermissionRequest.tsx
import { useInput as useInput14 } from "ink";
import * as React88 from "react";

// src/tools/FileEditTool/FileEditTool.tsx
import { existsSync as existsSync20, mkdirSync as mkdirSync8, readFileSync as readFileSync18, statSync as statSync5 } from "fs";
import { Box as Box52, Text as Text60 } from "ink";
import { dirname as dirname6, isAbsolute as isAbsolute10, relative as relative9, resolve as resolve14, sep as sep4 } from "path";
import * as React76 from "react";
import { z as z15 } from "zod";

// src/components/FileEditToolUpdatedMessage.tsx
import { Box as Box50, Text as Text58 } from "ink";
import * as React74 from "react";

// src/utils/array.ts
function intersperse(as, separator) {
  return as.flatMap((a, i) => i ? [separator(i), a] : [a]);
}

// src/components/FileEditToolUpdatedMessage.tsx
init_state();
import { relative as relative7 } from "path";
function FileEditToolUpdatedMessage({
  filePath,
  structuredPatch: structuredPatch2,
  verbose
}) {
  const { columns } = useTerminalSize();
  const numAdditions = structuredPatch2.reduce(
    (count, hunk) => count + hunk.lines.filter((_) => _.startsWith("+")).length,
    0
  );
  const numRemovals = structuredPatch2.reduce(
    (count, hunk) => count + hunk.lines.filter((_) => _.startsWith("-")).length,
    0
  );
  return /* @__PURE__ */ React74.createElement(Box50, { flexDirection: "column" }, /* @__PURE__ */ React74.createElement(Text58, null, "  ", "\u23BF Updated", " ", /* @__PURE__ */ React74.createElement(Text58, { bold: true }, verbose ? filePath : relative7(getCwd(), filePath)), numAdditions > 0 || numRemovals > 0 ? " with " : "", numAdditions > 0 ? /* @__PURE__ */ React74.createElement(React74.Fragment, null, /* @__PURE__ */ React74.createElement(Text58, { bold: true }, numAdditions), " ", numAdditions > 1 ? "additions" : "addition") : null, numAdditions > 0 && numRemovals > 0 ? " and " : null, numRemovals > 0 ? /* @__PURE__ */ React74.createElement(React74.Fragment, null, /* @__PURE__ */ React74.createElement(Text58, { bold: true }, numRemovals), " ", numRemovals > 1 ? "removals" : "removal") : null), intersperse(
    structuredPatch2.map((_) => /* @__PURE__ */ React74.createElement(Box50, { flexDirection: "column", paddingLeft: 5, key: _.newStart }, /* @__PURE__ */ React74.createElement(StructuredDiff, { patch: _, dim: false, width: columns - 12 }))),
    (i) => /* @__PURE__ */ React74.createElement(Box50, { paddingLeft: 5, key: `ellipsis-${i}` }, /* @__PURE__ */ React74.createElement(Text58, { color: getTheme().secondaryText }, "..."))
  ));
}

// src/tools/FileEditTool/FileEditTool.tsx
init_statsig();
init_log();
init_state();

// src/tools/NotebookEditTool/NotebookEditTool.tsx
import { existsSync as existsSync19, readFileSync as readFileSync16 } from "fs";
import { Box as Box51, Text as Text59 } from "ink";
import { extname as extname5, isAbsolute as isAbsolute8, relative as relative8, resolve as resolve12 } from "path";
import * as React75 from "react";
import { z as z14 } from "zod";
init_json();
init_state();

// src/tools/NotebookEditTool/prompt.ts
var DESCRIPTION13 = "Replace the contents of a specific cell in a Jupyter notebook.";
var PROMPT8 = `Completely replaces the contents of a specific cell in a Jupyter notebook (.ipynb file) with new source. Jupyter notebooks are interactive documents that combine code, text, and visualizations, commonly used for data analysis and scientific computing. The notebook_path parameter must be an absolute path, not a relative path. The cell_number is 0-indexed. Use edit_mode=insert to add a new cell at the index specified by cell_number. Use edit_mode=delete to delete the cell at the index specified by cell_number.`;

// src/tools/NotebookEditTool/NotebookEditTool.tsx
var inputSchema13 = z14.strictObject({
  notebook_path: z14.string().describe(
    "The absolute path to the Jupyter notebook file to edit (must be absolute, not relative)"
  ),
  cell_number: z14.number().describe("The index of the cell to edit (0-based)"),
  new_source: z14.string().describe("The new source for the cell"),
  cell_type: z14.enum(["code", "markdown"]).optional().describe(
    "The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."
  ),
  edit_mode: z14.string().optional().describe(
    "The type of edit to make (replace, insert, delete). Defaults to replace."
  )
});
var NotebookEditTool = {
  name: "NotebookEditCell",
  async description() {
    return DESCRIPTION13;
  },
  async prompt() {
    return PROMPT8;
  },
  inputSchema: inputSchema13,
  userFacingName() {
    return "Edit Notebook";
  },
  async isEnabled() {
    return true;
  },
  isReadOnly() {
    return false;
  },
  needsPermissions({ notebook_path }) {
    return !hasWritePermission(notebook_path);
  },
  renderResultForAssistant({ cell_number, edit_mode, new_source, error }) {
    if (error) {
      return error;
    }
    switch (edit_mode) {
      case "replace":
        return `Updated cell ${cell_number} with ${new_source}`;
      case "insert":
        return `Inserted cell ${cell_number} with ${new_source}`;
      case "delete":
        return `Deleted cell ${cell_number}`;
    }
  },
  renderToolUseMessage(input, { verbose }) {
    return `notebook_path: ${verbose ? input.notebook_path : relative8(getCwd(), input.notebook_path)}, cell: ${input.cell_number}, content: ${input.new_source.slice(0, 30)}\u2026, cell_type: ${input.cell_type}, edit_mode: ${input.edit_mode ?? "replace"}`;
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React75.createElement(FallbackToolUseRejectedMessage, null);
  },
  renderToolResultMessage({ cell_number, new_source, language, error }) {
    if (error) {
      return /* @__PURE__ */ React75.createElement(Box51, { flexDirection: "column" }, /* @__PURE__ */ React75.createElement(Text59, { color: "red" }, error));
    }
    return /* @__PURE__ */ React75.createElement(Box51, { flexDirection: "column" }, /* @__PURE__ */ React75.createElement(Text59, null, "Updated cell ", cell_number, ":"), /* @__PURE__ */ React75.createElement(Box51, { marginLeft: 2 }, /* @__PURE__ */ React75.createElement(HighlightedCode, { code: new_source, language })));
  },
  async validateInput({
    notebook_path,
    cell_number,
    cell_type,
    edit_mode = "replace"
  }) {
    const fullPath = isAbsolute8(notebook_path) ? notebook_path : resolve12(getCwd(), notebook_path);
    if (!existsSync19(fullPath)) {
      return {
        result: false,
        message: "Notebook file does not exist."
      };
    }
    if (extname5(fullPath) !== ".ipynb") {
      return {
        result: false,
        message: "File must be a Jupyter notebook (.ipynb file). For editing other file types, use the FileEdit tool."
      };
    }
    if (cell_number < 0) {
      return {
        result: false,
        message: "Cell number must be non-negative."
      };
    }
    if (edit_mode !== "replace" && edit_mode !== "insert" && edit_mode !== "delete") {
      return {
        result: false,
        message: "Edit mode must be replace, insert, or delete."
      };
    }
    if (edit_mode === "insert" && !cell_type) {
      return {
        result: false,
        message: "Cell type is required when using edit_mode=insert."
      };
    }
    const enc = detectFileEncoding(fullPath);
    const content = readFileSync16(fullPath, enc);
    const notebook = safeParseJSON(content);
    if (!notebook) {
      return {
        result: false,
        message: "Notebook is not valid JSON."
      };
    }
    if (edit_mode === "insert" && cell_number > notebook.cells.length) {
      return {
        result: false,
        message: `Cell number is out of bounds. For insert mode, the maximum value is ${notebook.cells.length} (to append at the end).`
      };
    } else if ((edit_mode === "replace" || edit_mode === "delete") && (cell_number >= notebook.cells.length || !notebook.cells[cell_number])) {
      return {
        result: false,
        message: `Cell number is out of bounds. Notebook has ${notebook.cells.length} cells.`
      };
    }
    return { result: true };
  },
  async *call({
    notebook_path,
    cell_number,
    new_source,
    cell_type,
    edit_mode
  }) {
    const fullPath = isAbsolute8(notebook_path) ? notebook_path : resolve12(getCwd(), notebook_path);
    try {
      const enc = detectFileEncoding(fullPath);
      const content = readFileSync16(fullPath, enc);
      const notebook = JSON.parse(content);
      const language = notebook.metadata.language_info?.name ?? "python";
      if (edit_mode === "delete") {
        notebook.cells.splice(cell_number, 1);
      } else if (edit_mode === "insert") {
        const new_cell = {
          cell_type,
          // validateInput ensures cell_type is not undefined
          source: new_source,
          metadata: {}
        };
        notebook.cells.splice(
          cell_number,
          0,
          cell_type == "markdown" ? new_cell : { ...new_cell, outputs: [] }
        );
      } else {
        const targetCell = notebook.cells[cell_number];
        targetCell.source = new_source;
        targetCell.execution_count = void 0;
        targetCell.outputs = [];
        if (cell_type && cell_type !== targetCell.cell_type) {
          targetCell.cell_type = cell_type;
        }
      }
      const endings = detectLineEndings(fullPath);
      writeTextContent(
        fullPath,
        JSON.stringify(notebook, null, 1),
        enc,
        endings
      );
      const data = {
        cell_number,
        new_source,
        cell_type: cell_type ?? "code",
        language,
        edit_mode: edit_mode ?? "replace",
        error: ""
      };
      yield {
        type: "result",
        data,
        resultForAssistant: this.renderResultForAssistant(data)
      };
    } catch (error) {
      if (error instanceof Error) {
        const data2 = {
          cell_number,
          new_source,
          cell_type: cell_type ?? "code",
          language: "python",
          edit_mode: "replace",
          error: error.message
        };
        yield {
          type: "result",
          data: data2,
          resultForAssistant: this.renderResultForAssistant(data2)
        };
        return;
      }
      const data = {
        cell_number,
        new_source,
        cell_type: cell_type ?? "code",
        language: "python",
        edit_mode: "replace",
        error: "Unknown error occurred while editing notebook"
      };
      yield {
        type: "result",
        data,
        resultForAssistant: this.renderResultForAssistant(data)
      };
    }
  }
};

// src/tools/FileEditTool/prompt.ts
var DESCRIPTION14 = `This is a tool for editing files. For moving or renaming files, you should generally use the Bash tool with the 'mv' command instead. For larger edits, use the Write tool to overwrite files. For Jupyter notebooks (.ipynb files), use the ${NotebookEditTool.name} instead.

Before using this tool:

1. Use the View tool to understand the file's contents and context

2. Verify the directory path is correct (only applicable when creating new files):
   - Use the LS tool to verify the parent directory exists and is the correct location

To make a file edit, provide the following:
1. file_path: The absolute path to the file to modify (must be absolute, not relative)
2. old_string: The text to replace (must be unique within the file, and must match the file contents exactly, including all whitespace and indentation)
3. new_string: The edited text to replace the old_string

The tool will replace ONE occurrence of old_string with new_string in the specified file.

CRITICAL REQUIREMENTS FOR USING THIS TOOL:

1. UNIQUENESS: The old_string MUST uniquely identify the specific instance you want to change. This means:
   - Include AT LEAST 3-5 lines of context BEFORE the change point
   - Include AT LEAST 3-5 lines of context AFTER the change point
   - Include all whitespace, indentation, and surrounding code exactly as it appears in the file

2. SINGLE INSTANCE: This tool can only change ONE instance at a time. If you need to change multiple instances:
   - Make separate calls to this tool for each instance
   - Each call must uniquely identify its specific instance using extensive context

3. VERIFICATION: Before using this tool:
   - Check how many instances of the target text exist in the file
   - If multiple instances exist, gather enough context to uniquely identify each one
   - Plan separate tool calls for each instance

WARNING: If you do not follow these requirements:
   - The tool will fail if old_string matches multiple locations
   - The tool will fail if old_string doesn't match exactly (including whitespace)
   - You may change the wrong instance if you don't include enough context

When making edits:
   - Ensure the edit results in idiomatic, correct code
   - Do not leave the code in a broken state
   - Always use absolute file paths (starting with /)

If you want to create a new file, use:
   - A new file path, including dir name if needed
   - An empty old_string
   - The new file's contents as new_string

Remember: when making multiple file edits in a row to the same file, you should prefer to send all edits in a single message with multiple calls to this tool, rather than multiple messages with a single call each.
`;

// src/tools/FileEditTool/utils.ts
init_state();
import { isAbsolute as isAbsolute9, resolve as resolve13 } from "path";
import { readFileSync as readFileSync17 } from "fs";

// src/utils/diff.ts
import { structuredPatch } from "diff";
var CONTEXT_LINES = 3;
var AMPERSAND_TOKEN = "<<:AMPERSAND_TOKEN:>>";
var DOLLAR_TOKEN = "<<:DOLLAR_TOKEN:>>";
function getPatch({
  filePath,
  fileContents,
  oldStr,
  newStr
}) {
  return structuredPatch(
    filePath,
    filePath,
    fileContents.replaceAll("&", AMPERSAND_TOKEN).replaceAll("$", DOLLAR_TOKEN),
    fileContents.replaceAll("&", AMPERSAND_TOKEN).replaceAll("$", DOLLAR_TOKEN).replace(
      oldStr.replaceAll("&", AMPERSAND_TOKEN).replaceAll("$", DOLLAR_TOKEN),
      newStr.replaceAll("&", AMPERSAND_TOKEN).replaceAll("$", DOLLAR_TOKEN)
    ),
    void 0,
    void 0,
    { context: CONTEXT_LINES }
  ).hunks.map((_) => ({
    ..._,
    lines: _.lines.map(
      (_2) => _2.replaceAll(AMPERSAND_TOKEN, "&").replaceAll(DOLLAR_TOKEN, "$")
    )
  }));
}

// src/tools/FileEditTool/utils.ts
function applyEdit(file_path, old_string, new_string) {
  const fullFilePath = isAbsolute9(file_path) ? file_path : resolve13(getCwd(), file_path);
  let originalFile;
  let updatedFile;
  if (old_string === "") {
    originalFile = "";
    updatedFile = new_string;
  } else {
    const enc = detectFileEncoding(fullFilePath);
    originalFile = readFileSync17(fullFilePath, enc);
    if (new_string === "") {
      if (!old_string.endsWith("\n") && originalFile.includes(old_string + "\n")) {
        updatedFile = originalFile.replace(old_string + "\n", () => new_string);
      } else {
        updatedFile = originalFile.replace(old_string, () => new_string);
      }
    } else {
      updatedFile = originalFile.replace(old_string, () => new_string);
    }
    if (updatedFile === originalFile) {
      throw new Error(
        "Original and edited file match exactly. Failed to apply edit."
      );
    }
  }
  const patch = getPatch({
    filePath: file_path,
    fileContents: originalFile,
    oldStr: originalFile,
    newStr: updatedFile
  });
  return { patch, updatedFile };
}

// src/tools/FileEditTool/FileEditTool.tsx
var inputSchema14 = z15.strictObject({
  file_path: z15.string().describe("The absolute path to the file to modify"),
  old_string: z15.string().describe("The text to replace"),
  new_string: z15.string().describe("The text to replace it with")
});
var N_LINES_SNIPPET = 4;
var FileEditTool = {
  name: "Edit",
  async description() {
    return "A tool for editing files";
  },
  async prompt() {
    return DESCRIPTION14;
  },
  inputSchema: inputSchema14,
  userFacingName({ old_string, new_string }) {
    if (old_string === "") return "Create";
    if (new_string === "") return "Delete";
    return "Update";
  },
  async isEnabled() {
    return true;
  },
  needsPermissions({ file_path }) {
    return !hasWritePermission(file_path);
  },
  isReadOnly() {
    return false;
  },
  renderToolUseMessage(input, { verbose }) {
    return `file_path: ${verbose ? input.file_path : relative9(getCwd(), input.file_path)}`;
  },
  renderToolResultMessage({ filePath, structuredPatch: structuredPatch2 }, { verbose }) {
    return /* @__PURE__ */ React76.createElement(
      FileEditToolUpdatedMessage,
      {
        filePath,
        structuredPatch: structuredPatch2,
        verbose
      }
    );
  },
  renderToolUseRejectedMessage({ file_path, old_string, new_string }, { columns, verbose }) {
    try {
      const { patch } = applyEdit(file_path, old_string, new_string);
      return /* @__PURE__ */ React76.createElement(Box52, { flexDirection: "column" }, /* @__PURE__ */ React76.createElement(Text60, null, "  ", "\u23BF", " ", /* @__PURE__ */ React76.createElement(Text60, { color: getTheme().error }, "User rejected ", old_string === "" ? "write" : "update", " to", " "), /* @__PURE__ */ React76.createElement(Text60, { bold: true }, verbose ? file_path : relative9(getCwd(), file_path))), intersperse(
        patch.map((patch2) => /* @__PURE__ */ React76.createElement(Box52, { flexDirection: "column", paddingLeft: 5, key: patch2.newStart }, /* @__PURE__ */ React76.createElement(StructuredDiff, { patch: patch2, dim: true, width: columns - 12 }))),
        (i) => /* @__PURE__ */ React76.createElement(Box52, { paddingLeft: 5, key: `ellipsis-${i}` }, /* @__PURE__ */ React76.createElement(Text60, { color: getTheme().secondaryText }, "..."))
      ));
    } catch (e) {
      logError(e);
      return /* @__PURE__ */ React76.createElement(Box52, { flexDirection: "column" }, /* @__PURE__ */ React76.createElement(Text60, null, "  ", "\u23BF (No changes)"));
    }
  },
  async validateInput({ file_path, old_string, new_string }, { readFileTimestamps }) {
    if (old_string === new_string) {
      return {
        result: false,
        message: "No changes to make: old_string and new_string are exactly the same.",
        meta: {
          old_string
        }
      };
    }
    const fullFilePath = isAbsolute10(file_path) ? file_path : resolve14(getCwd(), file_path);
    if (existsSync20(fullFilePath) && old_string === "") {
      return {
        result: false,
        message: "Cannot create new file - file already exists."
      };
    }
    if (!existsSync20(fullFilePath) && old_string === "") {
      return {
        result: true
      };
    }
    if (!existsSync20(fullFilePath)) {
      const similarFilename = findSimilarFile(fullFilePath);
      let message = "File does not exist.";
      if (similarFilename) {
        message += ` Did you mean ${similarFilename}?`;
      }
      return {
        result: false,
        message
      };
    }
    if (fullFilePath.endsWith(".ipynb")) {
      return {
        result: false,
        message: `File is a Jupyter Notebook. Use the ${NotebookEditTool.name} to edit this file.`
      };
    }
    const readTimestamp = readFileTimestamps[fullFilePath];
    if (!readTimestamp) {
      return {
        result: false,
        message: "File has not been read yet. Read it first before writing to it.",
        meta: {
          isFilePathAbsolute: String(isAbsolute10(file_path))
        }
      };
    }
    const stats = statSync5(fullFilePath);
    const lastWriteTime = stats.mtimeMs;
    if (lastWriteTime > readTimestamp) {
      return {
        result: false,
        message: "File has been modified since read, either by the user or by a linter. Read it again before attempting to write it."
      };
    }
    const enc = detectFileEncoding(fullFilePath);
    const file = readFileSync18(fullFilePath, enc);
    if (!file.includes(old_string)) {
      return {
        result: false,
        message: `String to replace not found in file.`,
        meta: {
          isFilePathAbsolute: String(isAbsolute10(file_path))
        }
      };
    }
    const matches = file.split(old_string).length - 1;
    if (matches > 1) {
      return {
        result: false,
        message: `Found ${matches} matches of the string to replace. For safety, this tool only supports replacing exactly one occurrence at a time. Add more lines of context to your edit and try again.`,
        meta: {
          isFilePathAbsolute: String(isAbsolute10(file_path))
        }
      };
    }
    return { result: true };
  },
  async *call({ file_path, old_string, new_string }, { readFileTimestamps }) {
    const { patch, updatedFile } = applyEdit(file_path, old_string, new_string);
    const fullFilePath = isAbsolute10(file_path) ? file_path : resolve14(getCwd(), file_path);
    const dir = dirname6(fullFilePath);
    mkdirSync8(dir, { recursive: true });
    const enc = existsSync20(fullFilePath) ? detectFileEncoding(fullFilePath) : "utf8";
    const endings = existsSync20(fullFilePath) ? detectLineEndings(fullFilePath) : "LF";
    const originalFile = existsSync20(fullFilePath) ? readFileSync18(fullFilePath, enc) : "";
    writeTextContent(fullFilePath, updatedFile, enc, endings);
    readFileTimestamps[fullFilePath] = statSync5(fullFilePath).mtimeMs;
    if (fullFilePath.endsWith(`${sep4}CLAUDE.md`)) {
      logEvent("tengu_write_claudemd", {});
    }
    const data = {
      filePath: file_path,
      oldString: old_string,
      newString: new_string,
      originalFile,
      structuredPatch: patch
    };
    yield {
      type: "result",
      data,
      resultForAssistant: this.renderResultForAssistant(data)
    };
  },
  renderResultForAssistant({ filePath, originalFile, oldString, newString }) {
    const { snippet, startLine } = getSnippet(
      originalFile || "",
      oldString,
      newString
    );
    return `The file ${filePath} has been updated. Here's the result of running \`cat -n\` on a snippet of the edited file:
${addLineNumbers({
      content: snippet,
      startLine
    })}`;
  }
};
function getSnippet(initialText, oldStr, newStr) {
  const before = initialText.split(oldStr)[0] ?? "";
  const replacementLine = before.split(/\r?\n/).length - 1;
  const newFileLines = initialText.replace(oldStr, newStr).split(/\r?\n/);
  const startLine = Math.max(0, replacementLine - N_LINES_SNIPPET);
  const endLine = replacementLine + N_LINES_SNIPPET + newStr.split(/\r?\n/).length;
  const snippetLines = newFileLines.slice(startLine, endLine + 1);
  const snippet = snippetLines.join("\n");
  return { snippet, startLine: startLine + 1 };
}

// src/tools/FileWriteTool/FileWriteTool.tsx
import { existsSync as existsSync21, mkdirSync as mkdirSync9, readFileSync as readFileSync19, statSync as statSync6 } from "fs";
import { Box as Box53, Text as Text61 } from "ink";
import { EOL as EOL4 } from "os";
import { dirname as dirname7, extname as extname6, isAbsolute as isAbsolute11, relative as relative10, resolve as resolve15, sep as sep5 } from "path";
import * as React77 from "react";
import { z as z16 } from "zod";
init_statsig();
init_log();
init_state();

// src/tools/FileWriteTool/prompt.ts
var PROMPT9 = `Write a file to the local filesystem. Overwrites the existing file if there is one.

Before using this tool:

1. Use the ReadFile tool to understand the file's contents and context

2. Directory Verification (only applicable when creating new files):
   - Use the LS tool to verify the parent directory exists and is the correct location`;

// src/tools/FileWriteTool/FileWriteTool.tsx
var MAX_LINES_TO_RENDER2 = 10;
var MAX_LINES_TO_RENDER_FOR_ASSISTANT = 16e3;
var TRUNCATED_MESSAGE2 = "<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with Grep in order to find the line numbers of what you are looking for.</NOTE>";
var inputSchema15 = z16.strictObject({
  file_path: z16.string().describe(
    "The absolute path to the file to write (must be absolute, not relative)"
  ),
  content: z16.string().describe("The content to write to the file")
});
var FileWriteTool = {
  name: "Replace",
  async description() {
    return "Write a file to the local filesystem.";
  },
  userFacingName: () => "Write",
  async prompt() {
    return PROMPT9;
  },
  inputSchema: inputSchema15,
  async isEnabled() {
    return true;
  },
  isReadOnly() {
    return false;
  },
  needsPermissions({ file_path }) {
    return !hasWritePermission(file_path);
  },
  renderToolUseMessage(input, { verbose }) {
    return `file_path: ${verbose ? input.file_path : relative10(getCwd(), input.file_path)}`;
  },
  renderToolUseRejectedMessage({ file_path, content }, { columns, verbose }) {
    try {
      const fullFilePath = isAbsolute11(file_path) ? file_path : resolve15(getCwd(), file_path);
      const oldFileExists = existsSync21(fullFilePath);
      const enc = oldFileExists ? detectFileEncoding(fullFilePath) : "utf-8";
      const oldContent = oldFileExists ? readFileSync19(fullFilePath, enc) : null;
      const type = oldContent ? "update" : "create";
      const patch = getPatch({
        filePath: file_path,
        fileContents: oldContent ?? "",
        oldStr: oldContent ?? "",
        newStr: content
      });
      return /* @__PURE__ */ React77.createElement(Box53, { flexDirection: "column" }, /* @__PURE__ */ React77.createElement(Text61, null, "  ", "\u23BF", " ", /* @__PURE__ */ React77.createElement(Text61, { color: getTheme().error }, "User rejected ", type === "update" ? "update" : "write", " to", " "), /* @__PURE__ */ React77.createElement(Text61, { bold: true }, verbose ? file_path : relative10(getCwd(), file_path))), intersperse(
        patch.map((_) => /* @__PURE__ */ React77.createElement(Box53, { flexDirection: "column", paddingLeft: 5, key: _.newStart }, /* @__PURE__ */ React77.createElement(StructuredDiff, { patch: _, dim: true, width: columns - 12 }))),
        (i) => /* @__PURE__ */ React77.createElement(Box53, { paddingLeft: 5, key: `ellipsis-${i}` }, /* @__PURE__ */ React77.createElement(Text61, { color: getTheme().secondaryText }, "..."))
      ));
    } catch (e) {
      logError(e);
      return /* @__PURE__ */ React77.createElement(Box53, { flexDirection: "column" }, /* @__PURE__ */ React77.createElement(Text61, null, "  ", "\u23BF (No changes)"));
    }
  },
  renderToolResultMessage({ filePath, content, structuredPatch: structuredPatch2, type }, { verbose }) {
    switch (type) {
      case "create": {
        const contentWithFallback = content || "(No content)";
        const numLines = content.split(EOL4).length;
        return /* @__PURE__ */ React77.createElement(Box53, { flexDirection: "column" }, /* @__PURE__ */ React77.createElement(Text61, null, "  ", "\u23BF Wrote ", numLines, " lines to", " ", /* @__PURE__ */ React77.createElement(Text61, { bold: true }, verbose ? filePath : relative10(getCwd(), filePath))), /* @__PURE__ */ React77.createElement(Box53, { flexDirection: "column", paddingLeft: 5 }, /* @__PURE__ */ React77.createElement(
          HighlightedCode,
          {
            code: verbose ? contentWithFallback : contentWithFallback.split("\n").slice(0, MAX_LINES_TO_RENDER2).filter((_) => _.trim() !== "").join("\n"),
            language: extname6(filePath).slice(1)
          }
        ), !verbose && numLines > MAX_LINES_TO_RENDER2 && /* @__PURE__ */ React77.createElement(Text61, { color: getTheme().secondaryText }, "... (+", numLines - MAX_LINES_TO_RENDER2, " lines)")));
      }
      case "update":
        return /* @__PURE__ */ React77.createElement(
          FileEditToolUpdatedMessage,
          {
            filePath,
            structuredPatch: structuredPatch2,
            verbose
          }
        );
    }
  },
  async validateInput({ file_path }, { readFileTimestamps }) {
    const fullFilePath = isAbsolute11(file_path) ? file_path : resolve15(getCwd(), file_path);
    if (!existsSync21(fullFilePath)) {
      return { result: true };
    }
    const readTimestamp = readFileTimestamps[fullFilePath];
    if (!readTimestamp) {
      return {
        result: false,
        message: "File has not been read yet. Read it first before writing to it."
      };
    }
    const stats = statSync6(fullFilePath);
    const lastWriteTime = stats.mtimeMs;
    if (lastWriteTime > readTimestamp) {
      return {
        result: false,
        message: "File has been modified since read, either by the user or by a linter. Read it again before attempting to write it."
      };
    }
    return { result: true };
  },
  async *call({ file_path, content }, { readFileTimestamps }) {
    const fullFilePath = isAbsolute11(file_path) ? file_path : resolve15(getCwd(), file_path);
    const dir = dirname7(fullFilePath);
    const oldFileExists = existsSync21(fullFilePath);
    const enc = oldFileExists ? detectFileEncoding(fullFilePath) : "utf-8";
    const oldContent = oldFileExists ? readFileSync19(fullFilePath, enc) : null;
    const endings = oldFileExists ? detectLineEndings(fullFilePath) : await detectRepoLineEndings(getCwd());
    mkdirSync9(dir, { recursive: true });
    writeTextContent(fullFilePath, content, enc, endings);
    readFileTimestamps[fullFilePath] = statSync6(fullFilePath).mtimeMs;
    if (fullFilePath.endsWith(`${sep5}CLAUDE.md`)) {
      logEvent("tengu_write_claudemd", {});
    }
    if (oldContent) {
      const patch = getPatch({
        filePath: file_path,
        fileContents: oldContent,
        oldStr: oldContent,
        newStr: content
      });
      const data2 = {
        type: "update",
        filePath: file_path,
        content,
        structuredPatch: patch
      };
      yield {
        type: "result",
        data: data2,
        resultForAssistant: this.renderResultForAssistant(data2)
      };
      return;
    }
    const data = {
      type: "create",
      filePath: file_path,
      content,
      structuredPatch: []
    };
    yield {
      type: "result",
      data,
      resultForAssistant: this.renderResultForAssistant(data)
    };
  },
  renderResultForAssistant({ filePath, content, type }) {
    switch (type) {
      case "create":
        return `File created successfully at: ${filePath}`;
      case "update":
        return `The file ${filePath} has been updated. Here's the result of running \`cat -n\` on a snippet of the edited file:
${addLineNumbers({
          content: content.split(/\r?\n/).length > MAX_LINES_TO_RENDER_FOR_ASSISTANT ? content.split(/\r?\n/).slice(0, MAX_LINES_TO_RENDER_FOR_ASSISTANT).join("\n") + TRUNCATED_MESSAGE2 : content,
          startLine: 1
        })}`;
    }
  }
};

// src/components/permissions/FileEditPermissionRequest/FileEditPermissionRequest.tsx
init_source();
import { Select as Select7 } from "@inkjs/ui";
import { Box as Box56, Text as Text64 } from "ink";
import { basename as basename3, extname as extname7 } from "path";
import React80, { useMemo as useMemo7 } from "react";

// src/hooks/usePermissionRequestLogging.ts
init_statsig();
import { useEffect as useEffect12 } from "react";

// src/utils/unaryLogging.ts
init_statsig();
function logUnaryEvent(event) {
  logEvent("tengu_unary_event", {
    event: event.event,
    completion_type: event.completion_type,
    language_name: event.metadata.language_name,
    message_id: event.metadata.message_id,
    platform: event.metadata.platform
  });
}

// src/hooks/usePermissionRequestLogging.ts
init_env();
function usePermissionRequestLogging(toolUseConfirm, unaryEvent) {
  useEffect12(() => {
    logEvent("tengu_tool_use_show_permission_request", {
      messageID: toolUseConfirm.assistantMessage.message.id,
      toolName: toolUseConfirm.tool.name
    });
    const languagePromise = Promise.resolve(unaryEvent.language_name);
    languagePromise.then((language) => {
      logUnaryEvent({
        completion_type: unaryEvent.completion_type,
        event: "response",
        metadata: {
          language_name: language,
          message_id: toolUseConfirm.assistantMessage.message.id,
          platform: env2.platform
        }
      });
    });
  }, [toolUseConfirm, unaryEvent]);
}

// src/permissions.ts
init_config();
init_errors();
init_log();
init_state();
var SAFE_COMMANDS = /* @__PURE__ */ new Set([
  "git status",
  "git diff",
  "git log",
  "git branch",
  "pwd",
  "tree",
  "date",
  "which"
]);
var bashToolCommandHasExactMatchPermission = (tool, command3, allowedTools) => {
  if (SAFE_COMMANDS.has(command3)) {
    return true;
  }
  if (allowedTools.includes(getPermissionKey(tool, { command: command3 }, null))) {
    return true;
  }
  if (allowedTools.includes(getPermissionKey(tool, { command: command3 }, command3))) {
    return true;
  }
  return false;
};
var bashToolCommandHasPermission = (tool, command3, prefix, allowedTools) => {
  if (bashToolCommandHasExactMatchPermission(tool, command3, allowedTools)) {
    return true;
  }
  return allowedTools.includes(getPermissionKey(tool, { command: command3 }, prefix));
};
var bashToolHasPermission = async (tool, command3, context, allowedTools, getCommandSubcommandPrefixFn = getCommandSubcommandPrefix) => {
  if (bashToolCommandHasExactMatchPermission(tool, command3, allowedTools)) {
    return { result: true };
  }
  const subCommands = splitCommand(command3).filter((_) => {
    if (_ === `cd ${getCwd()}`) {
      return false;
    }
    return true;
  });
  const commandSubcommandPrefix = await getCommandSubcommandPrefixFn(
    command3,
    context.abortController.signal
  );
  if (context.abortController.signal.aborted) {
    throw new AbortError();
  }
  if (commandSubcommandPrefix === null) {
    return {
      result: false,
      message: `Claude requested permissions to use ${tool.name}, but you haven't granted it yet.`
    };
  }
  if (commandSubcommandPrefix.commandInjectionDetected) {
    if (bashToolCommandHasExactMatchPermission(tool, command3, allowedTools)) {
      return { result: true };
    } else {
      return {
        result: false,
        message: `Claude requested permissions to use ${tool.name}, but you haven't granted it yet.`
      };
    }
  }
  if (subCommands.length < 2) {
    if (bashToolCommandHasPermission(
      tool,
      command3,
      commandSubcommandPrefix.commandPrefix,
      allowedTools
    )) {
      return { result: true };
    } else {
      return {
        result: false,
        message: `Claude requested permissions to use ${tool.name}, but you haven't granted it yet.`
      };
    }
  }
  if (subCommands.every((subCommand) => {
    const prefixResult = commandSubcommandPrefix.subcommandPrefixes.get(subCommand);
    if (prefixResult === void 0 || prefixResult.commandInjectionDetected) {
      return false;
    }
    const hasPermission = bashToolCommandHasPermission(
      tool,
      subCommand,
      prefixResult ? prefixResult.commandPrefix : null,
      allowedTools
    );
    return hasPermission;
  })) {
    return { result: true };
  }
  return {
    result: false,
    message: `Claude requested permissions to use ${tool.name}, but you haven't granted it yet.`
  };
};
var hasPermissionsToUseTool = async (tool, input, context, _assistantMessage) => {
  if (context.options.dangerouslySkipPermissions) {
    return { result: true };
  }
  if (context.abortController.signal.aborted) {
    throw new AbortError();
  }
  try {
    if (!tool.needsPermissions(input)) {
      return { result: true };
    }
  } catch (e) {
    logError(`Error checking permissions: ${e}`);
    return { result: false, message: "Error checking permissions" };
  }
  const projectConfig = getCurrentProjectConfig();
  const allowedTools = projectConfig.allowedTools ?? [];
  if (tool === BashTool && allowedTools.includes(BashTool.name)) {
    return { result: true };
  }
  switch (tool) {
    // For bash tool, check each sub-command's permissions separately
    case BashTool: {
      const { command: command3 } = inputSchema4.parse(input);
      return await bashToolHasPermission(tool, command3, context, allowedTools);
    }
    // For file editing tools, check session-only permissions
    case FileEditTool:
    case FileWriteTool:
    case NotebookEditTool: {
      if (!tool.needsPermissions(input)) {
        return { result: true };
      }
      return {
        result: false,
        message: `Claude requested permissions to use ${tool.name}, but you haven't granted it yet.`
      };
    }
    // For other tools, check persistent permissions
    default: {
      const permissionKey = getPermissionKey(tool, input, null);
      if (allowedTools.includes(permissionKey)) {
        return { result: true };
      }
      return {
        result: false,
        message: `Claude requested permissions to use ${tool.name}, but you haven't granted it yet.`
      };
    }
  }
};
async function savePermission(tool, input, prefix) {
  const key = getPermissionKey(tool, input, prefix);
  if (tool === FileEditTool || tool === FileWriteTool || tool === NotebookEditTool) {
    grantWritePermissionForOriginalDir();
    return;
  }
  const projectConfig = getCurrentProjectConfig();
  if (projectConfig.allowedTools.includes(key)) {
    return;
  }
  projectConfig.allowedTools.push(key);
  projectConfig.allowedTools.sort();
  saveCurrentProjectConfig(projectConfig);
}
function getPermissionKey(tool, input, prefix) {
  switch (tool) {
    case BashTool:
      if (prefix) {
        return `${BashTool.name}(${prefix}:*)`;
      }
      return `${BashTool.name}(${BashTool.renderToolUseMessage(input)})`;
    default:
      return tool.name;
  }
}

// src/components/permissions/FileEditPermissionRequest/FileEditPermissionRequest.tsx
init_env();

// src/components/permissions/PermissionRequestTitle.tsx
import * as React78 from "react";
import { Box as Box54, Text as Text62 } from "ink";
function categoryForRiskScore(riskScore) {
  return riskScore >= 70 ? "high" : riskScore >= 30 ? "moderate" : "low";
}
function colorSchemeForRiskScoreCategory(category) {
  const theme = getTheme();
  switch (category) {
    case "low":
      return {
        highlightColor: theme.success,
        textColor: theme.permission
      };
    case "moderate":
      return {
        highlightColor: theme.warning,
        textColor: theme.warning
      };
    case "high":
      return {
        highlightColor: theme.error,
        textColor: theme.error
      };
  }
}
function textColorForRiskScore(riskScore) {
  if (riskScore === null) {
    return getTheme().permission;
  }
  const category = categoryForRiskScore(riskScore);
  return colorSchemeForRiskScoreCategory(category).textColor;
}
function PermissionRiskScore({
  riskScore
}) {
  const category = categoryForRiskScore(riskScore);
  return /* @__PURE__ */ React78.createElement(Text62, { color: textColorForRiskScore(riskScore) }, "Risk: ", category);
}
function PermissionRequestTitle({
  title,
  riskScore
}) {
  return /* @__PURE__ */ React78.createElement(Box54, { flexDirection: "column" }, /* @__PURE__ */ React78.createElement(Text62, { bold: true, color: getTheme().permission }, title), riskScore !== null && /* @__PURE__ */ React78.createElement(PermissionRiskScore, { riskScore }));
}

// src/components/permissions/FileEditPermissionRequest/FileEditToolDiff.tsx
import * as React79 from "react";
import { existsSync as existsSync22, readFileSync as readFileSync20 } from "fs";
import { useMemo as useMemo6 } from "react";
import { Box as Box55, Text as Text63 } from "ink";
init_state();
import { relative as relative11 } from "path";
function FileEditToolDiff({
  file_path,
  new_string,
  old_string,
  verbose,
  useBorder = true,
  width
}) {
  const file = useMemo6(
    () => existsSync22(file_path) ? readFileSync20(file_path, "utf8") : "",
    [file_path]
  );
  const patch = useMemo6(
    () => getPatch({
      filePath: file_path,
      fileContents: file,
      oldStr: old_string,
      newStr: new_string
    }),
    [file_path, file, old_string, new_string]
  );
  return /* @__PURE__ */ React79.createElement(Box55, { flexDirection: "column" }, /* @__PURE__ */ React79.createElement(
    Box55,
    {
      borderColor: getTheme().secondaryBorder,
      borderStyle: useBorder ? "round" : void 0,
      flexDirection: "column",
      paddingX: 1
    },
    /* @__PURE__ */ React79.createElement(Box55, { paddingBottom: 1 }, /* @__PURE__ */ React79.createElement(Text63, { bold: true }, verbose ? file_path : relative11(getCwd(), file_path))),
    intersperse(
      patch.map((_) => /* @__PURE__ */ React79.createElement(
        StructuredDiff,
        {
          key: _.newStart,
          patch: _,
          dim: false,
          width
        }
      )),
      (i) => /* @__PURE__ */ React79.createElement(Text63, { color: getTheme().secondaryText, key: `ellipsis-${i}` }, "...")
    )
  ));
}

// src/components/permissions/FileEditPermissionRequest/FileEditPermissionRequest.tsx
function getOptions(path7) {
  const showDontAskAgainOptions = pathInOriginalCwd(path7) ? [
    {
      label: "Yes, and don't ask again this session",
      value: "yes-dont-ask-again"
    }
  ] : [];
  return [
    {
      label: "Yes",
      value: "yes"
    },
    ...showDontAskAgainOptions,
    {
      label: `No, and tell Claude what to do differently (${source_default.bold.hex(getTheme().warning)("esc")})`,
      value: "no"
    }
  ];
}
function FileEditPermissionRequest({
  toolUseConfirm,
  onDone,
  verbose
}) {
  const { columns } = useTerminalSize();
  const { file_path, new_string, old_string } = toolUseConfirm.input;
  const unaryEvent = useMemo7(
    () => ({
      completion_type: "str_replace_single",
      language_name: extractLanguageName(file_path)
    }),
    [file_path]
  );
  usePermissionRequestLogging(toolUseConfirm, unaryEvent);
  return /* @__PURE__ */ React80.createElement(
    Box56,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: textColorForRiskScore(toolUseConfirm.riskScore),
      marginTop: 1,
      paddingLeft: 1,
      paddingRight: 1,
      paddingBottom: 1
    },
    /* @__PURE__ */ React80.createElement(
      PermissionRequestTitle,
      {
        title: "Edit file",
        riskScore: toolUseConfirm.riskScore
      }
    ),
    /* @__PURE__ */ React80.createElement(
      FileEditToolDiff,
      {
        file_path,
        new_string,
        old_string,
        verbose,
        width: columns - 12
      }
    ),
    /* @__PURE__ */ React80.createElement(Box56, { flexDirection: "column" }, /* @__PURE__ */ React80.createElement(Text64, null, "Do you want to make this edit to", " ", /* @__PURE__ */ React80.createElement(Text64, { bold: true }, basename3(file_path)), "?"), /* @__PURE__ */ React80.createElement(
      Select7,
      {
        options: getOptions(file_path),
        onChange: (newValue) => {
          switch (newValue) {
            case "yes":
              extractLanguageName(file_path).then((language) => {
                logUnaryEvent({
                  completion_type: "str_replace_single",
                  event: "accept",
                  metadata: {
                    language_name: language,
                    message_id: toolUseConfirm.assistantMessage.message.id,
                    platform: env2.platform
                  }
                });
              });
              onDone();
              toolUseConfirm.onAllow("temporary");
              break;
            case "yes-dont-ask-again":
              extractLanguageName(file_path).then((language) => {
                logUnaryEvent({
                  completion_type: "str_replace_single",
                  event: "accept",
                  metadata: {
                    language_name: language,
                    message_id: toolUseConfirm.assistantMessage.message.id,
                    platform: env2.platform
                  }
                });
              });
              savePermission(
                toolUseConfirm.tool,
                toolUseConfirm.input,
                toolUseConfirmGetPrefix(toolUseConfirm)
              ).then(() => {
                onDone();
                toolUseConfirm.onAllow("permanent");
              });
              break;
            case "no":
              extractLanguageName(file_path).then((language) => {
                logUnaryEvent({
                  completion_type: "str_replace_single",
                  event: "reject",
                  metadata: {
                    language_name: language,
                    message_id: toolUseConfirm.assistantMessage.message.id,
                    platform: env2.platform
                  }
                });
              });
              onDone();
              toolUseConfirm.onReject();
              break;
          }
        }
      }
    ))
  );
}
async function extractLanguageName(file_path) {
  const ext = extname7(file_path);
  if (!ext) {
    return "unknown";
  }
  const Highlight = await import("highlight.js");
  return Highlight.default.getLanguage(ext.slice(1))?.name ?? "unknown";
}

// src/components/permissions/BashPermissionRequest/BashPermissionRequest.tsx
import { Box as Box59, Text as Text67 } from "ink";
import React83, { useMemo as useMemo9 } from "react";

// src/components/permissions/hooks.ts
import { useEffect as useEffect13 } from "react";
init_env();
init_statsig();
function usePermissionRequestLogging2(toolUseConfirm, unaryEvent) {
  useEffect13(() => {
    logEvent("tengu_tool_use_show_permission_request", {
      messageID: toolUseConfirm.assistantMessage.message.id,
      toolName: toolUseConfirm.tool.name
    });
    const languagePromise = Promise.resolve(unaryEvent.language_name);
    languagePromise.then((language) => {
      logUnaryEvent({
        completion_type: unaryEvent.completion_type,
        event: "response",
        metadata: {
          language_name: language,
          message_id: toolUseConfirm.assistantMessage.message.id,
          platform: env2.platform
        }
      });
    });
  }, [toolUseConfirm, unaryEvent]);
}

// src/components/permissions/utils.ts
init_env();
function logUnaryPermissionEvent(completion_type, {
  assistantMessage: {
    message: { id: message_id }
  }
}, event) {
  logUnaryEvent({
    completion_type,
    event,
    metadata: {
      language_name: "none",
      message_id,
      platform: env2.platform
    }
  });
}

// src/components/CustomSelect/select.tsx
import { Box as Box58, Text as Text66 } from "ink";
import React82 from "react";

// src/components/CustomSelect/select-option.tsx
import figures4 from "figures";
import { Box as Box57, Text as Text65 } from "ink";
import React81 from "react";
import { useComponentTheme } from "@inkjs/ui";
function SelectOption({
  isFocused,
  isSelected,
  smallPointer,
  children
}) {
  const { styles: styles4 } = useComponentTheme("Select");
  return /* @__PURE__ */ React81.createElement(Box57, { ...styles4.option({ isFocused }) }, isFocused && /* @__PURE__ */ React81.createElement(Text65, { ...styles4.focusIndicator() }, smallPointer ? figures4.triangleDownSmall : figures4.pointer), /* @__PURE__ */ React81.createElement(Text65, { ...styles4.label({ isFocused, isSelected }) }, children), isSelected && /* @__PURE__ */ React81.createElement(Text65, { ...styles4.selectedIndicator() }, figures4.tick));
}

// src/components/CustomSelect/use-select-state.ts
import { isDeepStrictEqual } from "node:util";
import {
  useReducer,
  useCallback as useCallback4,
  useMemo as useMemo8,
  useState as useState15,
  useEffect as useEffect14
} from "react";

// src/components/CustomSelect/option-map.ts
var OptionMap = class extends Map {
  constructor(options) {
    const items = [];
    let firstItem;
    let previous;
    let index = 0;
    for (const option of options) {
      const item = {
        ...option,
        previous,
        next: void 0,
        index
      };
      if (previous) {
        previous.next = item;
      }
      firstItem ||= item;
      const key = "value" in option ? option.value : optionHeaderKey(option);
      items.push([key, item]);
      index++;
      previous = item;
    }
    super(items);
    this.first = firstItem;
  }
};

// src/components/CustomSelect/use-select-state.ts
var reducer = (state2, action) => {
  switch (action.type) {
    case "focus-next-option": {
      if (!state2.focusedValue) {
        return state2;
      }
      const item = state2.optionMap.get(state2.focusedValue);
      if (!item) {
        return state2;
      }
      let next = item.next;
      while (next && !("value" in next)) {
        next = next.next;
      }
      if (!next) {
        return state2;
      }
      const needsToScroll = next.index >= state2.visibleToIndex;
      if (!needsToScroll) {
        return {
          ...state2,
          focusedValue: next.value
        };
      }
      const nextVisibleToIndex = Math.min(
        state2.optionMap.size,
        state2.visibleToIndex + 1
      );
      const nextVisibleFromIndex = nextVisibleToIndex - state2.visibleOptionCount;
      return {
        ...state2,
        focusedValue: next.value,
        visibleFromIndex: nextVisibleFromIndex,
        visibleToIndex: nextVisibleToIndex
      };
    }
    case "focus-previous-option": {
      if (!state2.focusedValue) {
        return state2;
      }
      const item = state2.optionMap.get(state2.focusedValue);
      if (!item) {
        return state2;
      }
      let previous = item.previous;
      while (previous && !("value" in previous)) {
        previous = previous.previous;
      }
      if (!previous) {
        return state2;
      }
      const needsToScroll = previous.index <= state2.visibleFromIndex;
      if (!needsToScroll) {
        return {
          ...state2,
          focusedValue: previous.value
        };
      }
      const nextVisibleFromIndex = Math.max(0, state2.visibleFromIndex - 1);
      const nextVisibleToIndex = nextVisibleFromIndex + state2.visibleOptionCount;
      return {
        ...state2,
        focusedValue: previous.value,
        visibleFromIndex: nextVisibleFromIndex,
        visibleToIndex: nextVisibleToIndex
      };
    }
    case "select-focused-option": {
      return {
        ...state2,
        previousValue: state2.value,
        value: state2.focusedValue
      };
    }
    case "reset": {
      return action.state;
    }
    case "set-focus": {
      return {
        ...state2,
        focusedValue: action.value
      };
    }
  }
};
var flattenOptions = (options) => options.flatMap((option) => {
  if ("options" in option) {
    const flatSubtree = flattenOptions(option.options);
    const optionValues = flatSubtree.flatMap(
      (o) => "value" in o ? o.value : []
    );
    const header = option.header !== void 0 ? [{ header: option.header, optionValues }] : [];
    return [...header, ...flatSubtree];
  }
  return option;
});
var createDefaultState = ({
  visibleOptionCount: customVisibleOptionCount,
  defaultValue,
  options
}) => {
  const flatOptions = flattenOptions(options);
  const visibleOptionCount = typeof customVisibleOptionCount === "number" ? Math.min(customVisibleOptionCount, flatOptions.length) : flatOptions.length;
  const optionMap = new OptionMap(flatOptions);
  const firstOption = optionMap.first;
  const focusedValue = firstOption && "value" in firstOption ? firstOption.value : void 0;
  return {
    optionMap,
    visibleOptionCount,
    focusedValue,
    visibleFromIndex: 0,
    visibleToIndex: visibleOptionCount,
    previousValue: defaultValue,
    value: defaultValue
  };
};
var useSelectState = ({
  visibleOptionCount = 5,
  options,
  defaultValue,
  onChange,
  onFocus,
  focusValue
}) => {
  const flatOptions = flattenOptions(options);
  const [state2, dispatch] = useReducer(
    reducer,
    { visibleOptionCount, defaultValue, options },
    createDefaultState
  );
  const [lastOptions, setLastOptions] = useState15(flatOptions);
  if (flatOptions !== lastOptions && !isDeepStrictEqual(flatOptions, lastOptions)) {
    dispatch({
      type: "reset",
      state: createDefaultState({ visibleOptionCount, defaultValue, options })
    });
    setLastOptions(flatOptions);
  }
  const focusNextOption = useCallback4(() => {
    dispatch({
      type: "focus-next-option"
    });
  }, []);
  const focusPreviousOption = useCallback4(() => {
    dispatch({
      type: "focus-previous-option"
    });
  }, []);
  const selectFocusedOption = useCallback4(() => {
    dispatch({
      type: "select-focused-option"
    });
  }, []);
  const visibleOptions = useMemo8(() => {
    return flatOptions.map((option, index) => ({
      ...option,
      index
    })).slice(state2.visibleFromIndex, state2.visibleToIndex);
  }, [flatOptions, state2.visibleFromIndex, state2.visibleToIndex]);
  useEffect14(() => {
    if (state2.value && state2.previousValue !== state2.value) {
      onChange?.(state2.value);
    }
  }, [state2.previousValue, state2.value, options, onChange]);
  useEffect14(() => {
    if (state2.focusedValue) {
      onFocus?.(state2.focusedValue);
    }
  }, [state2.focusedValue, onFocus]);
  useEffect14(() => {
    if (focusValue) {
      dispatch({
        type: "set-focus",
        value: focusValue
      });
    }
  }, [focusValue]);
  return {
    focusedValue: state2.focusedValue,
    visibleFromIndex: state2.visibleFromIndex,
    visibleToIndex: state2.visibleToIndex,
    value: state2.value,
    visibleOptions,
    focusNextOption,
    focusPreviousOption,
    selectFocusedOption
  };
};

// src/components/CustomSelect/use-select.ts
import { useInput as useInput13 } from "ink";
var useSelect = ({ isDisabled = false, state: state2 }) => {
  useInput13(
    (_input, key) => {
      if (key.downArrow) {
        state2.focusNextOption();
      }
      if (key.upArrow) {
        state2.focusPreviousOption();
      }
      if (key.return) {
        state2.selectFocusedOption();
      }
    },
    { isActive: !isDisabled }
  );
};

// src/components/CustomSelect/select.tsx
import { useComponentTheme as useComponentTheme2 } from "@inkjs/ui";
var optionHeaderKey = (optionHeader) => `HEADER-${optionHeader.optionValues.join(",")}`;
function Select8({
  isDisabled = false,
  visibleOptionCount = 5,
  highlightText,
  options,
  defaultValue,
  onChange,
  onFocus,
  focusValue
}) {
  const state2 = useSelectState({
    visibleOptionCount,
    options,
    defaultValue,
    onChange,
    onFocus,
    focusValue
  });
  useSelect({ isDisabled, state: state2 });
  const { styles: styles4 } = useComponentTheme2("Select");
  return /* @__PURE__ */ React82.createElement(Box58, { ...styles4.container() }, state2.visibleOptions.map((option) => {
    const key = "value" in option ? option.value : optionHeaderKey(option);
    const isFocused = !isDisabled && state2.focusedValue !== void 0 && ("value" in option ? state2.focusedValue === option.value : option.optionValues.includes(state2.focusedValue));
    const isSelected = !!state2.value && ("value" in option ? state2.value === option.value : option.optionValues.includes(state2.value));
    const smallPointer = "header" in option;
    const labelText = "label" in option ? option.label : option.header;
    let label = labelText;
    if (highlightText && labelText.includes(highlightText)) {
      const index = labelText.indexOf(highlightText);
      label = /* @__PURE__ */ React82.createElement(React82.Fragment, null, labelText.slice(0, index), /* @__PURE__ */ React82.createElement(Text66, { ...styles4.highlightedText() }, highlightText), labelText.slice(index + highlightText.length));
    }
    return /* @__PURE__ */ React82.createElement(
      SelectOption,
      {
        key,
        isFocused,
        isSelected,
        smallPointer
      },
      label
    );
  }));
}

// src/components/permissions/toolUseOptions.ts
init_source();
init_state();
function toolUseOptions({
  toolUseConfirm,
  command: command3
}) {
  const showDontAskAgainOption = !isUnsafeCompoundCommand(command3) && toolUseConfirm.commandPrefix && !toolUseConfirm.commandPrefix.commandInjectionDetected;
  const prefix = toolUseConfirmGetPrefix(toolUseConfirm);
  const showDontAskAgainPrefixOption = showDontAskAgainOption && prefix !== null;
  let dontShowAgainOptions = [];
  if (showDontAskAgainPrefixOption) {
    dontShowAgainOptions = [
      {
        label: `Yes, and don't ask again for ${source_default.bold(prefix)} commands in ${source_default.bold(getCwd())}`,
        value: "yes-dont-ask-again-prefix"
      }
    ];
  } else if (showDontAskAgainOption) {
    dontShowAgainOptions = [
      {
        label: `Yes, and don't ask again for ${source_default.bold(command3)} commands in ${source_default.bold(getCwd())}`,
        value: "yes-dont-ask-again-full"
      }
    ];
  }
  return [
    {
      label: "Yes",
      value: "yes"
    },
    ...dontShowAgainOptions,
    {
      label: `No, and tell Claude what to do differently (${source_default.bold.hex(getTheme().warning)("esc")})`,
      value: "no"
    }
  ];
}

// src/components/permissions/BashPermissionRequest/BashPermissionRequest.tsx
function BashPermissionRequest({
  toolUseConfirm,
  onDone
}) {
  const theme = getTheme();
  const { command: command3 } = BashTool.inputSchema.parse(toolUseConfirm.input);
  const unaryEvent = useMemo9(
    () => ({ completion_type: "tool_use_single", language_name: "none" }),
    []
  );
  usePermissionRequestLogging2(toolUseConfirm, unaryEvent);
  return /* @__PURE__ */ React83.createElement(
    Box59,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: theme.permission,
      marginTop: 1,
      paddingLeft: 1,
      paddingRight: 1,
      paddingBottom: 1
    },
    /* @__PURE__ */ React83.createElement(
      PermissionRequestTitle,
      {
        title: "Bash command",
        riskScore: toolUseConfirm.riskScore
      }
    ),
    /* @__PURE__ */ React83.createElement(Box59, { flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React83.createElement(Text67, null, BashTool.renderToolUseMessage({ command: command3 })), /* @__PURE__ */ React83.createElement(Text67, { color: theme.secondaryText }, toolUseConfirm.description)),
    /* @__PURE__ */ React83.createElement(Box59, { flexDirection: "column" }, /* @__PURE__ */ React83.createElement(Text67, null, "Do you want to proceed?"), /* @__PURE__ */ React83.createElement(
      Select8,
      {
        options: toolUseOptions({ toolUseConfirm, command: command3 }),
        onChange: (newValue) => {
          switch (newValue) {
            case "yes":
              logUnaryPermissionEvent(
                "tool_use_single",
                toolUseConfirm,
                "accept"
              );
              toolUseConfirm.onAllow("temporary");
              onDone();
              break;
            case "yes-dont-ask-again-prefix": {
              const prefix = toolUseConfirmGetPrefix(toolUseConfirm);
              if (prefix !== null) {
                logUnaryPermissionEvent(
                  "tool_use_single",
                  toolUseConfirm,
                  "accept"
                );
                savePermission(
                  toolUseConfirm.tool,
                  toolUseConfirm.input,
                  prefix
                ).then(() => {
                  toolUseConfirm.onAllow("permanent");
                  onDone();
                });
              }
              break;
            }
            case "yes-dont-ask-again-full":
              logUnaryPermissionEvent(
                "tool_use_single",
                toolUseConfirm,
                "accept"
              );
              savePermission(
                toolUseConfirm.tool,
                toolUseConfirm.input,
                null
                // Save without prefix
              ).then(() => {
                toolUseConfirm.onAllow("permanent");
                onDone();
              });
              break;
            case "no":
              logUnaryPermissionEvent(
                "tool_use_single",
                toolUseConfirm,
                "reject"
              );
              toolUseConfirm.onReject();
              onDone();
              break;
          }
        }
      }
    ))
  );
}

// src/components/permissions/FallbackPermissionRequest.tsx
import { Box as Box60, Text as Text68 } from "ink";
import React84, { useMemo as useMemo10 } from "react";
import { Select as Select9 } from "@inkjs/ui";
init_env();
init_state();
init_source();
function FallbackPermissionRequest({
  toolUseConfirm,
  onDone,
  verbose
}) {
  const theme = getTheme();
  const originalUserFacingName = toolUseConfirm.tool.userFacingName(
    toolUseConfirm.input
  );
  const userFacingName = originalUserFacingName.endsWith(" (MCP)") ? originalUserFacingName.slice(0, -6) : originalUserFacingName;
  const unaryEvent = useMemo10(
    () => ({
      completion_type: "tool_use_single",
      language_name: "none"
    }),
    []
  );
  usePermissionRequestLogging(toolUseConfirm, unaryEvent);
  return /* @__PURE__ */ React84.createElement(
    Box60,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: textColorForRiskScore(toolUseConfirm.riskScore),
      marginTop: 1,
      paddingLeft: 1,
      paddingRight: 1,
      paddingBottom: 1
    },
    /* @__PURE__ */ React84.createElement(
      PermissionRequestTitle,
      {
        title: "Tool use",
        riskScore: toolUseConfirm.riskScore
      }
    ),
    /* @__PURE__ */ React84.createElement(Box60, { flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React84.createElement(Text68, null, userFacingName, "(", toolUseConfirm.tool.renderToolUseMessage(
      toolUseConfirm.input,
      { verbose }
    ), ")", originalUserFacingName.endsWith(" (MCP)") ? /* @__PURE__ */ React84.createElement(Text68, { color: theme.secondaryText }, " (MCP)") : ""), /* @__PURE__ */ React84.createElement(Text68, { color: theme.secondaryText }, toolUseConfirm.description)),
    /* @__PURE__ */ React84.createElement(Box60, { flexDirection: "column" }, /* @__PURE__ */ React84.createElement(Text68, null, "Do you want to proceed?"), /* @__PURE__ */ React84.createElement(
      Select9,
      {
        options: [
          {
            label: "Yes",
            value: "yes"
          },
          {
            label: `Yes, and don't ask again for ${source_default.bold(userFacingName)} commands in ${source_default.bold(getCwd())}`,
            value: "yes-dont-ask-again"
          },
          {
            label: `No, and tell Claude what to do differently (${source_default.bold.hex(getTheme().warning)("esc")})`,
            value: "no"
          }
        ],
        onChange: (newValue) => {
          switch (newValue) {
            case "yes":
              logUnaryEvent({
                completion_type: "tool_use_single",
                event: "accept",
                metadata: {
                  language_name: "none",
                  message_id: toolUseConfirm.assistantMessage.message.id,
                  platform: env2.platform
                }
              });
              toolUseConfirm.onAllow("temporary");
              onDone();
              break;
            case "yes-dont-ask-again":
              logUnaryEvent({
                completion_type: "tool_use_single",
                event: "accept",
                metadata: {
                  language_name: "none",
                  message_id: toolUseConfirm.assistantMessage.message.id,
                  platform: env2.platform
                }
              });
              savePermission(
                toolUseConfirm.tool,
                toolUseConfirm.input,
                toolUseConfirmGetPrefix(toolUseConfirm)
              ).then(() => {
                toolUseConfirm.onAllow("permanent");
                onDone();
              });
              break;
            case "no":
              logUnaryEvent({
                completion_type: "tool_use_single",
                event: "reject",
                metadata: {
                  language_name: "none",
                  message_id: toolUseConfirm.assistantMessage.message.id,
                  platform: env2.platform
                }
              });
              toolUseConfirm.onReject();
              onDone();
              break;
          }
        }
      }
    ))
  );
}

// src/hooks/useNotifyAfterTimeout.ts
import { useEffect as useEffect15 } from "react";
import { memoize as memoize15 } from "lodash-es";
var DEFAULT_INTERACTION_THRESHOLD_MS = 6e3;
var STATE3 = {
  lastInteractionTime: Date.now()
};
function updateLastInteractionTime() {
  STATE3.lastInteractionTime = Date.now();
}
function getTimeSinceLastInteraction() {
  return Date.now() - STATE3.lastInteractionTime;
}
function hasRecentInteraction(threshold) {
  return getTimeSinceLastInteraction() < threshold;
}
function shouldNotify(threshold) {
  return !hasRecentInteraction(threshold);
}
var init = memoize15(() => process.stdin.on("data", updateLastInteractionTime));
function useNotifyAfterTimeout(message, timeout = DEFAULT_INTERACTION_THRESHOLD_MS) {
  useEffect15(() => {
    init();
    updateLastInteractionTime();
  }, []);
  useEffect15(() => {
    let hasNotified = false;
    const timer = setInterval(() => {
      if (shouldNotify(timeout) && !hasNotified) {
        hasNotified = true;
        sendNotification({
          message
        });
      }
    }, timeout);
    return () => clearTimeout(timer);
  }, [message, timeout]);
}

// src/components/permissions/FileWritePermissionRequest/FileWritePermissionRequest.tsx
import { Box as Box62, Text as Text70 } from "ink";
import React86, { useMemo as useMemo12 } from "react";
import { Select as Select10 } from "@inkjs/ui";
import { basename as basename4, extname as extname9 } from "path";
init_env();
init_source();
import { existsSync as existsSync24 } from "fs";

// src/components/permissions/FileWritePermissionRequest/FileWriteToolDiff.tsx
import * as React85 from "react";
import { existsSync as existsSync23, readFileSync as readFileSync21 } from "fs";
import { useMemo as useMemo11 } from "react";
import { Box as Box61, Text as Text69 } from "ink";
init_state();
import { extname as extname8, relative as relative12 } from "path";
function FileWriteToolDiff({
  file_path,
  content,
  verbose,
  width
}) {
  const fileExists3 = useMemo11(() => existsSync23(file_path), [file_path]);
  const oldContent = useMemo11(() => {
    if (!fileExists3) {
      return "";
    }
    const enc = detectFileEncoding(file_path);
    return readFileSync21(file_path, enc);
  }, [file_path, fileExists3]);
  const hunks = useMemo11(() => {
    if (!fileExists3) {
      return null;
    }
    return getPatch({
      filePath: file_path,
      fileContents: oldContent,
      oldStr: oldContent,
      newStr: content
    });
  }, [fileExists3, file_path, oldContent, content]);
  return /* @__PURE__ */ React85.createElement(
    Box61,
    {
      borderColor: getTheme().secondaryBorder,
      borderStyle: "round",
      flexDirection: "column",
      paddingX: 1
    },
    /* @__PURE__ */ React85.createElement(Box61, { paddingBottom: 1 }, /* @__PURE__ */ React85.createElement(Text69, { bold: true }, verbose ? file_path : relative12(getCwd(), file_path))),
    hunks ? intersperse(
      hunks.map((_) => /* @__PURE__ */ React85.createElement(
        StructuredDiff,
        {
          key: _.newStart,
          patch: _,
          dim: false,
          width
        }
      )),
      (i) => /* @__PURE__ */ React85.createElement(Text69, { color: getTheme().secondaryText, key: `ellipsis-${i}` }, "...")
    ) : /* @__PURE__ */ React85.createElement(
      HighlightedCode,
      {
        code: content || "(No content)",
        language: extname8(file_path).slice(1)
      }
    )
  );
}

// src/components/permissions/FileWritePermissionRequest/FileWritePermissionRequest.tsx
function FileWritePermissionRequest({
  toolUseConfirm,
  onDone,
  verbose
}) {
  const { file_path, content } = toolUseConfirm.input;
  const fileExists3 = useMemo12(() => existsSync24(file_path), [file_path]);
  const unaryEvent = useMemo12(
    () => ({
      completion_type: "write_file_single",
      language_name: extractLanguageName2(file_path)
    }),
    [file_path]
  );
  const { columns } = useTerminalSize();
  usePermissionRequestLogging(toolUseConfirm, unaryEvent);
  return /* @__PURE__ */ React86.createElement(
    Box62,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: textColorForRiskScore(toolUseConfirm.riskScore),
      marginTop: 1,
      paddingLeft: 1,
      paddingRight: 1,
      paddingBottom: 1
    },
    /* @__PURE__ */ React86.createElement(
      PermissionRequestTitle,
      {
        title: `${fileExists3 ? "Edit" : "Create"} file`,
        riskScore: toolUseConfirm.riskScore
      }
    ),
    /* @__PURE__ */ React86.createElement(Box62, { flexDirection: "column" }, /* @__PURE__ */ React86.createElement(
      FileWriteToolDiff,
      {
        file_path,
        content,
        verbose,
        width: columns - 12
      }
    )),
    /* @__PURE__ */ React86.createElement(Box62, { flexDirection: "column" }, /* @__PURE__ */ React86.createElement(Text70, null, "Do you want to ", fileExists3 ? "make this edit to" : "create", " ", /* @__PURE__ */ React86.createElement(Text70, { bold: true }, basename4(file_path)), "?"), /* @__PURE__ */ React86.createElement(
      Select10,
      {
        options: [
          {
            label: "Yes",
            value: "yes"
          },
          {
            label: "Yes, and don't ask again this session",
            value: "yes-dont-ask-again"
          },
          {
            label: `No, and tell Claude what to do differently (${source_default.bold.hex(getTheme().warning)("esc")})`,
            value: "no"
          }
        ],
        onChange: (newValue) => {
          switch (newValue) {
            case "yes":
              extractLanguageName2(file_path).then((language) => {
                logUnaryEvent({
                  completion_type: "write_file_single",
                  event: "accept",
                  metadata: {
                    language_name: language,
                    message_id: toolUseConfirm.assistantMessage.message.id,
                    platform: env2.platform
                  }
                });
              });
              toolUseConfirm.onAllow("temporary");
              onDone();
              break;
            case "yes-dont-ask-again":
              extractLanguageName2(file_path).then((language) => {
                logUnaryEvent({
                  completion_type: "write_file_single",
                  event: "accept",
                  metadata: {
                    language_name: language,
                    message_id: toolUseConfirm.assistantMessage.message.id,
                    platform: env2.platform
                  }
                });
              });
              savePermission(
                toolUseConfirm.tool,
                toolUseConfirm.input,
                toolUseConfirmGetPrefix(toolUseConfirm)
              ).then(() => {
                toolUseConfirm.onAllow("permanent");
                onDone();
              });
              break;
            case "no":
              extractLanguageName2(file_path).then((language) => {
                logUnaryEvent({
                  completion_type: "write_file_single",
                  event: "reject",
                  metadata: {
                    language_name: language,
                    message_id: toolUseConfirm.assistantMessage.message.id,
                    platform: env2.platform
                  }
                });
              });
              toolUseConfirm.onReject();
              onDone();
              break;
          }
        }
      }
    ))
  );
}
async function extractLanguageName2(file_path) {
  const ext = extname9(file_path);
  if (!ext) {
    return "unknown";
  }
  const Highlight = await import("highlight.js");
  return Highlight.default.getLanguage(ext.slice(1))?.name ?? "unknown";
}

// src/components/permissions/FilesystemPermissionRequest/FilesystemPermissionRequest.tsx
import { Box as Box63, Text as Text71 } from "ink";
import React87, { useMemo as useMemo13 } from "react";
import { Select as Select11 } from "@inkjs/ui";
init_env();
init_source();
init_state();
function pathArgNameForToolUse(toolUseConfirm) {
  switch (toolUseConfirm.tool) {
    case FileWriteTool:
    case FileEditTool:
    case FileReadTool: {
      return "file_path";
    }
    case GlobTool:
    case GrepTool:
    case LSTool: {
      return "path";
    }
    case NotebookEditTool:
    case NotebookReadTool: {
      return "notebook_path";
    }
  }
  return null;
}
function isMultiFile(toolUseConfirm) {
  switch (toolUseConfirm.tool) {
    case GlobTool:
    case GrepTool:
    case LSTool: {
      return true;
    }
  }
  return false;
}
function pathFromToolUse(toolUseConfirm) {
  const pathArgName = pathArgNameForToolUse(toolUseConfirm);
  const input = toolUseConfirm.input;
  if (pathArgName && pathArgName in input) {
    if (typeof input[pathArgName] === "string") {
      return toAbsolutePath(input[pathArgName]);
    } else {
      return toAbsolutePath(getCwd());
    }
  }
  return null;
}
function FilesystemPermissionRequest({
  toolUseConfirm,
  onDone,
  verbose
}) {
  const path7 = pathFromToolUse(toolUseConfirm);
  if (!path7) {
    return /* @__PURE__ */ React87.createElement(
      FallbackPermissionRequest,
      {
        toolUseConfirm,
        onDone,
        verbose
      }
    );
  }
  return /* @__PURE__ */ React87.createElement(
    FilesystemPermissionRequestImpl,
    {
      toolUseConfirm,
      path: path7,
      onDone,
      verbose
    }
  );
}
function getDontAskAgainOptions(toolUseConfirm, path7) {
  if (toolUseConfirm.tool.isReadOnly()) {
    return [];
  }
  return pathInOriginalCwd(path7) ? [
    {
      label: "Yes, and don't ask again for file edits this session",
      value: "yes-dont-ask-again"
    }
  ] : [];
}
function FilesystemPermissionRequestImpl({
  toolUseConfirm,
  path: path7,
  onDone,
  verbose
}) {
  const userFacingName = toolUseConfirm.tool.userFacingName(
    toolUseConfirm.input
  );
  const userFacingReadOrWrite = toolUseConfirm.tool.isReadOnly() ? "Read" : "Edit";
  const title = `${userFacingReadOrWrite} ${isMultiFile(toolUseConfirm) ? "files" : "file"}`;
  const unaryEvent = useMemo13(
    () => ({
      completion_type: "tool_use_single",
      language_name: "none"
    }),
    []
  );
  usePermissionRequestLogging(toolUseConfirm, unaryEvent);
  return /* @__PURE__ */ React87.createElement(
    Box63,
    {
      flexDirection: "column",
      borderStyle: "round",
      borderColor: textColorForRiskScore(toolUseConfirm.riskScore),
      marginTop: 1,
      paddingLeft: 1,
      paddingRight: 1,
      paddingBottom: 1
    },
    /* @__PURE__ */ React87.createElement(
      PermissionRequestTitle,
      {
        title,
        riskScore: toolUseConfirm.riskScore
      }
    ),
    /* @__PURE__ */ React87.createElement(Box63, { flexDirection: "column", paddingX: 2, paddingY: 1 }, /* @__PURE__ */ React87.createElement(Text71, null, userFacingName, "(", toolUseConfirm.tool.renderToolUseMessage(
      toolUseConfirm.input,
      { verbose }
    ), ")")),
    /* @__PURE__ */ React87.createElement(Box63, { flexDirection: "column" }, /* @__PURE__ */ React87.createElement(Text71, null, "Do you want to proceed?"), /* @__PURE__ */ React87.createElement(
      Select11,
      {
        options: [
          {
            label: "Yes",
            value: "yes"
          },
          ...getDontAskAgainOptions(toolUseConfirm, path7),
          {
            label: `No, and tell Claude what to do differently (${source_default.bold.hex(getTheme().warning)("esc")})`,
            value: "no"
          }
        ],
        onChange: (newValue) => {
          switch (newValue) {
            case "yes":
              logUnaryEvent({
                completion_type: "tool_use_single",
                event: "accept",
                metadata: {
                  language_name: "none",
                  message_id: toolUseConfirm.assistantMessage.message.id,
                  platform: env2.platform
                }
              });
              toolUseConfirm.onAllow("temporary");
              onDone();
              break;
            case "yes-dont-ask-again":
              logUnaryEvent({
                completion_type: "tool_use_single",
                event: "accept",
                metadata: {
                  language_name: "none",
                  message_id: toolUseConfirm.assistantMessage.message.id,
                  platform: env2.platform
                }
              });
              grantWritePermissionForOriginalDir();
              toolUseConfirm.onAllow("permanent");
              onDone();
              break;
            case "no":
              logUnaryEvent({
                completion_type: "tool_use_single",
                event: "reject",
                metadata: {
                  language_name: "none",
                  message_id: toolUseConfirm.assistantMessage.message.id,
                  platform: env2.platform
                }
              });
              toolUseConfirm.onReject();
              onDone();
              break;
          }
        }
      }
    ))
  );
}

// src/components/permissions/PermissionRequest.tsx
function permissionComponentForTool(tool) {
  switch (tool) {
    case FileEditTool:
      return FileEditPermissionRequest;
    case FileWriteTool:
      return FileWritePermissionRequest;
    case BashTool:
      return BashPermissionRequest;
    case GlobTool:
    case GrepTool:
    case LSTool:
    case FileReadTool:
    case NotebookReadTool:
    case NotebookEditTool:
      return FilesystemPermissionRequest;
    default:
      return FallbackPermissionRequest;
  }
}
function toolUseConfirmGetPrefix(toolUseConfirm) {
  return toolUseConfirm.commandPrefix && !toolUseConfirm.commandPrefix.commandInjectionDetected && toolUseConfirm.commandPrefix.commandPrefix || null;
}
function PermissionRequest({
  toolUseConfirm,
  onDone,
  verbose
}) {
  useInput14((input, key) => {
    if (key.ctrl && input === "c") {
      onDone();
      toolUseConfirm.onReject();
    }
  });
  const toolName = toolUseConfirm.tool.userFacingName(
    toolUseConfirm.input
  );
  useNotifyAfterTimeout(`Claude needs your permission to use ${toolName}`);
  const PermissionComponent = permissionComponentForTool(toolUseConfirm.tool);
  return /* @__PURE__ */ React88.createElement(
    PermissionComponent,
    {
      toolUseConfirm,
      onDone,
      verbose
    }
  );
}

// src/components/PromptInput.tsx
import { Box as Box66, Text as Text74, useInput as useInput16 } from "ink";
import { sample as sample3 } from "lodash-es";

// src/utils/exampleCommands.ts
init_config();
init_env();
init_state();
init_log();
init_git();
import { exec as exec2 } from "child_process";
import { memoize as memoize16, sample as sample2 } from "lodash-es";
import { promisify } from "util";
var execPromise = promisify(exec2);
async function getFrequentlyModifiedFiles() {
  if (false) return [];
  if (env2.platform === "windows") return [];
  if (!await getIsGit()) return [];
  try {
    let filenames = "";
    const { stdout: userFilenames } = await execPromise(
      "git log -n 1000 --pretty=format: --name-only --diff-filter=M --author=$(git config user.email) | sort | uniq -c | sort -nr | head -n 20",
      { cwd: getCwd(), encoding: "utf8" }
    );
    filenames = "Files modified by user:\n" + userFilenames;
    if (userFilenames.split("\n").length < 10) {
      const { stdout: allFilenames } = await execPromise(
        "git log -n 1000 --pretty=format: --name-only --diff-filter=M | sort | uniq -c | sort -nr | head -n 20",
        { cwd: getCwd(), encoding: "utf8" }
      );
      filenames += "\n\nFiles modified by other users:\n" + allFilenames;
    }
    const response = await queryHaiku({
      systemPrompt: [
        "You are an expert at analyzing git history. Given a list of files and their modification counts, return exactly five filenames that are frequently modified and represent core application logic (not auto-generated files, dependencies, or configuration). Make sure filenames are diverse, not all in the same folder, and are a mix of user and other users. Return only the filenames' basenames (without the path) separated by newlines with no explanation."
      ],
      userPrompt: filenames
    });
    const content = response.message.content[0];
    if (!content || content.type !== "text") return [];
    const chosenFilenames = content.text.trim().split("\n");
    if (chosenFilenames.length < 5) {
      return [];
    }
    return chosenFilenames;
  } catch (err) {
    logError(err);
    return [];
  }
}
var getExampleCommands = memoize16(async () => {
  const globalConfig = getGlobalConfig();
  const projectConfig = getCurrentProjectConfig();
  const now = Date.now();
  const lastGenerated = projectConfig.exampleFilesGeneratedAt ?? 0;
  const oneWeek = 7 * 24 * 60 * 60 * 1e3;
  if (now - lastGenerated > oneWeek) {
    projectConfig.exampleFiles = [];
  }
  const newGlobalConfig = {
    ...globalConfig,
    numStartups: (globalConfig.numStartups ?? 0) + 1
  };
  saveGlobalConfig(newGlobalConfig);
  if (!projectConfig.exampleFiles?.length) {
    getFrequentlyModifiedFiles().then((files) => {
      if (files.length) {
        saveCurrentProjectConfig({
          ...getCurrentProjectConfig(),
          exampleFiles: files,
          exampleFilesGeneratedAt: Date.now()
        });
      }
    });
  }
  const frequentFile = projectConfig.exampleFiles?.length ? sample2(projectConfig.exampleFiles) : "<filepath>";
  return [
    "fix lint errors",
    "fix typecheck errors",
    `how does ${frequentFile} work?`,
    `refactor ${frequentFile}`,
    "how do I log an error?",
    `edit ${frequentFile} to...`,
    `write a test for ${frequentFile}`,
    "create a util logging.py that..."
  ];
});

// src/components/PromptInput.tsx
import * as React92 from "react";

// src/hooks/useArrowKeyHistory.ts
import { useState as useState16 } from "react";

// src/history.ts
init_config();
var MAX_HISTORY_ITEMS = 100;
function getHistory() {
  return getCurrentProjectConfig().history ?? [];
}
function addToHistory(command3) {
  const projectConfig = getCurrentProjectConfig();
  const history = projectConfig.history ?? [];
  if (history[0] === command3) {
    return;
  }
  history.unshift(command3);
  saveCurrentProjectConfig({
    ...projectConfig,
    history: history.slice(0, MAX_HISTORY_ITEMS)
  });
}

// src/hooks/useArrowKeyHistory.ts
function useArrowKeyHistory(onSetInput, currentInput) {
  const [historyIndex, setHistoryIndex] = useState16(0);
  const [lastTypedInput, setLastTypedInput] = useState16("");
  const updateInput = (input) => {
    if (input !== void 0) {
      const mode = input.startsWith("!") ? "bash" : "prompt";
      const value = mode === "bash" ? input.slice(1) : input;
      onSetInput(value, mode);
    }
  };
  function onHistoryUp() {
    const latestHistory = getHistory();
    if (historyIndex < latestHistory.length) {
      if (historyIndex === 0 && currentInput.trim() !== "") {
        setLastTypedInput(currentInput);
      }
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      updateInput(latestHistory[historyIndex]);
    }
  }
  function onHistoryDown() {
    const latestHistory = getHistory();
    if (historyIndex > 1) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      updateInput(latestHistory[newIndex - 1]);
    } else if (historyIndex === 1) {
      setHistoryIndex(0);
      updateInput(lastTypedInput);
    }
  }
  function resetHistory() {
    setLastTypedInput("");
    setHistoryIndex(0);
  }
  return {
    historyIndex,
    setHistoryIndex,
    onHistoryUp,
    onHistoryDown,
    resetHistory
  };
}

// src/hooks/useSlashCommandTypeahead.ts
import { useInput as useInput15 } from "ink";
import { useState as useState17, useCallback as useCallback5 } from "react";
function useSlashCommandTypeahead({
  commands,
  onInputChange,
  onSubmit,
  setCursorOffset
}) {
  const [suggestions, setSuggestions] = useState17([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState17(-1);
  function updateSuggestions(value) {
    if (value.startsWith("/")) {
      const query2 = value.slice(1).toLowerCase();
      const matchingCommands = commands.filter((cmd) => !cmd.isHidden).filter((cmd) => {
        const names = [cmd.userFacingName()];
        if (cmd.aliases) {
          names.push(...cmd.aliases);
        }
        return names.some((name) => name.toLowerCase().startsWith(query2));
      });
      const filtered = matchingCommands.map((cmd) => cmd.userFacingName());
      setSuggestions(filtered);
      const newIndex = selectedSuggestion > -1 ? filtered.indexOf(suggestions[selectedSuggestion]) : 0;
      if (newIndex > -1) {
        setSelectedSuggestion(newIndex);
      } else {
        setSelectedSuggestion(0);
      }
    } else {
      setSuggestions([]);
      setSelectedSuggestion(-1);
    }
  }
  useInput15((_, key) => {
    if (suggestions.length > 0) {
      if (key.downArrow) {
        setSelectedSuggestion(
          (prev) => prev >= suggestions.length - 1 ? 0 : prev + 1
        );
        return true;
      } else if (key.upArrow) {
        setSelectedSuggestion(
          (prev) => prev <= 0 ? suggestions.length - 1 : prev - 1
        );
        return true;
      } else if (key.tab || key.return && selectedSuggestion >= 0) {
        if (selectedSuggestion === -1 && key.tab) {
          setSelectedSuggestion(0);
        }
        const suggestionIndex = selectedSuggestion >= 0 ? selectedSuggestion : 0;
        const suggestion = suggestions[suggestionIndex];
        if (!suggestion) return true;
        const input = "/" + suggestion + " ";
        onInputChange(input);
        setCursorOffset(input.length);
        setSuggestions([]);
        setSelectedSuggestion(-1);
        if (key.return) {
          const command3 = getCommand(suggestion, commands);
          if (command3.type !== "prompt" || (command3.argNames ?? []).length === 0) {
            onSubmit(
              input,
              /* isSubmittingSlashCommand */
              true
            );
          }
        }
        return true;
      }
    }
  });
  const clearSuggestions = useCallback5(() => {
    setSuggestions([]);
    setSelectedSuggestion(-1);
  }, []);
  return {
    suggestions,
    selectedSuggestion,
    updateSuggestions,
    clearSuggestions
  };
}

// src/components/PromptInput.tsx
import { memo, useCallback as useCallback7, useEffect as useEffect17, useMemo as useMemo14, useState as useState19 } from "react";

// src/components/SentryErrorBoundary.ts
init_sentry();
import * as React89 from "react";
var SentryErrorBoundary = class extends React89.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    captureException(error);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
};

// src/components/AutoUpdater.tsx
import { Box as Box64, Text as Text72 } from "ink";
import * as React90 from "react";
var import_semver3 = __toESM(require_semver2(), 1);
init_config();
import { useEffect as useEffect16, useState as useState18 } from "react";
init_statsig();
function AutoUpdater({
  debug: debug2,
  isUpdating,
  onChangeIsUpdating,
  onAutoUpdaterResult,
  autoUpdaterResult
}) {
  const theme = getTheme();
  const [versions, setVersions] = useState18({});
  const checkForUpdates = React90.useCallback(async () => {
    if (false) {
      return;
    }
    if (isUpdating) {
      return;
    }
    const globalVersion = "0.2.8";
    const latestVersion = await getLatestVersion();
    const isDisabled = await isAutoUpdaterDisabled();
    setVersions({ global: globalVersion, latest: latestVersion });
    if (!isDisabled && globalVersion && latestVersion && !(0, import_semver3.gte)(globalVersion, latestVersion)) {
      const startTime = Date.now();
      onChangeIsUpdating(true);
      const installStatus = await installGlobalPackage();
      onChangeIsUpdating(false);
      if (installStatus === "success") {
        logEvent("tengu_auto_updater_success", {
          fromVersion: globalVersion,
          toVersion: latestVersion,
          durationMs: String(Date.now() - startTime)
        });
      } else {
        logEvent("tengu_auto_updater_fail", {
          fromVersion: globalVersion,
          attemptedVersion: latestVersion,
          status: installStatus,
          durationMs: String(Date.now() - startTime)
        });
      }
      onAutoUpdaterResult({
        version: latestVersion,
        status: installStatus
      });
    }
  }, [onAutoUpdaterResult]);
  useEffect16(() => {
    checkForUpdates();
  }, [checkForUpdates]);
  useInterval(checkForUpdates, 30 * 60 * 1e3);
  if (debug2) {
    return /* @__PURE__ */ React90.createElement(Box64, { flexDirection: "row" }, /* @__PURE__ */ React90.createElement(Text72, { dimColor: true }, "globalVersion: ", versions.global, " \xB7 latestVersion:", " ", versions.latest));
  }
  if (!autoUpdaterResult?.version && (!versions.global || !versions.latest)) {
    return null;
  }
  if (!autoUpdaterResult?.version && !isUpdating) {
    return null;
  }
  return /* @__PURE__ */ React90.createElement(Box64, { flexDirection: "row" }, debug2 && /* @__PURE__ */ React90.createElement(Text72, { dimColor: true }, "globalVersion: ", versions.global, " \xB7 latestVersion:", " ", versions.latest), isUpdating && /* @__PURE__ */ React90.createElement(React90.Fragment, null, /* @__PURE__ */ React90.createElement(Box64, null, /* @__PURE__ */ React90.createElement(Text72, { color: theme.secondaryText, dimColor: true, wrap: "end" }, "Auto-updating to v", versions.latest, "\u2026"))), autoUpdaterResult?.status === "success" && autoUpdaterResult?.version ? /* @__PURE__ */ React90.createElement(Text72, { color: theme.success }, "\u2713 Update installed \xB7 Restart to apply") : null, (autoUpdaterResult?.status === "install_failed" || autoUpdaterResult?.status === "no_permissions") && /* @__PURE__ */ React90.createElement(Text72, { color: theme.error }, "\u2717 Auto-update failed \xB7 Try ", /* @__PURE__ */ React90.createElement(Text72, { bold: true }, "claude doctor"), " or", " ", /* @__PURE__ */ React90.createElement(Text72, { bold: true }, "npm i -g ", "claude-code")));
}

// src/components/TokenWarning.tsx
import { Box as Box65, Text as Text73 } from "ink";
import * as React91 from "react";
var MAX_TOKENS = 19e4;
var WARNING_THRESHOLD = MAX_TOKENS * 0.6;
var ERROR_THRESHOLD = MAX_TOKENS * 0.8;
function TokenWarning({ tokenUsage }) {
  const theme = getTheme();
  if (tokenUsage < WARNING_THRESHOLD) {
    return null;
  }
  const isError = tokenUsage >= ERROR_THRESHOLD;
  return /* @__PURE__ */ React91.createElement(Box65, { flexDirection: "row" }, /* @__PURE__ */ React91.createElement(Text73, { color: isError ? theme.error : theme.warning }, "Context low (", Math.max(0, 100 - Math.round(tokenUsage / MAX_TOKENS * 100)), "% remaining) \xB7 Run /compact to compact & continue"));
}

// src/components/PromptInput.tsx
init_model();
function getPastedTextPrompt(text) {
  const newlineCount = (text.match(/\r\n|\r|\n/g) || []).length;
  return `[Pasted text +${newlineCount} lines] `;
}
function PromptInput({
  commands,
  forkNumber,
  messageLogName,
  isDisabled,
  isLoading,
  onQuery,
  debug: debug2,
  verbose,
  messages,
  setToolJSX,
  onAutoUpdaterResult,
  autoUpdaterResult,
  tools,
  input,
  onInputChange,
  mode,
  onModeChange,
  submitCount,
  onSubmitCountChange,
  setIsLoading,
  setAbortController,
  onShowMessageSelector,
  setForkConvoWithMessagesOnTheNextRender,
  readFileTimestamps
}) {
  const [isAutoUpdating, setIsAutoUpdating] = useState19(false);
  const [exitMessage, setExitMessage] = useState19({ show: false });
  const [message, setMessage] = useState19({ show: false });
  const [pastedImage, setPastedImage] = useState19(null);
  const [placeholder, setPlaceholder] = useState19("");
  const [cursorOffset, setCursorOffset] = useState19(input.length);
  const [pastedText, setPastedText] = useState19(null);
  useEffect17(() => {
    getExampleCommands().then((commands2) => {
      setPlaceholder(`Try "${sample3(commands2)}"`);
    });
  }, []);
  const { columns } = useTerminalSize();
  const commandWidth = useMemo14(
    () => Math.max(...commands.map((cmd) => cmd.userFacingName().length)) + 5,
    [commands]
  );
  const {
    suggestions,
    selectedSuggestion,
    updateSuggestions,
    clearSuggestions
  } = useSlashCommandTypeahead({
    commands,
    onInputChange,
    onSubmit,
    setCursorOffset
  });
  const onChange = useCallback7(
    (value) => {
      if (value.startsWith("!")) {
        onModeChange("bash");
        return;
      }
      updateSuggestions(value);
      onInputChange(value);
    },
    [onModeChange, onInputChange, updateSuggestions]
  );
  const { resetHistory, onHistoryUp, onHistoryDown } = useArrowKeyHistory(
    (value, mode2) => {
      onChange(value);
      onModeChange(mode2);
    },
    input
  );
  const handleHistoryUp = () => {
    if (suggestions.length <= 1) {
      onHistoryUp();
    }
  };
  const handleHistoryDown = () => {
    if (suggestions.length <= 1) {
      onHistoryDown();
    }
  };
  async function onSubmit(input2, isSubmittingSlashCommand = false) {
    if (input2 === "") {
      return;
    }
    if (isDisabled) {
      return;
    }
    if (isLoading) {
      return;
    }
    if (suggestions.length > 0 && !isSubmittingSlashCommand) {
      return;
    }
    if (["exit", "quit", ":q", ":q!", ":wq", ":wq!"].includes(input2.trim())) {
      exit();
    }
    let finalInput = input2;
    if (pastedText) {
      const pastedPrompt = getPastedTextPrompt(pastedText);
      if (finalInput.includes(pastedPrompt)) {
        finalInput = finalInput.replace(pastedPrompt, pastedText);
      }
    }
    onInputChange("");
    onModeChange("prompt");
    clearSuggestions();
    setPastedImage(null);
    setPastedText(null);
    onSubmitCountChange((_) => _ + 1);
    setIsLoading(true);
    const abortController = new AbortController();
    setAbortController(abortController);
    const model2 = await getSlowAndCapableModel();
    const messages2 = await processUserInput(
      finalInput,
      mode,
      setToolJSX,
      {
        options: {
          commands,
          forkNumber,
          messageLogName,
          tools,
          verbose,
          slowAndCapableModel: model2,
          maxThinkingTokens: 0
        },
        messageId: void 0,
        abortController,
        readFileTimestamps,
        setForkConvoWithMessagesOnTheNextRender
      },
      pastedImage ?? null
    );
    if (messages2.length) {
      onQuery(messages2, abortController);
    } else {
      addToHistory(input2);
      resetHistory();
      return;
    }
    for (const message2 of messages2) {
      if (message2.type === "user") {
        const inputToAdd = mode === "bash" ? `!${input2}` : input2;
        addToHistory(inputToAdd);
        resetHistory();
      }
    }
  }
  function onImagePaste(image) {
    onModeChange("prompt");
    setPastedImage(image);
  }
  function onTextPaste(rawText) {
    const text = rawText.replace(/\r/g, "\n");
    const pastedPrompt = getPastedTextPrompt(text);
    const newInput = input.slice(0, cursorOffset) + pastedPrompt + input.slice(cursorOffset);
    onInputChange(newInput);
    setCursorOffset(cursorOffset + pastedPrompt.length);
    setPastedText(text);
  }
  useInput16((_, key) => {
    if (input === "" && (key.escape || key.backspace || key.delete)) {
      onModeChange("prompt");
    }
    if (key.escape && messages.length > 0 && !input && !isLoading) {
      onShowMessageSelector();
    }
  });
  const textInputColumns = useTerminalSize().columns - 6;
  const tokenUsage = useMemo14(() => countTokens(messages), [messages]);
  const theme = getTheme();
  return /* @__PURE__ */ React92.createElement(Box66, { flexDirection: "column" }, /* @__PURE__ */ React92.createElement(
    Box66,
    {
      alignItems: "flex-start",
      justifyContent: "flex-start",
      borderColor: mode === "bash" ? theme.bashBorder : theme.secondaryBorder,
      borderDimColor: true,
      borderStyle: "round",
      marginTop: 1,
      width: "100%"
    },
    /* @__PURE__ */ React92.createElement(
      Box66,
      {
        alignItems: "flex-start",
        alignSelf: "flex-start",
        flexWrap: "nowrap",
        justifyContent: "flex-start",
        width: 3
      },
      mode === "bash" ? /* @__PURE__ */ React92.createElement(Text74, { color: theme.bashBorder }, "\xA0!\xA0") : /* @__PURE__ */ React92.createElement(Text74, { color: isLoading ? theme.secondaryText : void 0 }, "\xA0>\xA0")
    ),
    /* @__PURE__ */ React92.createElement(Box66, { paddingRight: 1 }, /* @__PURE__ */ React92.createElement(
      TextInput,
      {
        multiline: true,
        onSubmit,
        onChange,
        value: input,
        onHistoryUp: handleHistoryUp,
        onHistoryDown: handleHistoryDown,
        onHistoryReset: () => resetHistory(),
        placeholder: submitCount > 0 ? void 0 : placeholder,
        onExit: () => process.exit(0),
        onExitMessage: (show, key) => setExitMessage({ show, key }),
        onMessage: (show, text) => setMessage({ show, text }),
        onImagePaste,
        columns: textInputColumns,
        isDimmed: isDisabled || isLoading,
        disableCursorMovementForUpDownKeys: suggestions.length > 0,
        cursorOffset,
        onChangeCursorOffset: setCursorOffset,
        onPaste: onTextPaste
      }
    ))
  ), suggestions.length === 0 && /* @__PURE__ */ React92.createElement(
    Box66,
    {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingX: 2,
      paddingY: 0
    },
    /* @__PURE__ */ React92.createElement(Box66, { justifyContent: "flex-start", gap: 1 }, exitMessage.show ? /* @__PURE__ */ React92.createElement(Text74, { dimColor: true }, "Press ", exitMessage.key, " again to exit") : message.show ? /* @__PURE__ */ React92.createElement(Text74, { dimColor: true }, message.text) : /* @__PURE__ */ React92.createElement(React92.Fragment, null, /* @__PURE__ */ React92.createElement(
      Text74,
      {
        color: mode === "bash" ? theme.bashBorder : void 0,
        dimColor: mode !== "bash"
      },
      "! for bash mode"
    ), /* @__PURE__ */ React92.createElement(Text74, { dimColor: true }, "\xB7 / for commands \xB7 esc to undo"))),
    /* @__PURE__ */ React92.createElement(SentryErrorBoundary, null, /* @__PURE__ */ React92.createElement(Box66, { justifyContent: "flex-end", gap: 1 }, !autoUpdaterResult && !isAutoUpdating && !debug2 && tokenUsage < WARNING_THRESHOLD && /* @__PURE__ */ React92.createElement(Text74, { dimColor: true }, terminalSetup_default.isEnabled && isShiftEnterKeyBindingInstalled() ? "shift + \u23CE for newline" : "\\\u23CE for newline"), debug2 && /* @__PURE__ */ React92.createElement(Text74, { dimColor: true }, `${countTokens(messages)} tokens (${Math.round(
      1e4 * (countCachedTokens(messages) || 1) / (countTokens(messages) || 1)
    ) / 100}% cached)`), /* @__PURE__ */ React92.createElement(TokenWarning, { tokenUsage }), /* @__PURE__ */ React92.createElement(
      AutoUpdater,
      {
        debug: debug2,
        onAutoUpdaterResult,
        autoUpdaterResult,
        isUpdating: isAutoUpdating,
        onChangeIsUpdating: setIsAutoUpdating
      }
    )))
  ), suggestions.length > 0 && /* @__PURE__ */ React92.createElement(
    Box66,
    {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingX: 2,
      paddingY: 0
    },
    /* @__PURE__ */ React92.createElement(Box66, { flexDirection: "column" }, suggestions.map((suggestion, index) => {
      const command3 = commands.find(
        (cmd) => cmd.userFacingName() === suggestion.replace("/", "")
      );
      return /* @__PURE__ */ React92.createElement(
        Box66,
        {
          key: suggestion,
          flexDirection: columns < 80 ? "column" : "row"
        },
        /* @__PURE__ */ React92.createElement(Box66, { width: columns < 80 ? void 0 : commandWidth }, /* @__PURE__ */ React92.createElement(
          Text74,
          {
            color: index === selectedSuggestion ? theme.suggestion : void 0,
            dimColor: index !== selectedSuggestion
          },
          "/",
          suggestion,
          command3?.aliases && command3.aliases.length > 0 && /* @__PURE__ */ React92.createElement(Text74, { dimColor: true }, " (", command3.aliases.join(", "), ")")
        )),
        command3 && /* @__PURE__ */ React92.createElement(
          Box66,
          {
            width: columns - (columns < 80 ? 4 : commandWidth + 4),
            paddingLeft: columns < 80 ? 4 : 0
          },
          /* @__PURE__ */ React92.createElement(
            Text74,
            {
              color: index === selectedSuggestion ? theme.suggestion : void 0,
              dimColor: index !== selectedSuggestion,
              wrap: "wrap"
            },
            /* @__PURE__ */ React92.createElement(Text74, { dimColor: index !== selectedSuggestion }, command3.description, command3.type === "prompt" && command3.argNames?.length ? ` (arguments: ${command3.argNames.join(", ")})` : null)
          )
        )
      );
    })),
    /* @__PURE__ */ React92.createElement(SentryErrorBoundary, null, /* @__PURE__ */ React92.createElement(Box66, { justifyContent: "flex-end", gap: 1 }, /* @__PURE__ */ React92.createElement(TokenWarning, { tokenUsage: countTokens(messages) }), /* @__PURE__ */ React92.createElement(
      AutoUpdater,
      {
        debug: debug2,
        onAutoUpdaterResult,
        autoUpdaterResult,
        isUpdating: isAutoUpdating,
        onChangeIsUpdating: setIsAutoUpdating
      }
    )))
  ));
}
var PromptInput_default = memo(PromptInput);
function exit() {
  setTerminalTitle("");
  process.exit(0);
}

// src/components/TokenUsageDisplay.tsx
import * as React93 from "react";
import { Box as Box67, Text as Text75 } from "ink";
import { useState as useState20, useEffect as useEffect18 } from "react";
function TokenUsageDisplay({
  verbose = false,
  messages = []
}) {
  const [tokenUsage, setTokenUsage] = useState20(getTotalTokens());
  useEffect18(() => {
    setTokenUsage(getTotalTokens());
  }, [messages]);
  if (!verbose) {
    return /* @__PURE__ */ React93.createElement(Box67, null, /* @__PURE__ */ React93.createElement(Text75, { color: "gray" }, "Tokens: ", tokenUsage.total.toLocaleString()));
  }
  return /* @__PURE__ */ React93.createElement(Box67, { flexDirection: "column" }, /* @__PURE__ */ React93.createElement(Text75, { color: "gray" }, "Tokens: ", tokenUsage.total.toLocaleString(), " (in: ", tokenUsage.input.toLocaleString(), ", out: ", tokenUsage.output.toLocaleString(), ", cached: ", tokenUsage.cached.toLocaleString(), ")"));
}

// src/hooks/useLogStartupTime.ts
init_statsig();
import { useEffect as useEffect19 } from "react";
function useLogStartupTime() {
  useEffect19(() => {
    const startupTimeMs = Math.round(process.uptime() * 1e3);
    logEvent("tengu_timer", {
      event: "startup",
      durationMs: String(startupTimeMs)
    });
  }, []);
}

// src/hooks/useApiKeyVerification.ts
import { useCallback as useCallback8, useState as useState21 } from "react";
init_config();
function useApiKeyVerification() {
  const [status, setStatus] = useState21(() => {
    const apiKey = getAnthropicApiKey();
    return apiKey ? "loading" : "missing";
  });
  const [error, setError] = useState21(null);
  const verify = useCallback8(async () => {
    if (isDefaultApiKey()) {
      setStatus("valid");
      return;
    }
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      const newStatus = "missing";
      setStatus(newStatus);
      return;
    }
    try {
      const isValid = await verifyApiKey(apiKey);
      const newStatus = isValid ? "valid" : "invalid";
      setStatus(newStatus);
      return;
    } catch (error2) {
      setError(error2);
      const newStatus = "error";
      setStatus(newStatus);
      return;
    }
  }, []);
  return {
    status,
    reverify: verify,
    error
  };
}

// src/hooks/useCancelRequest.ts
init_statsig();
import { useInput as useInput17 } from "ink";
function useCancelRequest(setToolJSX, setToolUseConfirm, setBinaryFeedbackContext, onCancel, isLoading, isMessageSelectorVisible, abortSignal) {
  useInput17((_, key) => {
    if (!key.escape) {
      return;
    }
    if (abortSignal?.aborted) {
      return;
    }
    if (!abortSignal) {
      return;
    }
    if (!isLoading) {
      return;
    }
    if (isMessageSelectorVisible) {
      return;
    }
    logEvent("tengu_cancel", {});
    setToolJSX(null);
    setToolUseConfirm(null);
    setBinaryFeedbackContext(null);
    onCancel();
  });
}

// src/hooks/useCanUseTool.ts
import { useCallback as useCallback9 } from "react";
init_statsig();
init_errors();
init_log();
function useCanUseTool(setToolUseConfirm) {
  return useCallback9(
    async (tool, input, toolUseContext, assistantMessage) => {
      return new Promise((resolve16) => {
        function logCancelledEvent() {
          logEvent("tengu_tool_use_cancelled", {
            messageID: assistantMessage.message.id,
            toolName: tool.name
          });
        }
        function resolveWithCancelledAndAbortAllToolCalls() {
          resolve16({
            result: false,
            message: REJECT_MESSAGE
          });
          toolUseContext.abortController.abort();
        }
        if (toolUseContext.abortController.signal.aborted) {
          logCancelledEvent();
          resolveWithCancelledAndAbortAllToolCalls();
          return;
        }
        return hasPermissionsToUseTool(
          tool,
          input,
          toolUseContext,
          assistantMessage
        ).then(async (result) => {
          if (result.result) {
            logEvent("tengu_tool_use_granted_in_config", {
              messageID: assistantMessage.message.id,
              toolName: tool.name
            });
            resolve16({ result: true });
            return;
          }
          const [description, commandPrefix] = await Promise.all([
            tool.description(input),
            tool === BashTool ? getCommandSubcommandPrefix(
              inputSchema4.parse(input).command,
              // already validated upstream, so ok to parse (as opposed to safeParse)
              toolUseContext.abortController.signal
            ) : Promise.resolve(null)
          ]);
          if (toolUseContext.abortController.signal.aborted) {
            logCancelledEvent();
            resolveWithCancelledAndAbortAllToolCalls();
            return;
          }
          setToolUseConfirm({
            assistantMessage,
            tool,
            description,
            input,
            commandPrefix,
            riskScore: null,
            onAbort() {
              logCancelledEvent();
              logEvent("tengu_tool_use_rejected_in_prompt", {
                messageID: assistantMessage.message.id,
                toolName: tool.name
              });
              resolveWithCancelledAndAbortAllToolCalls();
            },
            onAllow(type) {
              if (type === "permanent") {
                logEvent("tengu_tool_use_granted_in_prompt_permanent", {
                  messageID: assistantMessage.message.id,
                  toolName: tool.name
                });
              } else {
                logEvent("tengu_tool_use_granted_in_prompt_temporary", {
                  messageID: assistantMessage.message.id,
                  toolName: tool.name
                });
              }
              resolve16({ result: true });
            },
            onReject() {
              logEvent("tengu_tool_use_rejected_in_prompt", {
                messageID: assistantMessage.message.id,
                toolName: tool.name
              });
              resolveWithCancelledAndAbortAllToolCalls();
            }
          });
        }).catch((error) => {
          if (error instanceof AbortError) {
            logCancelledEvent();
            resolveWithCancelledAndAbortAllToolCalls();
          } else {
            logError(error);
          }
        });
      });
    },
    [setToolUseConfirm]
  );
}
var useCanUseTool_default = useCanUseTool;

// src/hooks/useLogMessages.ts
init_log();
import { useEffect as useEffect20 } from "react";
function useLogMessages(messages, messageLogName, forkNumber) {
  useEffect20(() => {
    overwriteLog(
      getMessagesPath(messageLogName, forkNumber, 0),
      messages.filter((_) => _.type !== "progress")
    );
  }, [messages, messageLogName, forkNumber]);
}

// src/components/binary-feedback/utils.ts
init_statsig();
init_git();
import { isEqual, zip } from "lodash-es";
async function getBinaryFeedbackStatsigConfig() {
  return await getDynamicConfig("tengu-binary-feedback-config", {
    sampleFrequency: 0
  });
}
function getMessageBlockSequence(m) {
  return m.message.content.map((cb) => {
    if (cb.type === "text") return "text";
    if (cb.type === "tool_use") return cb.name;
    return cb.type;
  });
}
async function logBinaryFeedbackEvent(m1, m2, choice) {
  const modelA = m1.message.model;
  const modelB = m2.message.model;
  const gitState = await getGitState();
  logEvent("tengu_binary_feedback", {
    msg_id_A: m1.message.id,
    msg_id_B: m2.message.id,
    choice: {
      "prefer-left": m1.message.id,
      "prefer-right": m2.message.id,
      neither: void 0,
      "no-preference": void 0
    }[choice],
    choiceStr: choice,
    gitHead: gitState?.commitHash,
    gitBranch: gitState?.branchName,
    gitRepoRemoteUrl: gitState?.remoteUrl || void 0,
    gitRepoIsHeadOnRemote: gitState?.isHeadOnRemote?.toString(),
    gitRepoIsClean: gitState?.isClean?.toString(),
    modelA,
    modelB,
    temperatureA: String(MAIN_QUERY_TEMPERATURE),
    temperatureB: String(MAIN_QUERY_TEMPERATURE),
    seqA: String(getMessageBlockSequence(m1)),
    seqB: String(getMessageBlockSequence(m2))
  });
}
async function logBinaryFeedbackSamplingDecision(decision, reason) {
  logEvent("tengu_binary_feedback_sampling_decision", {
    decision: decision.toString(),
    reason
  });
}
async function logBinaryFeedbackDisplayDecision(decision, m1, m2, reason) {
  logEvent("tengu_binary_feedback_display_decision", {
    decision: decision.toString(),
    reason,
    msg_id_A: m1.message.id,
    msg_id_B: m2.message.id,
    seqA: String(getMessageBlockSequence(m1)),
    seqB: String(getMessageBlockSequence(m2))
  });
}
function textContentBlocksEqual(cb1, cb2) {
  return cb1.text === cb2.text;
}
function contentBlocksEqual(cb1, cb2) {
  if (cb1.type !== cb2.type) {
    return false;
  }
  if (cb1.type === "text") {
    return textContentBlocksEqual(cb1, cb2);
  }
  cb2 = cb2;
  return cb1.name === cb2.name && isEqual(cb1.input, cb2.input);
}
function allContentBlocksEqual(content1, content2) {
  if (content1.length !== content2.length) {
    return false;
  }
  return zip(content1, content2).every(
    ([cb1, cb2]) => contentBlocksEqual(cb1, cb2)
  );
}
async function shouldUseBinaryFeedback() {
  if (process.env.DISABLE_BINARY_FEEDBACK) {
    logBinaryFeedbackSamplingDecision(false, "disabled_by_env_var");
    return false;
  }
  if (process.env.FORCE_BINARY_FEEDBACK) {
    logBinaryFeedbackSamplingDecision(true, "forced_by_env_var");
    return true;
  }
  if (process.env.USER_TYPE !== "ant") {
    logBinaryFeedbackSamplingDecision(false, "not_ant");
    return false;
  }
  if (false) {
    logBinaryFeedbackSamplingDecision(false, "test");
    return false;
  }
  const config3 = await getBinaryFeedbackStatsigConfig();
  if (config3.sampleFrequency === 0) {
    logBinaryFeedbackSamplingDecision(false, "top_level_frequency_zero");
    return false;
  }
  if (Math.random() > config3.sampleFrequency) {
    logBinaryFeedbackSamplingDecision(false, "top_level_frequency_rng");
    return false;
  }
  logBinaryFeedbackSamplingDecision(true);
  return true;
}
function messagePairValidForBinaryFeedback(m1, m2) {
  const logPass = () => logBinaryFeedbackDisplayDecision(true, m1, m2);
  const logFail = (reason) => logBinaryFeedbackDisplayDecision(false, m1, m2, reason);
  const nonThinkingBlocks1 = m1.message.content.filter(
    (b) => b.type !== "thinking" && b.type !== "redacted_thinking"
  );
  const nonThinkingBlocks2 = m2.message.content.filter(
    (b) => b.type !== "thinking" && b.type !== "redacted_thinking"
  );
  const hasToolUse = nonThinkingBlocks1.some((b) => b.type === "tool_use") || nonThinkingBlocks2.some((b) => b.type === "tool_use");
  if (!hasToolUse) {
    if (allContentBlocksEqual(nonThinkingBlocks1, nonThinkingBlocks2)) {
      logFail("contents_identical");
      return false;
    }
    logPass();
    return true;
  }
  if (allContentBlocksEqual(
    nonThinkingBlocks1.filter((b) => b.type === "tool_use"),
    nonThinkingBlocks2.filter((b) => b.type === "tool_use")
  )) {
    logFail("contents_identical");
    return false;
  }
  logPass();
  return true;
}
function getBinaryFeedbackResultForChoice(m1, m2, choice) {
  switch (choice) {
    case "prefer-left":
      return { message: m1, shouldSkipPermissionCheck: true };
    case "prefer-right":
      return { message: m2, shouldSkipPermissionCheck: true };
    case "no-preference":
      return {
        message: Math.random() < 0.5 ? m1 : m2,
        shouldSkipPermissionCheck: false
      };
    case "neither":
      return { message: null, shouldSkipPermissionCheck: false };
  }
}

// src/query.ts
init_statsig();
init_log();
init_state();
var MAX_TOOL_USE_CONCURRENCY = 10;
async function queryWithBinaryFeedback(toolUseContext, getAssistantResponse, getBinaryFeedbackResponse) {
  if (process.env.USER_TYPE !== "ant" || !getBinaryFeedbackResponse || !await shouldUseBinaryFeedback()) {
    const assistantMessage = await getAssistantResponse();
    if (toolUseContext.abortController.signal.aborted) {
      return { message: null, shouldSkipPermissionCheck: false };
    }
    return { message: assistantMessage, shouldSkipPermissionCheck: false };
  }
  const [m1, m2] = await Promise.all([
    getAssistantResponse(),
    getAssistantResponse()
  ]);
  if (toolUseContext.abortController.signal.aborted) {
    return { message: null, shouldSkipPermissionCheck: false };
  }
  if (m2.isApiErrorMessage) {
    return { message: m1, shouldSkipPermissionCheck: false };
  }
  if (m1.isApiErrorMessage) {
    return { message: m2, shouldSkipPermissionCheck: false };
  }
  if (!messagePairValidForBinaryFeedback(m1, m2)) {
    return { message: m1, shouldSkipPermissionCheck: false };
  }
  return await getBinaryFeedbackResponse(m1, m2);
}
async function* query(messages, systemPrompt, context, canUseTool, toolUseContext, getBinaryFeedbackResponse) {
  const fullSystemPrompt = formatSystemPromptWithContext(systemPrompt, context);
  function getAssistantResponse() {
    return querySonnet(
      normalizeMessagesForAPI(messages),
      fullSystemPrompt,
      toolUseContext.options.maxThinkingTokens,
      toolUseContext.options.tools,
      toolUseContext.abortController.signal,
      {
        dangerouslySkipPermissions: toolUseContext.options.dangerouslySkipPermissions ?? false,
        model: toolUseContext.options.slowAndCapableModel,
        prependCLISysprompt: true
      }
    );
  }
  const result = await queryWithBinaryFeedback(
    toolUseContext,
    getAssistantResponse,
    getBinaryFeedbackResponse
  );
  if (result.message === null) {
    yield createAssistantMessage(INTERRUPT_MESSAGE);
    return;
  }
  const assistantMessage = result.message;
  const shouldSkipPermissionCheck = result.shouldSkipPermissionCheck;
  yield assistantMessage;
  const toolUseMessages = assistantMessage.message.content.filter(
    (_) => _.type === "tool_use"
  );
  if (!toolUseMessages.length) {
    return;
  }
  const toolResults = [];
  if (toolUseMessages.every(
    (msg) => toolUseContext.options.tools.find((t) => t.name === msg.name)?.isReadOnly()
  )) {
    for await (const message of runToolsConcurrently(
      toolUseMessages,
      assistantMessage,
      canUseTool,
      toolUseContext,
      shouldSkipPermissionCheck
    )) {
      yield message;
      if (message.type === "user") {
        toolResults.push(message);
      }
    }
  } else {
    for await (const message of runToolsSerially(
      toolUseMessages,
      assistantMessage,
      canUseTool,
      toolUseContext,
      shouldSkipPermissionCheck
    )) {
      yield message;
      if (message.type === "user") {
        toolResults.push(message);
      }
    }
  }
  if (toolUseContext.abortController.signal.aborted) {
    yield createAssistantMessage(INTERRUPT_MESSAGE_FOR_TOOL_USE);
    return;
  }
  const orderedToolResults = toolResults.sort((a, b) => {
    const aIndex = toolUseMessages.findIndex(
      (tu) => tu.id === a.message.content[0].id
    );
    const bIndex = toolUseMessages.findIndex(
      (tu) => tu.id === b.message.content[0].id
    );
    return aIndex - bIndex;
  });
  yield* await query(
    [...messages, assistantMessage, ...orderedToolResults],
    systemPrompt,
    context,
    canUseTool,
    toolUseContext,
    getBinaryFeedbackResponse
  );
}
async function* runToolsConcurrently(toolUseMessages, assistantMessage, canUseTool, toolUseContext, shouldSkipPermissionCheck) {
  yield* all(
    toolUseMessages.map(
      (toolUse) => runToolUse(
        toolUse,
        new Set(toolUseMessages.map((_) => _.id)),
        assistantMessage,
        canUseTool,
        toolUseContext,
        shouldSkipPermissionCheck
      )
    ),
    MAX_TOOL_USE_CONCURRENCY
  );
}
async function* runToolsSerially(toolUseMessages, assistantMessage, canUseTool, toolUseContext, shouldSkipPermissionCheck) {
  for (const toolUse of toolUseMessages) {
    yield* runToolUse(
      toolUse,
      new Set(toolUseMessages.map((_) => _.id)),
      assistantMessage,
      canUseTool,
      toolUseContext,
      shouldSkipPermissionCheck
    );
  }
}
async function* runToolUse(toolUse, siblingToolUseIDs, assistantMessage, canUseTool, toolUseContext, shouldSkipPermissionCheck) {
  const toolName = toolUse.name;
  const tool = toolUseContext.options.tools.find((t) => t.name === toolName);
  if (!tool) {
    logEvent("tengu_tool_use_error", {
      error: `No such tool available: ${toolName}`,
      messageID: assistantMessage.message.id,
      toolName,
      toolUseID: toolUse.id
    });
    yield createUserMessage([
      {
        type: "tool_result",
        content: `Error: No such tool available: ${toolName}`,
        is_error: true,
        tool_use_id: toolUse.id
      }
    ]);
    return;
  }
  const toolInput = toolUse.input;
  try {
    if (toolUseContext.abortController.signal.aborted) {
      logEvent("tengu_tool_use_cancelled", {
        toolName: tool.name,
        toolUseID: toolUse.id
      });
      const message = createUserMessage([
        createToolResultStopMessage(toolUse.id)
      ]);
      yield message;
      return;
    }
    for await (const message of checkPermissionsAndCallTool(
      tool,
      toolUse.id,
      siblingToolUseIDs,
      toolInput,
      toolUseContext,
      canUseTool,
      assistantMessage,
      shouldSkipPermissionCheck
    )) {
      yield message;
    }
  } catch (e) {
    logError(e);
  }
}
function normalizeToolInput(tool, input) {
  switch (tool) {
    case BashTool: {
      const { command: command3, timeout } = BashTool.inputSchema.parse(input);
      return {
        command: command3.replace(`cd ${getCwd()} && `, ""),
        ...timeout ? { timeout } : {}
      };
    }
    default:
      return input;
  }
}
async function* checkPermissionsAndCallTool(tool, toolUseID, siblingToolUseIDs, input, context, canUseTool, assistantMessage, shouldSkipPermissionCheck) {
  const isValidInput = tool.inputSchema.safeParse(input);
  if (!isValidInput.success) {
    logEvent("tengu_tool_use_error", {
      error: `InputValidationError: ${isValidInput.error.message}`,
      messageID: assistantMessage.message.id,
      toolName: tool.name,
      toolInput: JSON.stringify(input).slice(0, 200)
    });
    yield createUserMessage([
      {
        type: "tool_result",
        content: `InputValidationError: ${isValidInput.error.message}`,
        is_error: true,
        tool_use_id: toolUseID
      }
    ]);
    return;
  }
  const normalizedInput = normalizeToolInput(tool, input);
  const isValidCall = await tool.validateInput?.(
    normalizedInput,
    context
  );
  if (isValidCall?.result === false) {
    logEvent("tengu_tool_use_error", {
      error: isValidCall?.message.slice(0, 2e3),
      messageID: assistantMessage.message.id,
      toolName: tool.name,
      toolInput: JSON.stringify(input).slice(0, 200),
      ...isValidCall?.meta ?? {}
    });
    yield createUserMessage([
      {
        type: "tool_result",
        content: isValidCall.message,
        is_error: true,
        tool_use_id: toolUseID
      }
    ]);
    return;
  }
  const permissionResult = shouldSkipPermissionCheck ? { result: true } : await canUseTool(tool, normalizedInput, context, assistantMessage);
  if (permissionResult.result === false) {
    yield createUserMessage([
      {
        type: "tool_result",
        content: permissionResult.message,
        is_error: true,
        tool_use_id: toolUseID
      }
    ]);
    return;
  }
  try {
    const generator = tool.call(normalizedInput, context, canUseTool);
    for await (const result of generator) {
      switch (result.type) {
        case "result":
          logEvent("tengu_tool_use_success", {
            messageID: assistantMessage.message.id,
            toolName: tool.name
          });
          yield createUserMessage(
            [
              {
                type: "tool_result",
                content: result.resultForAssistant,
                tool_use_id: toolUseID
              }
            ],
            {
              data: result.data,
              resultForAssistant: result.resultForAssistant
            }
          );
          return;
        case "progress":
          logEvent("tengu_tool_use_progress", {
            messageID: assistantMessage.message.id,
            toolName: tool.name
          });
          yield createProgressMessage(
            toolUseID,
            siblingToolUseIDs,
            result.content,
            result.normalizedMessages,
            result.tools
          );
      }
    }
  } catch (error) {
    const content = formatError(error);
    logError(error);
    logEvent("tengu_tool_use_error", {
      error: content.slice(0, 2e3),
      messageID: assistantMessage.message.id,
      toolName: tool.name,
      toolInput: JSON.stringify(input).slice(0, 1e3)
    });
    yield createUserMessage([
      {
        type: "tool_result",
        content,
        is_error: true,
        tool_use_id: toolUseID
      }
    ]);
  }
}
function formatError(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const parts = [error.message];
  if ("stderr" in error && typeof error.stderr === "string") {
    parts.push(error.stderr);
  }
  if ("stdout" in error && typeof error.stdout === "string") {
    parts.push(error.stdout);
  }
  const fullMessage = parts.filter(Boolean).join("\n");
  if (fullMessage.length <= 1e4) {
    return fullMessage;
  }
  const halfLength = 5e3;
  const start = fullMessage.slice(0, halfLength);
  const end = fullMessage.slice(-halfLength);
  return `${start}

... [${fullMessage.length - 1e4} characters truncated] ...

${end}`;
}

// src/screens/REPL.tsx
init_config();
init_statsig();
init_log();
init_model();

// src/components/binary-feedback/BinaryFeedback.tsx
import { default as React96, useCallback as useCallback10 } from "react";

// src/components/binary-feedback/BinaryFeedbackView.tsx
init_source();
import { Box as Box69, Text as Text76, useInput as useInput18 } from "ink";
import Link3 from "ink-link";
import React95, { useState as useState22 } from "react";

// src/components/binary-feedback/BinaryFeedbackOption.tsx
import * as React94 from "react";
import { Box as Box68 } from "ink";
function BinaryFeedbackOption({
  debug: debug2,
  erroredToolUseIDs,
  inProgressToolUseIDs,
  message,
  normalizedMessages,
  tools,
  unresolvedToolUseIDs,
  verbose
}) {
  const { columns } = useTerminalSize();
  return normalizeMessages([message]).filter((_) => _.type !== "progress").map((_, index) => /* @__PURE__ */ React94.createElement(Box68, { flexDirection: "column", key: index }, /* @__PURE__ */ React94.createElement(
    Message,
    {
      addMargin: false,
      erroredToolUseIDs,
      debug: debug2,
      inProgressToolUseIDs,
      message: _,
      messages: normalizedMessages,
      shouldAnimate: false,
      shouldShowDot: true,
      tools,
      unresolvedToolUseIDs,
      verbose,
      width: columns / 2 - 6
    }
  ), /* @__PURE__ */ React94.createElement(AdditionalContext, { message: _, verbose })));
}
function AdditionalContext({
  message,
  verbose
}) {
  const { columns } = useTerminalSize();
  if (message.type !== "assistant") {
    return null;
  }
  const content = message.message.content[0];
  switch (content.type) {
    case "tool_use":
      switch (content.name) {
        case FileEditTool.name: {
          const input = FileEditTool.inputSchema.safeParse(content.input);
          if (!input.success) {
            return null;
          }
          return /* @__PURE__ */ React94.createElement(
            FileEditToolDiff,
            {
              file_path: input.data.file_path,
              new_string: input.data.new_string,
              old_string: input.data.old_string,
              verbose,
              width: columns / 2 - 12
            }
          );
        }
        case FileWriteTool.name: {
          const input = FileWriteTool.inputSchema.safeParse(content.input);
          if (!input.success) {
            return null;
          }
          return /* @__PURE__ */ React94.createElement(
            FileWriteToolDiff,
            {
              file_path: input.data.file_path,
              content: input.data.content,
              verbose,
              width: columns / 2 - 12
            }
          );
        }
        default:
          return null;
      }
    default:
      return null;
  }
}

// src/components/binary-feedback/BinaryFeedbackView.tsx
var HELP_URL = "https://go/cli-feedback";
function getOptions2() {
  return [
    {
      // This option combines the follow user intents:
      // - The two options look about equally good to me
      // - I don't feel confident enough to choose
      // - I don't want to choose right now
      label: "Choose for me",
      value: "no-preference"
    },
    {
      label: "Left option looks better",
      value: "prefer-left"
    },
    {
      label: "Right option looks better",
      value: "prefer-right"
    },
    {
      label: `Neither, and tell Claude what to do differently (${source_default.bold.hex(getTheme().warning)("esc")})`,
      value: "neither"
    }
  ];
}
function BinaryFeedbackView({
  m1,
  m2,
  onChoose,
  debug: debug2,
  erroredToolUseIDs,
  inProgressToolUseIDs,
  normalizedMessages,
  tools,
  unresolvedToolUseIDs,
  verbose
}) {
  const theme = getTheme();
  const [focused, setFocus] = useState22("no-preference");
  const [focusValue, setFocusValue] = useState22(void 0);
  const exitState = useExitOnCtrlCD(() => process.exit(1));
  useInput18((_input, key) => {
    if (key.leftArrow) {
      setFocusValue("prefer-left");
    } else if (key.rightArrow) {
      setFocusValue("prefer-right");
    } else if (key.escape) {
      onChoose?.("neither");
    }
  });
  return /* @__PURE__ */ React95.createElement(React95.Fragment, null, /* @__PURE__ */ React95.createElement(
    Box69,
    {
      flexDirection: "column",
      height: "100%",
      width: "100%",
      borderStyle: "round",
      borderColor: theme.permission
    },
    /* @__PURE__ */ React95.createElement(Box69, { width: "100%", justifyContent: "space-between", paddingX: 1 }, /* @__PURE__ */ React95.createElement(Text76, { bold: true, color: theme.permission }, "[ANT-ONLY] Help train Claude"), /* @__PURE__ */ React95.createElement(Text76, null, /* @__PURE__ */ React95.createElement(Link3, { url: HELP_URL }, "[?]"))),
    /* @__PURE__ */ React95.createElement(Box69, { flexDirection: "row", width: "100%", flexGrow: 1, paddingTop: 1 }, /* @__PURE__ */ React95.createElement(
      Box69,
      {
        flexDirection: "column",
        flexGrow: 1,
        flexBasis: 1,
        gap: 1,
        borderStyle: focused === "prefer-left" ? "bold" : "single",
        borderColor: focused === "prefer-left" ? theme.success : theme.secondaryBorder,
        marginRight: 1,
        padding: 1
      },
      /* @__PURE__ */ React95.createElement(
        BinaryFeedbackOption,
        {
          erroredToolUseIDs,
          debug: debug2,
          inProgressToolUseIDs,
          message: m1,
          normalizedMessages,
          tools,
          unresolvedToolUseIDs,
          verbose
        }
      )
    ), /* @__PURE__ */ React95.createElement(
      Box69,
      {
        flexDirection: "column",
        flexGrow: 1,
        flexBasis: 1,
        gap: 1,
        borderStyle: focused === "prefer-right" ? "bold" : "single",
        borderColor: focused === "prefer-right" ? theme.success : theme.secondaryBorder,
        marginLeft: 1,
        padding: 1
      },
      /* @__PURE__ */ React95.createElement(
        BinaryFeedbackOption,
        {
          erroredToolUseIDs,
          debug: debug2,
          inProgressToolUseIDs,
          message: m2,
          normalizedMessages,
          tools,
          unresolvedToolUseIDs,
          verbose
        }
      )
    )),
    /* @__PURE__ */ React95.createElement(Box69, { flexDirection: "column", paddingTop: 1, paddingX: 1 }, /* @__PURE__ */ React95.createElement(Text76, null, "How do you want to proceed?"), /* @__PURE__ */ React95.createElement(
      Select,
      {
        options: getOptions2(),
        onFocus: setFocus,
        focusValue,
        onChange: onChoose
      }
    ))
  ), exitState.pending ? /* @__PURE__ */ React95.createElement(Box69, { marginLeft: 3 }, /* @__PURE__ */ React95.createElement(Text76, { dimColor: true }, "Press ", exitState.keyName, " again to exit")) : (
    // Render a blank line so that the UI doesn't reflow when the exit message is shown
    /* @__PURE__ */ React95.createElement(Text76, null, " ")
  ));
}

// src/components/binary-feedback/BinaryFeedback.tsx
function BinaryFeedback({
  m1,
  m2,
  resolve: resolve16,
  debug: debug2,
  erroredToolUseIDs,
  inProgressToolUseIDs,
  normalizedMessages,
  tools,
  unresolvedToolUseIDs,
  verbose
}) {
  const onChoose = useCallback10(
    (choice) => {
      logBinaryFeedbackEvent(m1, m2, choice);
      resolve16(getBinaryFeedbackResultForChoice(m1, m2, choice));
    },
    [m1, m2, resolve16]
  );
  useNotifyAfterTimeout("Claude needs your input on a response comparison");
  return /* @__PURE__ */ React96.createElement(
    BinaryFeedbackView,
    {
      debug: debug2,
      erroredToolUseIDs,
      inProgressToolUseIDs,
      m1,
      m2,
      normalizedMessages,
      tools,
      unresolvedToolUseIDs,
      verbose,
      onChoose
    }
  );
}

// src/utils/thinking.ts
init_statsig();
import { last as last2 } from "lodash-es";
init_model();
async function getMaxThinkingTokens(messages) {
  if (process.env.USER_TYPE === "ant" && process.env.MAX_THINKING_TOKENS) {
    const tokens = parseInt(process.env.MAX_THINKING_TOKENS, 10);
    logEvent("tengu_thinking", {
      method: "scratchpad",
      tokenCount: tokens.toString(),
      messageId: getLastAssistantMessageId(messages),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
    });
    return tokens;
  }
  if (await ThinkTool.isEnabled()) {
    logEvent("tengu_thinking", {
      method: "scratchpad",
      tokenCount: "0",
      messageId: getLastAssistantMessageId(messages),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
    });
    return 0;
  }
  const lastMessage = last2(messages);
  if (lastMessage?.type !== "user" || typeof lastMessage.message.content !== "string") {
    logEvent("tengu_thinking", {
      method: "scratchpad",
      tokenCount: "0",
      messageId: getLastAssistantMessageId(messages),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
    });
    return 0;
  }
  const content = lastMessage.message.content.toLowerCase();
  if (content.includes("think harder") || content.includes("think intensely") || content.includes("think longer") || content.includes("think really hard") || content.includes("think super hard") || content.includes("think very hard") || content.includes("ultrathink")) {
    logEvent("tengu_thinking", {
      method: "scratchpad",
      tokenCount: "31999",
      messageId: getLastAssistantMessageId(messages),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
    });
    return 32e3 - 1;
  }
  if (content.includes("think about it") || content.includes("think a lot") || content.includes("think hard") || content.includes("think more") || content.includes("megathink")) {
    logEvent("tengu_thinking", {
      method: "scratchpad",
      tokenCount: "10000",
      messageId: getLastAssistantMessageId(messages),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
    });
    return 1e4;
  }
  if (content.includes("think")) {
    logEvent("tengu_thinking", {
      method: "scratchpad",
      tokenCount: "4000",
      messageId: getLastAssistantMessageId(messages),
      provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
    });
    return 4e3;
  }
  logEvent("tengu_thinking", {
    method: "scratchpad",
    tokenCount: "0",
    messageId: getLastAssistantMessageId(messages),
    provider: USE_BEDROCK ? "bedrock" : USE_VERTEX ? "vertex" : "1p"
  });
  return 0;
}

// src/screens/REPL.tsx
init_state();
function REPL({
  commands,
  dangerouslySkipPermissions,
  debug: debug2 = false,
  initialForkNumber = 0,
  initialPrompt,
  messageLogName,
  shouldShowPromptInput,
  tools,
  verbose: verboseFromCLI,
  initialMessages,
  mcpClients = [],
  isDefaultModel = true
}) {
  const verbose = verboseFromCLI ?? getGlobalConfig().verbose;
  const [forkNumber, setForkNumber] = useState23(
    getNextAvailableLogForkNumber(messageLogName, initialForkNumber, 0)
  );
  const [
    forkConvoWithMessagesOnTheNextRender,
    setForkConvoWithMessagesOnTheNextRender
  ] = useState23(null);
  const [abortController, setAbortController] = useState23(null);
  const [isLoading, setIsLoading] = useState23(false);
  const [autoUpdaterResult, setAutoUpdaterResult] = useState23(null);
  const [toolJSX, setToolJSX] = useState23(null);
  const [toolUseConfirm, setToolUseConfirm] = useState23(
    null
  );
  const [messages, setMessages2] = useState23(initialMessages ?? []);
  const [inputValue, setInputValue] = useState23("");
  const [inputMode, setInputMode] = useState23("prompt");
  const [submitCount, setSubmitCount] = useState23(0);
  const [isMessageSelectorVisible, setIsMessageSelectorVisible] = useState23(false);
  const [showCostDialog, setShowCostDialog] = useState23(false);
  const [haveShownCostDialog, setHaveShownCostDialog] = useState23(
    getGlobalConfig().hasAcknowledgedCostThreshold
  );
  const [binaryFeedbackContext, setBinaryFeedbackContext] = useState23(null);
  const getBinaryFeedbackResponse = useCallback11(
    (m1, m2) => {
      return new Promise((resolvePromise) => {
        setBinaryFeedbackContext({
          m1,
          m2,
          resolve: resolvePromise
        });
      });
    },
    []
  );
  const readFileTimestamps = useRef6({});
  const { status: apiKeyStatus, reverify } = useApiKeyVerification();
  function onCancel() {
    if (!isLoading) {
      return;
    }
    setIsLoading(false);
    if (toolUseConfirm) {
      toolUseConfirm.onAbort();
    } else {
      abortController?.abort();
    }
  }
  useCancelRequest(
    setToolJSX,
    setToolUseConfirm,
    setBinaryFeedbackContext,
    onCancel,
    isLoading,
    isMessageSelectorVisible,
    abortController?.signal
  );
  useEffect21(() => {
    if (forkConvoWithMessagesOnTheNextRender) {
      setForkNumber((_) => _ + 1);
      setForkConvoWithMessagesOnTheNextRender(null);
      setMessages2(forkConvoWithMessagesOnTheNextRender);
    }
  }, [forkConvoWithMessagesOnTheNextRender]);
  useEffect21(() => {
    const totalCost = getTotalCost();
    if (totalCost >= 5 && !showCostDialog && !haveShownCostDialog) {
      logEvent("tengu_cost_threshold_reached", {});
      setShowCostDialog(true);
    }
  }, [messages, showCostDialog, haveShownCostDialog]);
  const canUseTool = useCanUseTool_default(setToolUseConfirm);
  async function onInit() {
    reverify();
    if (!initialPrompt) {
      return;
    }
    setIsLoading(true);
    const abortController2 = new AbortController();
    setAbortController(abortController2);
    const model2 = await getSlowAndCapableModel();
    const newMessages = await processUserInput(
      initialPrompt,
      "prompt",
      setToolJSX,
      {
        abortController: abortController2,
        options: {
          commands,
          forkNumber,
          messageLogName,
          tools,
          verbose,
          slowAndCapableModel: model2,
          maxThinkingTokens: 0
        },
        messageId: getLastAssistantMessageId(messages),
        setForkConvoWithMessagesOnTheNextRender,
        readFileTimestamps: readFileTimestamps.current
      },
      null
    );
    if (newMessages.length) {
      for (const message of newMessages) {
        if (message.type === "user") {
          addToHistory(initialPrompt);
        }
      }
      setMessages2((_) => [..._, ...newMessages]);
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.type === "assistant") {
        setAbortController(null);
        setIsLoading(false);
        return;
      }
      const [systemPrompt, context, model3, maxThinkingTokens] = await Promise.all([
        getSystemPrompt(),
        getContext(),
        getSlowAndCapableModel(),
        getMaxThinkingTokens([...messages, ...newMessages])
      ]);
      for await (const message of query(
        [...messages, ...newMessages],
        systemPrompt,
        context,
        canUseTool,
        {
          options: {
            commands,
            forkNumber,
            messageLogName,
            tools,
            slowAndCapableModel: model3,
            verbose,
            dangerouslySkipPermissions,
            maxThinkingTokens
          },
          messageId: getLastAssistantMessageId([...messages, ...newMessages]),
          readFileTimestamps: readFileTimestamps.current,
          abortController: abortController2,
          setToolJSX
        },
        getBinaryFeedbackResponse
      )) {
        setMessages2((oldMessages) => [...oldMessages, message]);
      }
    } else {
      addToHistory(initialPrompt);
    }
    setHaveShownCostDialog(
      getGlobalConfig().hasAcknowledgedCostThreshold || false
    );
    setIsLoading(false);
  }
  async function onQuery(newMessages, abortController2) {
    setMessages2((oldMessages) => [...oldMessages, ...newMessages]);
    markProjectOnboardingComplete();
    const lastMessage = newMessages[newMessages.length - 1];
    if (lastMessage.type === "user" && typeof lastMessage.message.content === "string") {
      updateTerminalTitle(lastMessage.message.content);
    }
    if (lastMessage.type === "assistant") {
      setAbortController(null);
      setIsLoading(false);
      return;
    }
    const [systemPrompt, context, model2, maxThinkingTokens] = await Promise.all(
      [
        getSystemPrompt(),
        getContext(),
        getSlowAndCapableModel(),
        getMaxThinkingTokens([...messages, lastMessage])
      ]
    );
    for await (const message of query(
      [...messages, lastMessage],
      systemPrompt,
      context,
      canUseTool,
      {
        options: {
          commands,
          forkNumber,
          messageLogName,
          tools,
          slowAndCapableModel: model2,
          verbose,
          dangerouslySkipPermissions,
          maxThinkingTokens
        },
        messageId: getLastAssistantMessageId([...messages, lastMessage]),
        readFileTimestamps: readFileTimestamps.current,
        abortController: abortController2,
        setToolJSX
      },
      getBinaryFeedbackResponse
    )) {
      setMessages2((oldMessages) => [...oldMessages, message]);
    }
    setIsLoading(false);
  }
  useCostSummary();
  useEffect21(() => {
    const getMessages2 = () => messages;
    setMessagesGetter(getMessages2);
    setMessagesSetter(setMessages2);
  }, [messages]);
  useLogMessages(messages, messageLogName, forkNumber);
  useLogStartupTime();
  useEffect21(() => {
    onInit();
  }, []);
  const normalizedMessages = useMemo15(
    () => normalizeMessages(messages).filter(isNotEmptyMessage),
    [messages]
  );
  const unresolvedToolUseIDs = useMemo15(
    () => getUnresolvedToolUseIDs(normalizedMessages),
    [normalizedMessages]
  );
  const inProgressToolUseIDs = useMemo15(
    () => getInProgressToolUseIDs(normalizedMessages),
    [normalizedMessages]
  );
  const erroredToolUseIDs = useMemo15(
    () => new Set(
      getErroredToolUseMessages(normalizedMessages).map(
        (_) => _.message.content[0].id
      )
    ),
    [normalizedMessages]
  );
  const messagesJSX = useMemo15(() => {
    return [
      {
        type: "static",
        jsx: /* @__PURE__ */ React97.createElement(Box70, { flexDirection: "column", key: `logo${forkNumber}` }, /* @__PURE__ */ React97.createElement(Logo, { mcpClients, isDefaultModel }), /* @__PURE__ */ React97.createElement(ProjectOnboarding, { workspaceDir: getOriginalCwd() }))
      },
      ...reorderMessages(normalizedMessages).map((_) => {
        const toolUseID = getToolUseID(_);
        const message = _.type === "progress" ? _.content.message.content[0]?.type === "text" && // Hack: AgentTool interrupts use Progress messages, so don't
        // need an extra ⎿ because <Message /> already adds one.
        // TODO: Find a cleaner way to do this.
        _.content.message.content[0].text === INTERRUPT_MESSAGE ? /* @__PURE__ */ React97.createElement(
          Message,
          {
            message: _.content,
            messages: _.normalizedMessages,
            addMargin: false,
            tools: _.tools,
            verbose: verbose ?? false,
            debug: debug2,
            erroredToolUseIDs: /* @__PURE__ */ new Set(),
            inProgressToolUseIDs: /* @__PURE__ */ new Set(),
            unresolvedToolUseIDs: /* @__PURE__ */ new Set(),
            shouldAnimate: false,
            shouldShowDot: false
          }
        ) : /* @__PURE__ */ React97.createElement(MessageResponse, null, /* @__PURE__ */ React97.createElement(
          Message,
          {
            message: _.content,
            messages: _.normalizedMessages,
            addMargin: false,
            tools: _.tools,
            verbose: verbose ?? false,
            debug: debug2,
            erroredToolUseIDs: /* @__PURE__ */ new Set(),
            inProgressToolUseIDs: /* @__PURE__ */ new Set(),
            unresolvedToolUseIDs: /* @__PURE__ */ new Set([
              _.content.message.content[0].id
            ]),
            shouldAnimate: false,
            shouldShowDot: false
          }
        )) : /* @__PURE__ */ React97.createElement(
          Message,
          {
            message: _,
            messages: normalizedMessages,
            addMargin: true,
            tools,
            verbose,
            debug: debug2,
            erroredToolUseIDs,
            inProgressToolUseIDs,
            shouldAnimate: !toolJSX && !toolUseConfirm && !isMessageSelectorVisible && (!toolUseID || inProgressToolUseIDs.has(toolUseID)),
            shouldShowDot: true,
            unresolvedToolUseIDs
          }
        );
        const type = shouldRenderStatically(
          _,
          normalizedMessages,
          unresolvedToolUseIDs
        ) ? "static" : "transient";
        if (debug2) {
          return {
            type,
            jsx: /* @__PURE__ */ React97.createElement(
              Box70,
              {
                borderStyle: "single",
                borderColor: type === "static" ? "green" : "red",
                key: _.uuid,
                width: "100%"
              },
              message
            )
          };
        }
        return {
          type,
          jsx: /* @__PURE__ */ React97.createElement(Box70, { key: _.uuid, width: "100%" }, message)
        };
      })
    ];
  }, [
    forkNumber,
    normalizedMessages,
    tools,
    verbose,
    debug2,
    erroredToolUseIDs,
    inProgressToolUseIDs,
    toolJSX,
    toolUseConfirm,
    isMessageSelectorVisible,
    unresolvedToolUseIDs,
    mcpClients,
    isDefaultModel
  ]);
  const showingCostDialog = !isLoading && showCostDialog;
  return /* @__PURE__ */ React97.createElement(React97.Fragment, null, /* @__PURE__ */ React97.createElement(
    Static2,
    {
      key: `static-messages-${forkNumber}`,
      items: messagesJSX.filter((_) => _.type === "static")
    },
    (_) => _.jsx
  ), messagesJSX.filter((_) => _.type === "transient").map((_) => _.jsx), /* @__PURE__ */ React97.createElement(
    Box70,
    {
      borderColor: "red",
      borderStyle: debug2 ? "single" : void 0,
      flexDirection: "column",
      width: "100%"
    },
    !toolJSX && !toolUseConfirm && !binaryFeedbackContext && isLoading && /* @__PURE__ */ React97.createElement(Spinner, null),
    toolJSX ? toolJSX.jsx : null,
    !toolJSX && binaryFeedbackContext && !isMessageSelectorVisible && /* @__PURE__ */ React97.createElement(
      BinaryFeedback,
      {
        m1: binaryFeedbackContext.m1,
        m2: binaryFeedbackContext.m2,
        resolve: (result) => {
          binaryFeedbackContext.resolve(result);
          setTimeout(() => setBinaryFeedbackContext(null), 0);
        },
        verbose,
        normalizedMessages,
        tools,
        debug: debug2,
        erroredToolUseIDs,
        inProgressToolUseIDs,
        unresolvedToolUseIDs
      }
    ),
    !toolJSX && toolUseConfirm && !isMessageSelectorVisible && !binaryFeedbackContext && /* @__PURE__ */ React97.createElement(
      PermissionRequest,
      {
        toolUseConfirm,
        onDone: () => setToolUseConfirm(null),
        verbose
      }
    ),
    !toolJSX && !toolUseConfirm && !isMessageSelectorVisible && !binaryFeedbackContext && showingCostDialog && /* @__PURE__ */ React97.createElement(
      CostThresholdDialog,
      {
        onDone: () => {
          setShowCostDialog(false);
          setHaveShownCostDialog(true);
          const projectConfig = getGlobalConfig();
          saveGlobalConfig({
            ...projectConfig,
            hasAcknowledgedCostThreshold: true
          });
          logEvent("tengu_cost_threshold_acknowledged", {});
        }
      }
    ),
    !toolUseConfirm && !toolJSX?.shouldHidePromptInput && shouldShowPromptInput && !isMessageSelectorVisible && !binaryFeedbackContext && !showingCostDialog && /* @__PURE__ */ React97.createElement(React97.Fragment, null, /* @__PURE__ */ React97.createElement(
      PromptInput_default,
      {
        commands,
        forkNumber,
        messageLogName,
        tools,
        isDisabled: apiKeyStatus === "invalid",
        isLoading,
        onQuery,
        debug: debug2,
        verbose,
        messages,
        setToolJSX,
        onAutoUpdaterResult: setAutoUpdaterResult,
        autoUpdaterResult,
        input: inputValue,
        onInputChange: setInputValue,
        mode: inputMode,
        onModeChange: setInputMode,
        submitCount,
        onSubmitCountChange: setSubmitCount,
        setIsLoading,
        setAbortController,
        onShowMessageSelector: () => setIsMessageSelectorVisible((prev) => !prev),
        setForkConvoWithMessagesOnTheNextRender
      }
    ), /* @__PURE__ */ React97.createElement(TokenUsageDisplay, { verbose, messages }))
  ), isMessageSelectorVisible && /* @__PURE__ */ React97.createElement(
    MessageSelector,
    {
      erroredToolUseIDs,
      unresolvedToolUseIDs,
      messages: normalizeMessagesForAPI(messages),
      onSelect: async (message) => {
        setIsMessageSelectorVisible(false);
        if (!messages.includes(message)) {
          return;
        }
        onCancel();
        setImmediate(async () => {
          await clearTerminal();
          setMessages2([]);
          setForkConvoWithMessagesOnTheNextRender(
            messages.slice(0, messages.indexOf(message))
          );
          if (typeof message.message.content === "string") {
            setInputValue(message.message.content);
          }
        });
      },
      onEscape: () => setIsMessageSelectorVisible(false),
      tools
    }
  ), /* @__PURE__ */ React97.createElement(Newline2, null));
}
function shouldRenderStatically(message, messages, unresolvedToolUseIDs) {
  switch (message.type) {
    case "user":
    case "assistant": {
      const toolUseID = getToolUseID(message);
      if (!toolUseID) {
        return true;
      }
      if (unresolvedToolUseIDs.has(toolUseID)) {
        return false;
      }
      const correspondingProgressMessage = messages.find(
        (_) => _.type === "progress" && _.toolUseID === toolUseID
      );
      if (!correspondingProgressMessage) {
        return true;
      }
      return !intersects(
        unresolvedToolUseIDs,
        correspondingProgressMessage.siblingToolUseIDs
      );
    }
    case "progress":
      return !intersects(unresolvedToolUseIDs, message.siblingToolUseIDs);
  }
}
function intersects(a, b) {
  return a.size > 0 && b.size > 0 && [...a].some((_) => b.has(_));
}

// src/entrypoints/cli.tsx
import { Command as Command2 } from "@commander-js/extra-typings";

// src/utils/ask.tsx
import { last as last3 } from "lodash-es";
init_model();
init_state();
init_log();
async function ask({
  commands,
  dangerouslySkipPermissions,
  hasPermissionsToUseTool: hasPermissionsToUseTool2,
  messageLogName,
  prompt,
  cwd: cwd4,
  tools,
  verbose = false
}) {
  await setCwd(cwd4);
  const message = createUserMessage(prompt);
  const messages = [message];
  const [systemPrompt, context, model2] = await Promise.all([
    getSystemPrompt(),
    getContext(),
    getSlowAndCapableModel()
  ]);
  for await (const m of query(
    messages,
    systemPrompt,
    context,
    hasPermissionsToUseTool2,
    {
      options: {
        commands,
        tools,
        verbose,
        dangerouslySkipPermissions,
        slowAndCapableModel: model2,
        forkNumber: 0,
        messageLogName: "unused",
        maxThinkingTokens: 0
      },
      abortController: new AbortController(),
      messageId: void 0,
      readFileTimestamps: {}
    }
  )) {
    messages.push(m);
  }
  const result = last3(messages);
  if (!result || result.type !== "assistant") {
    throw new Error("Expected content to be an assistant message");
  }
  if (result.message.content[0]?.type !== "text") {
    throw new Error(
      `Expected first content item to be text, but got ${JSON.stringify(
        result.message.content[0],
        null,
        2
      )}`
    );
  }
  const messageHistoryFile = getMessagesPath(messageLogName, 0, 0);
  overwriteLog(messageHistoryFile, messages);
  return {
    resultText: result.message.content[0].text,
    totalCost: getTotalCost(),
    messageHistoryFile
  };
}

// src/tools/AgentTool/AgentTool.tsx
init_source();
import { last as last4, memoize as memoize17 } from "lodash-es";
import { EOL as EOL5 } from "os";
import * as React98 from "react";
import { z as z17 } from "zod";
init_log();
init_model();

// src/tools/AgentTool/prompt.ts
async function getAgentTools(dangerouslySkipPermissions) {
  return (await (dangerouslySkipPermissions ? getTools() : getReadOnlyTools())).filter((_) => _.name !== AgentTool.name);
}
async function getPrompt(dangerouslySkipPermissions) {
  const tools = await getAgentTools(dangerouslySkipPermissions);
  const toolNames = tools.map((_) => _.name).join(", ");
  return `Launch a new agent that has access to the following tools: ${toolNames}. When you are searching for a keyword or file and are not confident that you will find the right match on the first try, use the Agent tool to perform the search for you. For example:

- If you are searching for a keyword like "config" or "logger", the Agent tool is appropriate
- If you want to read a specific file path, use the ${FileReadTool.name} or ${GlobTool.name} tool instead of the Agent tool, to find the match more quickly
- If you are searching for a specific class definition like "class Foo", use the ${GlobTool.name} tool instead, to find the match more quickly

Usage notes:
1. Launch multiple agents concurrently whenever possible, to maximize performance; to do that, use a single message with multiple tool uses
2. When the agent is done, it will return a single message back to you. The result returned by the agent is not visible to the user. To show the user the result, you should send a text message back to the user with a concise summary of the result.
3. Each agent invocation is stateless. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.
4. The agent's outputs should generally be trusted${dangerouslySkipPermissions ? "" : `
5. IMPORTANT: The agent can not use ${BashTool.name}, ${FileWriteTool.name}, ${FileEditTool.name}, ${NotebookEditTool.name}, so can not modify files. If you want to use these tools, use them directly instead of going through the agent.`}`;
}

// src/tools/AgentTool/AgentTool.tsx
var inputSchema16 = z17.object({
  prompt: z17.string().describe("The task for the agent to perform")
});
var AgentTool = {
  async prompt({ dangerouslySkipPermissions }) {
    return await getPrompt(dangerouslySkipPermissions);
  },
  name: TOOL_NAME,
  async description() {
    return "Launch a new task";
  },
  inputSchema: inputSchema16,
  async *call({ prompt }, {
    abortController,
    options: {
      dangerouslySkipPermissions = false,
      forkNumber,
      messageLogName,
      verbose
    },
    readFileTimestamps
  }) {
    const startTime = Date.now();
    const messages = [createUserMessage(prompt)];
    const tools = await getAgentTools(dangerouslySkipPermissions);
    yield {
      type: "progress",
      content: createAssistantMessage(source_default.dim("Initializing\u2026")),
      normalizedMessages: normalizeMessages(messages),
      tools
    };
    const [agentPrompt, context, slowAndCapableModel, maxThinkingTokens] = await Promise.all([
      getAgentPrompt(),
      getContext(),
      getSlowAndCapableModel(),
      getMaxThinkingTokens(messages)
    ]);
    let toolUseCount = 0;
    const getSidechainNumber = memoize17(
      () => getNextAvailableLogSidechainNumber(messageLogName, forkNumber)
    );
    for await (const message of query(
      messages,
      agentPrompt,
      context,
      hasPermissionsToUseTool,
      {
        abortController,
        options: {
          dangerouslySkipPermissions,
          forkNumber,
          messageLogName,
          tools,
          commands: [],
          verbose,
          slowAndCapableModel,
          maxThinkingTokens
        },
        messageId: getLastAssistantMessageId(messages),
        readFileTimestamps
      }
    )) {
      messages.push(message);
      overwriteLog(
        // IMPORTANT: Compute sidechain number here, not earlier, to avoid a race condition
        // where concurrent Agents reserve the same sidechain number.
        getMessagesPath(messageLogName, forkNumber, getSidechainNumber()),
        messages.filter((_) => _.type !== "progress")
      );
      if (message.type !== "assistant") {
        continue;
      }
      const normalizedMessages2 = normalizeMessages(messages);
      for (const content of message.message.content) {
        if (content.type !== "tool_use") {
          continue;
        }
        toolUseCount++;
        yield {
          type: "progress",
          content: normalizedMessages2.find(
            (_) => _.type === "assistant" && _.message.content[0]?.type === "tool_use" && _.message.content[0].id === content.id
          ),
          normalizedMessages: normalizedMessages2,
          tools
        };
      }
    }
    const normalizedMessages = normalizeMessages(messages);
    const lastMessage = last4(messages);
    if (lastMessage?.type !== "assistant") {
      throw new Error("Last message was not an assistant message");
    }
    if (lastMessage.message.content.some(
      (_) => _.type === "text" && _.text === INTERRUPT_MESSAGE
    )) {
      yield {
        type: "progress",
        content: lastMessage,
        normalizedMessages,
        tools
      };
    } else {
      const result = [
        toolUseCount === 1 ? "1 tool use" : `${toolUseCount} tool uses`,
        formatNumber(
          (lastMessage.message.usage.cache_creation_input_tokens ?? 0) + (lastMessage.message.usage.cache_read_input_tokens ?? 0) + lastMessage.message.usage.input_tokens + lastMessage.message.usage.output_tokens
        ) + " tokens",
        formatDuration(Date.now() - startTime)
      ];
      yield {
        type: "progress",
        content: createAssistantMessage(`Done (${result.join(" \xB7 ")})`),
        normalizedMessages,
        tools
      };
    }
    const data = lastMessage.message.content.filter((_) => _.type === "text");
    yield {
      type: "result",
      data,
      normalizedMessages,
      resultForAssistant: this.renderResultForAssistant(data),
      tools
    };
  },
  isReadOnly() {
    return true;
  },
  async isEnabled() {
    return true;
  },
  userFacingName() {
    return "Task";
  },
  needsPermissions() {
    return false;
  },
  renderResultForAssistant(data) {
    return data;
  },
  renderToolUseMessage({ prompt }, { verbose }) {
    const lines = prompt.split(EOL5);
    return applyMarkdown(!verbose && lines.length > 1 ? lines[0] + "\u2026" : prompt);
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React98.createElement(FallbackToolUseRejectedMessage, null);
  }
};

// src/tools/ArchitectTool/ArchitectTool.tsx
import { Box as Box71 } from "ink";
import * as React99 from "react";
import { z as z18 } from "zod";

// src/tools/ArchitectTool/prompt.ts
var ARCHITECT_SYSTEM_PROMPT = `You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and detailed. However do not actually write the code, just explain the plan.

Follow these steps for each request:
1. Carefully analyze requirements to identify core functionality and constraints
2. Define clear technical approach with specific technologies and patterns
3. Break down implementation into concrete, actionable steps at the appropriate level of abstraction

Keep responses focused, specific and actionable. 

IMPORTANT: Do not ask the user if you should implement the changes at the end. Just provide the plan as described above.
IMPORTANT: Do not attempt to write the code or use any string modification tools. Just provide the plan.`;
var DESCRIPTION15 = "Your go-to tool for any technical or coding task. Analyzes requirements and breaks them down into clear, actionable implementation steps. Use this whenever you need help planning how to implement a feature, solve a technical problem, or structure your code.";

// src/tools/ArchitectTool/ArchitectTool.tsx
var FS_EXPLORATION_TOOLS = [
  BashTool,
  LSTool,
  FileReadTool,
  FileWriteTool,
  GlobTool,
  GrepTool
];
var inputSchema17 = z18.strictObject({
  prompt: z18.string().describe("The technical request or coding task to analyze"),
  context: z18.string().describe("Optional context from previous conversation or system state").optional()
});
var ArchitectTool = {
  name: "Architect",
  async description() {
    return DESCRIPTION15;
  },
  inputSchema: inputSchema17,
  isReadOnly() {
    return true;
  },
  userFacingName() {
    return "Architect";
  },
  async isEnabled() {
    return false;
  },
  needsPermissions() {
    return false;
  },
  async *call({ prompt, context }, toolUseContext, canUseTool) {
    const content = context ? `<context>${context}</context>

${prompt}` : prompt;
    const userMessage = createUserMessage(content);
    const messages = [userMessage];
    const allowedTools = (toolUseContext.options.tools ?? []).filter(
      (_) => FS_EXPLORATION_TOOLS.map((_2) => _2.name).includes(_.name)
    );
    const lastResponse = await lastX(
      query(
        messages,
        [ARCHITECT_SYSTEM_PROMPT],
        await getContext(),
        canUseTool,
        {
          ...toolUseContext,
          options: { ...toolUseContext.options, tools: allowedTools }
        }
      )
    );
    if (lastResponse.type !== "assistant") {
      throw new Error("Invalid response from Claude API");
    }
    const data = lastResponse.message.content.filter((_) => _.type === "text");
    yield {
      type: "result",
      data,
      resultForAssistant: this.renderResultForAssistant(data)
    };
  },
  async prompt() {
    return DESCRIPTION15;
  },
  renderResultForAssistant(data) {
    return data;
  },
  renderToolUseMessage(input) {
    return Object.entries(input).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(", ");
  },
  renderToolResultMessage(content) {
    return /* @__PURE__ */ React99.createElement(Box71, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React99.createElement(
      HighlightedCode,
      {
        code: content.map((_) => _.text).join("\n"),
        language: "markdown"
      }
    ));
  },
  renderToolUseRejectedMessage() {
    return /* @__PURE__ */ React99.createElement(FallbackToolUseRejectedMessage, null);
  }
};

// src/tools/StickerRequestTool/StickerRequestTool.tsx
import { z as z19 } from "zod";
import React102 from "react";
import { Text as Text79 } from "ink";

// src/tools/StickerRequestTool/prompt.ts
var DESCRIPTION16 = "Sends the user swag stickers with love from Anthropic.";
var PROMPT10 = `This tool should be used whenever a user expresses interest in receiving Anthropic or Claude stickers, swag, or merchandise. When triggered, it will display a shipping form for the user to enter their mailing address and contact details. Once submitted, Anthropic will process the request and ship stickers to the provided address.

Common trigger phrases to watch for:
- "Can I get some Anthropic stickers please?"
- "How do I get Anthropic swag?"
- "I'd love some Claude stickers"
- "Where can I get merchandise?"
- Any mention of wanting stickers or swag

The tool handles the entire request process by showing an interactive form to collect shipping information.

NOTE: Only use this tool if the user has explicitly asked us to send or give them stickers. If there are other requests that include the word "sticker", but do not explicitly ask us to send them stickers, do not use this tool.
For example:
- "How do I make custom stickers for my project?" - Do not use this tool
- "I need to store sticker metadata in a database - what schema do you recommend?" - Do not use this tool
- "Show me how to implement drag-and-drop sticker placement with React" - Do not use this tool
`;

// src/components/StickerRequestForm.tsx
import React101 from "react";
import { Box as Box72, Text as Text78, useInput as useInput19 } from "ink";
import Link4 from "ink-link";

// src/utils/validate.ts
function validateField(field, value) {
  const trimmed = value.trim();
  if (!trimmed && field === "address2") {
    return null;
  }
  if (!trimmed) {
    return { message: "This field is required" };
  }
  switch (field) {
    case "email": {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(trimmed)) {
        return { message: "Please enter a valid email address" };
      }
      break;
    }
    case "name":
      if (trimmed.length < 2) {
        return { message: "Name must be at least 2 characters long" };
      }
      break;
    case "address1": {
      if (trimmed.length < 3) {
        return { message: "Please enter a valid address" };
      }
      const isPOBox = /^P\.?O\.?\s*Box\s+\d+$/i.test(trimmed);
      const hasNumber = /\d+/.test(trimmed);
      if (!isPOBox && !hasNumber) {
        return { message: "Please include a number in the street address" };
      }
      break;
    }
    case "address2":
      break;
    case "city":
      if (trimmed.length < 2) {
        return { message: "City name must be at least 2 characters long" };
      }
      if (!/^[a-zA-Z\s.-]+$/.test(trimmed)) {
        return {
          message: "City can only contain letters, spaces, periods, and hyphens"
        };
      }
      break;
    case "state": {
      const states = /* @__PURE__ */ new Set([
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
        "DC"
      ]);
      const stateCode = trimmed.toUpperCase();
      if (!states.has(stateCode)) {
        return { message: "Please enter a valid US state code (e.g. CA)" };
      }
      break;
    }
    case "usLocation": {
      const normalized = trimmed.toLowerCase();
      if (!["y", "yes", "n", "no"].includes(normalized)) {
        return { message: "Please enter y/yes or n/no" };
      }
      break;
    }
    case "zip":
      if (!/^\d{5}(-\d{4})?$/.test(trimmed)) {
        return {
          message: "Please enter a valid ZIP code (e.g. 12345 or 12345-6789)"
        };
      }
      break;
    case "phone":
      if (!/^(\+1\s?)?(\d{3}[-.\s]??)?\d{3}[-.\s]??\d{4}$/.test(trimmed)) {
        return {
          message: "Please enter a valid US phone number"
        };
      }
      break;
  }
  return null;
}

// src/components/StickerRequestForm.tsx
init_statsig();
init_log();

// src/components/AnimatedClaudeAsterisk.tsx
import React100 from "react";
import { Text as Text77 } from "ink";

// src/constants/claude-asterisk-ascii-art.tsx
var largeAnimatedAray = [
  `                                                  
              .=#*=.      :==.                    
              -%%%%=.    .#%#=                    
              .=%%%#=    :%%#:    -=+-            
         ...   .=%%%*-   =@%+   :+%%%%.           
        :*%%+=  .=%%%*-  +%%= .=%%%%%=            
        .=#%%%#=..=#%%*: *%#:-*%%%%+:             
          .=*%%%%+==#%%+.%%+=#%%%%=.              
             :=#%%%##%%%*%%%%%%%*-       .        
                -=#%%%%%%%%%%%%+-====+*%%%+.      
     .============-=*%%%%%%%%%%%%%%%%#+===:       
      =======+++****%%%%%%%%%%#+==:.              
                  -=*%%%%%%%%%*+#%%%%%%%#*=.      
              .=+#%#++#%%%%%%%%+-..-==+*##=.      
           .=+%%%+=-+%#=*%+%%%##%+:               
         .+%%%*=. =*%+:-%%:=#%#==#%+:             
         .=+=.  .=%%=. +%#. -*%%=:=*%+-           
               -*%#=  .#%*   :*%%+: :=*.          
             .=%%=.   =%%=    .=%%=.              
              :=.     +%%=     .-=:               
                      =#+.                        
`,
  `                                                  
              .=*+=.      .==.                    
              -####=.    .*#*=                    
              .=###*-    :##*:    -==-            
         ...   .=###+-   =%#+   :+####.           
        .+##+-  .=###+:  =##= .=*####-            
        .=*###*=..=*##+. +#*::+####=.             
          .=+###*=-=*##+.*#==*###*=.              
             .=*###**###+#######+-                
                :=*############+--====*###=.      
     .===========--=+################*+===.       
      -=========++++##########*+==.               
                  :=*#########*+*#######*+=.      
              .==*#*==*########=-..-===+**=.      
           .==*##+=:=#*-*#+###**#+:               
         .=###+=. -+#+::##:=*#*==*#=:             
         .===.  .=##=. =#*. -+#*=:=+#=-           
               -+#*=  .*#+   :+##+: :=*.          
              =#*=.   =##=    .=##=.              
              :=.     =##=      -=:               
                      =*+.                        
`,
  `                                                  
              .=+==.      .=-.                    
              :****=     .+*+=                    
              .=***+-    :**+:    -==:            
         ...   .=***+:   -**=   :=****.           
        .+**=-  .=***=:  =**= .=*****-            
        .=+***+=..=+**=. =*+.:=****=.             
           ==****=-=+**=.**==+****=.              
             .=+***++***+*******=:                
                :=+************=:-====+***=.      
     .==========--:-+****************+====.       
      -============+**********+==-.               
                  :=+*********+=+*******+==.      
              .-=+*+==+********=:..:====++=.      
            ==***=-:=*+-+*=***++*=:               
         .=***+=. -+*=::**.-+*+==+*=:             
         .===.  .=**=. =*+. :+**=.=+*=-           
               :+*+-  .+*+   :=**=: :=+.          
              =**=.   -**=    .=**=.              
              :-.     =**-      :=.               
                      =+=.                        
`,
  `                                                  
              .===-.      .=-.                    
              :++++=      =+=-                    
              .=+++=:    .++=:    :==:            
         ..    .=+++=:   -++=   :=++++            
        .=++=:  .=+++=:  =++= .=+++++:            
        .==+++==..==++=. =+=.:=++++=.             
           -=++++=--=++=.++=-=++++=.              
             .==+++==+++=+++++++=:                
                :==++++++++++++=::=====+++=.      
     .-====---=---:-=++++++++++++++++====-.       
      :=============++++++++++===-.               
                  :==+++++++++===+++++++==-.      
              .-==+===+++++++++=: .:=======.      
            -=+++=-:=+=:=+=+++==+=:               
         .=+++==. :=+=::++.-=+====+=.             
          ===.  .=++=. =++. :=++=.-=+=:           
               :=+=-  .++=   :=++=. .==.          
              -++=.   -++=    .=++=.              
              .-.     =++-      :-.               
                      -==.                        
`,
  `                                                  
              .===-.      .-:                     
              :====-      ===-                    
              .-====:    .===.    :==:            
         ..    .-====:   :===   .=====            
        .====:  .-====.  ===- .-=====:            
         -=====-..-====. ===..======.             
           -======:-====.===:=====-.              
             .-==================:                
                .===============::-========.      
     .-=---------:::=====================-.       
      :=-========================:.               
                  .=======================-.      
               :================: .:-=====-.      
            -=====:.===:==========.               
         .=====-. :===.:==.:===--===.             
          -=-.  .===-. ===  :====.-===:           
               :===:  .===   .====. .==           
              -==-.   :===    .====.              
              .:.     ===:      ::.               
                      -==.                        
`,
  `                                                  
              .-==:       .-:                     
              .====:      ===:                    
               :====:    .===.    .--.            
          .    .-====.   :===   .-====            
        .====.   :====.  -==: .:=====:            
         -=====-. :====. ===..=====-.             
           :======::====.==-:=====:               
             .-==================.                
                .-=============-..:---====-.      
     .:-------::::.:===================--:.       
      .---------===============--:.               
                  .-======================:       
               :-===--==========. ..:--===-.      
            :=====:.-==:==-=======.               
         .-====:. .===..==.:===::==-.             
          --:.  .-==-. -==  .===-.:==-.           
               .===:   ===   .====. .-=           
              :==-.   :==-    .-==-.              
              .:.     -==:      .:.               
                      :==                         
`,
  `                                                  
               :--:       .:.                     
              .===-:      -=-.                    
               :===-.    .==-.    .::.            
          .     :-==-.   .==:   .:-===            
        .-==:.   :-==-.  :=-:  :-===-.            
         :-===-:. :-==-. -=-..-====:.             
           .-===-:.:-==:.-=:.-===-:               
             .:-===---==:-==-=-=-.                
                .:-===========-:..::::--==-.      
      .:::::::::....--========-======-:::..       
      .:::::::::-----========--::..               
                  .:--====-------=======--.       
               .:-=-::---==--=-:.  .:::---:.      
            .:-=-:..:--.-=:-=---=-.               
          :===-:. .-=-..==..-=-::-=:.             
          :::.  .:=-:  :=-  .-=-:.:---.           
               .-=-.   -=-   .-==-. .:-           
              :=-:.   .-=:    .:-=:.              
              ...     :==.      ...               
                      .--                         
`,
  `                                                  
               .::.        ..                     
              .::::.      :::.                    
               .::::.     :::.    ....            
                .::::.   .::.   ..::::            
         :::..   .:::..  .::.  .:::::.            
         .:::::.  .:::.  .:: ..::::.              
           ..::::...:::. ::..:::::.               
              .:::::::::.:::::::..                
                ..:::::::::::::.......::::.       
      ..............::::::::::::::::::....        
      ...........::::::::::::::...                
                  ..:::::::::::.::::::::::.       
               ..:::..:::::::::..  .....::.       
            ..:::....::.::.::::::..               
          .::::.  .::...:: .:::..::.              
          ...    .::.  .::  .:::. .::..           
               .:::.   ::.   ..::.   .:           
              .::.    .::.     .::.               
               .      .::.      ..                
                      .:.                         
`,
  `                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
                                                  
`
];
var smallAnimatedArray = [
  `   @   
@  @  @
  @@@  
@  @  @
   @`,
  `   *   
*  *  *
  ***  
*  *  *
   *`,
  `   +   
+  +  +
  +++  
+  +  +
   +`,
  `   /   
/  /  /
  ///  
/  /  /
   /`,
  `   |   
|  |  |
  |||  
|  |  |
   |`,
  `   \\   
\\  \\  \\
  \\\\\\  
\\  \\  \\
   \\`,
  `   -   
-  -  -
  ---  
-  -  -
   -`
];

// src/components/AnimatedClaudeAsterisk.tsx
function AnimatedClaudeAsterisk({
  size = "small",
  cycles,
  color,
  intervalMs
}) {
  const [currentAsciiArtIndex, setCurrentAsciiArtIndex] = React100.useState(0);
  const direction = React100.useRef(1);
  const animateLoopCount = React100.useRef(0);
  const theme = getTheme();
  const animatedArray = size === "large" ? largeAnimatedAray : smallAnimatedArray;
  React100.useEffect(() => {
    const timer = setInterval(
      () => {
        setCurrentAsciiArtIndex((prevIndex) => {
          if (cycles !== void 0 && cycles !== null && animateLoopCount.current >= cycles) {
            return 0;
          }
          if (prevIndex === animatedArray.length - 1) {
            direction.current = -1;
            animateLoopCount.current += 1;
          }
          if (prevIndex === 0) {
            direction.current = 1;
          }
          return prevIndex + direction.current;
        });
      },
      intervalMs || (size === "large" ? 100 : 200)
    );
    return () => clearInterval(timer);
  }, [animatedArray.length, cycles, intervalMs, size]);
  return /* @__PURE__ */ React100.createElement(Text77, { color: color || theme.claude }, animatedArray[currentAsciiArtIndex]);
}

// src/components/StickerRequestForm.tsx
function StickerRequestForm({
  onSubmit,
  onClose
}) {
  const [googleFormURL, setGoogleFormURL] = React101.useState("");
  const { rows } = useTerminalSize();
  const getAsteriskSize = () => {
    if (rows >= 50) {
      return "large";
    } else if (rows >= 35) {
      return "medium";
    } else {
      return "small";
    }
  };
  const generateGoogleFormURL = (data) => {
    const name = encodeURIComponent(data.name || "");
    const email = encodeURIComponent(data.email || "");
    const phone = encodeURIComponent(data.phone || "");
    const address1 = encodeURIComponent(data.address1 || "");
    const address2 = encodeURIComponent(data.address2 || "");
    const city = encodeURIComponent(data.city || "");
    const state2 = encodeURIComponent(data.state || "");
    const country = encodeURIComponent("USA");
    return `https://docs.google.com/forms/d/e/1FAIpQLSfYhWr1a-t4IsvS2FKyEH45HRmHKiPUycvAlFKaD0NugqvfDA/viewform?usp=pp_url&entry.2124017765=${name}&entry.1522143766=${email}&entry.1730584532=${phone}&entry.1700407131=${address1}&entry.109484232=${address2}&entry.1209468849=${city}&entry.222866183=${state2}&entry.1042966503=${country}`;
  };
  const [formState, setFormState] = React101.useState({});
  const [currentField, setCurrentField] = React101.useState("name");
  const [inputValue, setInputValue] = React101.useState("");
  const [cursorOffset, setCursorOffset] = React101.useState(0);
  const [error, setError] = React101.useState(null);
  const [showingSummary, setShowingSummary] = React101.useState(false);
  const [showingNonUsMessage, setShowingNonUsMessage] = React101.useState(false);
  const [selectedYesNo, setSelectedYesNo] = React101.useState("yes");
  const theme = getTheme();
  const fields = [
    { key: "name", label: "Name" },
    { key: "usLocation", label: "Are you in the United States? (y/n)" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone Number" },
    { key: "address1", label: "Address Line 1" },
    { key: "address2", label: "Address Line 2 (optional)" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "zip", label: "ZIP Code" }
  ];
  const goToNextField = (currentKey) => {
    const currentIndex = fields.findIndex((f) => f.key === currentKey);
    const nextIndex = currentIndex + 1;
    if (currentIndex === -1) throw new Error("Invalid field state");
    const nextField = fields[nextIndex];
    if (!nextField) throw new Error("Invalid field state");
    logEvent("sticker_form_field_completed", {
      field_name: currentKey,
      field_index: currentIndex.toString(),
      next_field: nextField.key,
      form_progress: `${nextIndex}/${fields.length}`
    });
    setCurrentField(nextField.key);
    const newValue = formState[nextField.key]?.toString() || "";
    setInputValue(newValue);
    setCursorOffset(newValue.length);
    setError(null);
  };
  useInput19((input, key) => {
    if (key.escape || key.ctrl && (input === "c" || input === "d")) {
      onClose();
      return;
    }
    if (showingNonUsMessage && key.return) {
      onClose();
      return;
    }
    if (currentField === "usLocation" && !showingSummary) {
      if (key.leftArrow || key.rightArrow) {
        setSelectedYesNo((prev) => prev === "yes" ? "no" : "yes");
        return;
      }
      if (key.return) {
        if (selectedYesNo === "yes") {
          const newState = { ...formState, [currentField]: true };
          setFormState(newState);
          goToNextField(currentField);
        } else {
          setShowingNonUsMessage(true);
        }
        return;
      }
      const normalized = input.toLowerCase();
      if (["y", "yes"].includes(normalized)) {
        const newState = { ...formState, [currentField]: true };
        setFormState(newState);
        goToNextField(currentField);
        return;
      }
      if (["n", "no"].includes(normalized)) {
        setShowingNonUsMessage(true);
        return;
      }
    }
    if (!showingSummary) {
      if (key.tab) {
        if (key.shift) {
          const currentIndex2 = fields.findIndex((f) => f.key === currentField);
          if (currentIndex2 === -1) throw new Error("Invalid field state");
          const prevIndex = (currentIndex2 - 1 + fields.length) % fields.length;
          const prevField = fields[prevIndex];
          if (!prevField) throw new Error("Invalid field index");
          setCurrentField(prevField.key);
          const newValue2 = formState[prevField.key]?.toString() || "";
          setInputValue(newValue2);
          setCursorOffset(newValue2.length);
          setError(null);
          return;
        }
        if (currentField !== "address2" && currentField !== "usLocation") {
          const currentValue = inputValue.trim();
          const validationError = validateField(currentField, currentValue);
          if (validationError) {
            setError({
              message: "Please fill out this field before continuing"
            });
            return;
          }
          const newState = { ...formState, [currentField]: currentValue };
          setFormState(newState);
        }
        const currentIndex = fields.findIndex((f) => f.key === currentField);
        if (currentIndex === -1) throw new Error("Invalid field state");
        const nextIndex = (currentIndex + 1) % fields.length;
        const nextField = fields[nextIndex];
        if (!nextField) throw new Error("Invalid field index");
        setCurrentField(nextField.key);
        const newValue = formState[nextField.key]?.toString() || "";
        setInputValue(newValue);
        setCursorOffset(newValue.length);
        setError(null);
        return;
      }
    }
    if (showingSummary) {
      if (key.return) {
        onSubmit(formState);
      }
    }
  });
  const handleSubmit = (value) => {
    if (!value && currentField === "address2") {
      const newState2 = { ...formState, [currentField]: "" };
      setFormState(newState2);
      goToNextField(currentField);
      return;
    }
    const validationError = validateField(currentField, value);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (currentField === "state" && formState.zip) {
      const zipError = validateField("zip", formState.zip);
      if (zipError) {
        setError({
          message: "The existing ZIP code is not valid for this state"
        });
        return;
      }
    }
    const newState = { ...formState, [currentField]: value };
    setFormState(newState);
    setError(null);
    const currentIndex = fields.findIndex((f) => f.key === currentField);
    if (currentIndex === -1) throw new Error("Invalid field state");
    if (currentIndex < fields.length - 1) {
      goToNextField(currentField);
    } else {
      setShowingSummary(true);
    }
  };
  const currentFieldDef = fields.find((f) => f.key === currentField);
  if (!currentFieldDef) throw new Error("Invalid field state");
  if (showingSummary && !googleFormURL) {
    const url2 = generateGoogleFormURL(formState);
    setGoogleFormURL(url2);
    logEvent("sticker_form_summary_reached", {
      fields_completed: Object.keys(formState).length.toString()
    });
    openBrowser(url2).catch((err) => {
      logError(err);
    });
  }
  const classifiedHeaderText = `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551         CLASSIFIED           \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D`;
  const headerText = `You've discovered Claude's top secret sticker distribution operation!`;
  const renderHeader = () => /* @__PURE__ */ React101.createElement(React101.Fragment, null, /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "column", alignItems: "center", justifyContent: "center" }, /* @__PURE__ */ React101.createElement(Text78, null, classifiedHeaderText), /* @__PURE__ */ React101.createElement(Text78, { bold: true, color: theme.claude }, headerText)), !showingSummary && /* @__PURE__ */ React101.createElement(Box72, { justifyContent: "center" }, /* @__PURE__ */ React101.createElement(
    AnimatedClaudeAsterisk,
    {
      size: getAsteriskSize(),
      cycles: getAsteriskSize() === "large" ? 4 : void 0
    }
  )));
  const renderFooter = () => /* @__PURE__ */ React101.createElement(Box72, { marginLeft: 1 }, showingNonUsMessage || showingSummary ? /* @__PURE__ */ React101.createElement(Text78, { color: theme.suggestion, bold: true }, "Press Enter to return to base") : /* @__PURE__ */ React101.createElement(Text78, { color: theme.secondaryText }, currentField === "usLocation" ? /* @__PURE__ */ React101.createElement(React101.Fragment, null, "\u2190/\u2192 arrows to select \xB7 Enter to confirm \xB7 Y/N keys also work \xB7 Esc Esc to abort mission") : /* @__PURE__ */ React101.createElement(React101.Fragment, null, "Enter to continue \xB7 Tab/Shift+Tab to navigate \xB7 Esc to abort mission")));
  const renderContent = () => {
    if (showingSummary) {
      return /* @__PURE__ */ React101.createElement(React101.Fragment, null, /* @__PURE__ */ React101.createElement(Box72, null, /* @__PURE__ */ React101.createElement(Text78, { color: theme.suggestion, bold: true }, "Please review your shipping information:")), /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "column" }, fields.filter((f) => f.key !== "usLocation").map((field) => /* @__PURE__ */ React101.createElement(Box72, { key: field.key, marginLeft: 3 }, /* @__PURE__ */ React101.createElement(Text78, null, /* @__PURE__ */ React101.createElement(Text78, { bold: true, color: theme.text }, field.label, ":"), " ", /* @__PURE__ */ React101.createElement(
        Text78,
        {
          color: !formState[field.key] ? theme.secondaryText : theme.text
        },
        formState[field.key] || "(empty)"
      ))))), /* @__PURE__ */ React101.createElement(Box72, { marginTop: 1, marginBottom: 1, flexDirection: "column" }, /* @__PURE__ */ React101.createElement(Box72, null, /* @__PURE__ */ React101.createElement(Text78, { color: theme.text }, "Submit your sticker request:")), /* @__PURE__ */ React101.createElement(Box72, { marginTop: 1 }, /* @__PURE__ */ React101.createElement(Link4, { url: googleFormURL }, /* @__PURE__ */ React101.createElement(Text78, { color: theme.success, underline: true }, "\u279C Click here to open Google Form"))), /* @__PURE__ */ React101.createElement(Box72, { marginTop: 1 }, /* @__PURE__ */ React101.createElement(Text78, { color: theme.secondaryText, italic: true }, "(You can still edit your info on the form)"))));
    } else if (showingNonUsMessage) {
      return /* @__PURE__ */ React101.createElement(React101.Fragment, null, /* @__PURE__ */ React101.createElement(Box72, { marginY: 1 }, /* @__PURE__ */ React101.createElement(Text78, { color: theme.error, bold: true }, "Mission Not Available")), /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "column", marginY: 1 }, /* @__PURE__ */ React101.createElement(Text78, { color: theme.text }, "We're sorry, but the Claude sticker deployment mission is only available within the United States."), /* @__PURE__ */ React101.createElement(Box72, { marginTop: 1 }, /* @__PURE__ */ React101.createElement(Text78, { color: theme.text }, "Future missions may expand to other territories. Stay tuned for updates."))));
    } else {
      return /* @__PURE__ */ React101.createElement(React101.Fragment, null, /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "column" }, /* @__PURE__ */ React101.createElement(Text78, { color: theme.text }, "Please provide your coordinates for the sticker deployment mission."), /* @__PURE__ */ React101.createElement(Text78, { color: theme.secondaryText }, "Currently only shipping within the United States.")), /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "column" }, /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "row", marginLeft: 2 }, fields.map((f, i) => /* @__PURE__ */ React101.createElement(React101.Fragment, { key: f.key }, /* @__PURE__ */ React101.createElement(
        Text78,
        {
          color: f.key === currentField ? theme.suggestion : theme.secondaryText
        },
        f.key === currentField ? `[${f.label}]` : formState[f.key] ? /* @__PURE__ */ React101.createElement(Text78, { color: theme.secondaryText }, "\u25CF") : "\u25CB"
      ), i < fields.length - 1 && /* @__PURE__ */ React101.createElement(Text78, null, " ")))), /* @__PURE__ */ React101.createElement(Box72, { marginLeft: 2 }, /* @__PURE__ */ React101.createElement(Text78, { color: theme.secondaryText }, "Field ", fields.findIndex((f) => f.key === currentField) + 1, " of", " ", fields.length))), /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "column", marginX: 2 }, currentField === "usLocation" ? (
        // Special Yes/No Buttons for US Location
        /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "row" }, /* @__PURE__ */ React101.createElement(
          Text78,
          {
            color: selectedYesNo === "yes" ? theme.success : theme.secondaryText,
            bold: true
          },
          selectedYesNo === "yes" ? "\u25CF" : "\u25CB",
          " YES"
        ), /* @__PURE__ */ React101.createElement(Text78, null, " "), /* @__PURE__ */ React101.createElement(
          Text78,
          {
            color: selectedYesNo === "no" ? theme.error : theme.secondaryText,
            bold: true
          },
          selectedYesNo === "no" ? "\u25CF" : "\u25CB",
          " NO"
        ))
      ) : (
        // Regular TextInput for other fields
        /* @__PURE__ */ React101.createElement(
          TextInput,
          {
            value: inputValue,
            onChange: setInputValue,
            onSubmit: handleSubmit,
            placeholder: currentFieldDef.label,
            cursorOffset,
            onChangeCursorOffset: setCursorOffset,
            columns: 40
          }
        )
      ), error && /* @__PURE__ */ React101.createElement(Box72, { marginTop: 1 }, /* @__PURE__ */ React101.createElement(Text78, { color: theme.error, bold: true }, "\u2717 ", error.message))));
    }
  };
  return /* @__PURE__ */ React101.createElement(Box72, { flexDirection: "column", paddingLeft: 1 }, /* @__PURE__ */ React101.createElement(
    Box72,
    {
      borderColor: theme.claude,
      borderStyle: "round",
      flexDirection: "column",
      gap: 1,
      padding: 1,
      paddingLeft: 2,
      width: 100
    },
    renderHeader(),
    renderContent()
  ), renderFooter());
}

// src/tools/StickerRequestTool/StickerRequestTool.tsx
init_statsig();
var stickerRequestSchema = z19.object({
  trigger: z19.string()
});
var StickerRequestTool = {
  name: "StickerRequest",
  userFacingName: () => "Stickers",
  description: async () => DESCRIPTION16,
  inputSchema: stickerRequestSchema,
  isEnabled: async () => {
    const enabled = await checkGate("tengu_sticker_easter_egg");
    return enabled;
  },
  isReadOnly: () => false,
  needsPermissions: () => false,
  prompt: async () => PROMPT10,
  async *call(_, context) {
    logEvent("sticker_request_form_opened", {});
    let resolveForm;
    const formComplete = new Promise((resolve16) => {
      resolveForm = (success2) => resolve16(success2);
    });
    context.setToolJSX?.({
      jsx: /* @__PURE__ */ React102.createElement(
        StickerRequestForm,
        {
          onSubmit: (formData) => {
            logEvent("sticker_request_form_completed", {
              has_address: Boolean(formData.address1).toString(),
              has_optional_address: Boolean(formData.address2).toString()
            });
            resolveForm(true);
            context.setToolJSX?.(null);
          },
          onClose: () => {
            logEvent("sticker_request_form_cancelled", {});
            resolveForm(false);
            context.setToolJSX?.(null);
          }
        }
      ),
      shouldHidePromptInput: true
    });
    const success = await formComplete;
    if (!success) {
      context.abortController.abort();
      throw new Error("Sticker request cancelled");
    }
    yield {
      type: "result",
      resultForAssistant: "Sticker request completed! Please tell the user that they will receive stickers in the mail if they have submitted the form!",
      data: { success }
    };
  },
  renderToolUseMessage(_input) {
    return "";
  },
  renderToolUseRejectedMessage: (_input) => /* @__PURE__ */ React102.createElement(Text79, null, "\xA0\xA0\u23BF \xA0", /* @__PURE__ */ React102.createElement(Text79, { color: getTheme().error }, "No (Sticker request cancelled)")),
  renderResultForAssistant: (content) => content
};

// src/tools.ts
import { memoize as memoize18 } from "lodash-es";
var getAllTools = () => {
  return [
    AgentTool,
    BashTool,
    DocETLTool,
    GlobTool,
    GrepTool,
    LotusTool,
    LSTool,
    FileReadTool,
    FileEditTool,
    FileWriteTool,
    NotebookReadTool,
    NotebookEditTool,
    StickerRequestTool,
    ThinkTool,
    // Make all tools available regardless of user type
    MemoryReadTool,
    MemoryWriteTool,
    SelfImproveTool
  ];
};
var getTools = memoize18(
  async (enableArchitect) => {
    const tools = [...getAllTools(), ...await getMCPTools()];
    if (enableArchitect) {
      tools.push(ArchitectTool);
    }
    const isEnabled2 = await Promise.all(tools.map((tool) => tool.isEnabled()));
    return tools.filter((_, i) => isEnabled2[i]);
  }
);
var getReadOnlyTools = memoize18(async () => {
  const tools = getAllTools().filter((tool) => tool.isReadOnly());
  const isEnabled2 = await Promise.all(tools.map((tool) => tool.isEnabled()));
  return tools.filter((_, index) => isEnabled2[index]);
});

// src/entrypoints/cli.tsx
init_config();
init_log();
import { cwd as cwd3 } from "process";

// src/components/TrustDialog.tsx
import React103 from "react";
import { Box as Box73, Text as Text80, useInput as useInput20 } from "ink";
init_config();
import { Select as Select12 } from "@inkjs/ui";
init_statsig();
init_state();
import { homedir as homedir8 } from "os";
function TrustDialog({ onDone }) {
  const theme = getTheme();
  React103.useEffect(() => {
    logEvent("trust_dialog_shown", {});
  }, []);
  function onChange(value) {
    const config3 = getCurrentProjectConfig();
    switch (value) {
      case "yes": {
        const isHomeDir = homedir8() === getCwd();
        logEvent("trust_dialog_accept", {
          isHomeDir: String(isHomeDir)
        });
        if (!isHomeDir) {
          saveCurrentProjectConfig({
            ...config3,
            hasTrustDialogAccepted: true
          });
        }
        onDone();
        break;
      }
      case "no": {
        process.exit(1);
        break;
      }
    }
  }
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  useInput20((_input, key) => {
    if (key.escape) {
      process.exit(0);
      return;
    }
  });
  return /* @__PURE__ */ React103.createElement(React103.Fragment, null, /* @__PURE__ */ React103.createElement(
    Box73,
    {
      flexDirection: "column",
      gap: 1,
      padding: 1,
      borderStyle: "round",
      borderColor: theme.warning
    },
    /* @__PURE__ */ React103.createElement(Text80, { bold: true, color: theme.warning }, "Do you trust the files in this folder?"),
    /* @__PURE__ */ React103.createElement(Text80, { bold: true }, process.cwd()),
    /* @__PURE__ */ React103.createElement(Box73, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React103.createElement(Text80, null, PRODUCT_NAME, " may read files in this folder. Reading untrusted files may lead to ", PRODUCT_NAME, " to behave in an unexpected ways."), /* @__PURE__ */ React103.createElement(Text80, null, "With your permission ", PRODUCT_NAME, " may execute files in this folder. Executing untrusted code is unsafe."), /* @__PURE__ */ React103.createElement(Link, { url: "https://docs.anthropic.com/s/claude-code-security" })),
    /* @__PURE__ */ React103.createElement(
      Select12,
      {
        options: [
          { label: "Yes, proceed", value: "yes" },
          { label: "No, exit", value: "no" }
        ],
        onChange: (value) => onChange(value)
      }
    )
  ), /* @__PURE__ */ React103.createElement(Box73, { marginLeft: 3 }, /* @__PURE__ */ React103.createElement(Text80, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React103.createElement(React103.Fragment, null, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React103.createElement(React103.Fragment, null, "Enter to confirm \xB7 Esc to exit"))));
}

// src/entrypoints/cli.tsx
init_config();
init_model();

// src/screens/LogList.tsx
init_log();
import React104, { useEffect as useEffect22, useState as useState24 } from "react";
init_log();
init_log();
function LogList({ context, type, logNumber }) {
  const [logs, setLogs] = useState24([]);
  const [didSelectLog, setDidSelectLog] = useState24(false);
  useEffect22(() => {
    loadLogList(
      type === "messages" ? CACHE_PATHS.messages() : CACHE_PATHS.errors()
    ).then((logs2) => {
      if (logNumber !== void 0) {
        const log = logs2[logNumber >= 0 ? logNumber : 0];
        if (log) {
          console.log(JSON.stringify(log.messages, null, 2));
          process.exit(0);
        } else {
          console.error("No log found at index", logNumber);
          process.exit(1);
        }
      }
      setLogs(logs2);
    }).catch((error) => {
      logError(error);
      if (logNumber !== void 0) {
        process.exit(1);
      } else {
        context.unmount?.();
      }
    });
  }, [context, type, logNumber]);
  function onSelect(index) {
    const log = logs[index];
    if (!log) {
      return;
    }
    setDidSelectLog(true);
    setTimeout(() => {
      console.log(JSON.stringify(log.messages, null, 2));
      process.exit(0);
    }, 100);
  }
  if (logNumber !== void 0) {
    return null;
  }
  if (didSelectLog) {
    return null;
  }
  return /* @__PURE__ */ React104.createElement(LogSelector, { logs, onSelect });
}

// src/entrypoints/mcp.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { z as z20 } from "zod";
import { zodToJsonSchema as zodToJsonSchema3 } from "zod-to-json-schema";
init_state();
init_model();
init_log();
var state = {
  readFileTimestamps: {}
};
var MCP_COMMANDS = [review_default];
var MCP_TOOLS = [
  AgentTool,
  BashTool,
  FileEditTool,
  FileReadTool,
  GlobTool,
  GrepTool,
  FileWriteTool,
  LSTool
];
async function startMCPServer(cwd4) {
  await setCwd(cwd4);
  const server = new Server(
    {
      name: "claude/tengu",
      version: "0.2.8"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );
  server.setRequestHandler(
    ListToolsRequestSchema,
    async () => {
      const tools = await Promise.all(
        MCP_TOOLS.map(async (tool) => ({
          ...tool,
          description: await tool.description(z20.object({})),
          inputSchema: zodToJsonSchema3(tool.inputSchema)
        }))
      );
      return {
        tools
      };
    }
  );
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request) => {
      const { name, arguments: args } = request.params;
      const tool = MCP_TOOLS.find((_) => _.name === name);
      if (!tool) {
        throw new Error(`Tool ${name} not found`);
      }
      try {
        if (!await tool.isEnabled()) {
          throw new Error(`Tool ${name} is not enabled`);
        }
        const model2 = await getSlowAndCapableModel();
        const validationResult = await tool.validateInput?.(
          args ?? {},
          {
            abortController: new AbortController(),
            options: {
              commands: MCP_COMMANDS,
              tools: MCP_TOOLS,
              slowAndCapableModel: model2,
              forkNumber: 0,
              messageLogName: "unused",
              maxThinkingTokens: 0
            },
            messageId: void 0,
            readFileTimestamps: state.readFileTimestamps
          }
        );
        if (validationResult && !validationResult.result) {
          throw new Error(
            `Tool ${name} input is invalid: ${validationResult.message}`
          );
        }
        const result = tool.call(
          args ?? {},
          {
            abortController: new AbortController(),
            messageId: void 0,
            options: {
              commands: MCP_COMMANDS,
              tools: MCP_TOOLS,
              slowAndCapableModel: await getSlowAndCapableModel(),
              forkNumber: 0,
              messageLogName: "unused",
              maxThinkingTokens: 0
            },
            readFileTimestamps: state.readFileTimestamps
          },
          hasPermissionsToUseTool
        );
        const finalResult = await lastX(result);
        if (finalResult.type !== "result") {
          throw new Error(`Tool ${name} did not return a result`);
        }
        return {
          content: Array.isArray(finalResult) ? finalResult.map((item) => ({
            type: "text",
            text: "text" in item ? item.text : JSON.stringify(item)
          })) : [
            {
              type: "text",
              text: typeof finalResult === "string" ? finalResult : JSON.stringify(finalResult.data)
            }
          ]
        };
      } catch (error) {
        logError(error);
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
  async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
  return await runServer();
}

// src/entrypoints/cli.tsx
init_env();
init_state();
import { omit as omit2 } from "lodash-es";
init_log();

// src/utils/cleanup.ts
init_log();
init_log();
import { promises as fs4 } from "fs";
import { join as join18 } from "path";
var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1e3;
function convertFileNameToDate(filename) {
  const isoStr = filename.split(".")[0].replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/, "T$1:$2:$3.$4Z");
  return new Date(isoStr);
}
async function cleanupOldMessageFiles() {
  const messagePath = CACHE_PATHS.messages();
  const errorPath = CACHE_PATHS.errors();
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);
  const deletedCounts = { messages: 0, errors: 0 };
  for (const path7 of [messagePath, errorPath]) {
    try {
      const files = await fs4.readdir(path7);
      for (const file of files) {
        try {
          const timestamp = convertFileNameToDate(file);
          if (timestamp < thirtyDaysAgo) {
            await fs4.unlink(join18(path7, file));
            if (path7 === messagePath) {
              deletedCounts.messages++;
            } else {
              deletedCounts.errors++;
            }
          }
        } catch (error) {
          logError(
            `Failed to process file ${file}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
        logError(
          `Failed to cleanup directory ${path7}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }
  return deletedCounts;
}
function cleanupOldMessageFilesInBackground() {
  const immediate = setImmediate(cleanupOldMessageFiles);
  immediate.unref();
}

// src/commands/approvedTools.ts
init_config();
var defaultConfigHandler = {
  getCurrentProjectConfig,
  saveCurrentProjectConfig
};
function handleListApprovedTools(cwd4, projectConfigHandler = defaultConfigHandler) {
  const projectConfig = projectConfigHandler.getCurrentProjectConfig();
  return `Allowed tools for ${cwd4}:
${projectConfig.allowedTools.join("\n")}`;
}
function handleRemoveApprovedTool(tool, projectConfigHandler = defaultConfigHandler) {
  const projectConfig = projectConfigHandler.getCurrentProjectConfig();
  const originalToolCount = projectConfig.allowedTools.length;
  const updatedAllowedTools = projectConfig.allowedTools.filter((t) => t !== tool);
  if (originalToolCount !== updatedAllowedTools.length) {
    projectConfig.allowedTools = updatedAllowedTools;
    projectConfigHandler.saveCurrentProjectConfig(projectConfig);
    return {
      success: true,
      message: `Removed ${tool} from the list of approved tools`
    };
  } else {
    return {
      success: false,
      message: `${tool} was not in the list of approved tools`
    };
  }
}

// src/services/mcpServerApproval.tsx
import React107 from "react";
import { render as render5 } from "ink";

// src/components/MCPServerMultiselectDialog.tsx
import React105 from "react";
import { Box as Box74, Text as Text81, useInput as useInput21 } from "ink";
init_config();
import { MultiSelect } from "@inkjs/ui";
import { partition } from "lodash-es";
function MCPServerMultiselectDialog({
  serverNames,
  onDone
}) {
  const theme = getTheme();
  function onSubmit(selectedServers) {
    const config3 = getCurrentProjectConfig();
    if (!config3.approvedMcprcServers) {
      config3.approvedMcprcServers = [];
    }
    if (!config3.rejectedMcprcServers) {
      config3.rejectedMcprcServers = [];
    }
    const [approvedServers, rejectedServers] = partition(
      serverNames,
      (server) => selectedServers.includes(server)
    );
    config3.approvedMcprcServers.push(...approvedServers);
    config3.rejectedMcprcServers.push(...rejectedServers);
    saveCurrentProjectConfig(config3);
    onDone();
  }
  const exitState = useExitOnCtrlCD(() => process.exit());
  useInput21((_input, key) => {
    if (key.escape) {
      const config3 = getCurrentProjectConfig();
      if (!config3.rejectedMcprcServers) {
        config3.rejectedMcprcServers = [];
      }
      for (const server of serverNames) {
        if (!config3.rejectedMcprcServers.includes(server)) {
          config3.rejectedMcprcServers.push(server);
        }
      }
      saveCurrentProjectConfig(config3);
      onDone();
      return;
    }
  });
  return /* @__PURE__ */ React105.createElement(React105.Fragment, null, /* @__PURE__ */ React105.createElement(
    Box74,
    {
      flexDirection: "column",
      gap: 1,
      padding: 1,
      borderStyle: "round",
      borderColor: theme.warning
    },
    /* @__PURE__ */ React105.createElement(Text81, { bold: true, color: theme.warning }, "New MCP Servers Detected"),
    /* @__PURE__ */ React105.createElement(Text81, null, "This project contains a .mcprc file with ", serverNames.length, " MCP servers that require your approval."),
    /* @__PURE__ */ React105.createElement(MCPServerDialogCopy, null),
    /* @__PURE__ */ React105.createElement(Text81, null, "Please select the servers you want to enable:"),
    /* @__PURE__ */ React105.createElement(
      MultiSelect,
      {
        options: serverNames.map((server) => ({
          label: server,
          value: server
        })),
        defaultValue: serverNames,
        onSubmit
      }
    )
  ), /* @__PURE__ */ React105.createElement(Box74, { marginLeft: 3 }, /* @__PURE__ */ React105.createElement(Text81, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React105.createElement(React105.Fragment, null, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React105.createElement(React105.Fragment, null, "Space to select \xB7 Enter to confirm \xB7 Esc to reject all"))));
}

// src/components/MCPServerApprovalDialog.tsx
import React106 from "react";
import { Box as Box75, Text as Text82, useInput as useInput22 } from "ink";
init_config();
import { Select as Select13 } from "@inkjs/ui";
function MCPServerApprovalDialog({
  serverName,
  onDone
}) {
  const theme = getTheme();
  function onChange(value) {
    const config3 = getCurrentProjectConfig();
    switch (value) {
      case "yes": {
        if (!config3.approvedMcprcServers) {
          config3.approvedMcprcServers = [];
        }
        if (!config3.approvedMcprcServers.includes(serverName)) {
          config3.approvedMcprcServers.push(serverName);
        }
        saveCurrentProjectConfig(config3);
        onDone();
        break;
      }
      case "no": {
        if (!config3.rejectedMcprcServers) {
          config3.rejectedMcprcServers = [];
        }
        if (!config3.rejectedMcprcServers.includes(serverName)) {
          config3.rejectedMcprcServers.push(serverName);
        }
        saveCurrentProjectConfig(config3);
        onDone();
        break;
      }
    }
  }
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  useInput22((_input, key) => {
    if (key.escape) {
      onDone();
      return;
    }
  });
  return /* @__PURE__ */ React106.createElement(React106.Fragment, null, /* @__PURE__ */ React106.createElement(
    Box75,
    {
      flexDirection: "column",
      gap: 1,
      padding: 1,
      borderStyle: "round",
      borderColor: theme.warning
    },
    /* @__PURE__ */ React106.createElement(Text82, { bold: true, color: theme.warning }, "New MCP Server Detected"),
    /* @__PURE__ */ React106.createElement(Text82, null, "This project contains a .mcprc file with an MCP server that requires your approval:"),
    /* @__PURE__ */ React106.createElement(Text82, { bold: true }, serverName),
    /* @__PURE__ */ React106.createElement(MCPServerDialogCopy, null),
    /* @__PURE__ */ React106.createElement(Text82, null, "Do you want to approve this MCP server?"),
    /* @__PURE__ */ React106.createElement(
      Select13,
      {
        options: [
          { label: "Yes, approve this server", value: "yes" },
          { label: "No, reject this server", value: "no" }
        ],
        onChange: (value) => onChange(value)
      }
    )
  ), /* @__PURE__ */ React106.createElement(Box75, { marginLeft: 3 }, /* @__PURE__ */ React106.createElement(Text82, { dimColor: true }, exitState.pending ? /* @__PURE__ */ React106.createElement(React106.Fragment, null, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React106.createElement(React106.Fragment, null, "Enter to confirm \xB7 Esc to reject"))));
}

// src/services/mcpServerApproval.tsx
init_config();
async function handleMcprcServerApprovals() {
  const mcprcServers = getMcprcConfig();
  const pendingServers = Object.keys(mcprcServers).filter(
    (serverName) => getMcprcServerStatus(serverName) === "pending"
  );
  if (pendingServers.length === 0) {
    return;
  }
  await new Promise((resolve16) => {
    const clearScreenAndResolve = () => {
      process.stdout.write("\x1B[2J\x1B[3J\x1B[H", () => {
        resolve16();
      });
    };
    if (pendingServers.length === 1 && pendingServers[0] !== void 0) {
      const result = render5(
        /* @__PURE__ */ React107.createElement(
          MCPServerApprovalDialog,
          {
            serverName: pendingServers[0],
            onDone: () => {
              result.unmount?.();
              clearScreenAndResolve();
            }
          }
        ),
        { exitOnCtrlC: false }
      );
    } else {
      const result = render5(
        /* @__PURE__ */ React107.createElement(
          MCPServerMultiselectDialog,
          {
            serverNames: pendingServers,
            onDone: () => {
              result.unmount?.();
              clearScreenAndResolve();
            }
          }
        ),
        { exitOnCtrlC: false }
      );
    }
  });
}

// src/entrypoints/cli.tsx
init_statsig();
import { cursorShow } from "ansi-escapes";
init_log();
init_PersistentShell();
init_betas();

// src/components/InvalidConfigDialog.tsx
import React108 from "react";
import { Box as Box76, Newline as Newline3, Text as Text83, useInput as useInput23 } from "ink";
import { Select as Select14 } from "@inkjs/ui";
import { render as render6 } from "ink";
import { writeFileSync as writeFileSync12 } from "fs";
function InvalidConfigDialog({
  filePath,
  errorDescription,
  onExit,
  onReset
}) {
  const theme = getTheme();
  useInput23((_, key) => {
    if (key.escape) {
      onExit();
    }
  });
  const exitState = useExitOnCtrlCD(() => process.exit(0));
  const handleSelect = (value) => {
    if (value === "exit") {
      onExit();
    } else {
      onReset();
    }
  };
  return /* @__PURE__ */ React108.createElement(React108.Fragment, null, /* @__PURE__ */ React108.createElement(
    Box76,
    {
      flexDirection: "column",
      borderColor: theme.error,
      borderStyle: "round",
      padding: 1,
      width: 70,
      gap: 1
    },
    /* @__PURE__ */ React108.createElement(Text83, { bold: true }, "Configuration Error"),
    /* @__PURE__ */ React108.createElement(Box76, { flexDirection: "column", gap: 1 }, /* @__PURE__ */ React108.createElement(Text83, null, "The configuration file at ", /* @__PURE__ */ React108.createElement(Text83, { bold: true }, filePath), " contains invalid JSON."), /* @__PURE__ */ React108.createElement(Text83, null, errorDescription)),
    /* @__PURE__ */ React108.createElement(Box76, { flexDirection: "column" }, /* @__PURE__ */ React108.createElement(Text83, { bold: true }, "Choose an option:"), /* @__PURE__ */ React108.createElement(
      Select14,
      {
        options: [
          { label: "Exit and fix manually", value: "exit" },
          { label: "Reset with default configuration", value: "reset" }
        ],
        onChange: handleSelect
      }
    ))
  ), exitState.pending ? /* @__PURE__ */ React108.createElement(Text83, { dimColor: true }, "Press ", exitState.keyName, " again to exit") : /* @__PURE__ */ React108.createElement(Newline3, null));
}
function showInvalidConfigDialog({
  error
}) {
  return new Promise((resolve16) => {
    render6(
      /* @__PURE__ */ React108.createElement(
        InvalidConfigDialog,
        {
          filePath: error.filePath,
          errorDescription: error.message,
          onExit: () => {
            resolve16();
            process.exit(1);
          },
          onReset: () => {
            writeFileSync12(
              error.filePath,
              JSON.stringify(error.defaultConfig, null, 2)
            );
            resolve16();
            process.exit(0);
          }
        }
      ),
      { exitOnCtrlC: false }
    );
  });
}

// src/entrypoints/cli.tsx
init_errors();
initSentry();
Object.keys(dontcare);
function completeOnboarding() {
  const config3 = getGlobalConfig();
  saveGlobalConfig({
    ...config3,
    hasCompletedOnboarding: true,
    lastOnboardingVersion: "0.2.8"
  });
}
async function showSetupScreens(dangerouslySkipPermissions, print) {
  if (false) {
    return;
  }
  const config3 = getGlobalConfig();
  if (!config3.theme || !config3.hasCompletedOnboarding) {
    await clearTerminal();
    await new Promise((resolve16) => {
      render7(
        /* @__PURE__ */ React109.createElement(
          Onboarding,
          {
            onDone: async () => {
              completeOnboarding();
              await clearTerminal();
              resolve16();
            }
          }
        ),
        {
          exitOnCtrlC: false
        }
      );
    });
  }
  if (process.env.ANTHROPIC_API_KEY && process.env.USER_TYPE === "ant") {
    const customApiKeyTruncated = normalizeApiKeyForConfig(
      process.env.ANTHROPIC_API_KEY
    );
    const keyStatus = getCustomApiKeyStatus(customApiKeyTruncated);
    if (keyStatus === "new") {
      await new Promise((resolve16) => {
        render7(
          /* @__PURE__ */ React109.createElement(
            ApproveApiKey,
            {
              customApiKeyTruncated,
              onDone: async () => {
                await clearTerminal();
                resolve16();
              }
            }
          ),
          {
            exitOnCtrlC: false
          }
        );
      });
    }
  }
  if (!print && !dangerouslySkipPermissions) {
    if (!checkHasTrustDialogAccepted()) {
      await new Promise((resolve16) => {
        const onDone = () => {
          grantReadPermissionForOriginalDir();
          resolve16();
        };
        render7(/* @__PURE__ */ React109.createElement(TrustDialog, { onDone }), {
          exitOnCtrlC: false
        });
      });
    }
    if (process.env.USER_TYPE === "ant") {
      await handleMcprcServerApprovals();
    }
  }
}
function logStartup() {
  const config3 = getGlobalConfig();
  saveGlobalConfig({
    ...config3,
    numStartups: (config3.numStartups ?? 0) + 1
  });
}
async function setup(cwd4, dangerouslySkipPermissions) {
  setCwd(cwd4);
  grantReadPermissionForOriginalDir();
  if (dangerouslySkipPermissions) {
    if (process.platform !== "win32" && typeof process.getuid === "function" && process.getuid() === 0) {
      console.error(
        `--dangerously-skip-permissions cannot be used with root/sudo privileges for security reasons`
      );
      process.exit(1);
    }
    const [isDocker, hasInternet] = await Promise.all([
      env2.getIsDocker(),
      env2.hasInternetAccess()
    ]);
    if (!isDocker || hasInternet) {
      console.error(
        `--dangerously-skip-permissions can only be used in Docker containers with no internet access but got Docker: ${isDocker} and hasInternet: ${hasInternet}`
      );
      process.exit(1);
    }
  }
  if (false) {
    return;
  }
  cleanupOldMessageFilesInBackground();
  getExampleCommands();
  getContext();
  initializeStatsig();
  const globalConfig = getGlobalConfig();
  if (globalConfig.iterm2KeyBindingInstalled === true && globalConfig.shiftEnterKeyBindingInstalled !== true) {
    const updatedConfig = {
      ...globalConfig,
      shiftEnterKeyBindingInstalled: true
    };
    delete updatedConfig.iterm2KeyBindingInstalled;
    saveGlobalConfig(updatedConfig);
  }
  const projectConfig = getCurrentProjectConfig();
  if (projectConfig.lastCost !== void 0 && projectConfig.lastDuration !== void 0) {
    logEvent("tengu_exit", {
      last_session_cost: String(projectConfig.lastCost),
      last_session_api_duration: String(projectConfig.lastAPIDuration),
      last_session_duration: String(projectConfig.lastDuration),
      last_session_id: projectConfig.lastSessionId
    });
    saveCurrentProjectConfig({
      ...projectConfig,
      lastCost: void 0,
      lastAPIDuration: void 0,
      lastDuration: void 0,
      lastSessionId: void 0
    });
  }
  const autoUpdaterStatus = globalConfig.autoUpdaterStatus ?? "not_configured";
  if (autoUpdaterStatus === "not_configured") {
    logEvent("tengu_setup_auto_updater_not_configured", {});
    await new Promise((resolve16) => {
      render7(/* @__PURE__ */ React109.createElement(Doctor, { onDone: () => resolve16() }));
    });
  }
}
async function main() {
  try {
    enableConfigs();
  } catch (error) {
    if (error instanceof ConfigParseError) {
      await showInvalidConfigDialog({ error });
      return;
    }
  }
  let inputPrompt = "";
  let renderContext = {
    exitOnCtrlC: false,
    onFlicker() {
      logEvent("tengu_flicker", {});
    }
  };
  if (!process.stdin.isTTY && !process.env.CI && // Input hijacking breaks MCP.
  !process.argv.includes("mcp")) {
    inputPrompt = await stdin();
    if (process.platform !== "win32") {
      try {
        const ttyFd = openSync2("/dev/tty", "r");
        renderContext = { ...renderContext, stdin: new ReadStream(ttyFd) };
      } catch (err) {
        logError(`Could not open /dev/tty: ${err}`);
      }
    }
  }
  await parseArgs(inputPrompt, renderContext);
}
async function parseArgs(stdinContent, renderContext) {
  const program = new Command2();
  const renderContextWithExitOnCtrlC = {
    ...renderContext,
    exitOnCtrlC: true
  };
  const commands = await getCommands();
  const commandList = commands.filter((cmd) => !cmd.isHidden).map((cmd) => `/${cmd.name} - ${cmd.description}`).join("\n");
  program.name("claude").description(
    `${PRODUCT_NAME} - starts an interactive session by default, use -p/--print for non-interactive output

Slash commands available during an interactive session:
${commandList}`
  ).argument("[prompt]", "Your prompt", String).option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).option("-d, --debug", "Enable debug mode", () => true).option(
    "--verbose",
    "Override verbose mode setting from config",
    () => true
  ).option("--enable-architect", "Enable the Architect tool", () => true).option(
    "-p, --print",
    "Print response and exit (useful for pipes)",
    () => true
  ).option(
    "--dangerously-skip-permissions",
    "Skip all permission checks. Only works in Docker containers with no internet access. Will crash otherwise.",
    () => true
  ).action(
    async (prompt, {
      cwd: cwd4,
      debug: debug2,
      verbose,
      enableArchitect,
      print,
      dangerouslySkipPermissions
    }) => {
      await showSetupScreens(dangerouslySkipPermissions, print);
      logEvent("tengu_init", {
        entrypoint: "claude",
        hasInitialPrompt: Boolean(prompt).toString(),
        hasStdin: Boolean(stdinContent).toString(),
        enableArchitect: enableArchitect?.toString() ?? "false",
        verbose: verbose?.toString() ?? "false",
        debug: debug2?.toString() ?? "false",
        print: print?.toString() ?? "false"
      });
      await setup(cwd4, dangerouslySkipPermissions);
      assertMinVersion();
      const [tools, mcpClients] = await Promise.all([
        getTools(
          enableArchitect ?? getCurrentProjectConfig().enableArchitectTool
        ),
        getClients()
      ]);
      logStartup();
      const inputPrompt = [prompt, stdinContent].filter(Boolean).join("\n");
      if (print) {
        if (!inputPrompt) {
          console.error(
            "Error: Input must be provided either through stdin or as a prompt argument when using --print"
          );
          process.exit(1);
        }
        addToHistory(inputPrompt);
        const { resultText: response } = await ask({
          commands,
          hasPermissionsToUseTool,
          messageLogName: dateToFilename(/* @__PURE__ */ new Date()),
          prompt: inputPrompt,
          cwd: cwd4,
          tools,
          dangerouslySkipPermissions
        });
        console.log(response);
        process.exit(0);
      } else {
        const isDefaultModel = await isDefaultSlowAndCapableModel();
        render7(
          /* @__PURE__ */ React109.createElement(
            REPL,
            {
              commands,
              debug: debug2,
              initialPrompt: inputPrompt,
              messageLogName: dateToFilename(/* @__PURE__ */ new Date()),
              shouldShowPromptInput: true,
              verbose,
              tools,
              dangerouslySkipPermissions,
              mcpClients,
              isDefaultModel
            }
          ),
          renderContext
        );
      }
    }
  ).version("0.2.8", "-v, --version");
  if (process.env.USER_TYPE === "ant") {
    program.option("--melon", "Enable melon mode").hook("preAction", async () => {
      if (program.opts().melon) {
        const { runMelonWrapper: runMelonWrapper2 } = await Promise.resolve().then(() => (init_melonWrapper(), melonWrapper_exports));
        const melonArgs = process.argv.slice(
          process.argv.indexOf("--melon") + 1
        );
        const exitCode = runMelonWrapper2(melonArgs);
        process.exit(exitCode);
      }
    });
  }
  const config3 = program.command("config").description("Manage configuration (eg. claude config set -g theme dark)");
  config3.command("get <key>").description("Get a config value").option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).option("-g, --global", "Use global config").action(async (key, { cwd: cwd4, global: global2 }) => {
    await setup(cwd4, false);
    console.log(getConfigForCLI(key, global2 ?? false));
    process.exit(0);
  });
  config3.command("set <key> <value>").description("Set a config value").option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).option("-g, --global", "Use global config").action(async (key, value, { cwd: cwd4, global: global2 }) => {
    await setup(cwd4, false);
    setConfigForCLI(key, value, global2 ?? false);
    console.log(`Set ${key} to ${value}`);
    process.exit(0);
  });
  config3.command("remove <key>").description("Remove a config value").option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).option("-g, --global", "Use global config").action(async (key, { cwd: cwd4, global: global2 }) => {
    await setup(cwd4, false);
    deleteConfigForCLI(key, global2 ?? false);
    console.log(`Removed ${key}`);
    process.exit(0);
  });
  config3.command("list").description("List all config values").option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).option("-g, --global", "Use global config", false).action(async ({ cwd: cwd4, global: global2 }) => {
    await setup(cwd4, false);
    console.log(
      JSON.stringify(listConfigForCLI(global2 ?? false), null, 2)
    );
    process.exit(0);
  });
  const allowedTools = program.command("approved-tools").description("Manage approved tools");
  allowedTools.command("list").description("List all approved tools").action(async () => {
    const result = handleListApprovedTools(getCwd());
    console.log(result);
    process.exit(0);
  });
  allowedTools.command("remove <tool>").description("Remove a tool from the list of approved tools").action(async (tool) => {
    const result = handleRemoveApprovedTool(tool);
    logEvent("tengu_approved_tool_remove", {
      tool,
      success: String(result.success)
    });
    console.log(result.message);
    process.exit(result.success ? 0 : 1);
  });
  const mcp = program.command("mcp").description("Configure and manage MCP servers");
  mcp.command("serve").description(`Start the ${PRODUCT_NAME} MCP server`).action(async () => {
    const providedCwd = program.opts().cwd ?? cwd3();
    logEvent("tengu_mcp_start", { providedCwd });
    if (!existsSync25(providedCwd)) {
      console.error(`Error: Directory ${providedCwd} does not exist`);
      process.exit(1);
    }
    try {
      await setup(providedCwd, false);
      await startMCPServer(providedCwd);
    } catch (error) {
      console.error("Error: Failed to start MCP server:", error);
      process.exit(1);
    }
  });
  if (process.env.USER_TYPE === "ant") {
    mcp.command("add-sse <name> <url>").description("Add an SSE server").option(
      "-s, --scope <scope>",
      "Configuration scope (project or global)",
      "project"
    ).action(async (name, url2, options) => {
      try {
        const scope = ensureConfigScope(options.scope);
        logEvent("tengu_mcp_add", { name, type: "sse", scope });
        addMcpServer(name, { type: "sse", url: url2 }, scope);
        console.log(
          `Added SSE MCP server ${name} with URL ${url2} to ${scope} config`
        );
        process.exit(0);
      } catch (error) {
        console.error(error.message);
        process.exit(1);
      }
    });
  }
  mcp.command("add <name> <command> [args...]").description("Add a stdio server").option(
    "-s, --scope <scope>",
    "Configuration scope (project or global)",
    "project"
  ).option(
    "-e, --env <env...>",
    "Set environment variables (e.g. -e KEY=value)"
  ).action(async (name, command3, args, options) => {
    try {
      const scope = ensureConfigScope(options.scope);
      logEvent("tengu_mcp_add", { name, type: "stdio", scope });
      const env3 = parseEnvVars(options.env);
      addMcpServer(
        name,
        { type: "stdio", command: command3, args: args || [], env: env3 },
        scope
      );
      console.log(
        `Added stdio MCP server ${name} with command: ${command3} ${(args || []).join(" ")} to ${scope} config`
      );
      process.exit(0);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });
  mcp.command("remove <name>").description("Remove an MCP server").option(
    "-s, --scope <scope>",
    "Configuration scope (project, global, or mcprc)",
    "project"
  ).action(async (name, options) => {
    try {
      const scope = ensureConfigScope(options.scope);
      logEvent("tengu_mcp_delete", { name, scope });
      removeMcpServer(name, scope);
      console.log(`Removed MCP server ${name} from ${scope} config`);
      process.exit(0);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  });
  mcp.command("list").description("List configured MCP servers").action(() => {
    logEvent("tengu_mcp_list", {});
    const servers = listMCPServers();
    if (Object.keys(servers).length === 0) {
      console.log(
        "No MCP servers configured. Use `claude mcp add` to add a server."
      );
    } else {
      for (const [name, server] of Object.entries(servers)) {
        if (server.type === "sse") {
          console.log(`${name}: ${server.url} (SSE)`);
        } else {
          console.log(`${name}: ${server.command} ${server.args.join(" ")}`);
        }
      }
    }
    process.exit(0);
  });
  mcp.command("get <name>").description("Get details about an MCP server").action((name) => {
    logEvent("tengu_mcp_get", { name });
    const server = getMcpServer(name);
    if (!server) {
      console.error(`No MCP server found with name: ${name}`);
      process.exit(1);
    }
    console.log(`${name}:`);
    console.log(`  Scope: ${server.scope}`);
    if (server.type === "sse") {
      console.log(`  Type: sse`);
      console.log(`  URL: ${server.url}`);
    } else {
      console.log(`  Type: stdio`);
      console.log(`  Command: ${server.command}`);
      console.log(`  Args: ${server.args.join(" ")}`);
      if (server.env) {
        console.log("  Environment:");
        for (const [key, value] of Object.entries(server.env)) {
          console.log(`    ${key}=${value}`);
        }
      }
    }
    process.exit(0);
  });
  if (process.env.USER_TYPE === "ant") {
    mcp.command("reset-mcprc-choices").description(
      "Reset all approved and rejected .mcprc servers for this project"
    ).action(() => {
      logEvent("tengu_mcp_reset_mcprc_choices", {});
      const config4 = getCurrentProjectConfig();
      saveCurrentProjectConfig({
        ...config4,
        approvedMcprcServers: [],
        rejectedMcprcServers: []
      });
      console.log(
        "All .mcprc server approvals and rejections have been reset."
      );
      console.log(
        "You will be prompted for approval next time you start Claude Code."
      );
      process.exit(0);
    });
  }
  program.command("doctor").description("Check the health of your Claude Code auto-updater").action(async () => {
    logEvent("tengu_doctor_command", {});
    await new Promise((resolve16) => {
      render7(/* @__PURE__ */ React109.createElement(Doctor, { onDone: () => resolve16(), doctorMode: true }));
    });
    process.exit(0);
  });
  if (process.env.USER_TYPE === "ant") {
    program.command("update").description("Check for updates and install if available").action(async () => {
      const useExternalUpdater = await checkGate(GATE_USE_EXTERNAL_UPDATER);
      if (useExternalUpdater) {
        console.log("This version of Claude Code is no longer supported.");
        process.exit(0);
      }
      logEvent("tengu_update_check", {});
      console.log(`Current version: ${"0.2.8"}`);
      console.log("Checking for updates...");
      const latestVersion = await getLatestVersion();
      if (!latestVersion) {
        console.error("Failed to check for updates");
        process.exit(1);
      }
      if (latestVersion === "0.2.8") {
        console.log(`${PRODUCT_NAME} is up to date`);
        process.exit(0);
      }
      console.log(`New version available: ${latestVersion}`);
      console.log("Installing update...");
      const status = await installGlobalPackage();
      switch (status) {
        case "success":
          console.log(`Successfully updated to version ${latestVersion}`);
          break;
        case "no_permissions":
          console.error("Error: Insufficient permissions to install update");
          console.error("Try running with sudo or fix npm permissions");
          process.exit(1);
          break;
        case "install_failed":
          console.error("Error: Failed to install update");
          process.exit(1);
          break;
        case "in_progress":
          console.error(
            "Error: Another instance is currently performing an update"
          );
          console.error("Please wait and try again later");
          process.exit(1);
          break;
      }
      process.exit(0);
    });
    program.command("log").description("Manage conversation logs.").argument(
      "[number]",
      "A number (0, 1, 2, etc.) to display a specific log",
      parseInt
    ).option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).action(async (number, { cwd: cwd4 }) => {
      await setup(cwd4, false);
      logEvent("tengu_view_logs", { number: number?.toString() ?? "" });
      const context2 = {};
      const { unmount } = render7(
        /* @__PURE__ */ React109.createElement(LogList, { context: context2, type: "messages", logNumber: number }),
        renderContextWithExitOnCtrlC
      );
      context2.unmount = unmount;
    });
    program.command("resume").description(
      "Resume a previous conversation. Optionally provide a number (0, 1, 2, etc.) or file path to resume a specific conversation."
    ).argument(
      "[identifier]",
      "A number (0, 1, 2, etc.) or file path to resume a specific conversation"
    ).option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).option(
      "--enable-architect",
      "Enable the Architect tool",
      () => true
    ).option("-v, --verbose", "Do not truncate message output", () => true).option(
      "--dangerously-skip-permissions",
      "Skip all permission checks. Only works in Docker containers with no internet access. Will crash otherwise.",
      () => true
    ).action(
      async (identifier, { cwd: cwd4, enableArchitect, dangerouslySkipPermissions, verbose }) => {
        await setup(cwd4, dangerouslySkipPermissions);
        assertMinVersion();
        const [tools, commands2, logs, mcpClients] = await Promise.all([
          getTools(
            enableArchitect ?? getCurrentProjectConfig().enableArchitectTool
          ),
          getCommands(),
          loadLogList(CACHE_PATHS.messages()),
          getClients()
        ]);
        logStartup();
        if (identifier !== void 0) {
          const number = Math.abs(parseInt(identifier));
          const isNumber = !isNaN(number);
          let messages, date, forkNumber;
          try {
            if (isNumber) {
              logEvent("tengu_resume", { number: number.toString() });
              const log = logs[number];
              if (!log) {
                console.error("No conversation found at index", number);
                process.exit(1);
              }
              messages = await loadMessagesFromLog(log.fullPath, tools);
              ({ date, forkNumber } = log);
            } else {
              logEvent("tengu_resume", { filePath: identifier });
              if (!existsSync25(identifier)) {
                console.error("File does not exist:", identifier);
                process.exit(1);
              }
              messages = await loadMessagesFromLog(identifier, tools);
              const pathSegments = identifier.split("/");
              const filename = pathSegments[pathSegments.length - 1] ?? "unknown";
              ({ date, forkNumber } = parseLogFilename(filename));
            }
            const fork = getNextAvailableLogForkNumber(
              date,
              forkNumber ?? 1,
              0
            );
            const isDefaultModel = await isDefaultSlowAndCapableModel();
            render7(
              /* @__PURE__ */ React109.createElement(
                REPL,
                {
                  initialPrompt: "",
                  messageLogName: date,
                  initialForkNumber: fork,
                  shouldShowPromptInput: true,
                  verbose,
                  commands: commands2,
                  tools,
                  initialMessages: messages,
                  mcpClients,
                  isDefaultModel
                }
              ),
              { exitOnCtrlC: false }
            );
          } catch (error) {
            logError(`Failed to load conversation: ${error}`);
            process.exit(1);
          }
        } else {
          const context2 = {};
          const { unmount } = render7(
            /* @__PURE__ */ React109.createElement(
              ResumeConversation,
              {
                context: context2,
                commands: commands2,
                logs,
                tools,
                verbose
              }
            ),
            renderContextWithExitOnCtrlC
          );
          context2.unmount = unmount;
        }
      }
    );
    program.command("error").description(
      "View error logs. Optionally provide a number (0, -1, -2, etc.) to display a specific log."
    ).argument(
      "[number]",
      "A number (0, 1, 2, etc.) to display a specific log",
      parseInt
    ).option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).action(async (number, { cwd: cwd4 }) => {
      await setup(cwd4, false);
      logEvent("tengu_view_errors", { number: number?.toString() ?? "" });
      const context2 = {};
      const { unmount } = render7(
        /* @__PURE__ */ React109.createElement(LogList, { context: context2, type: "errors", logNumber: number }),
        renderContextWithExitOnCtrlC
      );
      context2.unmount = unmount;
    });
    const context = program.command("context").description(
      "Set static context (eg. claude context add-file ./src/*.py)"
    );
    context.command("get <key>").option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).description("Get a value from context").action(async (key, { cwd: cwd4 }) => {
      await setup(cwd4, false);
      logEvent("tengu_context_get", { key });
      const context2 = omit2(
        await getContext(),
        "codeStyle",
        "directoryStructure"
      );
      console.log(context2[key]);
      process.exit(0);
    });
    context.command("set <key> <value>").description("Set a value in context").option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).action(async (key, value, { cwd: cwd4 }) => {
      await setup(cwd4, false);
      logEvent("tengu_context_set", { key });
      setContext(key, value);
      console.log(`Set context.${key} to "${value}"`);
      process.exit(0);
    });
    context.command("list").description("List all context values").option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).action(async ({ cwd: cwd4 }) => {
      await setup(cwd4, false);
      logEvent("tengu_context_list", {});
      const context2 = omit2(
        await getContext(),
        "codeStyle",
        "directoryStructure",
        "gitStatus"
      );
      console.log(JSON.stringify(context2, null, 2));
      process.exit(0);
    });
    context.command("remove <key>").description("Remove a value from context").option("-c, --cwd <cwd>", "The current working directory", String, cwd3()).action(async (key, { cwd: cwd4 }) => {
      await setup(cwd4, false);
      logEvent("tengu_context_delete", { key });
      removeContext(key);
      console.log(`Removed context.${key}`);
      process.exit(0);
    });
  }
  await program.parseAsync(process.argv);
  return program;
}
async function stdin() {
  if (process.stdin.isTTY) {
    return "";
  }
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}
process.on("exit", () => {
  resetCursor();
  PersistentShell.getInstance().close();
});
process.on("SIGINT", () => {
  process.exit(0);
});
function resetCursor() {
  const terminal = process.stderr.isTTY ? process.stderr : process.stdout.isTTY ? process.stdout : void 0;
  terminal?.write(`\x1B[?25h${cursorShow}`);
}
main();
export {
  completeOnboarding
};
//# sourceMappingURL=cli.mjs.map