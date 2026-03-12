"use client"

import { useMemo } from "react"
import { CAMELOT_KEYS, getCamelotKey, getAllCompatibleKeys } from "@/lib/camelot"

const CX = 200
const CY = 200

// Ring radii
const INNER_R1 = 62   // A (minor) inner edge
const INNER_R2 = 128  // A (minor) outer edge
const OUTER_R1 = 133  // B (major) inner edge
const OUTER_R2 = 192  // B (major) outer edge
const CENTER_R = 54

// Each position (1-12) gets a hue: 0°, 30°, 60° ... 330°
function posHue(pos: number) {
  return (pos - 1) * 30
}

function segFill(
  pos: number,
  letter: "A" | "B",
  state: "normal" | "selected" | "compatible" | "dimmed"
): string {
  const h = posHue(pos)
  if (state === "dimmed") return `hsl(${h}, 15%, 28%)`
  if (letter === "A") {
    // Minor — deeper/darker
    if (state === "selected") return `hsl(${h}, 90%, 52%)`
    if (state === "compatible") return `hsl(${h}, 80%, 46%)`
    return `hsl(${h}, 72%, 40%)`
  } else {
    // Major — lighter
    if (state === "selected") return `hsl(${h}, 82%, 66%)`
    if (state === "compatible") return `hsl(${h}, 72%, 61%)`
    return `hsl(${h}, 62%, 58%)`
  }
}

function polar(r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180)
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function arcPath(r1: number, r2: number, startDeg: number, endDeg: number): string {
  const a = polar(r1, startDeg)
  const b = polar(r2, startDeg)
  const c = polar(r2, endDeg)
  const d = polar(r1, endDeg)
  return [
    `M${b.x},${b.y}`,
    `A${r2},${r2} 0 0,1 ${c.x},${c.y}`,
    `L${d.x},${d.y}`,
    `A${r1},${r1} 0 0,0 ${a.x},${a.y}`,
    "Z",
  ].join(" ")
}

// Rotate text to point radially outward; flip bottom-half text so it stays readable
function textRot(midAngle: number): number {
  const raw = midAngle - 90
  const norm = ((raw % 360) + 360) % 360
  return norm > 90 && norm < 270 ? raw + 180 : raw
}

interface Props {
  selectedKey: string
  onKeySelect: (key: string) => void
}

export function CamelotWheel({ selectedKey, onKeySelect }: Props) {
  const compatibleSet = useMemo(() => {
    const key = getCamelotKey(selectedKey)
    if (!key) return new Set<string>()
    return new Set(getAllCompatibleKeys(key).map((k) => k.camelot))
  }, [selectedKey])

  const hasSelection = Boolean(selectedKey)

  return (
    <svg
      viewBox="0 0 400 400"
      className="w-full max-w-[380px] mx-auto select-none"
      aria-label="Interactive Camelot Wheel — click any key segment to see compatible keys"
    >
      {CAMELOT_KEYS.map((key) => {
        const { number: n, letter } = key
        const midAngle = (n - 1) * 30 + 15
        const startAngle = (n - 1) * 30 + 0.5
        const endAngle = n * 30 - 0.5

        const r1 = letter === "A" ? INNER_R1 : OUTER_R1
        const r2 = letter === "A" ? INNER_R2 : OUTER_R2
        const labelR = (r1 + r2) / 2

        const isSelected = key.camelot === selectedKey
        const isCompatible = compatibleSet.has(key.camelot)
        const state = isSelected
          ? "selected"
          : isCompatible
          ? "compatible"
          : hasSelection
          ? "dimmed"
          : "normal"

        const fill = segFill(n, letter, state)
        const strokeColor =
          isSelected
            ? "#ffffff"
            : isCompatible
            ? "rgba(255,255,255,0.65)"
            : "rgba(0,0,0,0.2)"
        const strokeW = isSelected ? 2.5 : isCompatible ? 1.5 : 0.5

        const lp = polar(labelR, midAngle)
        const rot = textRot(midAngle)

        return (
          <g
            key={key.camelot}
            onClick={() => onKeySelect(key.camelot)}
            onKeyDown={(e) => e.key === "Enter" && onKeySelect(key.camelot)}
            className="cursor-pointer outline-none"
            tabIndex={0}
            role="button"
            aria-label={`${key.camelot} – ${key.musical} (${key.mode})`}
          >
            <path
              d={arcPath(r1, r2, startAngle, endAngle)}
              fill={fill}
              stroke={strokeColor}
              strokeWidth={strokeW}
              opacity={state === "dimmed" ? 0.32 : 1}
              className="transition-opacity duration-150"
            />
            <text
              transform={`translate(${lp.x},${lp.y}) rotate(${rot})`}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              pointerEvents="none"
              opacity={state === "dimmed" ? 0.45 : 1}
            >
              <tspan
                x={0}
                dy="-0.55em"
                fontSize={letter === "A" ? "14.5" : "13"}
                fontWeight="700"
              >
                {key.camelot}
              </tspan>
              <tspan
                x={0}
                dy="1.3em"
                fontSize={letter === "A" ? "11" : "10.5"}
                opacity="0.9"
              >
                {key.musical}
              </tspan>
            </text>
          </g>
        )
      })}

      {/* Center disc */}
      <circle
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <text
        x={CX}
        y={CY - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--foreground)"
        fontSize="12"
        fontWeight="700"
        pointerEvents="none"
      >
        Camelot
      </text>
      <text
        x={CX}
        y={CY + 9}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--muted-foreground)"
        fontSize="10"
        pointerEvents="none"
      >
        Wheel
      </text>
    </svg>
  )
}
