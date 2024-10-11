import { createStore } from "solid-js/store";
import { createSignal, For, Show } from "solid-js";
import { ChordType } from "~/bussiness/notes.js";
import { ChordBadge, MiniChordBadge } from "~/components/ChordBadges.jsx";
import { ChordPlayMode, play } from "~/bussiness/player";
import { Piano } from "~/components/Piano";
import { ChordNameAndNotes } from "~/models/notes";

export default function Home() {
    let [currentChord, setCurrentChord] = createSignal<ChordNameAndNotes>();
    let [matchingChords, setMatchingChords] =
        createSignal<ChordNameAndNotes[]>();
    let [chordHistory, setChordHistory] = createSignal<ChordNameAndNotes[]>([]);

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

            <Piano
                chordTypes={chordTypes}
                onChordPlay={(chord, matchingChords) => {
                    setCurrentChord(chord);
                    setMatchingChords(matchingChords);
                    setChordHistory([...chordHistory(), chord]);
                }}
            ></Piano>

            <Show when={currentChord()}>
                <div style="margin-top:15px;display: flex; justify-content:center">
                    <ChordBadge
                        chordName={currentChord()?.name!}
                        onClick={() => {
                            play(currentChord()?.notes!);
                        }}
                    ></ChordBadge>
                </div>
            </Show>
            <div style="margin-top: 10px; font-size:10px; display: flex; justify-content:center">
                <i>matching chords</i>
            </div>
            <div style="display: flex; justify-content:center; flex-wrap: wrap;">
                <For each={matchingChords()}>
                    {(chord) => (
                        <MiniChordBadge
                            chordName={chord.name}
                            onClick={() => {
                                console.log("playing matching", chord.notes);
                                play(chord.notes);
                            }}
                        ></MiniChordBadge>
                    )}
                </For>
            </div>
            <div style="margin-top: 10px; font-size:10px; display: flex; justify-content:center">
                <i>history</i>
            </div>
            <div style="display: flex; justify-content:center; flex-wrap: wrap;">
                <For each={chordHistory()}>
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
