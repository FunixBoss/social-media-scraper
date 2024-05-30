import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { killProcessByPort } from './port.service';

export async function startScraper(): Promise<ChildProcess> {
    await killProcessByPort(3000)
        .then(() => {
            console.log(`Port ${3000} is now free.`);
        })
        .catch((err) => {
            console.error(`Failed to free port ${3000}:`, err);
        });

    return new Promise((resolve) => {
        const scraperCommand = `cross-env NODE_ENV=${process.env.NODE_ENV} node dist/main.js`;
        const scraperProcess = spawn(scraperCommand, {
            cwd: path.join(__dirname, '../../packages/social-media-scraper'),
            shell: true,
        });

        const pid = scraperProcess.pid;
        console.log(`NestJS scraper started with PID: ${pid}`);

        scraperProcess.stdout.on('data', (data) => {
            console.log(`Scraper: ${data}`);
        });

        scraperProcess.stderr.on('data', (data) => {
            console.error(`Scraper Error: ${data}`);
        });

        scraperProcess.on('close', (code) => {
            console.log(`Scraper process exited with code ${code}`);
            resolve(scraperProcess); // Resolve the promise when the process exits
        });

        resolve(scraperProcess);
    });
}
