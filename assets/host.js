const liveSwitch = document.getElementById('liveSwitch');
const liveMessage = document.getElementById('liveMessage');
const offlineMessage = document.getElementById('offlineMessage');
let tracks;
let room;
let password;

const start = async () => {
  // prompt for the host password
  password = prompt('Enter the password');

  // get an access token
  const response = await fetch('/host_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: password,
    }),
  });
  if (!response.ok) {
    liveSwitch.checked = false;
    return alert(await response.text());
  }
  const data = await response.json();

  // get the video track
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: 1280,
      height: 720,
    }
  });
  const videoTrack = new Twilio.Video.LocalVideoTrack(screenStream.getTracks()[0], {
    name: 'screen'
  });

  // get the audio track
  const audioTrack = await Twilio.Video.createLocalAudioTrack({
    name: 'audio'
  });

  // connect to the video room
  tracks = [videoTrack, audioTrack];
  room = await Twilio.Video.connect(data.token, {
    tracks: tracks,
  });
  
  // start the live stream
  await fetch('/stream_start',  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: password,
      room: data.room
    }),
  });

  // update the UI
  offlineMessage.style.display = 'none';
  liveMessage.style.display = 'inline';
};

const stop = async () => {
  // stop the live stream
  await fetch('/stream_stop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: password,
    }),
  });

  // leave the video room
  room.disconnect();
  tracks[0].stop();
  tracks[1].stop();
  tracks = room = undefined;

  // update the UI
  liveMessage.style.display = 'none';
  offlineMessage.style.display = 'inline';
};

liveSwitch.addEventListener('click', (ev) => {
  if (ev.target.checked) {
    start();
  }
  else {
    stop();
  }
});
