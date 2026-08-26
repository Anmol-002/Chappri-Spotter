import asyncio
from pathlib import Path
import edge_tts

OUT = Path(__file__).resolve().parents[1] / "public" / "voice"
OUT.mkdir(parents=True, exist_ok=True)

LINES = {
    "map": {
        "baddie": ["एक्सक्यूज़ मी, ये एरिया मेरे नाम बुक है।", "मेन कैरेक्टर आ गई है, रास्ता दो।"],
        "chapri": ["हट जा बे, रील बन रही है!", "क्या बोलती पब्लिक, क्या चल रहा है!"],
        "gym": ["साइड हो जा, प्रोटीन का टाइम है!", "चेस्ट डे है भाई, पंप का रिस्पेक्ट कर!"],
        "traffic": ["हॉर्न बजा के बताऊँगा, साइड हो!", "इंडिकेटर ऑप्शनल है, एटीट्यूड नहीं!"],
        "uncle": ["आंटी नेटवर्क चैट में आ गया है!", "संस्कार चेक चल रहा है, बेटा!"],
        "reel": ["ट्राइपॉड को हाथ मत लगाना, टेक चल रहा है!"],
        "aura": ["वाइब चेक पास है, तुम्हारे एक्सक्यूज़ नहीं।"],
        "npc": ["डायलॉग ऑप्शन नहीं मिला, बाद में आना।"],
    },
    "fight": {
        "baddie": ["मेरी चोटी छोड़! बहुत मारूँगी तेरे को!", "आआआआ! साली, तेरे को बताती हूँ!"],
        "chapri": ["हट जा बे, अब पब्लिक देखेगी!", "क्या बोलती पब्लिक, पूरा सीन चालू है!"],
        "gym": ["प्रोटीन पावर्ड अपरकट!", "फॉर्म देख, फॉर्म!"],
        "traffic": ["बीप बीप, साइड हो!", "रॉन्ग साइड से आया हूँ!"],
        "uncle": ["मम्मी पापा को बोलूँगा!", "बालकनी सीसीटीवी चालू है!"],
        "reel": ["कैमरा ऑन है, ड्रामा दे!", "कंटेंट मिल गया भाई!"],
        "aura": ["ऑरा से ही नॉकआउट!", "वाइब अनडिफीटेड है!"],
        "npc": ["अनएक्सपेक्टेड बॉस फाइट डिटेक्टेड!"],
    },
}

# Spoken Hindi voices (hi-IN). Female for baddie, male for the rest.
VOICES = {
    "baddie": "hi-IN-SwaraNeural",
    "chapri": "hi-IN-MadhurNeural",
    "gym": "hi-IN-MadhurNeural",
    "traffic": "hi-IN-MadhurNeural",
    "uncle": "hi-IN-MadhurNeural",
    "reel": "hi-IN-MadhurNeural",
    "aura": "hi-IN-MadhurNeural",
    "npc": "hi-IN-MadhurNeural",
}

RATES = {
    "baddie": {"map": "+10%", "fight": "+18%"},
    "chapri": {"map": "+12%", "fight": "+20%"},
    "gym": {"map": "+10%", "fight": "+18%"},
    "traffic": {"map": "+12%", "fight": "+20%"},
    "uncle": {"map": "-8%", "fight": "+4%"},
    "reel": {"map": "+12%", "fight": "+18%"},
    "aura": {"map": "+6%", "fight": "+12%"},
    "npc": {"map": "-6%", "fight": "+2%"},
}


async def render_clip(path, text, voice, rate):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(path))
    print("wrote", path.name)


async def main():
    jobs = []
    for mode, chars in LINES.items():
        for character, lines in chars.items():
            voice = VOICES[character]
            rate = RATES[character][mode]
            for index, text in enumerate(lines):
                path = OUT / f"{character}-{mode}-{index}.mp3"
                jobs.append(render_clip(path, text, voice, rate))
    await asyncio.gather(*jobs)


if __name__ == "__main__":
    asyncio.run(main())
