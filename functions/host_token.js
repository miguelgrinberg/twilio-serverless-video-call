const twilio = require('twilio');

exports.handler = async function(context, event, callback) {
  const room_name = 'my-video-room';

  // check that there are at most 4 participants in the room
  try {
    const room = await context.getTwilioClient().video.rooms(room_name).fetch();
    const participants = await room.participants().list({status: 'connected'});
    if (Object.keys(participants).length >= 3) {
      return callback(null, {
        statusCode: 400,
        body: 'Room is full'
      });
    }
  }
  catch (error) {
    // the room doesn't exist yet
    console.log(error);
  }

  // create an access token
  const accessToken = new twilio.jwt.AccessToken(context.ACCOUNT_SID, context.API_KEY_SID, context.API_KEY_SECRET);
  accessToken.identity = 'Participant ' + Math.random().toString(16).substring(2, 6);
  const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
    room: room_name
  });
  accessToken.addGrant(videoGrant);
  return callback(null, {
    token: accessToken.toJwt(),
    room: room_name,
  });
}
