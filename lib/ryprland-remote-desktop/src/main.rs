// SPDX-FileCopyrightText: 2026 Ry2X
// SPDX-License-Identifier: GPL-3.0-or-later

use anyhow::{Result, bail};
use ryprland_remote_desktop::desktop::Desktop;
use ryprland_remote_desktop::supervisor;
use std::env;
use std::io;

fn main() {
    match run() {
        Ok(code) => std::process::exit(code),
        Err(error) => {
            eprintln!("Remote desktop: {error:#}");
            std::process::exit(1);
        }
    }
}

fn run() -> Result<i32> {
    let args: Vec<_> = env::args().skip(1).collect();
    if args.len() != 1 {
        bail!("Expected one action; use --help for available actions");
    }
    if matches!(args[0].as_str(), "--help" | "-h") {
        println!(
            "Sunshine lifecycle supervision and reversible Hyprland display isolation.\nActions: --prepare, --serve, --enter, --release, --restore, --sync, --status,\n         --wake, --idle-off, --idle-dim, --idle-brightness, --idle-suspend, --remove-output"
        );
        return Ok(0);
    }
    let desktop = Desktop::from_environment()?;
    match args[0].as_str() {
        "--prepare" => desktop.prepare()?,
        "--serve" => {
            return supervisor::serve(
                &desktop,
                supervisor::sunshine_command()?,
                &mut io::stdout().lock(),
            );
        }
        "--enter" => desktop.enter()?,
        "--release" => desktop.restore(true)?,
        "--restore" => desktop.restore(false)?,
        "--sync" => desktop.sync()?,
        "--status" => println!("{}", desktop.status()?),
        "--remove-output" => desktop.remove_output()?,
        action @ ("--wake" | "--idle-off" | "--idle-dim" | "--idle-brightness"
        | "--idle-suspend") => desktop.idle(&action[2..])?,
        action => bail!("Unknown action: {action}"),
    }
    Ok(0)
}
