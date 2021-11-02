const twilio = require('twilio');

exports.handler = async function(context, event, callback) {
  const room_name = 'livestream-' + Math.random().toString(16).substring(2)

  // authentication
  if (event.password != context.HOST_PASSWORD) {
    const response = new Twilio.Response();
    response.setStatusCode(401);
    response.setBody('Invalid password');
    return callback(null, response);
  }

  // create the video room
  await context.getTwilioClient().video.rooms.create({
    uniqueName: room_name,
    type: 'go',
  });

  // create an access token
  const accessToken = new twilio.jwt.AccessToken(context.ACCOUNT_SID, context.API_KEY_SID, context.API_KEY_SECRET);
  accessToken.identity = 'Miguel Grinberg';  // ← enter the name of the live stream host here!
  const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
    room: room_name
  });
  accessToken.addGrant(videoGrant);
  return callback(null, {
    token: accessToken.toJwt(),
    room: room_name,
  });
}
