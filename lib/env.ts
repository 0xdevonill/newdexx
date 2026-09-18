function read(name: string, fallback = ""): string {
  const v = (process.env[name] ?? "").trim();
  return v || fallback;
}

export function env(name: string, fallback = ""): string {
  return read(name, fallback);
}
