// import midiWriterJs from "https://cdn.skypack.dev/midi-writer-js@2.1.4";

export function playNotes(notes) {
    // const track = new midiWriterJs.Track();

    // track.addEvent(new midiWriterJs.ProgramChangeEvent({ instrument: 1 }));
    // track.setTempo(125, 0)

    // for (let i = 0; i < notes.length; i++) {
    //     const n = notes[i]
    //     const e = new midiWriterJs.NoteEvent({ pitch: n, duration: '4' })
    //     track.addEvent(e);
    // }

    // const write = new midiWriterJs.Writer(track);

    // let player = document.getElementById("player")
    // player.src = write.dataUri()

    piano.toDestination();
    piano.triggerAttack(notes);

}