import { StyleSheet } from "@react-pdf/renderer";

/**
 * Estilo compartido para los reportes en PDF.
 * Inspirado en los reportes clásicos de tabla: título centrado,
 * columnas alineadas, agrupación (la etiqueta del grupo solo aparece
 * en la primera fila del grupo) y una nota de pie en itálica.
 */
export const reportStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  frame: {
    borderWidth: 1,
    borderColor: "#a1a1aa",
    padding: 24,
    minHeight: "100%",
  },
  titleBlock: {
    textAlign: "center",
    marginBottom: 6,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#27272a",
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#16a34a",
  },
  title: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#27272a",
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  meta: {
    fontSize: 8.5,
    color: "#71717a",
    marginTop: 4,
  },
  table: {
    marginTop: 18,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    paddingBottom: 6,
    marginBottom: 4,
  },
  headerCell: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#27272a",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e4e4e7",
  },
  cell: {
    fontSize: 9,
    color: "#3f3f46",
  },
  groupCell: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#18181b",
  },
  noteRow: {
    fontSize: 7.5,
    fontStyle: "italic",
    color: "#a1a1aa",
    marginTop: -2,
    marginBottom: 3,
    paddingLeft: 2,
  },
  empty: {
    fontSize: 10,
    color: "#a1a1aa",
    textAlign: "center",
    marginTop: 32,
    fontStyle: "italic",
  },
  footer: {
    marginTop: 22,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#e4e4e7",
    fontSize: 7.5,
    color: "#a1a1aa",
    fontStyle: "italic",
    textAlign: "center",
  },
});
