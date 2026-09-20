import {
  ButtonItem,
  Field,
  PanelSection,
  PanelSectionRow,
  TextField,
  ToggleField,
  showModal,
} from "@decky/ui";
import { FC, useEffect, useState } from "react";
import { Settings } from "./backend";
import GameProfilesModal from "./GameProfilesModal";
import { scanLibrary } from "./scan";
import {
  dropGame,
  effectiveAllowedProfiles,
  refresh,
  snapshot,
  subscribe,
  updateGame,
  updateSettings,
} from "./store";
import { basename, isExcluded } from "./util";

const QamPanel: FC = () => {
  const [settings, setSettings] = useState<Settings | null>(snapshot());
  const [names, setNames] = useState<string[]>(snapshot()?.profiles ?? []);
  const [dirty, setDirty] = useState(false);
  const [scanning, setScanning] = useState<string | null>(null);
  const [newExclusion, setNewExclusion] = useState("");

  useEffect(() => {
    const unsubscribe = subscribe((next) => {
      setSettings({ ...next });
      setNames((current) => (dirty ? current : [...next.profiles]));
    });
    void refresh();
    return unsubscribe;
  }, [dirty]);

  if (!settings) {
    return (
      <PanelSection>
        <PanelSectionRow>Loading…</PanelSectionRow>
      </PanelSection>
    );
  }

  const games = Object.entries(settings.games)
    .filter(
      ([, config]) =>
        config.detected && !isExcluded(config.script, settings.excludedScripts),
    )
    .sort((a, b) => (a[1].name ?? "").localeCompare(b[1].name ?? ""));

  const runScan = async () => {
    setScanning("Scanning…");
    try {
      const found = await scanLibrary(({ done, total, found }) =>
        setScanning(`${done}/${total} checked, ${found} found`),
      );
      setScanning(`Done — ${found} script-launched game${found === 1 ? "" : "s"}`);
    } catch (e) {
      setScanning(`Scan failed: ${e}`);
    }
    setTimeout(() => setScanning(null), 4000);
  };

  return (
    <>
      <PanelSection title="Games">
        {games.length === 0 && (
          <PanelSectionRow>
            <Field
              label="Nothing detected yet"
              description="Scan your library, or just launch a game whose launch options point at a .sh file."
              bottomSeparator="none"
              focusable
            />
          </PanelSectionRow>
        )}

        {games.map(([appId, config]) => (
          <PanelSectionRow key={appId}>
            <ToggleField
              label={config.name || `App ${appId}`}
              description={`${basename(config.script)} · ${
                effectiveAllowedProfiles(config, settings.profiles.length).length
              } of ${settings.profiles.length} profiles`}
              checked={config.enabled}
              onChange={(enabled) => void updateGame(appId, { enabled })}
            />
            <ButtonItem
              layout="below"
              onClick={() =>
                showModal(
                  <GameProfilesModal appId={appId} fallbackName={config.name} />,
                  window,
                )
              }
            >
              Change Profiles...
            </ButtonItem>
          </PanelSectionRow>
        ))}

        <PanelSectionRow>
          <ButtonItem layout="below" disabled={!!scanning} onClick={runScan}>
            {scanning ?? "Scan library for .sh launchers"}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Profiles">
        {names.map((name, index) => (
          <PanelSectionRow key={index}>
            <TextField
              label={`Profile ${index + 1}`}
              value={name}
              onChange={(e) => {
                const next = [...names];
                next[index] = e.target.value;
                setNames(next);
                setDirty(true);
              }}
            />
          </PanelSectionRow>
        ))}

        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => {
              setNames([...names, `Profile ${names.length + 1}`]);
              setDirty(true);
            }}
          >
            Add a profile
          </ButtonItem>
        </PanelSectionRow>

        {names.length > 1 && (
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={() => {
                setNames(names.slice(0, -1));
                setDirty(true);
              }}
            >
              Remove the last profile
            </ButtonItem>
          </PanelSectionRow>
        )}

        {dirty && (
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={async () => {
                await updateSettings({
                  profiles: names.map((n, i) => n.trim() || `Profile ${i + 1}`),
                });
                setDirty(false);
              }}
            >
              Save profile names
            </ButtonItem>
          </PanelSectionRow>
        )}
      </PanelSection>

      <PanelSection title="Excluded scripts">
        <PanelSectionRow>
          <Field
            label="Scripts with these names are never treated as profile scripts. Wildcards work: launch.sh, start-*.sh"
            bottomSeparator="none"
          />
        </PanelSectionRow>

        {(settings.excludedScripts ?? []).map((pattern, index) => (
          <PanelSectionRow key={`${pattern}-${index}`}>
            <ButtonItem
              layout="below"
              onClick={() =>
                void updateSettings({
                  excludedScripts: settings.excludedScripts.filter(
                    (_, i) => i !== index,
                  ),
                })
              }
            >
              {`Remove "${pattern}"`}
            </ButtonItem>
          </PanelSectionRow>
        ))}

        <PanelSectionRow>
          <TextField
            label="Add a name to exclude"
            value={newExclusion}
            onChange={(e) => setNewExclusion(e.target.value)}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={!newExclusion.trim()}
            onClick={async () => {
              const pattern = newExclusion.trim();
              if (!pattern) return;
              const current = settings.excludedScripts ?? [];
              if (!current.includes(pattern)) {
                await updateSettings({ excludedScripts: [...current, pattern] });
              }
              setNewExclusion("");
            }}
          >
            Add exclusion
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Advanced">
        <PanelSectionRow>
          <TextField
            label="Script variable"
            description="The assignment rewritten inside the .sh file."
            value={settings.variable}
            onChange={(e) => void updateSettings({ variable: e.target.value })}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <ToggleField
            label="Prompt for newly detected games"
            checked={settings.askByDefault}
            onChange={(askByDefault) => void updateSettings({ askByDefault })}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <ToggleField
            label="Back up scripts once"
            description="Writes a .launchprofiles.bak next to each script the first time it is edited."
            checked={settings.backup}
            onChange={(backup) => void updateSettings({ backup })}
          />
        </PanelSectionRow>

        {games.length > 0 && (
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={async () => {
                for (const [appId] of games) await dropGame(appId);
              }}
            >
              Forget all detected games
            </ButtonItem>
          </PanelSectionRow>
        )}
      </PanelSection>
    </>
  );
};

export default QamPanel;
