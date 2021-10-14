const axios = require('axios');
const twilio = require('twilio')

exports.handler = async function(context, event, callback) {
  const auth = { username: context.API_KEY_SID, password: context.API_KEY_SECRET };

  // get first active player streamer
  let response = await axios.get(
    'https://media.twilio.com/v1/PlayerStreamers?Status=STARTED',
    { auth: auth },
  );
  const playerStreamer = response.data['player_streamers'][0];
  console.log(playerStreamer);

  if (!playerStreamer) {
    // not currently streaming
    return callback(null, {token: null});
  }

  // obtain a playback grant for the client
  console.log('Account SID', context.ACCOUNT_SID);
  console.log('PlaybackGrant URL', playerStreamer.links.playback_grant);
  response = await axios.post(
    playerStreamer.links.playback_grant,
    new URLSearchParams({
        Ttl: 15,
    }).toString(),
    { auth: auth },
  );
  const playbackGrant = response.data;

  // create an access token encapsulating the playback grant
  const accessToken = new twilio.jwt.AccessToken(context.ACCOUNT_SID, context.API_KEY_SID, context.API_KEY_SECRET);
  accessToken.identity = Math.random().toString(16).substring(2);
  accessToken.addGrant({
    key: 'player',
    toPayload: () => playbackGrant.grant,
  });

  // return a success response with the access token
  callback(null, {token: accessToken.toJwt()});
}
