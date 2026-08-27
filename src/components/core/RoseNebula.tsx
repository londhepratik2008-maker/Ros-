import { useRef, useMemo, createContext, useContext, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { AudioData } from '../../hooks/useAudioAnalyzer'
import { useUIStore } from '../../store/uiStore'
import { useChatStore } from '../../store/chatStore'

interface NebulaContextData {
  audio: AudioData
  isShattering: boolean
  isAssembling: boolean
  shatterProgress: number
  assembleProgress: number
}

const NebulaContext = createContext<NebulaContextData>({
  audio: {
    frequency: new Uint8Array(64),
    waveform: new Uint8Array(64),
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
  },
  isShattering: false,
  isAssembling: false,
  shatterProgress: 0,
  assembleProgress: 0,
})

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
  const { audio, isShattering, isAssembling, shatterProgress, assembleProgress } = useContext(NebulaContext)

  const geometry = useMemo(() => {
    return new THREE.TorusGeometry(radius, thickness, 16, 64)
  }, [radius, thickness])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.z = t * speed

    if (isShattering) {
      const scale = 1.0 + shatterProgress * 3.0
      ref.current.scale.set(scale, scale, scale)
      const mat = ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity * (1.0 - shatterProgress)
    } else if (isAssembling) {
      const scale = 4.0 - assembleProgress * 3.0
      ref.current.scale.set(scale, scale, scale)
      const mat = ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity * assembleProgress
    } else {
      const scale = 1.0 + audio.bass * 0.08
      ref.current.scale.set(scale, scale, scale)
      const mat = ref.current.material as THREE.MeshBasicMaterial
      mat.opacity = opacity + audio.volume * 0.15
    }
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
  const { audio, isShattering, isAssembling, shatterProgress, assembleProgress } = useContext(NebulaContext)

  const { geometry } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      pos[i * 3] = Math.cos(angle) * radius
      pos[i * 3 + 1] = (Math.random() - 0.5) * size * 2
      pos[i * 3 + 2] = Math.sin(angle) * radius
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return { geometry: geo }
  }, [radius, count, size])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime()
    ref.current.rotation.z = t * speed
    const mat = ref.current.material as THREE.PointsMaterial

    if (isShattering) {
      mat.size = size * (1.0 + shatterProgress * 5.0)
      mat.opacity = 0.7 * (1.0 - shatterProgress)
      const scale = 1.0 + shatterProgress * 4.0
      ref.current.scale.set(scale, scale, scale)
    } else if (isAssembling) {
      mat.size = size * (6.0 - assembleProgress * 5.0)
      mat.opacity = 0.7 * assembleProgress
      const scale = 5.0 - assembleProgress * 4.0
      ref.current.scale.set(scale, scale, scale)
    } else {
      mat.size = size + audio.treble * 2
      mat.opacity = 0.7
    }
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

