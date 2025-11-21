import { useCallback } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Part, Car } from "@/types";

// Initialize pdfMake with fonts
if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
  pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;
}

interface UsePDFExportProps {
  parts: Part[];
  selectedParts: Set<string>;
  selectedCar?: Car | null;
}

export function usePDFExport({
  parts,
  selectedParts,
  selectedCar,
}: UsePDFExportProps) {
  // Collect all parts to export (selected parts, or all parts if none selected)
  const getPartsToExport = useCallback((): Part[] => {
    if (selectedParts.size > 0) {
      // Return only selected parts
      return parts.filter((part) => selectedParts.has(part.id));
    }
    // If no parts selected, export all parts
    return parts;
  }, [parts, selectedParts]);

  const handleDownloadPDF = useCallback(() => {
    const partsToExport = getPartsToExport();

    if (partsToExport.length === 0) {
      alert("Nėra dalių eksportui");
      return;
    }

    // Build parts table data
    const tableBody = partsToExport.map((part) => {
      const soldCount = part.analysisStatusCounts?.sold ?? 0;

      return [
        part.category || "-",
        part.name || "-",
        part.code || "-",
        part.manufacturerCode || "-",
        part.status || "-",
        part.status === "In Stock" ? "1" : "0",
        soldCount.toString(),
        `${part.priceEUR} €`,
        part.warehouse || "-",
      ];
    });

    // Selected car info
    const carInfo = selectedCar
      ? `${selectedCar.brand.name} ${selectedCar.model.name} (${selectedCar.year})`
      : "";

    // Build PDF document definition
    const docDefinition: any = {
      content: [
        {
          text: "Detalių ataskaita",
          style: "header",
          margin: [0, 0, 0, 10],
        },
        ...(carInfo
          ? [
              {
                text: `Automobilis: ${carInfo}`,
                fontSize: 12,
                margin: [0, 0, 0, 5],
              },
            ]
          : []),
        {
          text: `Eksportuota: ${new Date().toLocaleString("lt-LT")}`,
          fontSize: 10,
          italics: true,
          margin: [0, 0, 0, 15],
        },
        ...(tableBody.length > 0
          ? [
              {
                text: "Detalės",
                style: "subheader",
                margin: [0, 10, 0, 5],
              },
              {
                table: {
                  headerRows: 1,
                  widths: [
                    "*",
                    "*",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                  ],
                  body: [
                    [
                      "Kategorija",
                      "Pavadinimas",
                      "Kodas",
                      "Gamintojo kodas",
                      "Statusas",
                      "Likutis",
                      "Parduota",
                      "Kaina",
                      "Sandėlys",
                    ],
                    ...tableBody,
                  ],
                },
                layout: {
                  fillColor: (rowIndex: number) => {
                    if (rowIndex === 0) return "#c8c8c8";
                    return rowIndex % 2 === 0 ? "#f5f5f5" : null;
                  },
                },
                fontSize: 9,
              },
            ]
          : []),
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
        },
      },
      defaultStyle: {
        font: "Roboto",
      },
    };

    // Generate and download PDF
    pdfMake
      .createPdf(docDefinition)
      .download(`ataskaita_${new Date().toISOString().split("T")[0]}.pdf`);
  }, [getPartsToExport, selectedCar]);

  return {
    handleDownloadPDF,
    getPartsToExport,
  };
}

