import { Router } from 'express';
import dataRoutes from './data/data.routes';
import socialRoutes from './social/social.routes';

const routes = Router();

routes.use('/data', dataRoutes);
routes.use('/social', socialRoutes);

export default routes;