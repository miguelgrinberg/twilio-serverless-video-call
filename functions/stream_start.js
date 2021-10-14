const axios = require('axios');

exports.handler = async function(context, event, callback) {
  const auth = { username: context.API_KEY_SID, password: context.API_KEY_SECRET };

  // create a player streamer
  let response = await axios.post(
    'https://media.twilio.com/v1/PlayerStreamers',
    new URLSearchParams({ Video: true }).toString(),
    { auth: auth },
  );
  const playerStreamer = response.data;
  console.log(playerStreamer);

  // create a media processor
  response = await axios.post(
    'https://media.twilio.com/v1/MediaProcessors',
    new URLSearchParams({
      Extension: 'video-composer-v1-preview',
      ExtensionContext: JSON.stringify({
        room: {name: event.room},
        identity: 'twilio-live',
        outputs: [playerStreamer.sid],
        resolution: '1280x720',
      }),
    }).toString(),
    { auth: auth },
  );
  const mediaProcessor = response.data;
  console.log(mediaProcessor);

  // return a success response
  return callback();
}
