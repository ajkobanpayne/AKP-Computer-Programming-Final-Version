const audCtx = new (AudioContext || webkit.AudioContext)();

let micSource = null;

const inputLevel = audCtx.createGain();
const outputLevel = audCtx.createGain();

//hpf filter node and settings
const hpf = audCtx.createBiquadFilter();
hpf.type = (typeof hpf.type === 'string') ? 'highpass' : 1;
    //hpf.frequency.value = 400;

  const selectMicInput = async function() {
    try {
        //media stream constraint object with low latency settings
        const audioConstraints = { audio: { latency: 0.02 } };

        // access user'ss media device(intended audio interface)
        const micInput = await navigator.mediaDevices.getUserMedia(audioConstraints);

        // Create a new MediaStreamAudioSourceNode using the audio interface input stream
        micSource = audCtx.createMediaStreamSource(micInput);

        // Connect the audio interface source to the 'inputLevel' gain node for further audio processing
        micSource.connect(inputLevel)

    } catch (err) {
        // If an error occurs while accessing microphone, log it to the console
        console.error('Error accessing the microphone:', err);
    }
}

inputLevel.connect(hpf);
hpf.connect(outputLevel);
outputLevel.connect(audCtx.destination);

//console.log("mic");
selectMicInput();

let inputElement = document.getElementById("inputGain");
inputElement.addEventListener("input", function() {
  inputLevel.gain.linearRampToValueAtTime(musicTools.dbfsToLinearAmplitude(parseFloat(this.value)), audCtx.currentTime + 0.02);
  document.getElementById("inputGainDisplay").innerText = this.value;
});

let hpfElement = document.getElementById("hpfFreq");
hpfElement.addEventListener("input", function() {
  hpf.frequency.value = parseFloat(this.value);
  document.getElementById("hpfFreqDisplay").innerText = this.value;
});

let outputElement = document.getElementById("outputGain");
outputElement.addEventListener("input", function() {
  outputLevel.gain.linearRampToValueAtTime(musicTools.dbfsToLinearAmplitude(parseFloat(this.value)), audCtx.currentTime + 0.02);
  document.getElementById("outputGainDisplay").innerText = this.value;
});

// Access the HTML element with the ID 'startAudio', which is a button
let startAudioButton = document.getElementById("startAudio");

// Add an event listener for the 'click' event on the 'startAudio' button to resume the audio context
startAudioButton.addEventListener("click", function() {

    audCtx.resume();
});
