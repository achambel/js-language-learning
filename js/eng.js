let repetitions = document.getElementById('repetitions');
let selectAudio = document.getElementById('selectAudio');
let audio = document.getElementById('audio');
let data = document.getElementById('data');
let progressBar = document.querySelector('.progress-bar');
let ol = document.getElementById('resume');
let counter = 0;

selectAudio.addEventListener('change', function(){
  data.innerHTML = '';
  audio.loop = false;
  audio.src = this.value;
  counter = repetitions.value;
});

audio.addEventListener('ended', function() {
  showInfo();
  progressUpdate();
  counter--;

  if(counter > 0) {
    audio.play();
  }

});

function showInfo() {
  let li = document.createElement('li');
  li.textContent = `Completed - [${new Date().toLocaleString('pt-BR')}] \u2713`;
  ol.appendChild(li);
}


audio.textTracks[0].oncuechange = function() {
  var cue = this.activeCues[0]; // assuming there is only one active cue
  if(cue){
    current(cue.id);
  }
};

audio.onloadeddata = function() {
  let cues = audio.textTracks[0].cues;

  if(cues) {
    for(let i = 0; i < cues.length; i++) {
      let begin = cues[i].startTime;
      let end = cues[i].endTime;

      let phrase = document.createElement('p');
      phrase.setAttribute('data-id', cues[i].id);
      phrase.setAttribute('data-begin', begin);
      phrase.setAttribute('data-end', end);
      phrase.textContent = begin + '-' + end + ': ' + cues[i].text;
      phrase.addEventListener('click', function() { syncAudio(phrase); }, false);

      data.appendChild(phrase);
    }
  }
};

function syncAudio(element) {
  audio.currentTime = element.dataset.begin;
  audio.play();
}

function current(activeCueId) {
  let pList = document.querySelectorAll('#data p');
  let current = 'current-time';

  for(let i = 0; i < pList.length; i++) {
    pList[i].classList.remove(current);
  }

  document.querySelector(`#data p[data-id="${activeCueId}"]`).classList.add(current);
}

function progressUpdate() {
  let completed = ol.childElementCount;
  let value = Math.floor((completed / repetitions.value) * 100);

  progressBar.style.width = `${value}%`;
  progressBar.title = `${value}%`;

  if(value <= 33) {
    progressBar.classList.add('part1');
  }
  else if(value > 33 && value <= 66) {
    progressBar.classList.add('part2');
  }
  else if(value > 66 && value < 100) {
    progressBar.classList.add('part3');
  }
  else if(value == 100) {
    progressBar.classList.add('part4');
  }

}

function speech() {
  let btnSpeech = document.querySelector('button');
  let recognition = new webkitSpeechRecognition();
  let final_transcript = '';
  recognition.lang = 'en-US';
  // recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = function(event) {
    let interimTranscript = '';

    for(let i = event.resultIndex; i < event.results.length; ++i) {
      if(event.results[i].isFinal) {
        final_transcript += `<p>${event.results[i][0].transcript}</p>`;
      } else {
        interimTranscript += `<p>${event.results[i][0].transcript}</p>`;
      }
    }

    let target = document.getElementById('transcript');
    target.innerHTML = final_transcript;
  }

  recognition.start();

  recognition.onspeechstart = function() {
    btnSpeech.setAttribute('disabled', true);
    btnSpeech.textContent = 'Pronouncing...';
  }

  recognition.onspeechend = function() {
    btnSpeech.removeAttribute('disabled');
    btnSpeech.textContent = 'Pronounce';
  }
}
