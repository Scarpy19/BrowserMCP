import { execSync } from "node:child_process";
import net from "node:net";

export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true)); // Port is still in use
    server.once("listening", () => {
      server.close(() => resolve(false)); // Port is free
    });
    server.listen(port);
  });
}

export function killProcessOnPort(port: number) {
  try {
    if (process.platform === "win32") {
      // Run netstat and parse PIDs in Node instead of relying on a fragile FOR/| findstr shell one-liner.
      const out = execSync("netstat -ano", { encoding: "utf8" });
      const lines = out.split(/\r?\n/);
      const re = new RegExp(`:${port}\\b`);
      const pids = new Set<number>();
      for (const line of lines) {
        if (!line) continue;
        if (re.test(line)) {
          const parts = line.trim().split(/\s+/);
          const pidStr = parts[parts.length - 1];
          const pid = Number(pidStr);
          if (!Number.isNaN(pid)) pids.add(pid);
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        } catch (err) {
          // Ignore per-PID failures (process may have exited or insufficient permissions)
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`);
    }
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
  }
}
