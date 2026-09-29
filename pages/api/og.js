import { ImageResponse } from "next/og";
import data from "../../data.json";

export const config = { runtime: "edge" };

const { name, profile } = data;

export default function handler() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", padding: "80px", background: "linear-gradient(135deg, #0b0b0f 0%, #2a1336 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 36, color: "#c79be0" }}>Hi, I'm</div>
        <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
        <div style={{ fontSize: 48, marginTop: 24 }}>{profile.jobTitle}</div>
        <div style={{ fontSize: 34, marginTop: 24, color: "#bdbdbd" }}>React · TypeScript · Next.js · Node.js — Remote</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
