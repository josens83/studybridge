import { getSupabase } from './supabase/client';

export interface ErrorLog {
  id?: string;
  error_message: string;
  error_stack?: string;
  component_stack?: string;
  user_id?: string;
  url?: string;
  user_agent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  created_at?: string;
}

/**
 * Log an error to Supabase for monitoring
 */
export async function logError(
  error: Error,
  errorInfo?: React.ErrorInfo,
  context?: {
    userId?: string;
    severity?: ErrorLog['severity'];
    additionalData?: Record<string, any>;
  }
): Promise<void> {
  try {
    const supabase = getSupabase();

    const errorLog: Omit<ErrorLog, 'id' | 'created_at'> = {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo?.componentStack,
      user_id: context?.userId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      severity: context?.severity || 'medium',
      context: context?.additionalData,
    };

    const { error: insertError } = await supabase
      .from('error_logs')
      .insert(errorLog);

    if (insertError) {
      console.error('Failed to log error to Supabase:', insertError);
    }
  } catch (e) {
    // Silently fail - don't want error logging to cause more errors
    console.error('Error in logError function:', e);
  }
}

/**
 * Log a client-side error
 */
export async function logClientError(
  message: string,
  severity: ErrorLog['severity'] = 'low',
  additionalData?: Record<string, any>
): Promise<void> {
  const error = new Error(message);
  await logError(error, undefined, { severity, additionalData });
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    logClientError(
      `Unhandled promise rejection: ${event.reason}`,
      'high',
      {
        reason: event.reason,
        promise: event.promise,
      }
    );
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    logClientError(
      event.message || 'Unknown error',
      'high',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      }
    );
  });
}
