// ===================================================================
// The 4 core ideas (the whole project is really just an extension of these):
//   1) Keep the symbols in an array, and redraw that array every frame (draw loop)
//   2) On click → find the nearest symbol → change that symbol's state (interaction)
//   3) Sound = an oscillator (a generator that produces a tone) + an envelope (a curve
//      that shapes volume over time: attack-decay-sustain-release)
//   4) The "forming line" = keep appending clicked coordinates to an array, then
//      connect that array with a line
// ===================================================================

let glyphs = [];   // the symbols on screen: {x, y, note, char}
let trail = [];     // coordinates piling up in click order — this is the "forming line"
let osc, env;        // makes sound with just one oscillator + one envelope

let notes = [261.6, 293.7, 329.6, 392.0, 440.0]; // C D E G A (pentatonic scale, Hz)
let chars = ['˘', '´', '…', '¶', '°'];             // 5 symbols (taken from the typographic score)

function setup(){
  createCanvas(600, 380);

  // lay out 5 symbols in a row, each pre-assigned a different note
  for(let i = 0; i < notes.length; i++){
    glyphs.push({
      x: 90 + i*105,
      y: 190,
      note: notes[i],
      char: chars[i]
    });
  }

  // oscillator: a generator that keeps producing one waveform. Start it at volume 0.
  osc = new p5.Oscillator('sawtooth');
  osc.amp(0);
  osc.start();

  // envelope: calling env.play(osc) moves the volume through
  // attack (ramps to peak volume in 0.02s) → decay (eases to sustain volume in 0.1s) →
  // sustain (holds that volume) → release (fades to 0 in 0.3s).
  env = new p5.Envelope();
  env.setADSR(0.02, 0.1, 0.15, 0.3);
}

function draw(){
  background('#f4f2ee');

  // 1) draw the trail so far as a line — just connect the trail array in order
  noFill();
  stroke('#e91e8c');
  strokeWeight(2);
  beginShape();
  for(let p of trail){ vertex(p.x, p.y); }
  endShape();

  // 2) draw the symbols — looping over the array and redrawing every frame is the core pattern
  noStroke();
  fill(30);
  textAlign(CENTER, CENTER);
  textSize(36);
  for(let g of glyphs){
    text(g.char, g.x, g.y);
  }
}

function mousePressed(){
  // find the symbol closest to where you clicked (only within 40px)
  let closest = null;
  let bestDist = 40;
  for(let g of glyphs){
    let d = dist(mouseX, mouseY, g.x, g.y);
    if(d < bestDist){
      bestDist = d;
      closest = g;
    }
  }
  if(!closest) return;

  // play the sound: set the oscillator's frequency to that symbol's note, then trigger the envelope
  osc.freq(closest.note);
  env.play(osc);

  // add this symbol's coordinates to the trail — as these pile up, draw() above connects them into a line
  trail.push({ x: closest.x, y: closest.y });
}

// ===================================================================
// If you want to extend this further (this is actually the order we built it in):
//
//  · Drag = tension — use mouseDragged instead of mousePressed, turn the distance
//    dragged from the press point into a 0–1 value, and use that to drive
//    env.setRange(...) or osc.freq(...) in real time.
//
//  · Vowel-like timbres — chain 2–3 p5.BandPass filters from p5.sound after the
//    oscillator, and give each filter a different frequency (formant) to get an
//    "ah/eh/ee" vowel-like feel.
//
//  · Saving — JSON.stringify() the trail array into localStorage, or let it be
//    downloaded as a file, so you can reload the trail you've drawn.
//
// Worth checking out:
//  · p5.js reference — https://p5js.org/reference/
//  · p5.sound reference — https://p5js.org/reference/#/libraries/p5.sound
//  · The Coding Train (YouTube) — lots of tutorials on sound and interaction with
//    p5.js, many in a similar spirit to this code.
// ===================================================================