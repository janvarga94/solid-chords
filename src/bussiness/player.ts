import * as Tone from "tone";
import { createSignal } from "solid-js";

var piano: any;
import("../libs/tone-instruments").then((lib: any) => {
    piano = lib.SampleLibrary.load({ instruments: "piano", ext: ".mp3" });
    Tone.ToneAudioBuffer.loaded()
        .then(() => {
            setIsToneLoaded(true);
        })
        .catch((e) => {
            console.log("error loading audio: ", e);
        });
});

let [isToneLoaded, setIsToneLoaded] = createSignal(false);
export type ChordPlayMode = "together" | "fan-ascending";

export function play(
    mappedNotes: string[],
    chordPlayMode: ChordPlayMode = "fan-ascending"
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
