import { Request, Response } from 'express';
import { getProductRecommendations } from '../service/recommendation.service';

export async function getRecommendationsHandler(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const recommendations = await getProductRecommendations(id);
    res.json({ recommendations });
  } catch (error) {
    console.error('Error in getRecommendationsHandler:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
}