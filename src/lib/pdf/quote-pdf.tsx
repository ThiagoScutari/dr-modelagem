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
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1A6E8C",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#E6F3F8",
    padding: 6,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
    paddingVertical: 4,
  },
  colDesc: { flex: 3, paddingRight: 4 },
  colUnit: { flex: 1, textAlign: "right" },
  colQty: { flex: 0.5, textAlign: "center" },
  colTotal: { flex: 1, textAlign: "right", fontFamily: "Helvetica-Bold" },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1A6E8C",
    paddingBottom: 3,
    marginBottom: 2,
    fontSize: 8,
    color: "#7BB8CC",
    fontFamily: "Helvetica-Bold",
  },
  totalSection: {
    marginTop: 16,
    borderTopWidth: 2,
    borderTopColor: "#1A6E8C",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1A6E8C",
  },
  info: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#FAF6EE",
    borderRadius: 4,
  },
  infoLine: {
    fontSize: 9,
    marginBottom: 2,
  },
  observations: {
    marginTop: 20,
    fontSize: 7,
    color: "#6B6B6B",
    lineHeight: 1.6,
  },
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
  DIGITALIZACAO: "Digitalização de Moldes",
  MODELAGEM: "Modelagem",
  GRADUACAO: "Graduação",
  ENCAIXE: "Encaixe",
  PLOTAGEM: "Plotagem",
  PILOTO: "Peças Piloto",
  CONVERSAO: "Conversão de Arquivos",
  CONSULTORIA: "Consultoria",
  OUTROS: "Outros",
};

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

interface QuotePDFItem {
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
}

interface QuotePDFData {
  clientName: string;
  clientDocument: string | null;
  createdAt: string;
  validUntil: string | null;
  items: QuotePDFItem[];
  totalGross: number;
  totalNet: number;
  discountPct: number | null;
  notes: string | null;
}

interface PresenterPDFData {
  name: string;
  razaoSocial: string;
  cnpj: string;
  observations: string;
}

export function QuotePDF({
  quote,
  presenter,
  logoSrc,
}: {
  quote: QuotePDFData;
  presenter: PresenterPDFData;
  logoSrc?: string;
}) {
  const categories = [...new Set(quote.items.map((i) => i.category))];
  const discountValue =
    quote.discountPct ? quote.totalGross * quote.discountPct : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logoSrc && <Image src={logoSrc} style={styles.logo} />}
          <Text style={styles.title}>ORÇAMENTO</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.infoLine}>
            Prestador: {presenter.name}
          </Text>
          <Text style={styles.infoLine}>
            {presenter.razaoSocial}
          </Text>
          <Text style={styles.infoLine}>
            CNPJ: {presenter.cnpj}
          </Text>
          <Text style={{ ...styles.infoLine, marginTop: 6 }}>
            Cliente: {quote.clientName}
          </Text>
          {quote.clientDocument && (
            <Text style={styles.infoLine}>
              CPF/CNPJ: {quote.clientDocument}
            </Text>
          )}
          <Text style={styles.infoLine}>
            Data:{" "}
            {new Date(quote.createdAt).toLocaleDateString("pt-BR")}
          </Text>
          {quote.validUntil && (
            <Text style={styles.infoLine}>
              Validade:{" "}
              {new Date(quote.validUntil).toLocaleDateString("pt-BR")}
            </Text>
          )}
        </View>

        {/* Table header */}
        <View style={styles.headerRow}>
          <Text style={styles.colDesc}>Serviço</Text>
          <Text style={styles.colUnit}>Valor Unit.</Text>
          <Text style={styles.colQty}>Qtd</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>

        {/* Items by category */}
        {categories.map((cat) => {
          const catItems = quote.items.filter((i) => i.category === cat);
          return (
            <View key={cat} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {categoryLabels[cat] ?? cat}
              </Text>
              {catItems.map((item, idx) => (
                <View key={idx} style={styles.row}>
                  <Text style={styles.colDesc}>{item.description}</Text>
                  <Text style={styles.colUnit}>
                    {formatCurrency(item.unitPrice)}
                  </Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colTotal}>
                    {formatCurrency(item.finalPrice)}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}

        {/* Discount */}
        {discountValue > 0 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 9, color: "#B81C1C" }}>
              Desconto ({((quote.discountPct ?? 0) * 100).toFixed(0)}
              %): -{formatCurrency(discountValue)}
            </Text>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(quote.totalNet)}
          </Text>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 8, color: "#6B6B6B" }}>
              Obs: {quote.notes}
            </Text>
          </View>
        )}

        {/* Observations */}
        <View style={styles.observations}>
          {presenter.observations.split("\n").map((line, i) => (
            <Text key={i}>{line}</Text>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          DR Estúdio de Modelagem · {presenter.cnpj}
        </Text>
      </Page>
    </Document>
  );
}
