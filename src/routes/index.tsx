import { createStore } from "solid-js/store";
import { batch, createSignal, For } from "solid-js";
import {
    ChordType,
    getAllChordsForSeminote,
    semitoneToToneAndOctave,
} from "~/bussiness/notes.js";
import { ChordBadge, MiniChordBadge } from "~/components/ChordBadges.jsx";
import { createKeyViewmodel } from "~/bussiness/keyViewmodel.js";
import { Key } from "~/models/viewModel.js";
import { ChordPlayMode, play } from "~/bussiness/player";

export default function Home() {
    let [currentChord, setCurrentChord] = createSignal("");
    let [currentChordNotes, setCurrentChordNotes] = createSignal<string[]>([]);
    let [matchingChords, setMatchingChords] = createSignal<
        { name: string; notes: string[] }[] | undefined
    >();

    let [chordPlayMode, setChordPlayMode] =
        createSignal<ChordPlayMode>("together");
    let [chordTypes, setChordTypes] = createStore<ChordType[]>([
        "major",
        "minor",
        "sus2",
        "sus4",
    ]);
    let allChordTypes: ChordType[] = [
        "major",
        "minor",
        "sus2",
        "sus4",
        "dom7",
        "maj7",
        "min7",
    ];

    let [keys, setKeys] = createStore(createKeyViewmodel());

    let playKeyWithMatchingChord = (key: Key) => {
        let chords = getAllChordsForSeminote(key.seminote, chordTypes);
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
            return semitoneToToneAndOctave(
                semi,
                semi >= lowestSeminote
                    ? key.octave - chordsOctaveOffset
                    : key.octave + 1 - chordsOctaveOffset
            );
        });

        play(mappedNotes);
        play([semitoneToToneAndOctave(key.seminote, key.octave + 1)]);

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

    let playKey = (key: Key) => {
        play([semitoneToToneAndOctave(key.seminote, key.octave)]);

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

    let chordTypeChange = (isChecked: boolean, chordType: ChordType) => {
        if (isChecked) {
            setChordTypes([...chordTypes, chordType]);
        } else {
            setChordTypes([...chordTypes.filter((c) => c !== chordType)]);
        }
    };

    return (
        <>
            <div style="margin-top:15px;display: flex; justify-content:center">
                {allChordTypes.map((chordType, index) => (
                    <span
                        style={{
                            "border-radius": "2px",
                            padding: "0px 10px",
                            "background-color":
                                index % 2 === 0
                                    ? "rgb(210,210,210)"
                                    : undefined,
                        }}
                    >
                        {chordType}
                        <input
                            type="checkbox"
                            checked={chordTypes.includes(chordType)}
                            onInput={(e) =>
                                chordTypeChange(e.target.checked, chordType)
                            }
                        ></input>
                    </span>
                ))}
            </div>
            <div
                id="keys"
                style="height:120px; position:relative; overflow-x:scroll;scrollbar-width: thin; margin-top: 15px;"
            >
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
                        play(currentChordNotes());
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
                                play(chord.notes);
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
