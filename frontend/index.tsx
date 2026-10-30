import { LocaleProvider } from "@margince/frontend/app";
import { createRoot } from "react-dom/client";
import { VoiceMic } from "./mic";
import { TryPage } from "./page";
import "./voice-input.css";

// Core imports every extension's entry when the app starts, and gives a unit
// no place on every field. So the microphone mounts itself beside the app, once.
const hostId = "ext-voice-input-host";
if (typeof document !== "undefined" && !document.getElementById(hostId)) {
  const host = document.createElement("div");
  host.id = hostId;
  document.body.append(host);
  createRoot(host).render(
    <LocaleProvider>
      <VoiceMic />
    </LocaleProvider>,
  );
}

// #/ext/voice-input: what the microphone does, with a field to try it in.
export default TryPage;
