import * as Tone from "tone";
import { SampleLibrary } from "../tone-instruments.js";
import { createStore } from "solid-js/store";
import { batch, createSignal, For } from "solid-js";
import {
    chordSeminoteToChordName,
    ChordTypeCheckboxes,
    getAllChordsForSeminote,
    semitoneToToneAndOctave,
} from "~/utils/notes.js";
import { ChordBadge, MiniChordBadge } from "~/components/chordBadges.jsx";
var piano = SampleLibrary.load({
    instruments: "piano",
});

export default function Home() {
    let [currentChord, setCurrentChord] = createSignal("");
    let [currentChordNotes, setCurrentChordNotes] = createSignal<string[]>([]);
    let [matchingChords, setMatchingChords] = createSignal<
        { name: string; notes: string[] }[] | undefined
    >();
    let [isToneLoaded, setIsToneLoaded] = createSignal(false);
    let [chordTypes, setChordTypes] = createStore<ChordTypeCheckboxes>({
        majors: true,
        minor: true,
        sus2: true,
        sus4: true,
        dom7: true,
        maj7: false,
        min7: true,
    });

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
        let chords = getAllChordsForSeminote(key.seminote, chordTypes);
        let specialChords = chords.filter(
            (c) => c!.matchingFifthSeminotes >= 3
        );
        let randomChord =
            specialChords[Math.floor(Math.random() * specialChords.length)]!;

        let chordsOctaveOffset = 2;
        let lowestSeminote =
            randomChord.seminotes[
                Math.floor(Math.random() * randomChord.seminotes.length)
            ];
        console.log("lowest semi", lowestSeminote);
        let mappedNotes = randomChord.seminotes.map((semi) => {
            // randomize order of note in chord
            return semitoneToToneAndOctave(
                semi,
                semi >= lowestSeminote
                    ? key.octave - chordsOctaveOffset
                    : key.octave + 1 - chordsOctaveOffset
            );
        });

        const now = Tone.now();
        piano.toDestination();
        mappedNotes.forEach((note, index) => {
            piano.triggerAttackRelease(note, "2n", now + index * 0.2);
        });
        piano.triggerAttackRelease(
            semitoneToToneAndOctave(key.seminote, key.octave + 1),
            "2n",
            now
        );
        // piano.triggerAttackRelease(
        //     [...mappedNotes, semitoneToToneAndOctave(key.seminote, key.octave)],
        //     "2n",
        //     now
        // );
        setCurrentChord(randomChord.name);
        setCurrentChordNotes(mappedNotes);
        setMatchingChords(
            specialChords.map((ch) => {
                return { name: ch!.name, notes: [] };
            })
        );
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

        const now = Tone.now();
        piano.toDestination();
        piano.triggerAttackRelease(
            semitoneToToneAndOctave(key.seminote, key.octave),
            "2n",
            now
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
            <div
                id="keys"
                style="height:120px; position:relative; overflow-x:scroll;scrollbar-width: thin;"
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
            <div style="margin-top:15px;display: flex; justify-content:center">
                <ChordBadge
                    chordName={currentChord()}
                    onClick={() => {
                        const now = Tone.now();
                        piano.toDestination();
                        currentChordNotes().forEach((note, index) => {
                            piano.triggerAttackRelease(
                                note,
                                "2n",
                                now + index * 0.2
                            );
                        });
                    }}
                ></ChordBadge>
            </div>
            <div style="margin-top: 10px; font-size:10px; display: flex; justify-content:center">
                <i>matching chords</i>
            </div>
            <div style="display: flex; justify-content:center">
                <For each={matchingChords()}>
                    {(chord) => (
                        <MiniChordBadge
                            chordName={chord.name}
                            onClick={() => {
                                const now = Tone.now();
                                piano.toDestination();
                                chord.notes.forEach((note, index) => {
                                    piano.triggerAttackRelease(
                                        note,
                                        "2n",
                                        now + index * 0.2
                                    );
                                });
                            }}
                        ></MiniChordBadge>
                    )}
                </For>
            </div>
            <div style="display: flex; justify-content:center">
                <img width="400" src="fifths.webp" />
            </div>
        </>
    );
}
