/* eslint-disable @typescript-eslint/no-var-requires */
const find = require('find-process');
const treeKill = require('tree-kill');

// Function to find and kill a process by port
export async function killProcessByPort(port: number): Promise<void> {
    try {
        // Find process running on the specified port
        const list = await find('port', port);

        if (list.length > 0) {
            const processInfo = list[0];
            const pid = processInfo.pid;

            console.log(`Found process ${processInfo.name} (PID: ${pid}) running on port ${port}`);

            // Kill the process
            treeKill(pid, 'SIGTERM', (err) => {
                if (err) {
                    console.error(`Failed to kill process with PID: ${pid}`, err);
                } else {
                    console.log(`Successfully killed process with PID: ${pid}`);
                }
            });
        } else {
            console.log(`No process found running on port ${port}`);
        }
    } catch (err) {
        console.error(`Error finding or killing process on port ${port}:`, err);
    }
}
