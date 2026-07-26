import { pdf, Document, Page, Text, View } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { reportStyles as s } from "./report-styles";

const CATEGORY_LABELS: Record<string, string> = {
  medical: "Medical",
  operational: "Operational",
};

export async function generateInventoryPDF(
  movements: any[],
  filters: { dateFrom: string; dateTo: string; category?: string }
) {
  // Agrupamos por categoría, y dentro de cada grupo ordenamos por fecha descendente
  const sorted = [...movements].sort((a, b) => {
    const catA = a.item.category as string;
    const catB = b.item.category as string;
    if (catA !== catB) return catA.localeCompare(catB);
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  let lastCategory: string | null = null;

  const doc = (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.frame}>
          <View style={s.titleBlock}>
            <Text style={s.companyName}>VetSystem</Text>
            <Text style={s.title}>Inventory Movements Report</Text>
            <Text style={s.meta}>
              From {filters.dateFrom} to {filters.dateTo}
              {filters.category
                ? `  •  Category: ${CATEGORY_LABELS[filters.category] ?? filters.category}`
                : ""}
            </Text>
          </View>

          <View style={s.table}>
            <View style={s.headerRow}>
              <Text style={[s.headerCell, { width: "16%" }]}>Category</Text>
              <Text style={[s.headerCell, { width: "26%" }]}>Item</Text>
              <Text style={[s.headerCell, { width: "15%" }]}>Date</Text>
              <Text style={[s.headerCell, { width: "13%" }]}>Type</Text>
              <Text style={[s.headerCell, { width: "13%" }]}>Qty</Text>
              <Text style={[s.headerCell, { width: "17%" }]}>By</Text>
            </View>

            {sorted.length === 0 ? (
              <Text style={s.empty}>No movements found for the selected filters</Text>
            ) : (
              sorted.map((mov, i) => {
                const category = mov.item.category as string;
                const showCategory = category !== lastCategory;
                lastCategory = category;
                return (
                  <View key={i}>
                    <View style={s.row}>
                      <Text style={[showCategory ? s.groupCell : s.cell, { width: "16%" }]}>
                        {showCategory ? CATEGORY_LABELS[category] ?? category : ""}
                      </Text>
                      <Text style={[s.cell, { width: "26%" }]}>{mov.item.name}</Text>
                      <Text style={[s.cell, { width: "15%" }]}>
                        {new Date(mov.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                      <Text style={[s.cell, { width: "13%" }]}>
                        {mov.type === "in" ? "In" : "Out"}
                      </Text>
                      <Text style={[s.cell, { width: "13%" }]}>
                        {mov.quantity} {mov.item.unit}
                      </Text>
                      <Text style={[s.cell, { width: "17%" }]}>{mov.user.name}</Text>
                    </View>
                    {mov.notes && <Text style={s.noteRow}>Note: {mov.notes}</Text>}
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
            {sorted.length} movement{sorted.length !== 1 ? "s" : ""} total
          </Text>
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  saveAs(blob, `inventory-movements-${Date.now()}.pdf`);
}