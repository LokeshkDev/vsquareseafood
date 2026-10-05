import { spawn } from 'child_process';
import path from 'path';

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting V² Seafood Backend (Port 5000) & Frontend (Port 3000) simultaneously...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Spawn Backend Server
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('server'),
  stdio: 'pipe',
  shell: true,
});

serverProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[SERVER]\x1b[0m ${data.toString()}`);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[SERVER ERROR]\x1b[0m ${data.toString()}`);
});

// 2. Spawn Frontend Client
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('client'),
  stdio: 'pipe',
  shell: true,
});

clientProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[CLIENT]\x1b[0m ${data.toString()}`);
});

clientProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[CLIENT WARN]\x1b[0m ${data.toString()}`);
});

// Graceful shutdown on Ctrl+C
const cleanup = () => {
  console.log('\n\x1b[36m%s\x1b[0m', '🛑 Shutting down server and client processes...');
  try {
    if (isWin) {
      if (serverProcess.pid) spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
      if (clientProcess.pid) spawn('taskkill', ['/pid', clientProcess.pid, '/f', '/t']);
    } else {
      serverProcess.kill('SIGINT');
      clientProcess.kill('SIGINT');
    }
  } catch (e) {
    // Ignore error on kill
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
