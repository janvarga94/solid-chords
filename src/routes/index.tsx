import * as Tone from "tone";
import { SampleLibrary } from "../tone-instruments.js";
import { createStore } from "solid-js/store";
import { batch, createSignal, For } from "solid-js";
import {
    chordSeminoteToChordName,
    getAllChordsForSeminote,
    semitoneToToneAndOctave,
} from "~/utils/notes.js";
var piano = SampleLibrary.load({
    instruments: "piano",
});

export default function Home() {
    let [currentChord, setCurrentChord] = createSignal("");
    let [matchingChords, setMatchingChords] = createSignal("");
    let [isToneLoaded, setIsToneLoaded] = createSignal(false);

    Tone.ToneAudioBuffer.loaded().then(() => {
        setIsToneLoaded(true);
    });

    type Key = {
        seminote: number;
        noteAndOctave: string;
        myChordMark: string;
        octave: number;
        isBlack: boolean;
        width: number;
        left: number;
        isPlaying: boolean;
    };

    let [keys, setKeys] = createStore(
        [...Array(88).keys()].map((keyIndex): Key => {
            let octave = Math.floor(keyIndex / 12) + 1;
            let seminote = (keyIndex + 1) % 12 || 12;
            let whiteWidth = 20;
            let blackWidth = 16;
            let isBlack = [2, 4, 7, 9, 11].includes(seminote);

            /** used only for key positioning on the screen */
            let keySequence = !isBlack
                ? seminote === 1
                    ? 1
                    : seminote === 3
                      ? 2
                      : seminote === 5
                        ? 3
                        : seminote === 6
                          ? 4
                          : seminote === 8
                            ? 5
                            : seminote === 10
                              ? 6
                              : 7
                : seminote === 2
                  ? 1
                  : seminote === 4
                    ? 2
                    : seminote === 7
                      ? 4
                      : seminote === 9
                        ? 5
                        : 6;
            return {
                seminote,
                noteAndOctave: semitoneToToneAndOctave(seminote, octave),
                myChordMark: chordSeminoteToChordName(seminote),
                octave,
                isBlack,
                width: isBlack ? blackWidth : whiteWidth,
                left:
                    (octave - 1) * whiteWidth * 7 +
                    (keySequence - 1) * whiteWidth +
                    (isBlack ? whiteWidth - blackWidth / 2 : 0),
                isPlaying: false,
            };
        })
    );

    let keyMouseDown = (key: Key) => {
        if (!isToneLoaded()) return;
        let chords = getAllChordsForSeminote(key.seminote);
        let specialChords = chords.filter(
            (c) => c!.matchingFifthSeminotes >= 3
        );
        let randomChord =
            specialChords[Math.floor(Math.random() * specialChords.length)]!;

        let chordsOctaveOffset = 1;
        let mappedNotes = randomChord.seminotes.map((semi) => {
            let lowestSeminote =
                randomChord.seminotes[
                    Math.floor(Math.random() * randomChord.seminotes.length)
                ];
            // console.log("lowest semi", lowestSeminote);
            return semitoneToToneAndOctave(
                semi,
                semi < lowestSeminote
                    ? key.octave + 1 - chordsOctaveOffset
                    : key.octave - chordsOctaveOffset
            );
        });

        piano.toDestination();
        piano.triggerAttackRelease(
            [...mappedNotes, semitoneToToneAndOctave(key.seminote, key.octave)],
            "2n"
        );
        setCurrentChord(randomChord.name);
        setMatchingChords(specialChords.map((ch) => ch!.name).join(", "));
        batch(() => {
            setKeys(
                (storeKey) => storeKey.isPlaying === true,
                "isPlaying",
                false
            );
            setKeys(
                (storeKey) => mappedNotes.includes(storeKey.noteAndOctave),
                "isPlaying",
                true
            );
            setKeys(
                (storeKey) =>
                    storeKey.noteAndOctave ===
                    semitoneToToneAndOctave(key.seminote, key.octave),
                "isPlaying",
                true
            );
        });
    };

    let rightMouseKeyDown = (key: Key) => {
        if (!isToneLoaded()) return;

        piano.toDestination();
        piano.triggerAttackRelease(
            semitoneToToneAndOctave(key.seminote, key.octave),
            "2n"
        );

        batch(() => {
            setKeys(
                (storeKey) => storeKey.isPlaying === true,
                "isPlaying",
                false
            );
            setKeys(
                (storeKey) => storeKey.noteAndOctave === key.noteAndOctave,
                "isPlaying",
                true
            );
        });
    };
    return (
        <>
            HI
            <div
                id="keys"
                style="width: 1300px; height:200px; position:relative"
            >
                <For each={keys}>
                    {(key) => (
                        <div
                            oncontextmenu={(e) => {
                                rightMouseKeyDown(key);
                                e.preventDefault();
                            }}
                            onMouseDown={(e) =>
                                e.button === 0 && keyMouseDown(key)
                            }
                            style={{
                                border: "solid 1px black",
                                display: "inline-flex",
                                "justify-content": "space-between",
                                "flex-direction": "column",
                                "background-color": key.isPlaying
                                    ? key.isBlack
                                        ? "rgb(155,155,0)"
                                        : "yellow"
                                    : key.isBlack
                                      ? "black"
                                      : "white",
                                color: key.isBlack ? "white" : "black",
                                height: key.isBlack ? "70px" : "100px",
                                position: "absolute",
                                left: key.left + "px",
                                width: key.width + "px",
                                cursor: "default",
                                "z-index": key.isBlack ? "12332" : undefined,
                                "border-radius": "2px",
                            }}
                        >
                            <div style="height:20px; "></div>
                            <div style="height:25px; ">
                                <div
                                    style={{
                                        "font-size": key.isBlack
                                            ? "5px"
                                            : "8px",
                                        display: "flex",
                                        "justify-content": "center",
                                    }}
                                >
                                    {key.noteAndOctave}
                                </div>
                                <div
                                    style={{
                                        "font-size": key.isBlack
                                            ? "8px"
                                            : "15px",
                                        display: "flex",
                                        "justify-content": "center",
                                    }}
                                >
                                    {key.myChordMark}
                                </div>
                            </div>
                        </div>
                    )}
                </For>
            </div>
            <div>
                <b>chord: </b>
                {currentChord()}
            </div>
            <div>
                <b>matching chords: </b>
                {matchingChords()}
            </div>
            <img
                style="position: absolute; left: 700px; top:200px"
                width="400"
                src="fifths.webp"
            />
        </>
    );
}
