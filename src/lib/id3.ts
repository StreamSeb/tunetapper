/**
 * Minimal ID3v2 reader for artist and title. Reads only the tag header and
 * text frames at the start of an MP3; anything unexpected returns {} and
 * the caller falls back to the file name.
 */

export interface BasicTags {
  artist?: string
  title?: string
}

function syncsafe(b: Uint8Array, o: number): number {
  return ((b[o] & 0x7f) << 21) | ((b[o + 1] & 0x7f) << 14) | ((b[o + 2] & 0x7f) << 7) | (b[o + 3] & 0x7f)
}

function decodeText(bytes: Uint8Array): string {
  if (bytes.length === 0) return ""
  const enc = bytes[0]
  const body = bytes.subarray(1)
  let text: string
  try {
    if (enc === 0) text = new TextDecoder("latin1").decode(body)
    else if (enc === 1) text = new TextDecoder("utf-16").decode(body) // BOM picks endianness
    else if (enc === 2) text = new TextDecoder("utf-16be").decode(body)
    else text = new TextDecoder("utf-8").decode(body)
  } catch {
    return ""
  }
  // Multiple values are NUL-separated; keep the first, strip a BOM
  return text.replace(/^﻿/, "").split("\u0000")[0].trim()
}

export async function readId3(file: File): Promise<BasicTags> {
  try {
    const head = new Uint8Array(await file.slice(0, 10).arrayBuffer())
    if (head.length < 10 || head[0] !== 0x49 || head[1] !== 0x44 || head[2] !== 0x33) return {}
    const version = head[3]
    const size = syncsafe(head, 6)
    if (version < 2 || version > 4 || size <= 0) return {}
    // Text frames sit near the start; cover art can be megabytes, so cap the read
    const tag = new Uint8Array(await file.slice(10, 10 + Math.min(size, 512 * 1024)).arrayBuffer())
    const out: BasicTags = {}
    let o = 0
    // Skip an extended header (v2.3/v2.4)
    if (head[5] & 0x40 && version >= 3) {
      const ext = version === 4 ? syncsafe(tag, 0) : (tag[0] << 24) | (tag[1] << 16) | (tag[2] << 8) | tag[3]
      o = version === 4 ? ext : ext + 4
    }
    const idLen = version === 2 ? 3 : 4
    const hdrLen = version === 2 ? 6 : 10
    const want: Record<string, keyof BasicTags> =
      version === 2 ? { TT2: "title", TP1: "artist" } : { TIT2: "title", TPE1: "artist" }
    while (o + hdrLen <= tag.length) {
      const id = String.fromCharCode(...tag.subarray(o, o + idLen))
      if (!/^[A-Z0-9]+$/.test(id)) break // padding
      const len =
        version === 2
          ? (tag[o + 3] << 16) | (tag[o + 4] << 8) | tag[o + 5]
          : version === 4
            ? syncsafe(tag, o + 4)
            : ((tag[o + 4] << 24) | (tag[o + 5] << 16) | (tag[o + 6] << 8) | tag[o + 7]) >>> 0
      if (len <= 0 || o + hdrLen + len > tag.length) break
      const field = want[id]
      if (field) {
        const value = decodeText(tag.subarray(o + hdrLen, o + hdrLen + len))
        if (value) out[field] = value
        if (out.artist && out.title) break
      }
      o += hdrLen + len
    }
    return out
  } catch {
    return {}
  }
}
