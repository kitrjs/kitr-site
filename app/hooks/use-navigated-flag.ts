import { useRouter } from '@kitr/router'
import { useEffect } from 'react'

/**
 * Sets `data-navigated` on <html> after the first client-side page change. The home hero's
 * entrance (motion.css) plays from the prerendered HTML, before any JavaScript, and only on that
 * first load: coming back to the home page shows it at rest.
 */
export function useNavigatedFlag() {
  const router = useRouter()
  useEffect(
    () =>
      router.subscribe('onBeforeNavigate', (e) => {
        if (e.pathChanged) document.documentElement.dataset.navigated = ''
      }),
    [router],
  )
}
