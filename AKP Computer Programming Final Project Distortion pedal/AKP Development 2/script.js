import {musicTools} from "./MusicTools.js";
//used for converting dbFS to linear amplitude on gain nodes

//creating audio context
const audCtx = new (AudioContext || webkit.AudioContext)();

//sets the mic source to null
let micSource = null;

const inputLevel = audCtx.createGain();
//gain node for input level 
const outputLevel = audCtx.createGain();
//gain node for the output level

//hpf filter node and settings
const hpf = audCtx.createBiquadFilter();
//chooses highpass for the type of filter for hpf
hpf.type = (typeof hpf.type === 'string') ? 'highpass' : 1;
    //hpf.frequency.value = 400;

//lpf tone knob filter node and settings
const toneFilter = audCtx.createBiquadFilter();
//chooses lowpass as the type of filter for tone control
toneFilter.type = (typeof toneFilter.type === 'string') ? 'lowpass' : 1;


//creating waveshaper and distortion curve
const distortion = audCtx.createWaveShaper();
//distortion.curve = makeDistortionCurve(200);
function makeDistortionCurve(amount) {
    let k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  };
  //amount controlled by drive knob 


//setting up audio interface input
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

//routing connections
inputLevel.connect(hpf);
hpf.connect(distortion);
distortion.connect(toneFilter);
toneFilter.connect(outputLevel);
outputLevel.connect(audCtx.destination);

//console.log("mic");
selectMicInput();

//getting values from index to control input gain level
let inputElement = document.getElementById("inputGain");
//add event listener for change to the gain control value on UI
inputElement.addEventListener("input", function() {
  //converts dbFS to linear amplitude
  inputLevel.gain.linearRampToValueAtTime(musicTools.dbfsToLinearAmplitude(parseFloat(this.value)), audCtx.currentTime + 0.02);
  //displays value on UI
  document.getElementById("inputGainDisplay").innerText = this.value;
});

//getting values from index to control drive (amount of distortion and value that goes into distortion curve)
let distortionElement = document.getElementById("drive");
//add event listener for change to the drive control value on UI
distortionElement.addEventListener("input", function() {
  //creation of distortion curve happens here
  distortion.curve = makeDistortionCurve(parseFloat(this.value));
  //displays value on UI
  document.getElementById("driveDisplay").innerText = this.value;
});

//getting values from index to control highpass frequency
let hpfElement = document.getElementById("hpfFreq");
//add event listener for change to the hpf control value on UI
hpfElement.addEventListener("input", function() {
  //sets hpf frequency value
  hpf.frequency.value = parseFloat(this.value);
  document.getElementById("hpfFreqDisplay").innerText = this.value;
});

//getting values from index to control output gain level
let outputElement = document.getElementById("outputGain");
//add event listener for change to the level control value on UI
outputElement.addEventListener("input", function() {
  //converts dbFS to linear amplitude
  outputLevel.gain.linearRampToValueAtTime(musicTools.dbfsToLinearAmplitude(parseFloat(this.value)), audCtx.currentTime + 0.02);
  //displays value on UI
  document.getElementById("outputGainDisplay").innerText = this.value;
});

//getting values from index to control lowpass frequency
let toneElement = document.getElementById("tone");
//add event listener for change to the tone control value on UI
toneElement.addEventListener("input", function() {
   //sets lpf frequency value
   //multiplied by 200 to allow the range to be 100Hz-20000Hz while the control on the UI displays 1%-100%
  toneFilter.frequency.value = parseFloat(this.value*200);
  //displays value on UI as a percent
  document.getElementById("toneDisplay").innerText = `${this.value}%`;
});

//code for the on/off switch that causes higher latency in sound
//disconnects inputLevel from hpf when checked off, reconnects when checked on 

// let toggleElement = document.getElementById("toggle");
// toggleElement.addEventListener("change", function() {
//   if (this.checked) 
//   {inputLevel.connect(hpf) } 
//   else 
//   {inputLevel.disconnect(hpf) }
// });


// Access the HTML element with the ID 'startAudio', which is a button
let startAudioButton = document.getElementById("startAudio");

// Add an event listener for the 'click' event on the 'startAudio' button to resume the audio context
startAudioButton.addEventListener("click", function() {

    audCtx.resume();
});
