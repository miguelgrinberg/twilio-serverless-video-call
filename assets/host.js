const connectSwitch = document.getElementById('connectSwitch');
const liveMessage = document.getElementById('liveMessage');
const offlineMessage = document.getElementById('offlineMessage');
const participants = document.getElementById('participants');
let tracks;
let room;
let password;

const initializeTracks = async () => {
  // get the video track
  const videoTrack = await Twilio.Video.createLocalVideoTrack({
    name: 'video'
  });

  // get the audio track
  const audioTrack = await Twilio.Video.createLocalAudioTrack({
    name: 'audio'
  });

  tracks = [videoTrack, audioTrack];

  // show local video
  const div = document.createElement('div');
  div.appendChild(videoTrack.attach());
  participants.appendChild(div);
};

const connect = async () => {
  // get an access token
  const response = await fetch('/host_token', {
    method: 'POST',
  });
  if (!response.ok) {
    connectSwitch.checked = false;
    return alert(await response.text());
  }
  const data = await response.json();
  console.log(data);

  // connect to the video room
  room = await Twilio.Video.connect(data.token, {
    tracks: tracks,
  });

  const participantConnected = participant => {
    const div = document.createElement('div');
    div.setAttribute('id', participant.sid);
    participants.appendChild(div);

    const trackSubscribed = track => div.appendChild(track.attach());
    const trackUnsubscribed = track => track.detach().forEach(element => element.remove());

    participant.tracks.forEach(pub => { if (pub.isSubscribed) trackSubscribed(pub.track) });
    participant.on('trackSubscribed', track => trackSubscribed(track));
    participant.on('trackUnsubscribed', trackUnsubscribed);
  };

  const participantDisconnected = participant => {
    document.getElementById(participant.sid).remove();
  };

  room.participants.forEach(participantConnected);
  room.on('participantConnected', participantConnected);
  room.on('participantDisconnected', participantDisconnected);
  
  // update the UI
  offlineMessage.style.display = 'none';
  liveMessage.style.display = 'inline';
};

const disconnect = async () => {
  room.disconnect();

  // update the UI
  liveMessage.style.display = 'none';
  offlineMessage.style.display = 'inline';
  while (participants.childNodes.length > 2) {
    participants.removeChild(participants.lastChild);
  }
};

initializeTracks();
connectSwitch.addEventListener('click', (ev) => {
  if (ev.target.checked) {
    connect();
  }
  else {
    disconnect();
  }
});
