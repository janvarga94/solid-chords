import { playNotes } from "./player.js";


//idea modes: random matching, walking base, most distinct notes for neghbour chords, least, inbetween semitones chord, 

function chordSeminoteToChordName(seminote) {
    switch (seminote) {
        case 1: return "1";
        case 2: return "1#";
        case 3: return "2";
        case 4: return "2#";
        case 5: return "3";
        case 6: return "4";
        case 7: return "4#";
        case 8: return "5";
        case 9: return "5#";
        case 10: return "6";
        case 11: return "6#";
        case 12: return "7";
        default: throw new Error("bad seminote", seminote)
    }
}

function getAllChordsForSeminote(seminote, excludeSelf) {
    let chords = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].flatMap(chordKey => {
        if (excludeSelf && seminote === chordKey) return [];

        function norm(semis) {
            return semis.map(key => key === 12 ? 12 : key % 12);
        }

        function extract(seminotes, type) {
            let seminotesInChord = norm(seminotes);
            if (seminotesInChord.includes(seminote)) {
                return {
                    name: chordSeminoteToChordName(chordKey) + type,
                    type: type,
                    matchingKeySeminotes: [1, 3, 5, 6, 8, 10, 12].filter(value => seminotesInChord.includes(value)).length,
                    matchingFourthSeminotes: norm([1, 3, 5, 6, 8, 10, 12].map(s => s + seminote - 1 + 5)).filter(value => seminotesInChord.includes(value)).length,
                    matchingFifthSeminotes: norm([1, 3, 5, 6, 8, 10, 12].map(s => s + seminote - 1 + 7)).filter(value => seminotesInChord.includes(value)).length,
                    key: chordKey,
                    seminotes: seminotesInChord,
                }
            }
        }

        let majors = extract([chordKey, chordKey + 4, chordKey + 7], "major",);
        let minors = extract([chordKey, chordKey + 3, chordKey + 7], "minor",);
        let sus4s = extract([chordKey, chordKey + 5, chordKey + 7], "sus4",);
        let sus2s = extract([chordKey, chordKey + 3, chordKey + 7], "sus2",);
        let domSevens = extract([chordKey, chordKey + 4, chordKey + 7, chordKey + 10], "dom7",);
        let minSevens = extract([chordKey, chordKey + 3, chordKey + 7, chordKey + 10], "min7",);
        let majSevens = []// extract([chordKey, chordKey + 4, chordKey + 7, chordKey + 11], "maj7",);
        // let diminished = extract([chordKey, chordKey + 3, chordKey + 6, chordKey + 9], "dim",);

        return [majors, minors, sus4s, sus2s, domSevens, majSevens, minSevens];
    }).filter(Boolean);
    return chords;
}

let keys = document.getElementById("keys");

function resetKeyColors() {
    document.querySelectorAll("[seminoteNumber]").forEach(oneKeyEl => {
        let seminote = +oneKeyEl.getAttribute("seminoteNumber");
        if ([2, 4, 7, 9, 11].includes(seminote)) {
            let keyOffset = seminote === 2 ? 1.5 : seminote === 4 ? 2.5 : seminote === 7 ? 4.5 : seminote === 9 ? 5.5 : 6.5;
            oneKeyEl.style.backgroundColor = "black";
            oneKeyEl.style.color = "white";
            oneKeyEl.style.height = "70px";
            oneKeyEl.style.position = "fixed";
            oneKeyEl.style.left = (-10 + keyOffset * 20 + seminote - 1) + "px";
            oneKeyEl.style.width = "16px";
        } else {
            oneKeyEl.style.backgroundColor = "white";
            oneKeyEl.style.color = "black";
            oneKeyEl.style.height = "100px";
            oneKeyEl.style.width = "20px";
        }
    })
}

[...Array(88).keys()].forEach(seminote => {
    seminote = seminote % 12 + 1; 
    let octave = Math.floor(seminote / 12) + 1;
    let key = document.createElement("div");
    key.setAttribute("style", "border: solid 1px black;display: inline-flex; justify-content:center");
    keys.appendChild(key)
    key.innerHTML = `<div style="height:20px;align-self: flex-end ">${chordSeminoteToChordName(seminote)}</div>`;
    key.setAttribute("seminoteNumber", seminote);
    key.addEventListener("mousedown", () => {
        resetKeyColors();
        let chords = getAllChordsForSeminote(seminote);
        let specialChords = chords.filter(c => c.matchingFifthSeminotes >= 3);
        let randomChord = specialChords[Math.floor(Math.random() * specialChords.length)];
        console.log("prev fifth chords", chords.filter(c => c.matchingFourthSeminotes >= 3));
        console.log("next fifth chords", chords.filter(c => c.matchingFifthSeminotes >= 3));
        // console.log("chords", chords);
        // console.log("random chord", randomChord);
        randomChord.seminotes.forEach(semi => {
            let el = document.querySelector(`[seminoteNumber="${semi}"]`);
            if (el) {
                el.style.backgroundColor = el.style.backgroundColor === "black" ? "rgb(155,155,0)" : "yellow";
                el.style.color = "black";
            }
        })
        let mappedNotes = randomChord.seminotes.map((semi) => {
            let futureLowestNoteIndex = Math.floor(Math.random() * randomChord.seminotes.length); 
            return semitoneToMIDIWriterMapper(semi, randomChord.seminotes.indexOf(semi) <= futureLowestNoteIndex ? octave:octave + 1)
        });
        playNotes([...mappedNotes, semitoneToMIDIWriterMapper(seminote, 6)])
        document.getElementById("chordInfo").innerHTML = randomChord.name;
    })
});

resetKeyColors();

function semitoneToMIDIWriterMapper(seminote, octave) {
    octave = octave || "";
    switch (seminote) {
        case 1: return "C" + octave;
        case 2: return "C#" + octave;
        case 3: return "D" + octave;
        case 4: return "D#" + octave;
        case 5: return "E" + octave;
        case 6: return "F" + octave;
        case 7: return "F#" + octave;
        case 8: return "G" + octave;
        case 9: return "G#" + octave;
        case 10: return "A" + octave;
        case 11: return "A#" + octave;
        case 12: return "B" + octave;
    }
}