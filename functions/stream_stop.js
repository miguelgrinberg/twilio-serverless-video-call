const twilio = require('twilio');

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();

  // get first active media processor
  const mediaProcessor = (await client.media.mediaProcessor.list({
    status: 'started',
    limit: 1,
  }))[0];
  console.log(mediaProcessor);
  const playerStreamerSid = JSON.parse(mediaProcessor.extensionContext).outputs[0];
  console.log(playerStreamerSid);

  // stop the media processor
  await client.media.mediaProcessor(mediaProcessor.sid).update({
    status: 'ENDED',
  });

  // stop the player streamer
  await client.media.playerStreamer(playerStreamerSid).update({
    status: 'ENDED',
  });

  // return a success response
  return callback();
}
