const fs = require('fs');
const path = require('path');

const signalPath = path.join(__dirname, '..', '.aevum', 'persona_signal.json');
const personaPath = path.join(__dirname, '..', '.aevum', 'global', 'companion_persona.json');

try {
    const signalData = JSON.parse(fs.readFileSync(signalPath, 'utf8'));
    const personaData = JSON.parse(fs.readFileSync(personaPath, 'utf8'));

    if (signalData.rawInput) {
        // Update fields from rawInput
        Object.assign(personaData, signalData.rawInput);
        
        // Ensure avatar is the string from signalData.rawInput.avatar
        // (already handled by Object.assign)

        fs.writeFileSync(personaPath, JSON.stringify(personaData, null, 2), 'utf8');
        console.log('Successfully updated companion_persona.json');
    } else {
        console.error('No rawInput found in signal file');
    }
} catch (err) {
    console.error('Error updating persona:', err);
}
