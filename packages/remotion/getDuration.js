const cp = require('child_process');
const output = cp.execSync('npx ffprobe -i public/foundry-version-2.mp4 -show_entries format=duration -v quiet -of csv="p=0"').toString();
console.log(output);
