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
            <div class="text-center mt-2">
                <i>Key center (1) is C, in future it will be changable</i>
            </div>
            <div class="mt-8 flex justify-center">
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
                            class="step step-neutral text-sm"
                            classList={{
                                "step-info": chordTypes.includes(chordType),
                            }}
                        >
                            {chordType}
                        </li>
                    ))}
                </ul>
                <span class="flex flex-col -mt-4 pl-4">
                    <i class="text-center text-xs">play mode: </i>
                    <div>
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
                                    "btn-neutral":
                                        chordPlayingMode() === playMode,
                                    "rounded-s-none": index === 1,
                                    "rounded-e-none": index === 0,
                                }}
                            >
                                {playMode}
                            </button>
                        ))}
                    </div>
                </span>
            </div>
            <Piano
                class="mt-10"
                chordTypes={chordTypes}
                chordPlayMode={chordPlayingMode()}
                onChordPlay={(chord, matchingChords) => {
                    setCurrentChord(chord);
                    setMatchingChords(matchingChords);
                    setChordHistory([...chordHistory(), chord]);
                }}
            ></Piano>

            <div class="flex justify-center">
                <div>
                    <Show when={currentChord()}>
                        <div class="mt-4 flex flex-col">
                            <i class="text-center text-xs">random chord</i>
                            <div class="text-center">
                                <ChordBadge
                                    chordName={currentChord()?.name!}
                                    onClick={() => {
                                        play(
                                            currentChord()?.notes!,
                                            chordPlayingMode()
                                        );
                                    }}
                                ></ChordBadge>
                            </div>
                        </div>
                    </Show>
                    <Show when={matchingChords()?.length}>
                        <div class="w-96  m-auto mt-4">
                            <div class="text-center text-xs">
                                <i>matching chords</i>
                            </div>
                            <div class="flex justify-center flex-wrap">
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
                    </Show>
                    <Show when={chordHistory().length}>
                        <div class="w-96  m-auto mt-4">
                            <div class="text-center text-xs">
                                <i>history</i>
                            </div>
                        </div>
                        <div class="w-96 m-auto flex justify-center flex-wrap">
                            <For each={chordHistory()}>
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
                    </Show>
                </div>
                <div>
                    <img width="400" src="fifths.webp" />
                </div>
            </div>
        </div>
    );
}
