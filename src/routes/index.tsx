import { createStore } from "solid-js/store";
import { createSignal, For, Show } from "solid-js";
import { ChordType } from "~/bussiness/notes.js";
import { ChordBadge, MiniChordBadge } from "~/components/ChordBadges.jsx";
import { ChordPlayMode, play } from "~/bussiness/player";
import { Piano } from "~/components/Piano";
import { ChordNameAndNotes } from "~/models/notes";

let allChordTypes: ChordType[] = [
    "major",
    "minor",
    "sus2",
    "sus4",
    "dom7",
    "maj7",
    "min7",
];

let allChordPlayModes: ChordPlayMode[] = ["fan-ascending", "together"];

// function fromServer() {
//     "use server";
//     console.log("hi serre");
// }

export default function Home() {
    console.log("in index");
    // fromServer();
    let [currentChord, setCurrentChord] = createSignal<ChordNameAndNotes>();
    let [matchingChords, setMatchingChords] =
        createSignal<ChordNameAndNotes[]>();
    let [chordHistory, setChordHistory] = createSignal<ChordNameAndNotes[]>([]);

    let [chordTypes, setChordTypes] = createStore<ChordType[]>([
        "major",
        "minor",
        "sus2",
        "sus4",
    ]);
    let [chordPlayingMode, setChordPlayingMode] =
        createSignal<ChordPlayMode>("together");

    let chordTypeChange = (isChecked: boolean, chordType: ChordType) => {
        if (isChecked) {
            setChordTypes([...chordTypes, chordType]);
        } else {
            setChordTypes([...chordTypes.filter((c) => c !== chordType)]);
        }
    };

    return (
        <div>
            <h1 class="text-center">Play a note and I'll find chords</h1>
            <div style="margin-top:15px;display: flex; justify-content:center">
                {allChordTypes.map((chordType, index) => (
                    <span
                        style={{
                            "border-radius": "2px",
                            padding: "0px 10px",
                        }}
                    >
                        {chordType}
                        <input
                            class="checkbox checkbox-sm"
                            type="checkbox"
                            checked={chordTypes.includes(chordType)}
                            onInput={(e) =>
                                chordTypeChange(e.target.checked, chordType)
                            }
                        ></input>
                    </span>
                ))}
            </div>
            <div style="margin-top:15px;display: flex; justify-content:center">
                play mode:
                {allChordPlayModes.map((playMode, index) => (
                    <span
                        style={{
                            "border-radius": "2px",
                            padding: "0px 10px",
                        }}
                    >
                        {playMode}
                        <input
                            type="radio"
                            class="radio radio-xs"
                            checked={chordPlayingMode() === playMode}
                            onInput={(e) => {
                                console.log("input", playMode);
                                setChordPlayingMode(playMode);
                            }}
                        ></input>
                    </span>
                ))}
            </div>

            <Piano
                chordTypes={chordTypes}
                chordPlayMode={chordPlayingMode()}
                onChordPlay={(chord, matchingChords) => {
                    setCurrentChord(chord);
                    setMatchingChords(matchingChords);
                    setChordHistory([...chordHistory(), chord]);
                }}
            ></Piano>

            <Show when={currentChord()}>
                <div style="margin-top:15px;display: flex; justify-content:center">
                    <i>random chord</i>
                    <ChordBadge
                        chordName={currentChord()?.name!}
                        onClick={() => {
                            play(currentChord()?.notes!, chordPlayingMode());
                        }}
                    ></ChordBadge>
                </div>
            </Show>
            <Show when={matchingChords()?.length}>
                <div class="card w-96  shadow-sm  m-auto ">
                    <div class="card-body">
                        <h3 class="card-title">matching chords</h3>
                        <div style="display: flex; justify-content:center; flex-wrap: wrap;">
                            <For each={matchingChords()}>
                                {(chord) => (
                                    <MiniChordBadge
                                        chordName={chord.name}
                                        onClick={() => {
                                            play(
                                                chord.notes,
                                                chordPlayingMode()
                                            );
                                        }}
                                    ></MiniChordBadge>
                                )}
                            </For>
                        </div>
                    </div>
                </div>
            </Show>
            <Show when={chordHistory().length}>
                <div style="margin-top: 10px; font-size:10px; display: flex; justify-content:center">
                    <i>history</i>
                </div>
                <div style="display: flex; justify-content:center; flex-wrap: wrap;">
                    <For each={chordHistory()}>
                        {(chord) => (
                            <MiniChordBadge
                                chordName={chord.name}
                                onClick={() => {
                                    play(chord.notes, chordPlayingMode());
                                }}
                            ></MiniChordBadge>
                        )}
                    </For>
                </div>
            </Show>
            <div style="display: flex; justify-content:center">
                <img width="400" src="fifths.webp" />
            </div>
        </div>
    );
}
