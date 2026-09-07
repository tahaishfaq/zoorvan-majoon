import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#5F1111",
        color: "#FFF8EE",
        fontSize: 43,
        fontFamily: "serif",
      }}
    >
      Z
    </div>,
    size,
  );
}
