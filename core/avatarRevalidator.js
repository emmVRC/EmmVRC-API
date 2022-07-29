const { Worker, isMainThread } = require('worker_threads');
const Log = require('./logger/Log');

const mysql = require('./database/query');

const bent = require('bent');
const get = bent('GET', 200);

if (isMainThread) {
  Log.writeLog("Starting Avatar Validator...");
  new Worker(__filename);
  return;
}

setInterval(async function() {
  return;
  let avtrLookup = await mysql.query('SELECT avatar_id, avatar_asset_url FROM avatar WHERE (last_validated IS NULL OR last_validated < NOW() - INTERVAL 7 DAY) AND is_deleted = 0 LIMIT 100');

  if (avtrLookup.length > 0) {
    let selectedAvatar = avtrLookup[Math.floor(Math.random() * avtrLookup.length)];
    let avatarId = selectedAvatar.avatar_id;
    let assetUrl = selectedAvatar.avatar_asset_url.replace(/(\d+)\/file((?!\/file))/g, '');

    let checkFile =  await get(assetUrl, null, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0'
    }).catch(err => err);

    if (checkFile.statusCode == 404) {
      Log.writeLog(avatarId + " no longer exists. Marking it as deleted. AssetUrl: " + assetUrl);
      await mysql.q('UPDATE avatar SET last_validated = NOW(), is_deleted = 1 WHERE avatar_id = ?', [avatarId]);
    } else if (checkFile.statusCode == 200) {
      await mysql.q('UPDATE avatar SET last_validated = NOW(), is_deleted = 0 WHERE avatar_id = ?', [avatarId]);
    }
  }
}, 6000);