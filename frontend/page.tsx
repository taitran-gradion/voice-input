import { useT } from "@margince/frontend/app";
import { Callout, Card, SectionHeader } from "@margince/frontend/design-system";
import { recognitionClass } from "./speech";

// #/ext/voice-input: what the microphone does, with a field to try it in.
export function TryPage() {
  const t = useT();
  return (
    <div className="wrap">
      <SectionHeader title={t("extVoiceInput.title")} level={1} />
      <p>{t("extVoiceInput.sub")}</p>
      {!recognitionClass() && (
        <Callout tone="warning" title={t("extVoiceInput.unsupported")}>
          {t("extVoiceInput.unsupportedBody")}
        </Callout>
      )}
      <Card>
        <textarea className="textarea" rows={5} placeholder={t("extVoiceInput.try")} aria-label={t("extVoiceInput.try")} />
        <p className="t-caption">{t("extVoiceInput.privacy")}</p>
      </Card>
    </div>
  );
}
