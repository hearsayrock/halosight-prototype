/**
 * FLUTTER HANDOFF: N/A
 * Dev-only API route — not used in the Flutter app.
 * Returns all remote git branches for the PlaygroundNav sidebar.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";
import path from "path";

const execAsync = promisify(exec);

export async function GET() {
  try {
    const repoRoot = path.resolve(process.cwd(), "..");
    const { stdout } = await execAsync(
      "git branch -r --format='%(refname:short)'",
      { cwd: repoRoot }
    );
    const branches = stdout
      .split("\n")
      .map(b => b.trim().replace(/^origin\//, ""))
      .filter(b => b && !b.startsWith("HEAD") && b !== "origin");
    return NextResponse.json({ branches });
  } catch {
    return NextResponse.json({ branches: [] });
  }
}
