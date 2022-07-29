const remoteAddress = ((req) => {
  /*if (req.connection.remoteAddress !== "127.0.0.1"
    || req.connection.remoteAddress !== "::ffff:127.0.0.1") {
    return req.connection.remoteAddress;
  }*/

  //if (req.headers['CF-Connecting-IP'])
  //  return req.headers['CF-Connecting-IP'] ? req.headers['CF-Connecting-IP'] : req.connection.remoteAddress;

  //return "???";
  
  const forwarded = req.headers['x-forwarded-for'];
    return forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress;
});

module.exports = remoteAddress;