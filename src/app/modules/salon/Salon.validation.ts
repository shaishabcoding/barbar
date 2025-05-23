import { z } from 'zod';
import { EUserGender } from '../user/User.enum';
import { week } from './Salon.constant';
import { json } from '../../../util/transform/json';
import { lower } from '../../../util/transform/lower';

export const SalonValidations = {
  upsert: z.object({
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      banner: z.string().optional(),
      location: z
        .object({
          coordinates: z.tuple([
            z
              .number()
              .min(-180, { message: 'Longitude must be ≥ -180' })
              .max(180, { message: 'Longitude must be ≤ 180' }),
            z
              .number()
              .min(-90, { message: 'Latitude must be ≥ -90' })
              .max(90, { message: 'Latitude must be ≤ 90' }),
          ]),
          address: z.string().optional(),
        })
        .optional(),
      gender: z
        .string()
        .transform(lower)
        .pipe(z.nativeEnum(EUserGender))
        .optional(),
      businessHours: z
        .string()
        .transform(json)
        .pipe(
          z.object(
            Object.fromEntries(
              week.map(day => [
                day,
                z
                  .object({
                    start: z
                      .string({ required_error: 'start is missing' })
                      .min(1, 'start is missing'),
                    end: z
                      .string({ required_error: 'end is missing' })
                      .min(1, 'end is missing'),
                    isOpen: z.boolean().default(true),
                  })
                  .optional(),
              ]),
            ),
          ),
        )
        .optional(),
      contact: z.string().optional(),
      website: z.string().optional(),
    }),
  }),

  list: z.object({
    query: z.object({
      longitude: z.number().min(-180).max(180).optional(),
      latitude: z.number().min(-90).max(90).optional(),
    }),
  }),
};
