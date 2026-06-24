import type { ReactNode } from "react";
import type { EventStatus } from "@/data/types";

/** Một chương đã dựng sẵn để vỏ Journey/PresentationMode render — kind-agnostic. */
export interface ChapterDef {
  id: string;
  title: string;
  status?: EventStatus;
  render: () => ReactNode;
}
