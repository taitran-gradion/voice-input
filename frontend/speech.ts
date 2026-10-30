// The browser's speech recognition, which Chrome, Edge and Safari carry under
// a prefix and Firefox does not carry at all. Typed here because TypeScript's
// DOM library does not declare it.

export type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export type RecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

type RecognitionClass = new () => Recognition;

export function recognitionClass(): RecognitionClass | undefined {
  if (typeof window === "undefined") return undefined;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionClass;
    webkitSpeechRecognition?: RecognitionClass;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
}

// The app's locales, as the language tags recognition listens for.
export const SPEECH_LANG: Record<string, string> = { en: "en-US", de: "de-DE", vi: "vi-VN" };

// The fields a member types prose into. Not a password, a number, a date, an
// address or anything read-only: dictating into those is either unsafe or
// meaningless, since speech comes back as words with spaces between them.
const TEXT_TYPES = new Set(["", "text", "search"]);

export type Editable = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

export function editableOf(node: EventTarget | null): Editable | null {
  if (node instanceof HTMLTextAreaElement) {
    return node.readOnly || node.disabled ? null : node;
  }
  if (node instanceof HTMLInputElement) {
    const type = (node.getAttribute("type") ?? "").toLowerCase();
    return TEXT_TYPES.has(type) && !node.readOnly && !node.disabled ? node : null;
  }
  if (node instanceof HTMLElement && node.isContentEditable) return node;
  return null;
}

/**
 * Types words into a field at its cursor, as a keystroke would, so the screen
 * that owns the field hears an input event and keeps its own state.
 *
 * setRangeText changes the value without going through the value setter React
 * watches, so React sees the value differ from the one it last set and calls
 * the field's onChange, exactly as for typing.
 */
export function typeInto(field: Editable, words: string) {
  const text = words.trim();
  if (text === "") return;
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    const before = field.value.slice(0, start);
    const spaced = before === "" || /\s$/.test(before) ? text : ` ${text}`;
    try {
      field.setRangeText(spaced, start, end, "end");
    } catch {
      // A field with no cursor to speak of takes the words at its end, set
      // through the prototype's setter for the same reason as setRangeText.
      const proto = field instanceof HTMLInputElement ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(field, field.value + spaced);
    }
    field.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }
  // A rich-text editor: the editing command keeps its undo history and fires
  // its input event.
  field.focus();
  document.execCommand("insertText", false, ` ${text}`);
}
