import * as fs from "fs";

const buffer = Buffer.alloc(1);
fs.readSync(0, buffer, 0, 1, null);

try {
  const remaining = Buffer.alloc(1024);
  fs.readSync(0, remaining, 0, 1024, null);
} catch (error) {
  // Ignore any errors from trying to read remaining characters
}

process.stdout.write("\n");

const answer = buffer.toString().toLowerCase();
process.exit(answer === "y" ? 0 : 1);
