import { ImageResponse } from "next/og";
import data from "../../data.json";

export const config = { runtime: "edge" };

const { name, profile } = data;

// /api/og → profile card; /api/og?title=… → blog post card with the author underneath.
export default function handler(req) {
  const title = new URL(req.url).searchParams.get("title")?.slice(0, 140);

  return new ImageResponse(
    title ? (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "80px", background: "linear-gradient(135deg, #0b0b0f 0%, #2a1336 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 30, color: "#c79be0" }}>Blog</div>
        <div style={{ fontSize: title.length > 70 ? 56 : 68, lineHeight: 1.15 }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34 }}>{name}</div>
          <div style={{ fontSize: 28, color: "#bdbdbd" }}>{`${profile.jobTitle} · React · TypeScript · Node.js`}</div>
        </div>
      </div>
    ) : (
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
