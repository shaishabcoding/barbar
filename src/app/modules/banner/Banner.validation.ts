import { z } from 'zod';

export const BannerValidations = {
  create: z.object({
    body: z.object({
      image: z
        .string({
          required_error: 'Image is required',
        })
        .min(1, 'Image is required'),
    }),
  }),
};
