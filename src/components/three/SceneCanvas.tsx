import { Component, Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createRoot, events, extend, type ReconcilerRoot, type RootStore } from '@react-three/fiber'
import * as THREE from 'three'

class SceneRenderBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFailure()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Own the actual canvas so renderer creation and async configuration share a failure path. */
export function SceneCanvas({
  children,
  onFailure,
}: {
  children: ReactNode
  onFailure: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const latest = useRef({ children, onFailure })
  const renderCurrent = useRef<(() => void) | null>(null)

  useLayoutEffect(() => {
    latest.current = { children, onFailure }
    renderCurrent.current?.()
  }, [children, onFailure])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    // A new element per effect keeps R3F's delayed unmount cleanup away from a StrictMode remount.
    const canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    host.appendChild(canvas)
    let disposed = false
    let failed = false
    let configured = false
    let context: WebGL2RenderingContext | null = null
    let renderer: THREE.WebGLRenderer | null = null
    let root: ReconcilerRoot<HTMLCanvasElement> | null = null
    let store: RootStore | null = null
    let observer: ResizeObserver | null = null

    const fail = () => {
      if (disposed || failed) return
      failed = true
      latest.current.onFailure()
    }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      fail()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    const renderScene = () => {
      if (disposed || failed || !configured || !root) return
      try {
        store = root.render(
          <SceneRenderBoundary onFailure={fail}>
            <Suspense fallback={null}>{latest.current.children}</Suspense>
          </SceneRenderBoundary>,
        )
      } catch {
        fail()
      }
    }
    renderCurrent.current = renderScene

    const resize = () => {
      if (disposed || failed || !renderer) return
      try {
        const { width, height, top, left } = host.getBoundingClientRect()
        if (width <= 0 || height <= 0) return
        if (store) {
          store.getState().setSize(width, height, top, left)
        } else if (!root) {
          root = createRoot(canvas)
          // Pass a real, successfully created renderer; never an async factory or a stub.
          void root
            .configure({
              gl: renderer,
              events,
              orthographic: true,
              camera: { position: [6.2, 6.2, 9], zoom: 48, near: 0.1, far: 50 },
              dpr: [1, 1.75],
              frameloop: 'demand',
              size: { width, height, top, left },
              onCreated: (state) => {
                if (!disposed && !failed) state.events.connect?.(host)
              },
            })
            .then(() => {
              if (disposed || failed) return
              configured = true
              renderScene()
              resize()
            })
            .catch(fail)
        }
      } catch {
        fail()
      }
    }

    try {
      const options = { antialias: true, alpha: true, powerPreference: 'low-power' } as const
      // Three r180 requires WebGL 2. Reuse this context for the real renderer instead of probing another canvas.
      context = canvas.getContext('webgl2', options) as WebGL2RenderingContext | null
      if (!context) {
        fail()
      } else {
        renderer = new THREE.WebGLRenderer({ canvas, context, ...options })
        extend({
          Group: THREE.Group,
          Mesh: THREE.Mesh,
          AmbientLight: THREE.AmbientLight,
          DirectionalLight: THREE.DirectionalLight,
          BoxGeometry: THREE.BoxGeometry,
          CircleGeometry: THREE.CircleGeometry,
          ConeGeometry: THREE.ConeGeometry,
          PlaneGeometry: THREE.PlaneGeometry,
          RingGeometry: THREE.RingGeometry,
          ExtrudeGeometry: THREE.ExtrudeGeometry,
          MeshBasicMaterial: THREE.MeshBasicMaterial,
          MeshStandardMaterial: THREE.MeshStandardMaterial,
        })
        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(resize)
          observer.observe(host)
        }
        window.addEventListener('resize', resize)
        resize()
      }
    } catch {
      fail()
    }

    return () => {
      disposed = true
      renderCurrent.current = null
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      root?.unmount()
      renderer?.dispose()
      // R3F releases a root-owned context after unmount; releasing it here first breaks that lookup.
      if (!root) context?.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'transparent',
      }}
    />
  )
}
