import { z } from 'zod/v4';

const userSchema = z.strictObject({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export { userSchema };