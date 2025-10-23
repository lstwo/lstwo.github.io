let names = [];

const nullReplacements = [
    "undefined",
    "null",
    "caethecow",
    "gabtinte",
    "usecode404",
    "usecodefourofourfortwentypercentoff",
    "lstwomods",
    "azzamods",
    "integer",
    "boolean",
    "raymond",
    "wobblysfav",
    "traubedev",
    "blammo",
    "lstwo",
    "daydreamer",
    "beffi",
    "ashley",
    "blclayton",
    "moonbird",
    "tom",
    "will",
    "william",
    "alex",
    "mark",
    "luci",
    "maze",
    "jellyman",
    "grandma",
    "forloop",
    "while",
    "for",
    "if",
    "byte",
    "kilobyte",
    "pointer",
    "vector",
    "string",
    "array",
    "thread",
    "compiler",
    "namespace",
    "char",
    "reference",
    "exception",
    "error",
    "this",
    "class",
    "wildepommes",
    "chatgpt",
    "rubberbandgames",
    "grok",
    "il2cpp",
    "c#",
    "python",
    "javascript",
    "html",
    "css",
    "c++",
    "c",
    "x86assembly",
    "rust",
    "typescript",
    "ruby",
    "branflakes",
    "brainfuck",
    "brick",
    "nintendowii",
    "raspberrypi",
    "discord",
    "nullyukiclonegenerator",
    "freakycheesy",
    "mazelabz",
    "cheesy",
    "",
    "missing",
    "empty",
    "nullreferenceexception",
    "visualstudio",
    "vscode",
    "yuki",
    "ryzen4070",
    "true",
    "false",
    "none",
    "404",
    "iamrunningoutofideas",
    "android",
    "linux",
    "archlinux",
    "iusearchbtw",
    "fixtheexploit",
    "wobblymod",
    "blammooooooo",
    "releasethefiles",
    "pleasehelpme"
];

loadNames();

async function loadNames() {
    const response = await fetch('https://gist.githubusercontent.com/elifiner/cc90fdd387449158829515782936a9a4/raw/fea1da1a3c4ce5c8e470f679a8e1bc741281a609/first-names.txt').catch(err => {
        console.log(err);
        document.getElementById("username").innerText = "ERROR: " + err;
    });

    names = (await response.text()).split("\n");
    console.log(names.length);
}

function generate() {
    if(Math.random() < 0.011) {
        let num = Math.random();

        if(num < 0.333) {
            document.getElementById("username").innerText = "Ashley";
        }
        else if(num < 0.666) {
            document.getElementById("username").innerText = "Beffi";
        }
        else {
            document.getElementById("username").innerText = "theyoungdaydreamer";
        }

        return;
    }

    let nullReplacement = nullReplacements[Math.floor(Math.random() * nullReplacements.length)].toUpperCase();
    const name = names[Math.floor(Math.random() * names.length)];
    let separator = "|"

    if(Math.random() < 0.05) {

        if(Math.random() < 0.5) {
            separator = "I";
        }
        else {
            separator = "l";
        }
    }

    document.getElementById("username").innerText = nullReplacement + "YUKI " + separator + " " + String(name).charAt(0).toUpperCase() + String(name).slice(1);
}