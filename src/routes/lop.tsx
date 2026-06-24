import { useParams, useSearchParams } from "react-router-dom";
import { mockRepository as repo } from "@/data/mockRepository";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/report/PageHeader";
import { ExportButton } from "@/components/report/ExportButton";
import { TongHopTab } from "./lop/TongHopTab";
import { LopTab } from "./lop/LopTab";
import { NhaTab } from "./lop/NhaTab";
import { ThiTab } from "./lop/ThiTab";

const TABS = [
  { key: "tong-hop", label: "Tổng hợp" },
  { key: "lop", label: "Học tại lớp" },
  { key: "nha", label: "Học tại nhà" },
  { key: "thi", label: "Qua các kì thi" },
];

export default function Lop() {
  const { classId = "" } = useParams();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") ?? "tong-hop";
  const report = repo.getClassReport(classId);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Lớp ${report.klass.name}`}
        subtitle={`GV chủ nhiệm ${report.klass.homeroomTeacher} · ${report.students.length} học sinh`}
        right={<ExportButton scope={{ kind: "lop", id: classId, title: `Báo cáo lớp ${report.klass.name}` }} />}
      />

      <Tabs value={tab} onValueChange={(v) => setSp({ tab: v })}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="tong-hop" className="pt-2">
          <TongHopTab report={report} />
        </TabsContent>
        <TabsContent value="lop" className="pt-2">
          <LopTab report={report} />
        </TabsContent>
        <TabsContent value="nha" className="pt-2">
          <NhaTab report={report} />
        </TabsContent>
        <TabsContent value="thi" className="pt-2">
          <ThiTab report={report} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
