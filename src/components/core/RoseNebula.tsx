import { useRef, useMemo, createContext, useContext } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { AudioData } from '../../hooks/useAudioAnalyzer'

const AudioContext = createContext<AudioData>({
  frequency: new Uint8Array(64),
  waveform: new Uint8Array(64),
  bass: 0,
  mid: 0,
  treble: 0,
  volume: 0,
})

// Visible glowing orbital ring around the nebula
const OrbitRing = ({
  radius,
  speed,
  color,
  thickness,
  opacity,
  tiltX,
  tiltZ,
}: {
  radius: number
  speed: number
  color: string
  thickness: number
  opacity: number
  tiltX: number
  tiltZ: number
}) => {
  const ref = useRef<THREE.Mesh>(null!)
  const audio = useContext(AudioContext)

  const geometry = useMemo(() => {
    const geo = new THREE.TorusGeometry(radius, thickness, 16, 128)
    return geo
  }, [radius, thickness])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.z = t * speed
    // Pulse with audio
    const scale = 1.0 + audio.bass * 0.08
    ref.current.scale.set(scale, scale, scale)
    const mat = ref.current.material as THREE.MeshBasicMaterial
    mat.opacity = opacity + audio.volume * 0.15
  })

  return (
    <mesh ref={ref} geometry={geometry} rotation={[tiltX, 0, tiltZ]}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Glowing particles along an orbit path
const OrbitParticles = ({
  radius,
  speed,
  count,
  color,
  size,
  tiltX,
  tiltZ,
}: {
  radius: number
  speed: number
  count: number
  color: string
  size: number
  tiltX: number
  tiltZ: number
}) => {
  const ref = useRef<THREE.Points>(null!)
  const audio = useContext(AudioContext)

  const { positions, geometry } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * size * 2
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { positions: pos, geometry: geo }
  }, [radius, count, size])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.z = t * speed
    const mat = ref.current.material as THREE.PointsMaterial
    mat.size = size + audio.treble * 2
  })

  return (
    <points ref={ref} geometry={geometry} rotation={[tiltX, 0, tiltZ]}>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// Slowly rotating group that holds the entire nebula
const NebulaGroup = ({ children }: { children: React.ReactNode }) => {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // Main rotation — slow wobble on all axes like a real nebula
    groupRef.current.rotation.y = t * 0.03
    groupRef.current.rotation.x = Math.sin(t * 0.015) * 0.15
    groupRef.current.rotation.z = Math.cos(t * 0.012) * 0.08

    // Gentle drift / orbit
    groupRef.current.position.x = Math.sin(t * 0.02) * 2
    groupRef.current.position.y = Math.cos(t * 0.018) * 1.5
  })

  return <group ref={groupRef}>{children}</group>
}

// Orbiting sub-groups for layered rotation
const OrbitalLayer = ({
  children,
  speed,
  axis,
  tilt,
}: {
  children: React.ReactNode
  speed: number
  axis: 'x' | 'y' | 'z'
  tilt: number
}) => {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation[axis] = t * speed
  })

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      {children}
    </group>
  )
}

