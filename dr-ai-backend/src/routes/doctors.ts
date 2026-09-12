import express, { Request, Response, NextFunction } from 'express';
import Doctor from '../models/Doctor';
import { NotFoundError } from '../errors/AppError';
import { SEED_DOCTORS } from '../seed/seed';

const router = express.Router();

/**
 * Get all doctors with filtering by specialty and availability.
 * Reads from MongoDB; falls back to static seed records if DB is not populated yet.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialty, availability, demoOnly } = req.query;

    const query: any = {};
    if (specialty && specialty !== 'All') {
      query.specialty = { $regex: String(specialty), $options: 'i' };
    }
    if (availability && availability !== 'All') {
      query.availability = String(availability);
    }
    if (demoOnly === 'true') {
      query.isDemo = true;
    }

    let doctors = await Doctor.find(query).sort({ rating: -1 }).lean();

    // If DB is empty, use seed list with explicit demo labels
    if (doctors.length === 0) {
      let filtered = [...SEED_DOCTORS];
      if (specialty && specialty !== 'All') {
        filtered = filtered.filter((d) => d.specialty.toLowerCase().includes(String(specialty).toLowerCase()));
      }
      if (availability && availability !== 'All') {
        filtered = filtered.filter((d) => d.availability.toLowerCase().includes(String(availability).toLowerCase()));
      }
      return res.json({
        total: filtered.length,
        doctors: filtered,
      });
    }

    res.json({
      total: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get specific doctor by ID.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor =
      (await Doctor.findOne({ id: req.params.id }).lean()) ||
      SEED_DOCTORS.find((d) => d.id === req.params.id);

    if (!doctor) {
      throw new NotFoundError(`Doctor with ID '${req.params.id}' not found.`);
    }

    res.json(doctor);
  } catch (error) {
    next(error);
  }
});

export default router;
