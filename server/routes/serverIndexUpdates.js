// Integration code for server/index.js

// Add this line to your imports
const testSnapshotsRouter = require('./routes/testSnapshots');

// Add this line where other routes are registered
app.use('/api/test-snapshots', testSnapshotsRouter);

// Keep existing routes
