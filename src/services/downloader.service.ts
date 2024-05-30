import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { killProcessByPort } from './port.service';

export async function startDownloader(): Promise<ChildProcess> {
    await killProcessByPort(3001)
        .then(() => {
            console.log(`Port ${3001} is now free.`);
        })
        .catch((err) => {
            console.error(`Failed to free port ${3001}:`, err);
        });

    return new Promise((resolve, reject) => {
        const downloaderCommand = `cross-env NODE_ENV=${process.env.NODE_ENV} node dist/main.js`;
        const downloaderProcess = spawn(downloaderCommand, {
            cwd: path.join(__dirname, '../../packages/social-media-downloader'),
            shell: true,
        });

        downloaderProcess.stdout.on('data', (data) => {
            console.log(`Downloader: ${data}`);
        });

        downloaderProcess.stderr.on('data', (data) => {
            console.error(`Downloader Error: ${data}`);
        });

        downloaderProcess.on('close', (code) => {
            console.log(`Downloader process exited with code ${code}`);
            resolve(downloaderProcess); // Resolve the promise when the process exits
        });

        downloaderProcess.on('error', (error) => {
            console.error(`Failed to start downloader: ${error}`);
            reject(error); // Reject the promise if the process fails to start
        });

        resolve(downloaderProcess);
    });
}
