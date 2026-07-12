const readline = require('readline');
        const { spawn } = require('child_process');
        const os = require('os');
        const path = require('path');

        const personaId = process.argv[2] || 'UNKNOWN';
        const defaultEngine = process.argv[3] || 'agy';
        const workspaceRoot = path.dirname(__dirname);
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

        console.log('\n\x1b[1mAEVUM SQUAD ORCHESTRATOR\x1b[0m\n');
        rl.question(`Choose Engine [1] agy, [2] gemini (Default: ${defaultEngine === 'gemini' ? '2' : '1'}): `, (answer) => {
            let engine = answer ? (answer === '2' ? 'gemini' : 'agy') : defaultEngine;
            rl.close();
            console.log(`STARTING ${engine.toUpperCase()} ENGINE...`);
            const isWin = os.platform() === 'win32';
            spawn(engine, ['-i', `AEVUM HANDSHAKE AND SYNC WITH PERSONA ${personaId} AEVUM NOW`], { stdio: 'inherit', shell: (engine === 'gemini' && isWin), cwd: workspaceRoot, env: process.env });
        });