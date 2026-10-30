import { useLocale, useT } from "@margince/frontend/app";
import { Mic, MicOff } from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { type Editable, editableOf, type Recognition, recognitionClass, SPEECH_LANG, typeInto } from "./speech";

const BUTTON = 28;
const INSET = 4;

type State = "idle" | "listening" | "blocked";

/**
 * The microphone on whichever text field has focus, anywhere in the app.
 * Pressing it, or Alt+V in the field, dictates into the field until it is
 * pressed again, the field loses focus, or Esc.
 */
export function VoiceMic() {
  const t = useT();
  const { locale } = useLocale();
  const [field, setField] = useState<Editable | null>(null);
  const [state, setState] = useState<State>("idle");
  const [heard, setHeard] = useState("");
  const [, reposition] = useState(0);
  const recognition = useRef<Recognition | null>(null);
  const button = useRef<HTMLButtonElement>(null);

  const stop = useCallback(() => {
    recognition.current?.stop();
    recognition.current = null;
    setHeard("");
    setState((now) => (now === "listening" ? "idle" : now));
  }, []);

  const start = useCallback(
    (target: Editable) => {
      const Speech = recognitionClass();
      if (!Speech) return;
      recognition.current?.abort();
      const listener = new Speech();
      listener.lang = SPEECH_LANG[locale] ?? "en-US";
      listener.continuous = true;
      listener.interimResults = true;
      listener.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;
          if (result.isFinal) typeInto(target, result[0].transcript);
          else interim += result[0].transcript;
        }
        setHeard(interim);
      };
      listener.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") setState("blocked");
      };
      listener.onend = () => {
        if (recognition.current === listener) {
          recognition.current = null;
          setHeard("");
          setState((now) => (now === "listening" ? "idle" : now));
        }
      };
      recognition.current = listener;
      setState("listening");
      listener.start();
    },
    [locale],
  );

  useEffect(() => {
    if (!recognitionClass()) return;
    const focus = (event: FocusEvent) => {
      if (event.target === button.current) return;
      const next = editableOf(event.target);
      setField((current) => {
        if (current !== next) stop();
        return next;
      });
    };
    const blur = (event: FocusEvent) => {
      // Pressing the microphone keeps focus in the field (see onMouseDown), so
      // a blur is the member moving on.
      if (event.relatedTarget === button.current) return;
      if (editableOf(event.target)) {
        stop();
        setField(null);
      }
    };
    const key = (event: KeyboardEvent) => {
      const target = editableOf(event.target);
      if (!target) return;
      if (event.altKey && event.code === "KeyV") {
        event.preventDefault();
        if (recognition.current) stop();
        else start(target);
      } else if (event.key === "Escape" && recognition.current) {
        stop();
      }
    };
    const move = () => reposition((n) => n + 1);
    document.addEventListener("focusin", focus);
    document.addEventListener("focusout", blur);
    document.addEventListener("keydown", key, true);
    window.addEventListener("scroll", move, true);
    window.addEventListener("resize", move);
    return () => {
      document.removeEventListener("focusin", focus);
      document.removeEventListener("focusout", blur);
      document.removeEventListener("keydown", key, true);
      window.removeEventListener("scroll", move, true);
      window.removeEventListener("resize", move);
      recognition.current?.abort();
    };
  }, [start, stop]);

  if (!field || !field.isConnected) return null;
  const label =
    state === "listening"
      ? t("extVoiceInput.stop")
      : state === "blocked"
        ? t("extVoiceInput.blocked")
        : t("extVoiceInput.start");
  return (
    <>
      <button
        ref={button}
        type="button"
        className={`ext-voice-input-mic is-${state}`}
        style={placeAt(field)}
        aria-label={label}
        aria-pressed={state === "listening"}
        title={label}
        // Keep the caret where the member left it: the words go there.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (recognition.current) stop();
          else start(field);
        }}
      >
        {state === "blocked" ? <MicOff size={16} aria-hidden /> : <Mic size={16} aria-hidden />}
      </button>
      {state === "listening" && (
        <div className="ext-voice-input-heard" style={bubbleAt(field)} aria-live="polite">
          {heard || t("extVoiceInput.listening")}
        </div>
      )}
    </>
  );
}

// Inside the field's right edge: centred on a one-line input, at the top of a
// text area or an editor.
function placeAt(field: Editable): CSSProperties {
  const rect = field.getBoundingClientRect();
  const oneLine = field instanceof HTMLInputElement;
  const top = oneLine ? rect.top + (rect.height - BUTTON) / 2 : rect.top + INSET;
  return { top, left: rect.right - BUTTON - INSET };
}

// What is being heard, under the field, until it is final and typed in.
function bubbleAt(field: Editable): CSSProperties {
  const rect = field.getBoundingClientRect();
  return { top: rect.bottom + 4, left: rect.left, maxWidth: Math.max(rect.width, 240) };
}
