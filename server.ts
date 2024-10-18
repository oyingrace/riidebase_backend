import express from 'express';
import dotenv from 'dotenv';

// Import your API routes
import * as driverApi from './driver+api';
import * as userApi from './user+api';
import * as createRideApi from './create+api';
import * as getRideApi from './[id]+api';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const neonConnectionString = process.env.DATABASE_URL;

app.use(express.json());

const handleApiRoute = (apiModule: any) => async (req: express.Request, res: express.Response) => {
  const method = req.method?.toUpperCase();
  if (method && apiModule[method]) {
    try {
      const response = await apiModule[method](req);
      
      if (!response) {
        res.status(404).json({ error: 'No data found' });
        return;
      }

      if (typeof response.json === 'function') {
        // If response is a Fetch API-like response object
        const data = await response.json();
        res.status(response.status || 200).json(data);
      } else {
        // For other cases where response is directly the data
        res.status(200).json(response);
      }
    } catch (error) {
      console.error('Error in API route:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};



// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API server' });
});

// Set up your API routes
app.use('/driver', handleApiRoute(driverApi));
app.use('/user', handleApiRoute(userApi));
app.post('/ride', handleApiRoute(createRideApi));
app.get('/:id', handleApiRoute(getRideApi));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});