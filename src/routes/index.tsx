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
            <h1 class="text-center mt-4">
                Play a note and I'll find matching chords
            </h1>
            <div style="margin-top:15px;display: flex; justify-content:center">
                <ul class="steps">
                    {allChordTypes.map((chordType, index) => (
                        <li
                            onClick={(e) =>
                                chordTypeChange(
                                    !chordTypes.includes(chordType),
                                    chordType
                                )
                            }
                            data-content={
                                chordTypes.includes(chordType) ? "✓" : "✕"
                            }
                            class="step step-neutral"
                            classList={{
                                "step-info": chordTypes.includes(chordType),
                            }}
                        >
                            {chordType}
                        </li>
                    ))}
                </ul>
                <span class="pt-2">
                    <i>play mode: </i>
                    {allChordPlayModes.map((playMode, index) => (
                        <button
                            style={{
                                padding: "0px 10px",
                            }}
                            class="btn"
                            onclick={(e) => {
                                console.log("input", playMode);
                                setChordPlayingMode(playMode);
                            }}
                            classList={{
                                "btn-neutral": chordPlayingMode() === playMode,
                            }}
                        >
                            {playMode}
                        </button>
                    ))}
                </span>
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
