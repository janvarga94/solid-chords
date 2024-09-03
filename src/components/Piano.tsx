import { batch, For } from "solid-js";
import { createStore } from "solid-js/store";
import { createKeyViewmodel } from "~/bussiness/pianoKeyViewmodel";
import {
    ChordType,
    getAllChordsForSeminote,
    semitoneToNoteAndOctave,
} from "~/bussiness/notes";
import { play } from "~/bussiness/player";
import { Key } from "~/models/viewModel";

export interface ChordNameAndNotes {
    /**
     * C4, C#4 ...
     */
    name: string;
    notes: string[];
}

export function Piano(props: {
    chordTypes: ChordType[];
    onChordPlay: (
        chord: ChordNameAndNotes,
        matchingChords: ChordNameAndNotes[]
    ) => void;
}) {
    let [keys, setKeys] = createStore(createKeyViewmodel());

    let playKeyWithMatchingChord = (key: Key) => {
        let chords = getAllChordsForSeminote(key.seminote, props.chordTypes);
        let specialChords = chords; /*.filter(
            (c) => c!.matchingFifthSeminotes >= 3
        );*/
        let randomChord =
            specialChords[Math.floor(Math.random() * specialChords.length)]!;

        let chordsOctaveOffset = 1;
        let lowestSeminote =
            randomChord.seminotes[
                Math.floor(Math.random() * randomChord.seminotes.length)
            ];
        let mappedNotes = randomChord.seminotes.map((semi) => {
            // randomize order of note in chord
            return semitoneToNoteAndOctave(
                semi,
                semi >= lowestSeminote
                    ? key.octave - chordsOctaveOffset
                    : key.octave + 1 - chordsOctaveOffset
            );
        });

        play(mappedNotes);
        play([semitoneToNoteAndOctave(key.seminote, key.octave + 1)]);

        props.onChordPlay(
            { name: randomChord.name, notes: mappedNotes },
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
                    semitoneToNoteAndOctave(key.seminote, key.octave),
                "isPlaying",
                true
            );
        });
    };

    let playKey = (key: Key) => {
        play([semitoneToNoteAndOctave(key.seminote, key.octave)]);

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
        <div style="height:120px; position:relative; overflow-x:scroll;scrollbar-width: thin; margin-top: 15px;">
            <For each={keys}>
                {(key) => (
                    <div
                        oncontextmenu={(e) => {
                            playKey(key);
                            e.preventDefault();
                        }}
                        onMouseDown={(e) =>
                            e.button === 0 && playKeyWithMatchingChord(key)
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
                                    "font-size": key.isBlack ? "5px" : "8px",
                                    display: "flex",
                                    "justify-content": "center",
                                }}
                            >
                                {key.noteAndOctave}
                            </div>
                            <div
                                style={{
                                    "font-size": key.isBlack ? "8px" : "15px",
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
    );
}
