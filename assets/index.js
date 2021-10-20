const playerDiv = document.getElementById('player');

const playStream = async () => {
  const response = await fetch('/audience_token', {
    method: 'POST',
  });
  const data = await response.json();

  if (!data.token) {
    playerDiv.innerHTML = 'Not currently streaming.';
  }
  else {
    player = await Twilio.Live.Player.connect(data.token, {playerWasmAssetsPath: ''});
    player.play();
    playerDiv.appendChild(player.videoElement);

    playerDiv.addEventListener('click', () => {
      player.isMuted = !player.isMuted;
    });

    player.on('stateChanged', (state) => {
      if (state === 'ended') {
        player.videoElement.remove();
        playerDiv.innerHTML = 'The stream has ended.';
      }
    });

  }
};

playStream();
