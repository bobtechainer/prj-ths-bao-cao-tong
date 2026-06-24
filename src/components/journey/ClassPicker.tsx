import { FocusPicker } from "@/components/journey/FocusPicker";
import { mockRepository as repo } from "@/data/mockRepository";

/** Chọn lớp đang xem: lớp chủ nhiệm (gắn nhãn) + các lớp bộ môn của giáo viên. */
export function ClassPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (classId: string) => void;
}) {
  const teaching = repo.getTeaching();
  const ids = [teaching.homeroomClassId, ...teaching.subjectClassIds];
  const items = ids.map((id) => {
    const k = repo.getClass(id);
    const name = k ? k.name : id;
    const label = id === teaching.homeroomClassId ? `${name} · chủ nhiệm` : `${name} · ${teaching.subject}`;
    return { id, label };
  });
  return <FocusPicker items={items} selectedId={selectedId} onSelect={onSelect} />;
}
