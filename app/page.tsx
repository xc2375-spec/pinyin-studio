"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tab = "learn" | "tones" | "sounds" | "practice";
type AnswerState = "idle" | "correct" | "wrong";

const siteAsset = (src: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${src}`;

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "learn", label: "Learn", icon: "A" },
  { id: "tones", label: "Tones", icon: "↗" },
  { id: "sounds", label: "Sounds", icon: "口" },
  { id: "practice", label: "Practice", icon: "✓" },
];

const tones = [
  { n: 1, mark: "ā", name: "high level", contour: "55", audio: "/audio/a1.wav", shape: "level" },
  { n: 2, mark: "á", name: "rising", contour: "35", audio: "/audio/a2.wav", shape: "rise" },
  { n: 3, mark: "ǎ", name: "low / dipping", contour: "214", audio: "/audio/a3.wav", shape: "dip" },
  { n: 4, mark: "à", name: "falling", contour: "51", audio: "/audio/a4.wav", shape: "fall" },
  { n: 0, mark: "a", name: "neutral", contour: "short · light", audio: "/audio/a5.wav", shape: "neutral" },
];

const toneExamples = [
  { tone: 1, items: [["huā", "hua1"], ["kuā", "kua1"], ["niē", "nie1"], ["liāo", "liao1"]] },
  { tone: 2, items: [["féi", "fei2"], ["liáo", "liao2"]] },
  { tone: 3, items: [["gěi", "gei3"], ["xiǔ", "xiu3"]] },
  { tone: 4, items: [["zuì", "zui4"], ["yuè", "yue4"], ["lüè", "lue4"]] },
];

const sandhiExamples = [
  { title: "3 + 3 → 2 + 3", note: "The first third tone becomes rising.", items: [["nǐ hǎo", "nihao"], ["lǎobǎn", "laoban"], ["xiǎozǔ", "xiaozu"], ["hěn hǎo", "henhao"]] },
  { title: "Low third before other tones", note: "Keep the third tone low; do not add the final rise.", items: [["jǐnzhāng", "jinzhang"], ["jiěfàng", "jiefang"], ["xǐhuan", "xihuan"], ["huǒchē", "huoche"], ["qǐchuáng", "qichuang"], ["bǐjì", "biji"]] },
];

const soundGroups = [
  { title: "Alveolo-palatal", cue: "Tongue blade forward; lips spread", sounds: [["jī", "ji1"], ["qī", "qi1"], ["xī", "xi1"]] },
  { title: "Retroflex", cue: "Tongue tip raised and slightly back", sounds: [["zhī", "zhi1"], ["chī", "chi1"], ["shī", "shi1"], ["rī", "ri"]] },
  { title: "Dental / alveolar", cue: "Tongue tip behind lower teeth", sounds: [["zī", "zi1"], ["cī", "ci1"], ["sī", "si1"]] },
];

const basicVowels = [["a", "vowel-a"], ["o", "vowel-o"], ["e", "vowel-e"], ["i", "vowel-i"], ["u", "vowel-u"], ["ü", "vowel-v"]];
const compoundFinals = [["ai", "ai"], ["ei", "ei"], ["ao", "ao"], ["ou", "ou"], ["ia", "ia"], ["ie", "ie"], ["ua", "ua"], ["iu", "iu"], ["ui", "ui"], ["üe", "ve"]];
const familiarInitials = [
  { label: "Lip sounds", cue: "lips / lip + teeth", sounds: [["bō", "bo"], ["pō", "po"], ["mō", "mo"], ["fō", "fo"]] },
  { label: "Tongue tip", cue: "at the alveolar ridge", sounds: [["dē", "de"], ["tē", "te"], ["nē", "ne"], ["lē", "le"]] },
  { label: "Tongue back", cue: "at the soft palate", sounds: [["gē", "ge"], ["kē", "ke"], ["hē", "he"]] },
];

const practiceQuestions = [
  { group: "Tones", prompt: "Which tone do you hear?", audio: "/audio/a1.wav", choices: ["Tone 1", "Tone 2", "Tone 3", "Tone 4"], answer: 0, note: "Tone 1 stays high and level: 55." },
  { group: "Tones", prompt: "Which tone do you hear?", audio: "/audio/a2.wav", choices: ["Tone 1", "Tone 2", "Tone 3", "Tone 4"], answer: 1, note: "Tone 2 rises from mid to high: 35." },
  { group: "Tones", prompt: "Which tone do you hear?", audio: "/audio/a3.wav", choices: ["Tone 1", "Tone 2", "Tone 3", "Tone 4"], answer: 2, note: "In isolation, Tone 3 is low and may dip then rise: 214." },
  { group: "Tones", prompt: "Which tone do you hear?", audio: "/audio/a4.wav", choices: ["Tone 1", "Tone 2", "Tone 3", "Tone 4"], answer: 3, note: "Tone 4 falls sharply from high to low: 51." },
  { group: "Initials", prompt: "Which syllable do you hear?", audio: "/audio/qi1.wav", choices: ["jī", "qī", "xī"], answer: 1, note: "q is an aspirated alveolo-palatal affricate [tɕʰ]." },
  { group: "Initials", prompt: "Which syllable do you hear?", audio: "/audio/shi1.wav", choices: ["sī", "xī", "shī"], answer: 2, note: "sh is retroflex; the tongue tip is raised slightly back." },
  { group: "Initials", prompt: "Which syllable do you hear?", audio: "/audio/ri.wav", choices: ["lī", "rī", "yī"], answer: 1, note: "Mandarin r is retroflex and friction-like—not an English r." },
  { group: "Initials", prompt: "Which syllable do you hear?", audio: "/audio/ci1.wav", choices: ["zī", "cī", "sī"], answer: 1, note: "c has the strongest air burst in this dental/alveolar set." },
  { group: "Spelling", prompt: "After j, q, or x, written u represents…", choices: ["u", "ü", "ou", "uei"], answer: 1, note: "The dots are dropped after j, q, and x, but the sound remains ü." },
  { group: "Spelling", prompt: "Which is the correct spelling when iang begins a syllable?", choices: ["iang", "yiang", "yang", "iangh"], answer: 2, note: "With no initial, i is rewritten with y: iang → yang." },
  { group: "Spelling", prompt: "What full final is abbreviated by -ui?", choices: ["uei", "iou", "uen", "üei"], answer: 0, note: "-ui is the written abbreviation of -uei." },
  { group: "Spelling", prompt: "Where does the tone mark go in liù?", choices: ["on l", "on i", "on u", "after the word"], answer: 2, note: "In -iu and -ui, place the tone mark on the second vowel." },
  { group: "Tone change", prompt: "How is the first syllable pronounced in hěn hǎo?", choices: ["Tone 1", "Tone 2", "Tone 3", "Tone 4"], answer: 1, note: "Before another third tone, a third tone changes to a rising tone: 3 + 3 → 2 + 3." },
  { group: "Tone change", prompt: "Which form is pronounced correctly? 不错", choices: ["bù cuò", "bú cuò", "bū cuò", "bǔ cuò"], answer: 1, note: "不 changes from Tone 4 to Tone 2 before another Tone 4." },
  { group: "Tone change", prompt: "Which form is pronounced correctly? 一个", choices: ["yī ge", "yí ge", "yǐ ge", "yì ge"], answer: 1, note: "一 becomes Tone 2 before a Tone 4 syllable." },
  { group: "Finals", prompt: "Which pair contrasts -n and -ng?", choices: ["mā / má", "jīn / jīng", "zhī / chī", "xué / xuě"], answer: 1, note: "jīn ends with the tongue tip forward; jīng ends with the tongue body raised at the velum." },
  { group: "Vowels", prompt: "Which basic vowel do you hear?", audio: "/audio/vowel-e.wav", choices: ["a", "o", "e", "ü"], answer: 2, note: "Mandarin e is a central/back unrounded vowel; avoid turning it into English /i/." },
  { group: "Vowels", prompt: "Which rounded vowel do you hear?", audio: "/audio/vowel-v.wav", choices: ["i", "u", "ü", "o"], answer: 2, note: "For ü, hold the tongue position of i while rounding the lips." },
  { group: "Finals", prompt: "Which compound final do you hear?", audio: "/audio/ai.wav", choices: ["ai", "ao", "ei", "ou"], answer: 0, note: "ai begins open at a and glides toward i." },
  { group: "Finals", prompt: "Which compound final do you hear?", audio: "/audio/ve.wav", choices: ["ie", "üe", "ou", "ei"], answer: 1, note: "üe begins with rounded ü and glides toward e." },
  { group: "Initials", prompt: "Which syllable begins with the aspirated lip sound?", audio: "/audio/po.wav", choices: ["bō", "pō", "mō", "fō"], answer: 1, note: "p is aspirated; place a hand before your mouth to feel the air burst." },
  { group: "Initials", prompt: "Which syllable begins with the aspirated tongue-tip sound?", audio: "/audio/te.wav", choices: ["dē", "tē", "nē", "lē"], answer: 1, note: "t is aspirated; d is its unaspirated partner." },
  { group: "Initials", prompt: "Which syllable begins with the aspirated tongue-back sound?", audio: "/audio/ke.wav", choices: ["gē", "kē", "hē"], answer: 1, note: "k is aspirated; g is its unaspirated partner." },
  { group: "Finals", prompt: "Which final do you hear?", audio: "/audio/ou.wav", choices: ["ao", "ou", "ei", "ie"], answer: 1, note: "ou starts with a rounded mid vowel and glides toward u." },
];

function playAudio(src: string, onDone?: () => void) {
  const audio = new Audio(siteAsset(src));
  audio.onended = () => onDone?.();
  audio.onerror = () => onDone?.();
  void audio.play();
}

function AudioButton({ src, compact = false }: { src: string; compact?: boolean }) {
  const [playing, setPlaying] = useState(false);
  return <button className={`audioButton ${compact ? "compact" : ""} ${playing ? "playing" : ""}`} onClick={() => { setPlaying(true); playAudio(src, () => setPlaying(false)); }} aria-label="Play native-speaker recording">
    <span>{playing ? "■" : "▶"}</span>{compact ? "" : playing ? "Playing" : "Listen"}
  </button>;
}

function ToneShape({ shape }: { shape: string }) {
  return <div className={`toneShape ${shape}`} aria-hidden="true"><i></i>{shape === "dip" && <b></b>}</div>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("learn");
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(0);
  const topRef = useRef<HTMLElement>(null);
  const current = practiceQuestions[question];
  const progress = useMemo(() => Math.round((completed / 4) * 100), [completed]);

  useEffect(() => {
    const saved = Number(localStorage.getItem("pinyin-progress") || 0);
    if (Number.isFinite(saved)) setCompleted(Math.min(saved, 4));
  }, []);

  function go(next: Tab) {
    setTab(next);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function markComplete(step: number, next?: Tab) {
    const value = Math.max(completed, step);
    setCompleted(value);
    localStorage.setItem("pinyin-progress", String(value));
    if (next) go(next);
  }

  function check(choice: number) {
    if (answer !== null) return;
    setAnswer(choice);
    const correct = choice === current.answer;
    setAnswerState(correct ? "correct" : "wrong");
    if (correct) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (question === practiceQuestions.length - 1) {
      markComplete(4);
      setQuestion(0);
      setScore(0);
    } else setQuestion((value) => value + 1);
    setAnswer(null);
    setAnswerState("idle");
  }

  return <main ref={topRef}>
    <header className="appHeader">
      <div><span className="courseLabel">Mandarin I · Pronunciation Lab</span><h1>Pinyin Studio</h1></div>
      <div className="progressRing" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div>
    </header>

    <div className="content">
      {tab === "learn" && <section className="screen learnScreen">
        <div className="eyebrow">Week 1 · the system at a glance</div>
        <h2>You already speak.<br/>So what is Pinyin for?</h2>
        <p className="intro">Pinyin makes Mandarin sounds visible. It helps you type, use dictionaries, monitor your pronunciation, and mark new words.</p>

        <div className="purposeGrid">
          <article><span>01</span><strong>Typing</strong><p>Type what you can already say.</p></article>
          <article><span>02</span><strong>Dictionaries</strong><p>Find an unfamiliar character.</p></article>
          <article><span>03</span><strong>Self-monitoring</strong><p>See where your speech differs.</p></article>
          <article><span>04</span><strong>New words</strong><p>Add a temporary pronunciation guide.</p></article>
        </div>

        <div className="learnLabel"><span>01</span><strong>One syllable = initial + final + tone</strong></div>

        <article className="syllableCard">
          <div className="syllableWord"><span>zh</span><b>ōng</b></div>
          <div className="formula">
            <div><small>INITIAL</small><strong>zh</strong><span>beginning</span></div>
            <i>+</i>
            <div><small>FINAL</small><strong>ong</strong><span>the rest</span></div>
            <i>+</i>
            <div><small>TONE</small><strong>1</strong><span>high level</span></div>
          </div>
        </article>

        <div className="learnLabel"><span>02</span><strong>The 21 initials, grouped by the mouth</strong></div>
        <div className="systemMap">
          <article><strong>b p m f</strong><p>lips / lip + teeth</p></article>
          <article><strong>d t n l</strong><p>tongue tip</p></article>
          <article><strong>g k h</strong><p>back of the tongue</p></article>
          <article><strong>j q x</strong><p>tongue blade, high and front</p></article>
          <article><strong>zh ch sh r</strong><p>retroflex—tongue tip raised back</p></article>
          <article><strong>z c s</strong><p>dental / alveolar</p></article>
        </div>

        <div className="learnLabel"><span>03</span><strong>Finals: simple, compound, and nasal</strong></div>
        <div className="finalFamilies">
          <article><span>Simple</span><p>a · o · e · i · u · ü</p></article>
          <article><span>Compound</span><p>ai · ei · ao · ou · ia · ie · ua · uo · üe</p></article>
          <article><span>Nasal -n</span><p>an · en · in · un · ün</p></article>
          <article><span>Nasal -ng</span><p>ang · eng · ing · ong</p></article>
        </div>
        <div className="audioShelf">
          <div className="mapHeading"><span>Hear the six vowels</span><small>Native-speaker models</small></div>
          <div>{basicVowels.map(([label, file]) => <button key={file} onClick={() => playAudio(`/audio/${file}.wav`)}><b>{label}</b><span>▶</span></button>)}</div>
        </div>
        <div className="finalAudioShelf">
          <div className="mapHeading"><span>Hear compound finals</span><small>Tap · listen · repeat</small></div>
          <div>{compoundFinals.map(([label, file]) => <button key={file} onClick={() => playAudio(`/audio/${file}.wav`)}><b>{label}</b><span>▶ listen</span></button>)}</div>
        </div>

        <div className="learnLabel"><span>04</span><strong>Three spelling patterns to recognize</strong></div>
        <div className="spellingLessons">
          <details open><summary>When do the dots of ü disappear?<span>＋</span></summary><div><p><b>nǚ · lǜ</b> — dots stay after n and l.</p><p><b>jù · qù · xué · yú</b> — dots disappear after j, q, x, and y; the sound is still ü.</p></div></details>
          <details><summary>Three abbreviated finals<span>＋</span></summary><div className="abbr"><p><b>-iu</b><span>= iou</span></p><p><b>-ui</b><span>= uei</span></p><p><b>-un</b><span>= uen</span></p></div></details>
          <details><summary>y and w are spelling, not new sounds<span>＋</span></summary><div><p><b>i → yi / y-</b> &nbsp; yī · yā · yīng</p><p><b>u → wu / w-</b> &nbsp; wǔ · wǒ · wáng</p><p><b>ü → yu</b> &nbsp; yú · yuè · yún</p></div></details>
        </div>
        <button className="primary" onClick={() => markComplete(1, "tones")}>Continue to tone lab <span>→</span></button>
      </section>}

      {tab === "tones" && <section className="screen">
        <div className="sectionTitle"><div className="eyebrow">Listen · imitate · compare</div><h2>Tone lab</h2><p>Pitch numbers are relative: 5 is high, 1 is low. Match the contour, not a musical note.</p></div>
        <div className="toneList">
          {tones.map((tone) => <article className="toneCard" key={tone.n}>
            <div className="toneNumber">{tone.n || "N"}</div>
            <div className="toneMark">{tone.mark}</div>
            <div className="toneMeta"><strong>{tone.name}</strong><span>{tone.contour}</span></div>
            <ToneShape shape={tone.shape}/>
            <AudioButton src={tone.audio} compact/>
          </article>)}
        </div>
        <div className="toneExampleLab">
          <div className="mapHeading"><span>Tone on real syllables</span><small>11 native-speaker models</small></div>
          {toneExamples.map(group => <article key={group.tone}><span className="exampleTone">T{group.tone}</span><div>{group.items.map(([label,file]) => <button key={file} onClick={() => playAudio(`/audio/${file}.wav`)}><b>{label}</b><small>▶ listen</small></button>)}</div></article>)}
        </div>
        <aside className="conceptNote"><strong>In connected speech</strong><p>A third tone is often mainly low. Before another third tone, the first changes to a rising tone.</p><span>3 + 3 → 2 + 3</span></aside>
        <div className="sandhiLab">
          <div className="mapHeading"><span>Hear tone change in context</span><small>Native-speaker phrases</small></div>
          <article className="comparePhrase"><header><strong>Hear the change</strong><small>two syllables → one phrase</small></header><div><button onClick={() => playAudio("/audio/ni3.wav")}><b>nǐ</b><span>▶ isolated</span></button><i>+</i><button onClick={() => playAudio("/audio/hao3.wav")}><b>hǎo</b><span>▶ isolated</span></button><i>→</i><button onClick={() => playAudio("/audio/nihao.wav")}><b>ní hǎo</b><span>▶ together</span></button></div></article>
          {sandhiExamples.map(group => <article className="sandhiSet" key={group.title}><header><strong>{group.title}</strong><small>{group.note}</small></header><div>{group.items.map(([label,file]) => <button key={file} onClick={() => playAudio(`/audio/${file}.wav`)}><b>{label}</b><span>▶ listen</span></button>)}</div></article>)}
        </div>
        <div className="toneRules">
          <article><span>不 before Tone 4</span><strong>bù cuò → bú cuò</strong><p>Fourth tone changes to rising before another fourth tone.</p></article>
          <article><span>一 changes by context</span><strong>yí ge · yì qǐ</strong><p>Rising before Tone 4; falling before Tones 1, 2, or 3.</p></article>
        </div>
        <button className="primary" onClick={() => markComplete(2, "sounds")}>Continue to sound lab <span>→</span></button>
        <p className="credit">Recordings: University of Oxford, CTCFL.</p>
      </section>}

      {tab === "sounds" && <section className="screen">
        <div className="sectionTitle"><div className="eyebrow">Place · manner · aspiration</div><h2>Sound lab</h2><p>Compare the tongue position first. Then notice whether there is a strong burst of air.</p></div>
        <div className="soundGroups">
          {soundGroups.map((group) => <article className="soundCard" key={group.title}>
            <header><div><h3>{group.title}</h3><p>{group.cue}</p></div><span>3-way contrast</span></header>
            <div className="soundButtons">
              {group.sounds.map(([label, file], i) => <button onClick={() => playAudio(`/audio/${file}.wav`)} key={file}><b>{label}</b><span>▶ listen</span><small>{label === "rī" ? "retroflex approximant" : i === 1 ? "aspirated" : i === 2 ? "fricative" : "unaspirated"}</small></button>)}
            </div>
          </article>)}
        </div>
        <aside className="airTest"><span>Quick check</span><div><strong>j · zh · z</strong><small>short onset</small></div><i>vs.</i><div><strong>q · ch · c</strong><small>strong air burst</small></div></aside>
        <div className="familiarSounds">
          <div className="mapHeading"><span>Other initials</span><small>Tap every syllable</small></div>
          {familiarInitials.map(group => <article key={group.label}><header><strong>{group.label}</strong><small>{group.cue}</small></header><div>{group.sounds.map(([label,file]) => <button key={file} onClick={() => playAudio(`/audio/${file}.wav`)}><b>{label}</b><span>▶</span></button>)}</div></article>)}
        </div>
        <button className="primary" onClick={() => markComplete(3, "practice")}>Start listening practice <span>→</span></button>
        <p className="credit">Recordings: University of Oxford, CTCFL.</p>
      </section>}

      {tab === "practice" && <section className="screen practiceScreen">
        <div className="quizTop"><div><div className="eyebrow">24 questions · 6 skills</div><h2>Practice</h2></div><span>{question + 1} / {practiceQuestions.length}</span></div>
        <div className="quizGroup"><span>{current.group}</span><small>Score {score}</small></div>
        <div className="quizProgress"><i style={{ width: `${((question + 1) / practiceQuestions.length) * 100}%` }}></i></div>
        <article className="quizCard">
          <p>{current.prompt}</p>
          {current.audio ? <button className="bigListen" onClick={() => playAudio(current.audio)}><span>▶</span><strong>Play recording</strong><small>Native-speaker audio</small></button> : <div className="thinkingPrompt"><span>Think first</span><strong>Use the spelling or tone rule.</strong></div>}
          <div className="choices">
            {current.choices.map((choice, i) => <button key={choice} disabled={answer !== null} className={answer === null ? "" : i === current.answer ? "correct" : i === answer ? "wrong" : "dim"} onClick={() => check(i)}><span>{String.fromCharCode(65 + i)}</span>{choice}</button>)}
          </div>
          {answerState !== "idle" && <div className={`feedback ${answerState}`}><strong>{answerState === "correct" ? "Correct" : "Not quite"}</strong><p>{current.note}</p></div>}
        </article>
        {answer !== null && <button className="primary" onClick={nextQuestion}>{question === practiceQuestions.length - 1 ? `Finish · ${score + (answerState === "correct" ? 0 : 0)}/${practiceQuestions.length}` : "Next question"}<span>→</span></button>}
        <p className="practiceHint">Use headphones. Replay as often as needed before answering.</p>
      </section>}
    </div>

    <nav className="bottomNav" aria-label="Learning sections">
      {tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => go(item.id)}><span>{item.icon}</span>{item.label}</button>)}
    </nav>
  </main>;
}
