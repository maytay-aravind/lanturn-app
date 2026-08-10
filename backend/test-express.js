import express from 'express';
const app = express();
const router = express.Router();

router.get('/applications/:applicationId', (req, res) => res.send('getOne'));
router.get('/applications/:applicationId/resume-url', (req, res) => res.send('resume-url'));

app.use('/api', router);

const req1 = { url: '/api/applications/123/resume-url', method: 'GET' };
app._router.handle(req1, {}, (err) => console.log('req1 Next called'));
