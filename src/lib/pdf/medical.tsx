import { pdf, Document, Page, Text, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { reportStyles as s } from "./report-styles";

export async function generateMedicalPDF(
  records: any[],
  pet: any,
  filters: { dateFrom?: string; dateTo?: string }
) {
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const doc = (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.frame}>
          <View style={s.titleBlock}>
            <Text style={s.companyName}>VetSystem</Text>
            <Text style={s.title}>Medical History Report</Text>
            <Text style={s.meta}>
              {pet?.name} ({pet?.species})
              {filters.dateFrom
                ? `  •  From ${filters.dateFrom}${filters.dateTo ? ` to ${filters.dateTo}` : ""}`
                : ""}
            </Text>
          </View>

          <View style={s.table}>
            <View style={s.headerRow}>
              <Text style={[s.headerCell, { width: "16%" }]}>Date</Text>
              <Text style={[s.headerCell, { width: "27%" }]}>Diagnosis</Text>
              <Text style={[s.headerCell, { width: "27%" }]}>Treatment</Text>
              <Text style={[s.headerCell, { width: "12%" }]}>Weight</Text>
              <Text style={[s.headerCell, { width: "18%" }]}>Recorded By</Text>
            </View>

            {sorted.length === 0 ? (
              <Text style={s.empty}>No medical records found for the selected filters</Text>
            ) : (
              sorted.map((record, i) => (
                <View key={i}>
                  <View style={s.row}>
                    <Text style={[s.cell, { width: "16%" }]}>
                      {new Date(record.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text style={[s.cell, { width: "27%" }]}>{record.diagnosis}</Text>
                    <Text style={[s.cell, { width: "27%" }]}>{record.treatment}</Text>
                    <Text style={[s.cell, { width: "12%" }]}>{String(record.weight)} kg</Text>
                    <Text style={[s.cell, { width: "18%" }]}>{record.user.name}</Text>
                  </View>
                  {record.notes && (
                    <Text style={s.noteRow}>Note: {record.notes}</Text>
                  )}
                </View>
              ))
            )}
          </View>

          <Text style={s.footer}>
            Generated{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {"  •  "}
            {sorted.length} record{sorted.length !== 1 ? "s" : ""} total
          </Text>
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  saveAs(blob, `medical-history-${pet?.name}-${Date.now()}.pdf`);
}