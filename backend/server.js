const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/simulate', (req, res) => {
    console.log("Resimulation requested. Running ML Engine...");
    
    // Command to run python script. Support both Windows and Linux (python3)
    const pythonScriptPath = path.join(__dirname, 'train_models.py');
    // For deployment on linux servers (like Render/Railway), it's usually python3
    const command = process.platform === 'win32' ? `python "${pythonScriptPath}"` : `python3 "${pythonScriptPath}"`;

    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing ML engine: ${error.message}`);
            return res.status(500).json({ error: "Failed to run simulation." });
        }
        
        console.log("ML Engine finished successfully. Reading output data...");
        
        // Read the newly generated JSON file
        const dataPath = path.join(__dirname, 'predicted_tournament.json');
        
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading generated data: ${err.message}`);
                return res.status(500).json({ error: "Failed to read simulation data." });
            }
            
            try {
                const parsedData = JSON.parse(data);
                res.status(200).json(parsedData);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
                res.status(500).json({ error: "Invalid JSON format generated." });
            }
        });
    });
});

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend API running on port ${PORT}`);
    console.log(`Waiting for resimulation requests...`);
});
