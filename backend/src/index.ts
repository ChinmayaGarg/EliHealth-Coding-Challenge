import express from 'express';
const cors = require('cors');
import testStripRoutes from './routes/testStripRoutes';

const app = express();
// const PORT = 3000;

app.use(cors());
app.use('/api/test-strips', testStripRoutes);

app.get('/', (_req, res) => {
  res.send('Eli Backend is running!');
});

// app.listen(PORT, () => {
//   console.log(`🚀 Eli backend listening at http://localhost:${PORT}`);
// });

export default app;
