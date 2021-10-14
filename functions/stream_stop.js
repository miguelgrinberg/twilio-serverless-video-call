const axios = require('axios');

exports.handler = async function(context, event, callback) {
  const auth = { username: context.API_KEY_SID, password: context.API_KEY_SECRET };

  // get first active media processor
  let response = await axios.get(
    'https://media.twilio.com/v1/MediaProcessors?Status=STARTED',
    { auth: auth },
  );
  const mediaProcessor = response.data['media_processors'][0];
  console.log(mediaProcessor);
  const playerStreamerSid = JSON.parse(mediaProcessor.extension_context).outputs[0];
  console.log(playerStreamerSid);

  // stop the media processor
  await axios.post(
    `https://media.twilio.com/v1/MediaProcessors/${mediaProcessor.sid}`,
    new URLSearchParams({Status: 'ENDED'}).toString(),
    { auth: auth },
  );

  // stop the player streamer
  await axios.post(
    `https://media.twilio.com/v1/PlayerStreamers/${playerStreamerSid}`,
    new URLSearchParams({Status: 'ENDED'}).toString(),
    { auth: auth },
  );

  // return a success response
  return callback();
}
