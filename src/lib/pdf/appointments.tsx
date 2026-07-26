import { pdf, Document, Page, Text, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { reportStyles as s } from "./report-styles";

export async function generateAppointmentsPDF(
  appointments: any[],
  filters: { dateFrom: string; dateTo: string; status?: string }
) {
  // Agrupamos por mascota, y dentro de cada grupo ordenamos por fecha ascendente
  const sorted = [...appointments].sort((a, b) => {
    const petA = a.pet.name as string;
    const petB = b.pet.name as string;
    if (petA !== petB) return petA.localeCompare(petB);
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  let lastPet: string | null = null;

  const doc = (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.frame}>
          <View style={s.titleBlock}>
            <Text style={s.companyName}>VetSystem</Text>
            <Text style={s.title}>Appointments Report</Text>
            <Text style={s.meta}>
              From {filters.dateFrom} to {filters.dateTo}
              {filters.status ? `  •  Status: ${filters.status}` : ""}
            </Text>
          </View>

          <View style={s.table}>
            <View style={s.headerRow}>
              <Text style={[s.headerCell, { width: "18%" }]}>Pet</Text>
              <Text style={[s.headerCell, { width: "14%" }]}>Date</Text>
              <Text style={[s.headerCell, { width: "10%" }]}>Time</Text>
              <Text style={[s.headerCell, { width: "18%" }]}>Owner</Text>
              <Text style={[s.headerCell, { width: "26%" }]}>Reason</Text>
              <Text style={[s.headerCell, { width: "14%" }]}>Status</Text>
            </View>

            {sorted.length === 0 ? (
              <Text style={s.empty}>No appointments found for the selected filters</Text>
            ) : (
              sorted.map((appt, i) => {
                const showPet = appt.pet.name !== lastPet;
                lastPet = appt.pet.name;
                return (
                  <View key={i} style={s.row}>
                    <Text style={[showPet ? s.groupCell : s.cell, { width: "18%" }]}>
                      {showPet ? `${appt.pet.name} (${appt.pet.species})` : ""}
                    </Text>
                    <Text style={[s.cell, { width: "14%" }]}>
                      {new Date(appt.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text style={[s.cell, { width: "10%" }]}>
                      {new Date(appt.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text style={[s.cell, { width: "18%" }]}>{appt.pet.owner.name}</Text>
                    <Text style={[s.cell, { width: "26%" }]}>{appt.reason}</Text>
                    <Text style={[s.cell, { width: "14%" }]}>{appt.status}</Text>
                  </View>
                );
              })
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
            {sorted.length} appointment{sorted.length !== 1 ? "s" : ""} total
          </Text>
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  saveAs(blob, `appointments-${Date.now()}.pdf`);
}