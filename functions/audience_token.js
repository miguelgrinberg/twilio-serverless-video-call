const twilio = require('twilio')

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  // get first active player streamer
  const playerStreamer = (await client.media.playerStreamer.list({
    status: 'started',
    limit: 1,
  }))[0];
  console.log(playerStreamer);

  if (!playerStreamer) {
    // not currently streaming
    return callback(null, {token: null});
  }

  // obtain a playback grant for the client
  console.log('Account SID', context.ACCOUNT_SID);
  console.log('PlayerStreamer SID', playerStreamer.sid);
  const playbackGrant = await client.media.playerStreamer(playerStreamer.sid).playbackGrant().create({ ttl: 60 });

  // create an access token encapsulating the playback grant
  const accessToken = new twilio.jwt.AccessToken(context.ACCOUNT_SID, context.API_KEY_SID, context.API_KEY_SECRET);
  accessToken.identity = Math.random().toString(16).substring(2);
  accessToken.addGrant(new twilio.jwt.AccessToken.PlaybackGrant({ grant: playbackGrant.grant }));

  // return a success response with the access token
  callback(null, {token: accessToken.toJwt()});
}
