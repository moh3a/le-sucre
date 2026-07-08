import React from "react";
import { StyleSheet, View, Text } from "@react-pdf/renderer";

type PDFStyle = React.ComponentProps<typeof View>["style"];

const flex_row = StyleSheet.create({ base: { flexDirection: "row" } }).base;
const flex_col = StyleSheet.create({ base: { flexDirection: "column" } }).base;
const bold_text = StyleSheet.create({ base: { fontFamily: "Helvetica-Bold" } }).base;

// Register default fonts if needed, otherwise use system defaults.
// Standard fonts supported by react-pdf out of the box: Helvetica, Times-Roman, Courier.
export const primaryColor = "#c8d152";
export const lightPrimary = "#f9f7be";
export const secondaryColor = "#4d4c20";
export const creamColor = "#fff3e3";
export const accentColor = "#700145";

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.5,
    color: "#333333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: primaryColor,
    paddingBottom: 15,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "column",
  },
  logoText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: secondaryColor,
  },
  companySubText: {
    fontSize: 8,
    color: "#666666",
    marginTop: 2,
  },
  titleContainer: {
    textAlign: "right",
    flexDirection: "column",
  },
  docTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: accentColor,
  },
  docNumber: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: secondaryColor,
    marginTop: 4,
  },
  dateText: {
    fontSize: 8,
    color: "#666666",
    marginTop: 2,
  },
  addressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  addressBox: {
    width: "48%",
    padding: 10,
    backgroundColor: creamColor,
    borderRadius: 4,
  },
  addressTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: secondaryColor,
    borderBottomWidth: 1,
    borderBottomColor: lightPrimary,
    paddingBottom: 4,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  addressText: {
    fontSize: 8,
    color: "#444444",
    marginBottom: 2,
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: secondaryColor,
    borderRadius: 3,
    padding: 6,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    padding: 6,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 8,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  summaryBox: {
    width: "40%",
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    paddingTop: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: lightPrimary,
    padding: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: secondaryColor,
  },
  grandTotalValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: accentColor,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 10,
    textAlign: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#999999",
    marginBottom: 2,
  },
});

interface BoxProps {
  style?: PDFStyle;
  children: React.ReactNode;
}

export const FlexRow: React.FC<BoxProps> = ({ style, children }) => (
  <View style={[flex_row, ...(Array.isArray(style) ? style : style ? [style] : [])]}>{children}</View>
);

export const FlexCol: React.FC<BoxProps> = ({ style, children }) => (
  <View style={[flex_col, ...(Array.isArray(style) ? style : style ? [style] : [])]}>{children}</View>
);

export const BoldText: React.FC<{
  style?: PDFStyle;
  children: React.ReactNode;
}> = ({ style, children }) => (
  <Text style={[bold_text, ...(Array.isArray(style) ? style : style ? [style] : [])]}>{children}</Text>
);