const NebulaGroup = ({ children }: { children: React.ReactNode }) => {
  const groupRef = useRef<THREE.Group>(null!)
  const { isShattering, isAssembling, shatterProgress, assembleProgress } = useContext(NebulaContext)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    if (isShattering) {
      groupRef.current.rotation.y = t * 0.03 + shatterProgress * Math.PI * 4
      groupRef.current.rotation.x = shatterProgress * Math.PI * 2
      groupRef.current.position.y = shatterProgress * 30
    } else if (isAssembling) {
      const reverseT = t * 0.03 + (1.0 - assembleProgress) * Math.PI * 4
      groupRef.current.rotation.y = reverseT
      groupRef.current.rotation.x = (1.0 - assembleProgress) * Math.PI * 2
      groupRef.current.position.y = (1.0 - assembleProgress) * 30
    } else {
      groupRef.current.rotation.y = t * 0.03
      groupRef.current.rotation.x = Math.sin(t * 0.015) * 0.15
      groupRef.current.rotation.z = Math.cos(t * 0.012) * 0.08
      groupRef.current.position.x = Math.sin(t * 0.02) * 2
      groupRef.current.position.y = Math.cos(t * 0.018) * 1.5
    }
  })

  return <group ref={groupRef}>{children}</group>
}

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
  // Reduced from 15k → 7k for ~2x GPU headroom during inference
  const count = 7000
  const speedMult = 0.8
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const pColor = useMemo(() => new THREE.Color(), [])
  const { audio, isShattering, isAssembling, shatterProgress, assembleProgress } = useContext(NebulaContext)

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

  // Store original nebula positions for reassembly
  const originalPositions = useMemo(() => {
    const pos: THREE.Vector3[] = []
    const safeCount = Math.max(1.0, count)
    const tau = Math.PI * 2.0
    const goldenAngle = 2.399963229728653
    const petalCurl = 1.15

    for (let i = 0; i < count; i++) {
      const unitIndex = i / safeCount
      const hashA = Math.sin((i + 1.0) * 12.9898) * 43758.5453
      const hashB = Math.sin((i + 1.0) * 78.233) * 24634.6345
      const randA = hashA - Math.floor(hashA)
      const randB = hashB - Math.floor(hashB)
      const signedA = randA * 2.0 - 1.0
      const signedB = randB * 2.0 - 1.0

      let px = 0.0, py = 0.0, pz = 0.0
      const nebulaSize = 30

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
        const baseAngle = (petal / petalCount) * tau + layer * goldenAngle * 0.34
        const curlAngle = baseAngle + petalCurl * (along - 0.18) * (0.75 + layerScale * 0.85)
        const radialStart = nebulaSize * (0.08 + layerScale * 0.43)
        const radialGrowth = nebulaSize * (0.20 + layerScale * 0.22) * along
        const radius = (radialStart + radialGrowth) * 1.0
        const petalWidth = nebulaSize * (0.025 + layerScale * 0.055) * petalArc * (0.35 + 0.65 * randB)
        const sideOffset = signedA * petalWidth
        const ca = Math.cos(curlAngle), sa = Math.sin(curlAngle)
        const tangentAngle = curlAngle + Math.PI * 0.5
        const ct = Math.cos(tangentAngle), st = Math.sin(tangentAngle)
        px = ca * radius + ct * sideOffset
        pz = sa * radius + st * sideOffset
        py = signedB * 3.4 * petalArc * (0.35 + layerScale * 0.95)
      } else if (unitIndex < 0.84) {
        const local = (unitIndex - 0.70) / 0.14
        const coreRadius = nebulaSize * 0.16 * Math.pow(local, 0.36)
        const coreTheta = i * goldenAngle
        const coreY = 1.0 - 2.0 * randB
        const coreRing = Math.sqrt(Math.max(0.0, 1.0 - coreY * coreY))
        px = Math.cos(coreTheta) * coreRing * coreRadius
        py = coreY * coreRadius
        pz = Math.sin(coreTheta) * coreRing * coreRadius
      } else if (unitIndex < 0.96) {
        const local = (unitIndex - 0.84) / 0.12
        const haloAngle = i * goldenAngle
        const haloRadius = nebulaSize * (0.72 + local * 0.66 + signedA * 0.08)
        px = Math.cos(haloAngle) * haloRadius
        pz = Math.sin(haloAngle) * haloRadius
        py = signedB * 3.4 * (1.2 + local * 1.8)
      } else {
        const local = (unitIndex - 0.96) / 0.04
        const starAngle = i * goldenAngle
        const starY = signedB
        const starRing = Math.sqrt(Math.max(0.0, 1.0 - starY * starY))
        const starRadius = nebulaSize * (1.25 + local * 1.10 + randA * 0.55)
        px = Math.cos(starAngle) * starRing * starRadius
        py = starY * starRadius * 0.72
        pz = Math.sin(starAngle) * starRing * starRadius
      }

      pos.push(new THREE.Vector3(px, py, pz))
    }
    return pos
  }, [])

  const shatterDirections = useMemo(() => {
    const dirs: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      dirs.push(new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize())
    }
    return dirs
  }, [])

  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.25), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff }), [])

  const smoothBass = useRef(0)
  const smoothMid = useRef(0)
  const smoothTreble = useRef(0)
  const smoothVolume = useRef(0)
  const frameCounter = useRef(0)
  const isStreaming = useChatStore(s => s.isStreaming)

  useFrame((state) => {
    if (!meshRef.current) return
    // Halve nebula FPS while the LLM streams — frees GPU for tokens
    frameCounter.current += 1
    if (isStreaming && frameCounter.current % 2 === 0) return
    const time = state.clock.getElapsedTime() * speedMult

    smoothBass.current += (audio.bass - smoothBass.current) * 0.15
    smoothMid.current += (audio.mid - smoothMid.current) * 0.12
    smoothTreble.current += (audio.treble - smoothTreble.current) * 0.1
    smoothVolume.current += (audio.volume - smoothVolume.current) * 0.1

    const bass = smoothBass.current
    const mid = smoothMid.current
    const treble = smoothTreble.current
    const vol = smoothVolume.current

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

      if (isShattering) {
        // Compute from pristine original positions so repeated shatters never drift
        const shatterDir = shatterDirections[i]
        const shatterDist = shatterProgress * 120
        const shatterSpin = shatterProgress * Math.PI * 2 * (randA - 0.5)
        const orig = originalPositions[i]

        px = orig.x + shatterDir.x * shatterDist + Math.sin(shatterSpin) * 5
        py = orig.y + shatterDir.y * shatterDist + Math.cos(shatterSpin) * 5
        pz = orig.z + shatterDir.z * shatterDist

        hue = 0.95 - shatterProgress * 0.3 + signedC * 0.02
        saturation = 0.8 - shatterProgress * 0.4
        lightness = 0.4 + shatterProgress * 0.3
      } else if (isAssembling) {
        // Fly back to original position
        const orig = originalPositions[i]
        const eased = 1.0 - Math.pow(1.0 - assembleProgress, 3)

        px = positions[i].x + (orig.x - positions[i].x) * eased * 0.45
        py = positions[i].y + (orig.y - positions[i].y) * eased * 0.45
        pz = positions[i].z + (orig.z - positions[i].z) * eased * 0.45

        if (assembleProgress >= 0.999) {
          px = orig.x
          py = orig.y
          pz = orig.z
        }

        // Compute proper colors based on particle section
        if (unitIndex < 0.70) {
          const local = unitIndex / 0.70
          const layerScale = Math.min(6.0, Math.floor(local * 7.0)) / 6.0
          const petalArc = Math.sin(Math.PI * (local * 7.0 - Math.floor(local * 7.0)))
          const edgeGlow = Math.pow(petalArc, 0.45)
          hue = 0.955 - layerScale * 0.085 + signedC * 0.018
          saturation = 0.72 + edgeGlow * 0.26
          lightness = 0.14 + edgeGlow * 0.48 + (1.0 - layerScale) * 0.10
        } else if (unitIndex < 0.84) {
          const local = (unitIndex - 0.70) / 0.14
          hue = 0.07 + randC * 0.05
          saturation = 0.52 + randA * 0.28
          lightness = 0.56 + (1.0 - local) * 0.38
        } else if (unitIndex < 0.96) {
          const local = (unitIndex - 0.84) / 0.12
          hue = 0.79 + randC * 0.13
          saturation = 0.58 + randA * 0.30
          lightness = 0.12 + (1.0 - local) * 0.22 + randB * 0.12
        } else {
          hue = 0.55 + randC * 0.12
          saturation = 0.18 + randA * 0.35
          lightness = 0.32 + 0.5
        }

        // Fade in from bright to normal
        const fadeIn = Math.min(1.0, assembleProgress * 2.0)
        lightness = 0.8 * (1.0 - fadeIn) + lightness * fadeIn
        saturation = 0.3 * (1.0 - fadeIn) + saturation * fadeIn

        positions[i].x = px
        positions[i].y = py
        positions[i].z = pz
      } else {
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
        } else if (unitIndex < 0.84) {
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
        } else if (unitIndex < 0.96) {
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
        } else {
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

        const driftPhase = i * 0.001 + time * 0.15
        const driftRadius = 0.3 + randA * 0.4
        target.x += Math.sin(driftPhase) * driftRadius
        target.y += Math.cos(driftPhase * 0.7) * driftRadius * 0.6
        target.z += Math.sin(driftPhase * 1.3) * driftRadius * 0.4

        positions[i].lerp(target, 0.08)
        px = positions[i].x
        py = positions[i].y
        pz = positions[i].z
      }

      pColor.setHSL(hue, saturation, lightness)

      dummy.position.set(px, py, pz)
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

const DEFAULT_AUDIO: AudioData = {
  frequency: new Uint8Array(64),
  waveform: new Uint8Array(64),
  bass: 0,
  mid: 0,
  treble: 0,
  volume: 0,
}

export function RoseNebula({ audioData }: RoseNebulaProps) {
  const isShattering = useUIStore(s => s.isShattering)
  const isAssembling = useUIStore(s => s.isAssembling)
  const [shatterProgress, setShatterProgress] = useState(0)
  const [assembleProgress, setAssembleProgress] = useState(0)
  const shatterStart = useRef(0)
  const assembleStart = useRef(0)

  useEffect(() => {
    if (isShattering) {
      shatterStart.current = performance.now()
    } else {
      setShatterProgress(0)
    }
  }, [isShattering])

  useEffect(() => {
    if (isAssembling) {
      assembleStart.current = performance.now()
    } else {
      setAssembleProgress(0)
    }
  }, [isAssembling])

  // Drive shatter progress
  useEffect(() => {
    if (!isShattering) return
    let raf: number
    const animate = () => {
      const elapsed = (performance.now() - shatterStart.current) / 1000
      const progress = Math.min(1.0, elapsed / 3.0)
      setShatterProgress(progress)
      if (progress < 1.0) {
        raf = requestAnimationFrame(animate)
      }
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isShattering])

  // Drive assemble progress
  useEffect(() => {
    if (!isAssembling) return
    let raf: number
    let resetTimer = 0
    const animate = () => {
      const elapsed = (performance.now() - assembleStart.current) / 1000
      const progress = Math.min(1.0, elapsed / 3.0)
      setAssembleProgress(progress)
      if (progress < 1.0) {
        raf = requestAnimationFrame(animate)
      } else {
        // Assembly complete — clear flag so idle animation resumes
        resetTimer = window.setTimeout(() => {
          const s = useUIStore.getState()
          if (s.isAssembling) s.resetState()
        }, 150)
      }
    }
    raf = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resetTimer)
    }
  }, [isAssembling])

  const contextValue = useMemo(() => ({
    audio: audioData || DEFAULT_AUDIO,
    isShattering,
    isAssembling,
    shatterProgress,
    assembleProgress,
  }), [audioData, isShattering, isAssembling, shatterProgress, assembleProgress])

  return (
    <div className="fixed inset-0 z-0" style={{ background: '#050208' }}>
      <NebulaContext.Provider value={contextValue}>
        <Canvas camera={{ position: [0, 0, 100], fov: 60 }}>
          <fog attach="fog" args={['#050208', 0.01]} />
          <NebulaGroup>
            <OrbitalLayer speed={0.04} axis="y" tilt={0.2}>
              <ParticleSwarm />
            </OrbitalLayer>
            <OrbitRing radius={38} speed={0.08} color="#d63384" thickness={0.15} opacity={0.25} tiltX={0.3} tiltZ={0.1} />
            <OrbitRing radius={42} speed={-0.05} color="#9c27b0" thickness={0.1} opacity={0.18} tiltX={0.5} tiltZ={-0.2} />
            <OrbitRing radius={48} speed={0.03} color="#e8527a" thickness={0.08} opacity={0.12} tiltX={0.8} tiltZ={0.4} />
            <OrbitParticles radius={35} speed={0.12} count={100} color="#ff69b4" size={0.3} tiltX={0.25} tiltZ={0.05} />
            <OrbitParticles radius={44} speed={-0.07} count={80} color="#c77dba" size={0.2} tiltX={0.6} tiltZ={-0.15} />
            <OrbitParticles radius={52} speed={0.04} count={60} color="#dda0dd" size={0.15} tiltX={0.9} tiltZ={0.3} />
          </NebulaGroup>
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.3}
            enableZoom={false}
            enablePan={false}
          />
        </Canvas>
      </NebulaContext.Provider>
    </div>
  )
}
