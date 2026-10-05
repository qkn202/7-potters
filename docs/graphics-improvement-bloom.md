# Bloom Post-Processing - Architecture Sketch

## Current State (No Post-Processing)
```
┌─────────────────────────────────────────────────────────────┐
│                      GAME LOOP                              │
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│   │  Scene   │───▶│ Renderer │───▶│  Canvas  │           │
│   │  (3D)    │    │ (Basic)  │    │  Output  │           │
│   └──────────┘    └──────────┘    └──────────┘           │
│                                                             │
│   ❌ No glow effects, spells look flat                     │
└─────────────────────────────────────────────────────────────┘
```

## Target State (With Bloom)
```
┌─────────────────────────────────────────────────────────────┐
│                      GAME LOOP                              │
│                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│   │  Scene   │───▶│ Renderer │───▶│ Texture  │           │
│   │  (3D)    │    │          │    │ (HDR)    │           │
│   └──────────┘    └──────────┘    └────┬─────┘           │
│                                        │                   │
│                                        ▼                   │
│   ┌─────────────────────────────────────────────┐         │
│   │         EffectComposer Pipeline              │         │
│   │                                              │         │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐   │         │
│   │  │RenderPass│─▶│BloomPass│─▶│OutputPass│   │         │
│   │  │ (Scene)  │  │(Glow)  │  │(Gamma)  │   │         │
│   │  └─────────┘  └─────────┘  └─────────┘   │         │
│   │                                              │         │
│   │  bloomPass.settings:                        │         │
│   │    - strength: 1.5                        │         │
│   │    - radius: 0.4                          │         │
│   │    - threshold: 0.85                      │         │
│   └─────────────────────────────────────────────┘         │
│                          │                                │
│                          ▼                                │
│                    ┌──────────┐                         │
│                    │  Canvas  │                         │
│                    │ (Glowy!) │                         │
│                    └──────────┘                         │
│                                                             │
│   ✅ Expelliarmus beam glows                              │
│   ✅ Avada Kedavra lightning glows                         │
│   ✅ Candle flames have bloom                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Import Post-Processing
```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
```

### Step 2: Create Composer in initRenderer()
```typescript
private composer!: EffectComposer
private bloomPass!: UnrealBloomPass

private setupPostProcessing() {
  // Create composer with HDR target
  this.composer = new EffectComposer(this.renderer)
  
  // Pass 1: Render scene to texture
  const renderPass = new RenderPass(this.scene, this.camera)
  this.composer.addPass(renderPass)
  
  // Pass 2: Bloom glow effect
  this.bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,    // strength (glow intensity)
    0.4,    // radius (spread)
    0.85    // threshold (minimum brightness to bloom)
  )
  this.composer.addPass(this.bloomPass)
  
  // Pass 3: Final output with tone mapping
  const outputPass = new OutputPass()
  this.composer.addPass(outputPass)
}
```

### Step 3: Update Render Loop
```typescript
// OLD: Direct render
this.renderer.render(this.scene, this.camera)

// NEW: Use composer
this.composer.render()
```

### Step 4: Adjust for Performance
```typescript
// On low-end devices, reduce bloom
if (isLowEndDevice) {
  this.bloomPass.strength = 0.8
  this.bloomPass.resolution.set(512, 512)
}

// On resize
onWindowResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  
  this.camera.aspect = width / height
  this.camera.updateProjectionMatrix()
  
  this.renderer.setSize(width, height)
  this.composer.setSize(width, height)  // Important!
  this.bloomPass.resolution.set(width, height)
}
```

## Spell-Specific Glow Settings

| Spell | Color | Recommended Bloom |
|-------|-------|-----------------|
| Expelliarmus | Red (#ff3838) | strength: 2.0 |
| Avada Kedavra | Green (#00ff44) | strength: 2.5 |
| Incendio | Orange (#ff7b25) | strength: 1.8 |
| Stupefy | Yellow (#ffe600) | strength: 1.5 |
| Protego Shield | Blue (#38b6ff) | strength: 1.2 |
| Candle Flames | Warm (#ffd700) | strength: 0.6 |

## Dynamic Bloom Control
```typescript
// Increase bloom during spell impact
private triggerSpellBloom(spellColor: number, intensity: number) {
  gsap.to(this.bloomPass, {
    strength: intensity,
    duration: 0.2,
    ease: 'power2.out'
  })
  
  // Fade back to normal
  gsap.to(this.bloomPass, {
    strength: 1.5,
    duration: 0.8,
    delay: 0.3,
    ease: 'power2.in'
  })
}
```

## Files to Modify
1. `src/dueling.ts` - Add imports and setup
2. `src/dueling.ts` - Modify render loop
3. `src/dueling.ts` - Add dynamic bloom control
