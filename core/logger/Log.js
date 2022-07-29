const format = require('util').format;
const logLevel = require('./logLevel');
const logType = require('./logType');
const ConsoleLog = require('./ConsoleLog');

const CLF_MONTH = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const Log = ((log) => {
    this.log = log;
});

const space = "   ";
const loglevel = logLevel.info;
const formatting = true;
const stackTrace = true;

Log.writeLog = ((p1, p2, p3, p4) => {
    if (typeof p4 != "undefined") { writeLog4(p1, p2, p3, p4); }
    else if (typeof p3 != "undefined") { writeLog3(p1, p2, p3); }
    else { writeLog2(p1, p2); }
});

const writeLog3 = ((message, loginfo, args) => {
    if (typeof loginfo == "string")
        this.writeLog(message, loginfo, logLevel.info, args);
    else if (typeof loginfo == "number")
        this.writeLog(message, logType.info, loginfo, args);
});

const writeLog2 = ((message, args) => {
    writeLog4(message, logType.info, logLevel.info, args);
});

Log.writeWarning = ((message, args) => {
    writeLog4(message, logType.warning, logLevel.warning, args);
});

Log.writeError = ((message, args) => {
    writeLog4(message, logType.error, logLevel.error, args);
});

const writeLog4 = ((message, logtype, loglevel, args) => {
    if (this.loglevel > loglevel) return;

    let preparedmessage = "";
    let caller = null;

    if (stackTrace && loglevel == logLevel.error) {

        let error = new Error();
        error.stackTraceLimit = 7;

        let stacktrace = error.stack;
        stacktrace = stacktrace.toString().split("\n");

        let depth = 1;

        while (caller == null || caller.includes('write')) {
            depth++;
            if (depth > 10) {
                caller = null;
                break;
            }

            caller = stacktrace[depth].toString().trimLeft().replace("at", "").split(" ", 2)[1];
        }

    }

    if (formatting)
        preparedmessage = Log.formatLog(message, caller, logtype, args);
    else
        preparedmessage = (message, args);

    ConsoleLog.WriteLog(preparedmessage);
});

Log.stringFormat = ((fmt, ...args) => {

    const string = fmt.toString();

    if (!string.match(/^(?:(?:(?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{[0-9]+\}))+$/)) {
        throw new Error('invalid format string.');
    }

    if (typeof args[0] === "object")
        args = args[0];

    return string.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([0-9]+)\})/g, (m, str, index) => {
        if (str) {
            return str.replace(/(?:{{)|(?:}})/g, m => m[0]);
        } else {
            if (index >= args.length) {
                throw new Error('argument index is out of range in format');
            }

            return args[index];
        }
    });
});

Log.formatLog = ((message, caller, type, args) => {
    let current_time = new Date();
    let formattedTime = current_time.getFullYear() + "/" + current_time.getMonth() + "/" + current_time.getDate()
        + " " + ("0"+current_time.getHours()).slice(-2) + ":" + ("0"+current_time.getMinutes()).slice(-2) + ":" + ("0"+current_time.getSeconds()).slice(-2) + ":" + ("0"+current_time.getMilliseconds()).slice(-2);

    let formattedType = "[ " + Log.stringPadding(type, 6) + " ]";
    let formattedMessage = "";

    if (typeof args === "undefined")
        args = "";

    formattedType = Log.stringPadding(formattedType, formattedType.length + 2);
    formattedMessage = Log.stringFormat(message, args);

    if (caller !== null) {
        let formattedCaller = "[" + Log.stringPadding(caller, 25) + "]";
        formattedCaller = Log.stringPadding(formattedCaller, formattedCaller.length + 2);

        return "[" + formattedTime + "]" + space + formattedType + space + formattedCaller + space + formattedMessage;
    } else
        return "[" + formattedTime + "]" + space + formattedType + space + formattedMessage;
});

Log.stringPadding = ((string, length) => {
    return string;

    if (typeof string != "string") return;

    let paddedString = "";
    let spacing = Math.ceil((length - string.length) / 2);


    if (string.length > length) {
        let shorten = "";


        for (let i = 0; i < length - 3; i++)
            shorten += string[i];

        string = shorten += "...";

        return string;
    }

    for (let i = 0; i < length; i++) {
        if (i < spacing || i >= spacing + string.length)
            paddedString += " ";
        else
            paddedString += string[i - spacing];
    }

    return paddedString;
});

module.exports = Log;
