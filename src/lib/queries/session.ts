import 'server-only';

import { cache } from 'react';
import { getCurrentUser } from '@/lib/auth/session';

// React limita esta caché al render actual: nunca comparte sesiones entre usuarios.
export const getQueryUser = cache(getCurrentUser);