const ParticleSwarm = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const count = 15000
  const speedMult = 0.8
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const pColor = useMemo(() => new THREE.Color(), [])
  const audio = useContext(AudioContext)

  const positions = useMemo(() => {
    const pos: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      pos.push(new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      ))
    }
    return pos
  }, [])

  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), [])

  // Smooth audio values to prevent jitter
  const smoothBass = useRef(0)
  const smoothMid = useRef(0)
  const smoothTreble = useRef(0)
  const smoothVolume = useRef(0)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime() * speedMult

    // Smooth audio interpolation
    smoothBass.current += (audio.bass - smoothBass.current) * 0.15
    smoothMid.current += (audio.mid - smoothMid.current) * 0.12
    smoothTreble.current += (audio.treble - smoothTreble.current) * 0.1
    smoothVolume.current += (audio.volume - smoothVolume.current) * 0.1

    const bass = smoothBass.current
    const mid = smoothMid.current
    const treble = smoothTreble.current
    const vol = smoothVolume.current

    // Audio-reactive parameters
    const audioPulse = 1.0 + bass * 0.6
    const audioTurbulence = 0.7 + mid * 1.8
    const audioSpeed = 0.32 + treble * 0.5
    const audioSize = 30 + vol * 15
    const audioDepth = 3.4 + bass * 2.0
    const audioPetalCurl = 1.15 + mid * 0.4

    const phaseTime = time * audioSpeed
    const nebulaSize = audioSize
    const petalCurl = audioPetalCurl
    const cloudDepth = audioDepth
    const corePulse = 0.75 + bass * 1.0
    const turbulence = audioTurbulence

    const safeCount = Math.max(1.0, count)
    const tau = Math.PI * 2.0
    const goldenAngle = 2.399963229728653

    for (let i = 0; i < count; i++) {
      const unitIndex = i / safeCount

      const hashA = Math.sin((i + 1.0) * 12.9898) * 43758.5453
      const hashB = Math.sin((i + 1.0) * 78.233) * 24634.6345
      const hashC = Math.sin((i + 1.0) * 39.425) * 15731.7431

      const randA = hashA - Math.floor(hashA)
      const randB = hashB - Math.floor(hashB)
      const randC = hashC - Math.floor(hashC)

      const signedA = randA * 2.0 - 1.0
      const signedB = randB * 2.0 - 1.0
      const signedC = randC * 2.0 - 1.0

      let px = 0.0, py = 0.0, pz = 0.0
      let hue = 0.93, saturation = 0.9, lightness = 0.5

      // 70% — Rose petals (react to bass + mid)
      if (unitIndex < 0.70) {
        const local = unitIndex / 0.70
        const layerPosition = local * 7.0
        const layer = Math.min(6.0, Math.floor(layerPosition))
        const layerFraction = layerPosition - layer
        const petalCount = 7.0 + layer
        const petalPosition = layerFraction * petalCount
        const petal = Math.floor(petalPosition)
        const along = petalPosition - petal
        const petalArc = Math.sin(Math.PI * along)
        const layerScale = layer / 6.0
        const breathing = audioPulse + 0.035 * Math.sin(time * corePulse + layer * 0.9)
        const baseAngle = (petal / petalCount) * tau + layer * goldenAngle * 0.34
        const curlAngle = baseAngle + phaseTime * (0.34 - layerScale * 0.18) + petalCurl * (along - 0.18) * (0.75 + layerScale * 0.85) + signedC * 0.045 * turbulence
        const radialStart = nebulaSize * (0.08 + layerScale * 0.43)
        const radialGrowth = nebulaSize * (0.20 + layerScale * 0.22) * along
        const radialRipple = nebulaSize * 0.018 * turbulence * Math.sin(along * 13.0 + layer * 2.1 + time * 0.42)
        const radius = (radialStart + radialGrowth + radialRipple) * breathing
        const petalWidth = nebulaSize * (0.025 + layerScale * 0.055) * petalArc * (0.35 + 0.65 * randB)
        const sideOffset = signedA * petalWidth
        const ca = Math.cos(curlAngle), sa = Math.sin(curlAngle)
        const tangentAngle = curlAngle + Math.PI * 0.5
        const ct = Math.cos(tangentAngle), st = Math.sin(tangentAngle)
        px = ca * radius + ct * sideOffset
        pz = sa * radius + st * sideOffset
        py = signedB * cloudDepth * petalArc * (0.35 + layerScale * 0.95) + Math.sin(curlAngle * 3.0 - time * 0.28 + layer) * cloudDepth * 0.12 * turbulence
        const dustLane = 0.5 + 0.5 * Math.sin(petal * 2.7 + along * 18.0 + layer * 1.3)
        const edgeGlow = Math.pow(petalArc, 0.45)
        hue = 0.955 - layerScale * 0.085 + signedC * 0.018 + bass * 0.02
        saturation = 0.72 + edgeGlow * 0.26 + mid * 0.15
        lightness = 0.14 + edgeGlow * 0.48 + (1.0 - layerScale) * 0.10 - dustLane * 0.10 + vol * 0.15
      }
      // 14% — Core (react to bass heavily)
      else if (unitIndex < 0.84) {
        const local = (unitIndex - 0.70) / 0.14
        const coreRadius = nebulaSize * 0.16 * Math.pow(local, 0.36)
        const coreTheta = i * goldenAngle + phaseTime * 0.8
        const coreY = 1.0 - 2.0 * randB
        const coreRing = Math.sqrt(Math.max(0.0, 1.0 - coreY * coreY))
        const pulse = audioPulse + 0.13 * Math.sin(time * corePulse * 2.0 + i * 0.013)
        px = Math.cos(coreTheta) * coreRing * coreRadius * pulse
        py = coreY * coreRadius * pulse
        pz = Math.sin(coreTheta) * coreRing * coreRadius * pulse
        hue = 0.07 + randC * 0.05 + bass * 0.03
        saturation = 0.52 + randA * 0.28 + bass * 0.2
        lightness = 0.56 + (1.0 - local) * 0.38 + bass * 0.25
      }
      // 12% — Halo (react to treble)
      else if (unitIndex < 0.96) {
        const local = (unitIndex - 0.84) / 0.12
        const haloAngle = i * goldenAngle + phaseTime * 0.12
        const haloRadius = nebulaSize * (0.72 + local * 0.66 + signedA * 0.08)
        const haloWarp = 1.0 + 0.10 * Math.sin(haloAngle * 5.0 + time * 0.25) + 0.05 * turbulence * Math.sin(haloAngle * 11.0 - time * 0.17) + treble * 0.15 * Math.sin(haloAngle * 8.0 + time * 2.0)
        px = Math.cos(haloAngle) * haloRadius * haloWarp
        pz = Math.sin(haloAngle) * haloRadius * haloWarp
        py = signedB * cloudDepth * (1.2 + local * 1.8) + Math.sin(haloAngle * 2.0 + time * 0.2) * cloudDepth * 0.35
        hue = 0.79 + randC * 0.13 + treble * 0.05
        saturation = 0.58 + randA * 0.30 + mid * 0.12
        lightness = 0.12 + (1.0 - local) * 0.22 + randB * 0.12 + vol * 0.18
      }
      // 4% — Stars (twinkle faster with treble)
      else {
        const local = (unitIndex - 0.96) / 0.04
        const starAngle = i * goldenAngle
        const starY = signedB
        const starRing = Math.sqrt(Math.max(0.0, 1.0 - starY * starY))
        const starRadius = nebulaSize * (1.25 + local * 1.10 + randA * 0.55)
        const twinkle = 0.5 + 0.5 * Math.sin(time * (1.2 + randC * 2.2 + treble * 3.0) + i * 0.17)
        px = Math.cos(starAngle) * starRing * starRadius
        py = starY * starRadius * 0.72
        pz = Math.sin(starAngle) * starRing * starRadius
        hue = 0.55 + randC * 0.12
        saturation = 0.18 + randA * 0.35
        lightness = 0.32 + twinkle * 0.50 + vol * 0.2
      }

      lightness = Math.max(0.02, Math.min(0.98, lightness))
      saturation = Math.max(0.0, Math.min(1.0, saturation))
      hue = hue - Math.floor(hue)

      target.set(px, py, pz)

      // Per-particle orbital drift — each particle slowly orbits its target
      const driftPhase = i * 0.001 + time * 0.15
      const driftRadius = 0.3 + randA * 0.4
      target.x += Math.sin(driftPhase) * driftRadius
      target.y += Math.cos(driftPhase * 0.7) * driftRadius * 0.6
      target.z += Math.sin(driftPhase * 1.3) * driftRadius * 0.4

      pColor.setHSL(hue, saturation, lightness)

      positions[i].lerp(target, 0.08)
      dummy.position.copy(positions[i])
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      meshRef.current.setColorAt(i, pColor)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} />
}

