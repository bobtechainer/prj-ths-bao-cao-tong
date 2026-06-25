import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TeacherNav } from "./TeacherNav";
import { CLASS_HERO } from "@/data/mock/world";

const wrap = (path: string) =>
  render(<MemoryRouter initialEntries={[path]}><TeacherNav teacherId={CLASS_HERO} /></MemoryRouter>);

describe("TeacherNav", () => {
  test("hiện nhóm Chủ nhiệm + Bộ môn theo môn", () => {
    wrap("/app/lop/" + CLASS_HERO + "?role=cn");
    expect(screen.getByText("Chủ nhiệm")).toBeInTheDocument();
    expect(screen.getByText(/Bộ môn · Địa lí/)).toBeInTheDocument();
  });

  test("12 Văn xuất hiện ở cả nhóm chủ nhiệm lẫn bộ môn", () => {
    wrap("/app/lop/" + CLASS_HERO + "?role=cn");
    // tên lớp xuất hiện >= 2 lần (một ở mỗi nhóm)
    expect(screen.getAllByText("12 Văn").length).toBeGreaterThanOrEqual(2);
  });
});
