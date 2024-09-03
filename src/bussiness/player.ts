import * as Tone from "tone";
import { SampleLibrary } from "../libs/tone-instruments";
import { createSignal } from "solid-js";

var piano = SampleLibrary.load({
    instruments: "piano",
});
Tone.ToneAudioBuffer.loaded().then((asdf) => {
    setIsToneLoaded(true);
});

let [isToneLoaded, setIsToneLoaded] = createSignal(false);

export type ChordPlayMode = "together" | "fan-ascending";

export function play(
    mappedNotes: string[],
    chordPlayMode: ChordPlayMode = "together"
) {
    if (!isToneLoaded()) return;
    const now = Tone.now();
    piano.toDestination();
    mappedNotes.forEach((note, index) => {
        piano.triggerAttackRelease(
            note,
            "2n",
            now + (chordPlayMode === "fan-ascending" ? index * 0.2 : 0)
        );
    });
}

Tone.ToneAudioBuffer.loaded().then(() => {
    setIsToneLoaded(true);
});
