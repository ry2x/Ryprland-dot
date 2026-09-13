import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath, URL } from "node:url";

const switcher = fileURLToPath(
    new URL("../base/.local/bin/theme-switch.sh", import.meta.url)
);
const qt6ctConfig = fileURLToPath(
    new URL("../base/.config/qt6ct/qt6ct.conf", import.meta.url)
);
const kvantumConfig = fileURLToPath(
    new URL("../base/.config/Kvantum/kvantum.kvconfig", import.meta.url)
);
const matugenConfig = fileURLToPath(
    new URL("../base/.config/matugen/config.toml", import.meta.url)
);
const kvantumSvgTemplate = fileURLToPath(
    new URL(
        "../base/.config/matugen/templates/matugen.svg",
        import.meta.url
    )
);
const hyprlandAutostart = fileURLToPath(
    new URL("../base/.config/hypr/modules/autostart.lua", import.meta.url)
);

function writeExecutable(filePath, contents) {
    fs.writeFileSync(filePath, contents, { mode: 0o755 });
}

describe("Ryprland theme-switch.sh mode state", () => {
    let temporaryDirectory;
    let environment;
    let modeFile;
    let wallpaper;
    let commandLog;

    beforeEach(() => {
        temporaryDirectory = fs.mkdtempSync(
            path.join(os.tmpdir(), "ryprland-theme-test-")
        );
        const binDirectory = path.join(temporaryDirectory, "bin");
        const configDirectory = path.join(
            temporaryDirectory,
            "config",
            "rystal-shell"
        );
        const cacheDirectory = path.join(
            temporaryDirectory,
            "cache",
            "rystal-shell"
        );
        const stateDirectory = path.join(
            temporaryDirectory,
            "state",
            "rystal-shell"
        );
        const runtimeDirectory = path.join(
            temporaryDirectory,
            "runtime",
            "rystal-shell"
        );
        const wallpaperDirectory = path.join(temporaryDirectory, "wallpapers");

        fs.mkdirSync(binDirectory, { recursive: true });
        fs.mkdirSync(wallpaperDirectory, { recursive: true });
        wallpaper = path.join(wallpaperDirectory, "wallpaper.png");
        commandLog = path.join(temporaryDirectory, "commands.log");
        modeFile = path.join(stateDirectory, "theme", "mode");
        fs.writeFileSync(wallpaper, "test image");

        writeExecutable(
            path.join(binDirectory, "matugen"),
            `#!/usr/bin/env bash
set -eu
[[ "\${MATUGEN_FAIL:-0}" != 1 ]] || exit 1
mode=unknown
while (($# > 0)); do
    if [[ "$1" == -m ]]; then
        mode="$2"
        shift
    fi
    shift
done
printf 'matugen %s\\n' "$mode" >>"$TEST_COMMAND_LOG"
`
        );
        writeExecutable(
            path.join(binDirectory, "magick"),
            `#!/usr/bin/env bash
set -eu
write_next=false
for argument in "$@"; do
    if $write_next; then
        output="\${argument#png:}"
        printf 'asset' >"$output"
        write_next=false
    elif [[ "$argument" == -write ]]; then
        write_next=true
    fi
done
printf 'magick\\n' >>"$TEST_COMMAND_LOG"
`
        );
        for (const command of ["awww", "bat", "pkill"]) {
            writeExecutable(
                path.join(binDirectory, command),
                `#!/usr/bin/env bash
printf '${command}\\n' >>"$TEST_COMMAND_LOG"
`
            );
        }
        writeExecutable(
            path.join(binDirectory, "ags"),
            `#!/usr/bin/env bash
[[ "\${1:-}" != list ]] || exit 0
`
        );
        writeExecutable(
            path.join(binDirectory, "notify-send"),
            `#!/usr/bin/env bash
exit 0
`
        );
        writeExecutable(
            path.join(binDirectory, "gsettings"),
            `#!/usr/bin/env bash
[[ "\${GSETTINGS_FAIL:-0}" != 1 ]] || exit 1
printf 'gsettings %s\\n' "$*" >>"$TEST_COMMAND_LOG"
`
        );

        environment = {
            ...process.env,
            HOME: temporaryDirectory,
            PATH: `${binDirectory}:${process.env.PATH}`,
            ROFI_IMAGE_DIR: path.join(temporaryDirectory, "rofi-images"),
            RYSTAL_SHELL_CACHE_DIR: cacheDirectory,
            RYSTAL_SHELL_CONFIG_DIR: configDirectory,
            RYSTAL_SHELL_RUNTIME_DIR: runtimeDirectory,
            RYSTAL_SHELL_STATE_DIR: stateDirectory,
            RYSTAL_SHELL_WALLPAPER_DIR: wallpaperDirectory,
            TEST_COMMAND_LOG: commandLog,
            USER: "theme-test",
            XDG_CONFIG_HOME: path.join(temporaryDirectory, "config")
        };
    });

    afterEach(() => {
        fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    });

    function run(args, overrides = {}) {
        return spawnSync("bash", [switcher, ...args], {
            encoding: "utf8",
            env: { ...environment, ...overrides }
        });
    }

    function runAsync(args, overrides = {}) {
        return new Promise((resolve) => {
            const child = spawn("bash", [switcher, ...args], {
                env: { ...environment, ...overrides }
            });
            let stderr = "";

            child.stderr.setEncoding("utf8");
            child.stderr.on("data", (chunk) => {
                stderr += chunk;
            });
            child.on("close", (status) => resolve({ status, stderr }));
        });
    }

    it("defaults to dark without creating state", () => {
        const result = run(["status"]);

        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout, "dark\n");
        assert.equal(fs.existsSync(modeFile), false);
    });

    it("persists light mode across refresh", () => {
        const initial = run(["--light", "set", "--", wallpaper]);
        const refresh = run(["refresh"]);

        assert.equal(initial.status, 0, initial.stderr);
        assert.equal(refresh.status, 0, refresh.stderr);
        assert.equal(fs.readFileSync(modeFile, "utf8"), "light\n");
        assert.equal(run(["status"]).stdout, "light\n");
        assert.deepEqual(
            fs
                .readFileSync(commandLog, "utf8")
                .trim()
                .split("\n")
                .filter((line) => line.startsWith("matugen")),
            ["matugen light", "matugen light"]
        );
        assert.deepEqual(
            fs
                .readFileSync(commandLog, "utf8")
                .trim()
                .split("\n")
                .filter((line) => line.startsWith("gsettings"))
                .slice(-3),
            [
                "gsettings set org.gnome.desktop.interface color-scheme prefer-light",
                "gsettings set org.gnome.desktop.interface gtk-theme adw-gtk3",
                "gsettings set org.gnome.desktop.interface icon-theme Ars-Light-Icons"
            ]
        );
    });

    it("applies mode and serializes concurrent toggles", async () => {
        assert.equal(run(["set", wallpaper]).status, 0);
        assert.equal(run(["mode", "light"]).status, 0);
        const toggles = await Promise.all([
            runAsync(["toggle"]),
            runAsync(["toggle"])
        ]);

        assert.deepEqual(
            toggles.map((result) => result.status),
            [0, 0],
            toggles.map((result) => result.stderr).join("\n")
        );
        assert.equal(fs.readFileSync(modeFile, "utf8"), "light\n");
    });

    it("does not save a requested mode when generation fails", () => {
        assert.equal(run(["--light", "set", wallpaper]).status, 0);

        const failed = run(["mode", "dark"], { MATUGEN_FAIL: "1" });

        assert.notEqual(failed.status, 0);
        assert.match(failed.stderr, /Matugen failed/);
        assert.equal(fs.readFileSync(modeFile, "utf8"), "light\n");
    });

    it("does not save a mode when toolkit synchronization fails", () => {
        const failed = run(["--light", "set", wallpaper], {
            GSETTINGS_FAIL: "1"
        });

        assert.notEqual(failed.status, 0);
        assert.match(failed.stderr, /Failed to apply GTK settings/);
        assert.equal(fs.existsSync(modeFile), false);
    });

    it("falls back safely from invalid state", () => {
        fs.mkdirSync(path.dirname(modeFile), { recursive: true });
        fs.writeFileSync(modeFile, "sepia\n");

        const result = run(["status"]);

        assert.equal(result.status, 0, result.stderr);
        assert.equal(result.stdout, "dark\n");
        assert.match(result.stderr, /Invalid saved mode/);
    });

    it("uses a mode-neutral qt6ct configuration backed by Kvantum", () => {
        const config = fs.readFileSync(qt6ctConfig, "utf8");

        assert.match(config, /custom_palette=false/);
        assert.match(config, /icon_theme=breeze/);
        assert.match(config, /style=kvantum/);
        assert.doesNotMatch(config, /\/home\//);
        assert.doesNotMatch(config, /kvantum-dark/);
    });

    it("generates the Kvantum palette and SVG outside tracked templates", () => {
        const selection = fs.readFileSync(kvantumConfig, "utf8");
        const generation = fs.readFileSync(matugenConfig, "utf8");
        const svgTemplate = fs.readFileSync(kvantumSvgTemplate, "utf8");

        assert.match(selection, /theme=matugen-generated/);
        assert.match(
            generation,
            /Kvantum\/matugen-generated\/matugen-generated\.kvconfig/
        );
        assert.match(
            generation,
            /Kvantum\/matugen-generated\/matugen-generated\.svg/
        );
        const buttonNormal = svgTemplate
            .split("\n")
            .find((line) => line.includes('id="button-normal"'));
        assert.ok(buttonNormal);
        assert.match(
            buttonNormal,
            /\{\{colors\.surface_container_high\.default\.hex\}\}/
        );
        assert.doesNotMatch(svgTemplate, /#2d393f/i);
    });

    it("restores the saved mode during Hyprland startup", () => {
        const autostart = fs.readFileSync(hyprlandAutostart, "utf8");

        assert.match(
            autostart,
            /awww restore; theme-switch\.sh refresh/
        );
    });
});
