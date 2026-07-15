import type { Metadata } from "next";
import { TacticsLab } from "./tactics-lab";

export const metadata: Metadata = {
  title: "国家队战术板 | 西班牙 4-1-2-3 动态阵型",
  description:
    "从位置职责、攻防阶段与教练指令理解国家队阵型变化。第一阶段以西班牙为例。",
};

export default function Home() {
  return <TacticsLab />;
}
