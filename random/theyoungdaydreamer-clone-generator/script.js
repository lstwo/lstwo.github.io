function generate() {
    const the_replacements = [
        { word: "the", plural: false },
        { word: "a", plural: false },
        { word: "some", plural: true },
        { word: "several", plural: true },
        { word: "many", plural: true },
        { word: "afew", plural: true },
        { word: "multiple", plural: true },
        { word: "each", plural: false },
        { word: "every", plural: false },
        { word: "another", plural: false },
        { word: "this", plural: false },
        { word: "that", plural: false },
        { word: "these", plural: true },
        { word: "those", plural: true }
    ];

    const young_replacements = [
        { word: "young", starts_with_vowel: true },
        { word: "youthful", starts_with_vowel: true },
        { word: "juvenile", starts_with_vowel: false },
        { word: "teenage", starts_with_vowel: false },
        { word: "teen", starts_with_vowel: false },
        { word: "junior", starts_with_vowel: false },
        { word: "grown", starts_with_vowel: false },
        { word: "adult", starts_with_vowel: true },
        { word: "middleaged", starts_with_vowel: false },
        { word: "aged", starts_with_vowel: true },
        { word: "elderly", starts_with_vowel: true },
        { word: "senior", starts_with_vowel: false },
        { word: "ancient", starts_with_vowel: true },
        { word: "venerable", starts_with_vowel: false },
        { word: "old", starts_with_vowel: true },
        { word: "wizened", starts_with_vowel: false }
    ];

    const day_replacements = [
        "day",
        "morning",
        "afternoon",
        "evening",
        "dawn",
        "sunrise",
        "noon",
        "midday",
        "twilight",
        "dusk"
    ];

    const dreamer_replacements = [
        { singular: "dreamer", plural: "dreamers" },
        { singular: "visionary", plural: "visionaries" },
        { singular: "idealist", plural: "idealists" },
        { singular: "fantasizer", plural: "fantasizers" },
        { singular: "believer", plural: "believers" },
        { singular: "stargazer", plural: "stargazers" },
        { singular: "imaginer", plural: "imaginers" },
        { singular: "thinker", plural: "thinkers" },
        { singular: "creator", plural: "creators" },
        { singular: "visioneer", plural: "visioneers" },
        { singular: "storyteller", plural: "storytellers" },
        { singular: "seeker", plural: "seekers" },
        { singular: "visionholder", plural: "visionholders" },
        { singular: "marer", plural: "marers" },
        { singular: "stalker", plural: "stalkers" },
        { singular: "observer", plural: "observers" },
    ];

    let the_replacement = the_replacements[Math.floor(Math.random() * the_replacements.length)];
    let young_replacement = young_replacements[Math.floor(Math.random() * young_replacements.length)];
    let day_replacement = day_replacements[Math.floor(Math.random() * day_replacements.length)];
    let dreamer_replacement = dreamer_replacements[Math.floor(Math.random() * dreamer_replacements.length)];

    if(the_replacement.word === "a" && young_replacement.starts_with_vowel) {
        the_replacement.word = "an";
    }

    document.getElementById("username").innerText = the_replacement.word + young_replacement.word + day_replacement + (the_replacement.plural ? dreamer_replacement.plural : dreamer_replacement.singular);
    document.getElementById("word_display").innerText = the_replacement.word + " " +  young_replacement.word + " " + day_replacement + " " + (the_replacement.plural ? dreamer_replacement.plural : dreamer_replacement.singular);
}