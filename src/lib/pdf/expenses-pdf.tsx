import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1C3D4F",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#7BB8CC",
    paddingBottom: 12,
  },
  logo: { width: 60, height: 60 },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#B81C1C",
  },
  subtitle: {
    fontSize: 10,
    color: "#7BB8CC",
    marginTop: 2,
  },
  info: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#FAF6EE",
    borderRadius: 4,
  },
  infoLine: { fontSize: 9, marginBottom: 2 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1A6E8C",
    paddingBottom: 3,
    marginBottom: 2,
    fontSize: 8,
    color: "#7BB8CC",
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 4,
  },
  colDate: { width: 70 },
  colCat: { width: 80 },
  colDesc: { flex: 1, paddingRight: 4 },
  colAmount: { width: 80, textAlign: "right", fontFamily: "Helvetica-Bold" },
  totalSection: {
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#B81C1C",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalLabel: { fontSize: 14, fontFamily: "Helvetica-Bold", marginRight: 20 },
  totalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#B81C1C" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#AAAAAA",
    textAlign: "center",
  },
});

const categoryLabels: Record<string, string> = {
  DESLOCAMENTO: "Deslocamento",
  TRANSPORTE: "Transporte",
  MATERIAL: "Material",
  ALIMENTACAO: "Alimentação",
  OUTROS: "Outros",
};

function fmt(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

interface ExpensePDFItem {
  description: string;
  category: string;
  amount: number;
  date: string;
  clientName: string | null;
}

interface PresenterData {
  name: string;
  cnpj: string;
}

export function ExpensesPDF({
  expenses,
  presenter,
  period,
  clientFilter,
  logoSrc,
}: {
  expenses: ExpensePDFItem[];
  presenter: PresenterData;
  period: string;
  clientFilter?: string;
  logoSrc?: string;
}) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoSrc && <Image src={logoSrc} style={styles.logo} />}
          <View>
            <Text style={styles.title}>RELATÓRIO DE DESPESAS</Text>
            <Text style={styles.subtitle}>{period}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoLine}>{presenter.name}</Text>
          <Text style={styles.infoLine}>CNPJ: {presenter.cnpj}</Text>
          {clientFilter && (
            <Text style={{ ...styles.infoLine, marginTop: 4 }}>
              Cliente: {clientFilter}
            </Text>
          )}
          <Text style={styles.infoLine}>
            Total de registros: {expenses.length}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colDate}>Data</Text>
          <Text style={styles.colCat}>Categoria</Text>
          <Text style={styles.colDesc}>Descrição</Text>
          <Text style={styles.colAmount}>Valor</Text>
        </View>

        {expenses.map((exp, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.colDate}>
              {new Date(exp.date).toLocaleDateString("pt-BR")}
            </Text>
            <Text style={styles.colCat}>
              {categoryLabels[exp.category] ?? exp.category}
            </Text>
            <Text style={styles.colDesc}>{exp.description}</Text>
            <Text style={styles.colAmount}>{fmt(exp.amount)}</Text>
          </View>
        ))}

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{fmt(total)}</Text>
        </View>

        <Text style={styles.footer}>
          DR Estúdio de Modelagem · {presenter.cnpj}
        </Text>
      </Page>
    </Document>
  );
}
