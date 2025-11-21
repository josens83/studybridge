'use client';

import { useEffect } from 'react';
import { setupGlobalErrorHandlers } from '@/lib/error-logging';

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Set up global error handlers
    setupGlobalErrorHandlers();
  }, []);

  return null;
}
