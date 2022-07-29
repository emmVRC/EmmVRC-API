const config = require('../config');
const {InfluxDB, Point, HttpError} = require('@influxdata/influxdb-client');
let _influx = null;

let influxOrg = "";
let influxBucket = "";

let influx = {
  writePoint(point) {
    if (_influx) {
      const writeApi = _influx.getWriteApi(influxOrg, influxBucket, 'ms');
      writeApi.writePoint(point);
      writeApi.close().then(() => {}).catch(err => {});
    }
  }
};

if (config.influx) {
  const influxUrl = config.influx.url;
  const influxToken = config.influx.token;

  influxOrg = config.influx.org;
  influxBucket = config.influx.bucket;
  
  _influx = new InfluxDB({
    url: influxUrl,
    token: influxToken
  });
}

module.exports = {influx, Point}; 