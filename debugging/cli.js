const fs = require('fs');
const [, , ...args] = process.argv;

await fs.promises.mkdir('~/component/' + args[0].toLocaleLowerCase(), { recursive: false });
