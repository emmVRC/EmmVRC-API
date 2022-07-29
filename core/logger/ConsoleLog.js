const ConsoleLog = ((consoleLog) => {
    this.ConsoleLog = consoleLog;
});

ConsoleLog.WriteLog = ((message) => {
    console.log(message);
});


module.exports = ConsoleLog;