interface RoseNebulaProps {
  audioData?: AudioData
}

export function RoseNebula({ audioData }: RoseNebulaProps) {
  const defaultAudio: AudioData = {
    frequency: new Uint8Array(64),
    waveform: new Uint8Array(64),
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
  }

  return (
    <div className="fixed inset-0 z-0" style={{ background: '#050208' }}>
      <AudioContext.Provider value={audioData || defaultAudio}>
        <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
          <fog attach="fog" args={['#050208', 0.01]} />
          <NebulaGroup>
            {/* Main nebula body — slow y-axis rotation */}
            <OrbitalLayer speed={0.04} axis="y" tilt={0.2}>
              <ParticleSwarm />
            </OrbitalLayer>

            {/* Orbital rings */}
            <OrbitRing radius={38} speed={0.08} color="#d63384" thickness={0.15} opacity={0.25} tiltX={0.3} tiltZ={0.1} />
            <OrbitRing radius={42} speed={-0.05} color="#9c27b0" thickness={0.1} opacity={0.18} tiltX={0.5} tiltZ={-0.2} />
            <OrbitRing radius={48} speed={0.03} color="#e8527a" thickness={0.08} opacity={0.12} tiltX={0.8} tiltZ={0.4} />

            {/* Orbiting particle trails */}
            <OrbitParticles radius={35} speed={0.12} count={200} color="#ff69b4" size={0.3} tiltX={0.25} tiltZ={0.05} />
            <OrbitParticles radius={44} speed={-0.07} count={150} color="#c77dba" size={0.2} tiltX={0.6} tiltZ={-0.15} />
            <OrbitParticles radius={52} speed={0.04} count={100} color="#dda0dd" size={0.15} tiltX={0.9} tiltZ={0.3} />
          </NebulaGroup>
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.3}
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
      </AudioContext.Provider>
    </div>
  )
}
