import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from 'react-three-fiber'
import { Effects } from './Effects'
import * as THREE from 'three'

const roundedSquareWave = (t, delta, a, f) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

// function heartbeat(t, bpm = 72) {
//   const f = bpm / 60
//   return Math.exp(-1.5 * (t % (1 / f))) * Math.sin(2 * Math.PI * f * t)
// }

function heartbeat(t, bpm = 72) {
  const f = bpm / 60

  const primary = Math.exp(-1.5 * (t % (1 / f))) * Math.sin(2 * Math.PI * f * t)

  // Zweiter, schwächerer Impuls leicht versetzt
  const delay = 0.2 / f
  const secondary = 0.6 * Math.exp(-1.5 * ((t + delay) % (1 / f))) * Math.sin(2 * Math.PI * f * (t + delay))

  return primary + secondary
}


function Dots() {
  
  const ref = useRef()
  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()

    // Precompute randomized initial positions
    const positions = [...Array(10000)].map((_, i) => {
      const position = new THREE.Vector3()
      // Place in a grid
      position.x = (i % 100) - 50
      position.y = Math.floor(i / 100) - 50

      // Offset every other column (hexagonal pattern)
      position.y += (i % 2) * 0.5

      // Add some noise
      position.x += Math.random() * 0.3
      position.y += Math.random() * 0.3
      return position
    })

    // Precompute initial distances with octagonal offset
    const right = new THREE.Vector3(1, 0, 0)
    const distances = positions.map((pos) => {
      return pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5
    })
    return { vec, transform, positions, distances }
  }, [])
  // useFrame(({ clock }) => {
  //   for (let i = 0; i < 10000; ++i) {
  //     const dist = distances[i]

  //     // Distance affects the wave phase
  //     // const t = clock.elapsedTime - dist / 25

  //     const t = clock.elapsedTime - dist / 25
  //     const wave = heartbeat(t, 60)

  //     // Oscillates between -0.4 and +0.4
  //     //const wave = roundedSquareWave(t, 0.15 + (0.2 * dist) / 72, 0.4, 1 / 3.8)

  //     // Scale initial position by our oscillator
  //     vec.copy(positions[i]).multiplyScalar(wave + 1.3)

  //     // Apply the Vector3 to a Matrix4
  //     transform.setPosition(vec)

  //     // Update Matrix4 for this instance
  //     ref.current.setMatrixAt(i, transform)
  //   }
  //   ref.current.instanceMatrix.needsUpdate = true
  // })
  const mouse = useRef(new THREE.Vector2(0, 0))

useFrame(({ clock, mouse: r3fMouse }) => {
  // Mausposition in Weltkoordinaten normalisieren (-1 bis 1 → -50 bis 50)
  mouse.current.set(r3fMouse.x * 50, r3fMouse.y * 50)

  for (let i = 0; i < 10000; ++i) {
    const pos = positions[i]

    // Abstand zur aktuellen Mausposition statt Ursprung
    const dx = pos.x - mouse.current.x / 15
    const dy = pos.y - mouse.current.y / 15
    const dist = Math.sqrt(dx * dx + dy * dy)

    const t = clock.elapsedTime - dist / 25
    const wave = heartbeat(t, 60)

    vec.copy(pos).multiplyScalar(wave + 1.3)
    transform.setPosition(vec)
    ref.current.setMatrixAt(i, transform)
  }
  ref.current.instanceMatrix.needsUpdate = true
})

  return (
    <instancedMesh ref={ref} args={[null, null, 10000]}>
      <circleBufferGeometry args={[0.1]} />
      <meshBasicMaterial />
    </instancedMesh>
  )
}

export default function App() {
  return (
    <Canvas orthographic camera={{ zoom: 20 }} colorManagement={false}>
      <color attach="background" args={['#000033']} />
      <Effects />
      <Dots />
    </Canvas>
  )
}
