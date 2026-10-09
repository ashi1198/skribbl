import type { UpdatedRoom } from "./Waiting"; // 🔗 CONNECTING LINE: Importing parent type
import "./GameSettingsPanel.css";
interface GameSettingsPanelProps {
  settings: UpdatedRoom;
  handleSettingChange: (key: keyof UpdatedRoom, value: string | number) => void;
  isHost: boolean;
}

export function GameSettingsPanel({
  settings,
  handleSettingChange,
  isHost,
}: GameSettingsPanelProps) {
  return (
    <>
      <h3>Game Settings</h3>
      {/* Difficulty Setting */}
      <label className="setting-row">Difficulty</label>
      <select
        value={settings.difficulty}
        disabled={!isHost} // 👑 Disables the select if user is a guest
        onChange={(e) => handleSettingChange("difficulty", e.target.value)}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="normal">Normal</option>
        <option value="hard">Hard</option>
      </select>
      {/* Max Players Setting */}
      <label className="setting-row">Max Players</label>
      <select
        value={settings.maxPlayers}
        disabled={!isHost}
        onChange={(e) =>
          handleSettingChange("maxPlayers", Number(e.target.value))
        }
      >
        {[5, 8, 10, 12, 15].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      {/* Rounds Setting */}
      <label className="setting-row">Rounds</label>
      <select
        value={settings.rounds}
        disabled={!isHost}
        onChange={(e) => handleSettingChange("rounds", Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      {/* Turn Time Setting */}
      <label className="setting-row">Turn Time</label>
      <select
        value={settings.turnTime}
        disabled={!isHost}
        onChange={(e) =>
          handleSettingChange("turnTime", Number(e.target.value))
        }
      >
        {[30, 45, 60, 90, 120].map((n) => (
          <option key={n} value={n}>
            {n}s
          </option>
        ))}
      </select>
    </>
  );
}
