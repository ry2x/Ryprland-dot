import GLib from "gi://GLib"
import Gio from "gi://Gio"

const CONFIG_DIR = `${GLib.get_user_config_dir()}/ags`

// Simple observable to replace AGS Variable
class SimpleVariable<T> {
  private value: T;
  private listeners: ((val: T) => void)[] = [];
  constructor(val: T) { this.value = val; }
  get() { return this.value; }
  set(val: T) {
    this.value = val;
    this.listeners.forEach(l => l(val));
  }
  subscribe(fn: (val: T) => void) {
    this.listeners.push(fn);
  }
}

// Dynamically track Matugen colors
export const themeColors = new SimpleVariable<Record<string, string>>({})

function loadColors() {
  const path = `${CONFIG_DIR}/themes/matugen.scss`
  if (!GLib.file_test(path, GLib.FileTest.EXISTS)) return
  const [ok, contents] = GLib.file_get_contents(path)
  if (!ok) return
  const out = new TextDecoder("utf-8").decode(contents)
  const c: Record<string, string> = {}
  out.split("\n").forEach((line) => {
    const match = line.match(/\$(.+):\s*(#[0-9a-fA-F]+);/)
    if (match) c[match[1]] = match[2]
  })
  themeColors.set(c)
}

loadColors()
const themeFile = Gio.File.new_for_path(`${CONFIG_DIR}/themes/matugen.scss`)
const monitor = themeFile.monitor_file(Gio.FileMonitorFlags.NONE, null)
monitor.connect("changed", () => loadColors())

/**
 * Helper function to get the symbolic icon name for a lucide icon.
 * @param name The icon name (e.g., "activity", "check-circle")
 * @returns The symbolic icon name
 */
export function lucideIcon(name: string): string {
  // Prefix with 'lucide-' to prevent collisions with system GTK icons like Adwaita
  return `lucide-${name}-symbolic`
}

/**
 * LucideIcon component that correctly utilizes GTK's IconTheme via iconName.
 * This allows SCSS states (like :hover, color changes) and dynamic binding updates to work perfectly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function LucideIcon({ name, ...props }: { name: any; [key: string]: any }) {
  // Check if name is a reactive binding/accessor (has an .as method)
  const icon = (name && typeof name.as === "function")
    ? name.as((n: string) => lucideIcon(n))
    : lucideIcon(name as string)

  return <image iconName={icon} {...props} />
}
