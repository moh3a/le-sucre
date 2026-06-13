import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, BoldText, secondaryColor } from "./components";

interface Address {
  full_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  phone?: string;
}

interface InvoiceItem {
  id: string;
  sku_code: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  tax_rate: string;
  tax_amount: string;
  line_total: string;
}

interface InvoicePdfData {
  invoice_number: string;
  order_id: string;
  order_number?: string;
  status: string;
  type: string;
  currency: string;
  subtotal: string;
  discount_total: string;
  tax_total: string;
  shipping_total: string;
  grand_total: string;
  billing_address: Address;
  shipping_address: Address;
  vat_number?: string | null;
  created_at: string;
  due_at?: string | null;
  paid_at?: string | null;
  items: InvoiceItem[];
}

interface CompanyInfo {
  name: string;
  address: string;
  vat_number: string;
  email: string;
  phone: string;
}

const default_company: CompanyInfo = {
  name: "LE SUCRE E-COMMERCE",
  address: "123 Rue de la Liberté, Alger, Algérie",
  vat_number: "AI-198273645000",
  email: "contact@lesucre.dz",
  phone: "0000 00 00 00",
};

export const InvoicePdfTemplate: React.FC<{
  invoice: InvoicePdfData;
  company?: CompanyInfo;
}> = ({ invoice, company = default_company }) => {
  const get_doc_title = () => {
    switch (invoice.type) {
      case "refund_invoice":
        return "FACTURE DE REMBOURSEMENT";
      case "credit_note":
        return "NOTE DE CRÉDIT";
      case "order_invoice":
      default:
        return "FACTURE";
    }
  };

  const get_status_label = () => {
    switch (invoice.status) {
      case "paid":
        return "PAYÉE";
      case "void":
        return "ANNULÉE";
      case "refunded":
        return "REMBOURSÉE";
      case "partially_refunded":
        return "PARTIELLEMENT REMBOURSÉE";
      case "unpaid":
      default:
        return "NON PAYÉE";
    }
  };

  const format_date = (date_str?: string | null) => {
    if (!date_str) return "N/A";
    try {
      const d = new Date(date_str);
      return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date_str;
    }
  };

  const format_amount = (val: string | number) => {
    const num = Number(val);
    return `${num.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${invoice.currency}`;
  };

  const billing = invoice.billing_address || {};
  const shipping = invoice.shipping_address || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{company.name}</Text>
            <Text style={styles.companySubText}>{company.address}</Text>
            <Text style={styles.companySubText}>
              Tél: {company.phone} | Email: {company.email}
            </Text>
            <Text style={styles.companySubText}>NIF: {company.vat_number}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.docTitle}>{get_doc_title()}</Text>
            <Text style={styles.docNumber}>N°: {invoice.invoice_number}</Text>
            <Text style={styles.dateText}>
              {"Date d'émission: "}
              {format_date(invoice.created_at)}
            </Text>
            {invoice.due_at && (
              <Text style={styles.dateText}>
                {"Date d'échéance: "}
                {format_date(invoice.due_at)}
              </Text>
            )}
            {invoice.paid_at && (
              <Text style={styles.dateText}>
                {"Payé le: "}
                {format_date(invoice.paid_at)}
              </Text>
            )}
            <View
              style={{
                marginTop: 5,
                padding: 3,
                backgroundColor: "#f0f0f0",
                borderRadius: 2,
                alignSelf: "flex-end",
              }}
            >
              <Text style={{ fontSize: 7, fontFamily: "Helvetica-Bold" }}>
                {"STATUT: "}
                {get_status_label()}
              </Text>
            </View>
          </View>
        </View>

        {/* Addresses Grid */}
        <View style={styles.addressGrid}>
          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Facturé à</Text>
            <Text style={[styles.addressText, { fontFamily: "Helvetica-Bold" }]}>
              {billing.full_name || "Client"}
            </Text>
            <Text style={styles.addressText}>{billing.line1 || ""}</Text>
            {billing.line2 && <Text style={styles.addressText}>{billing.line2}</Text>}
            <Text style={styles.addressText}>
              {billing.postal_code || ""} {billing.city || ""}, {billing.state || ""}
            </Text>
            <Text style={styles.addressText}>Pays: {billing.country_code || "DZ"}</Text>
            <Text style={styles.addressText}>Tél: {billing.phone || "N/A"}</Text>
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.addressTitle}>Livré à</Text>
            <Text style={[styles.addressText, { fontFamily: "Helvetica-Bold" }]}>
              {shipping.full_name || "Destinataire"}
            </Text>
            <Text style={styles.addressText}>{shipping.line1 || ""}</Text>
            {shipping.line2 && <Text style={styles.addressText}>{shipping.line2}</Text>}
            <Text style={styles.addressText}>
              {shipping.postal_code || ""} {shipping.city || ""}, {shipping.state || ""}
            </Text>
            <Text style={styles.addressText}>Pays: {shipping.country_code || "DZ"}</Text>
            <Text style={styles.addressText}>Tél: {shipping.phone || "N/A"}</Text>
          </View>
        </View>

        {/* Details and References */}
        <View
          style={{
            marginBottom: 15,
            padding: 8,
            borderLeftWidth: 3,
            borderLeftColor: secondaryColor,
            backgroundColor: "#fcfcfc",
          }}
        >
          <Text style={{ fontSize: 8 }}>
            <BoldText>Référence Commande:</BoldText> {invoice.order_number || invoice.order_id}
          </Text>
          {invoice.vat_number && (
            <Text style={{ fontSize: 8, marginTop: 2 }}>
              <BoldText>N° TVA Client:</BoldText> {invoice.vat_number}
            </Text>
          )}
        </View>

        {/* Table of Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={{ width: "45%" }}>
              <Text style={styles.tableHeaderCell}>Article</Text>
            </View>
            <View style={{ width: "15%" }}>
              <Text style={[styles.tableHeaderCell, { textAlign: "right" }]}>Prix Unitaire</Text>
            </View>
            <View style={{ width: "10%", textAlign: "center" }}>
              <Text style={styles.tableHeaderCell}>Qté</Text>
            </View>
            <View style={{ width: "15%", textAlign: "right" }}>
              <Text style={styles.tableHeaderCell}>TVA</Text>
            </View>
            <View style={{ width: "15%", textAlign: "right" }}>
              <Text style={styles.tableHeaderCell}>Total</Text>
            </View>
          </View>

          {invoice.items.map((item, index) => (
            <View style={styles.tableRow} key={item.id || index}>
              <View style={{ width: "45%" }}>
                <Text style={[styles.tableCell, { fontFamily: "Helvetica-Bold" }]}>
                  {item.product_name}
                </Text>
                <Text style={{ fontSize: 7, color: "#666666" }}>Ref: {item.sku_code}</Text>
              </View>
              <View style={{ width: "15%", textAlign: "right" }}>
                <Text style={styles.tableCell}>{format_amount(item.unit_price)}</Text>
              </View>
              <View style={{ width: "10%", textAlign: "center" }}>
                <Text style={styles.tableCell}>{item.quantity}</Text>
              </View>
              <View style={{ width: "15%", textAlign: "right" }}>
                <Text style={styles.tableCell}>
                  {format_amount(item.tax_amount)} ({Math.round(Number(item.tax_rate) * 100)}%)
                </Text>
              </View>
              <View style={{ width: "15%", textAlign: "right" }}>
                <Text style={[styles.tableCell, { fontFamily: "Helvetica-Bold" }]}>
                  {format_amount(item.line_total)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total:</Text>
              <Text style={styles.summaryValue}>{format_amount(invoice.subtotal)}</Text>
            </View>
            {Number(invoice.discount_total) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remise:</Text>
                <Text style={[styles.summaryValue, { color: "#d32f2f" }]}>
                  -{format_amount(invoice.discount_total)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TVA Totale:</Text>
              <Text style={styles.summaryValue}>{format_amount(invoice.tax_total)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais de livraison:</Text>
              <Text style={styles.summaryValue}>{format_amount(invoice.shipping_total)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Général:</Text>
              <Text style={styles.grandTotalValue}>{format_amount(invoice.grand_total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Merci pour votre confiance ! Pour toute question, veuillez nous contacter à{" "}
            {company.email}.
          </Text>
          <Text style={styles.footerText}>
            {company.name} - NIF: {company.vat_number} - {company.address}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
