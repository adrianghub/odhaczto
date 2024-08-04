import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';

export function reducer<T>(
  source$: Observable<T>,
  next: (value: T) => void,
  error?: (error: any) => void
) {
  source$.pipe(takeUntilDestroyed()).subscribe({
    next,
    error: error ? error : (error) => console.error(error),
  });
}
