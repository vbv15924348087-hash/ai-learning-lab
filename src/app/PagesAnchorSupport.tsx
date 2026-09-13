import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function findAnchor(fragment: string) {
  if (!fragment.startsWith('#') || fragment.startsWith('#/')) return null
  try {
    return document.getElementById(decodeURIComponent(fragment.slice(1)))
  } catch {
    return null
  }
}

function revealAnchor(target: HTMLElement) {
  const needsTabIndex = !target.hasAttribute('tabindex') && target.tabIndex < 0
  if (needsTabIndex) {
    target.setAttribute('tabindex', '-1')
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }
  target.scrollIntoView({ block: 'start', behavior: 'auto' })
  target.focus({ preventScroll: true })
}

/** Keep document anchors from replacing the route stored in the Pages URL hash. */
export function PagesAnchorSupport() {
  const location = useLocation()

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self')
      )
        return
      const target = findAnchor(link.getAttribute('href') ?? '')
      if (!target) return
      event.preventDefault()
      revealAnchor(target)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    // AppLayout restores the page top on navigation. Follow nested route anchors
    // after those effects have run, e.g. #/lesson/final-system-map#chapter-challenge.
    if (!location.hash) return
    let frame: number | undefined
    let observer: MutationObserver | undefined
    const revealWhenMounted = () => {
      const target = findAnchor(location.hash)
      if (!target) return false
      observer?.disconnect()
      frame = requestAnimationFrame(() => {
        if (target.isConnected) revealAnchor(target)
      })
      return true
    }
    if (!revealWhenMounted()) {
      // A lesson can still be loading behind Suspense on the first route frame.
      observer = new MutationObserver(revealWhenMounted)
      observer.observe(document.body, { childList: true, subtree: true })
    }
    return () => {
      observer?.disconnect()
      if (frame !== undefined) cancelAnimationFrame(frame)
    }
  }, [location.key, location.hash])

  return null
}
