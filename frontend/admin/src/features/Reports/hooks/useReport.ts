import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ColumnConfig, FilterConfig } from "@/types/report";

export interface UseReportOptions<T extends object> {
    fetcher: (params?: Record<string, any>) => Promise<{ result: boolean; message: string; data: T[] }>;
    params?: Record<string, any>;
    autoFetch?: boolean;
    filters?: FilterConfig[];
}

export const useReport = <T extends object>({
    fetcher,
    params = {},
    autoFetch = true,
    filters = [],
}: UseReportOptions<T>) => {
    const { t } = useTranslation();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const CompanyName = t("Company Name");
    const CompanyLogo = "/assets/logo.png";

    const initialFilters = useMemo(() => {
        const initial: Record<string, any> = {};
        filters.forEach(filter => {
            if (filter.type === "date") {
                if (filter.key === "from") initial[filter.key] = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                if (filter.key === "to") initial[filter.key] = new Date().toISOString().split("T")[0];
            }
        });
        return initial;
    }, [filters]);

    const [filtersState, setFiltersState] = useState<Record<string, any>>(initialFilters);

    const mountedRef = useRef(true);
    const fetchQueueRef = useRef(false);

    const stableParams = useMemo(() => params, [JSON.stringify(params)]);

    const formatDate = useCallback((value: any): string => {
        if (!value) return "";
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return String(value);
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            const hh = String(date.getHours()).padStart(2, "0");
            const mm = String(date.getMinutes()).padStart(2, "0");
            const ss = String(date.getSeconds()).padStart(2, "0");
            return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
        } catch {
            return String(value);
        }
    }, []);

    const processDataForExport = useCallback(
        (data: T[], columns?: ColumnConfig[]): any[] => {
            return data
                .map(row => {
                    const processedRow: any = {};
                    if (columns) {
                        columns.forEach(col => {
                            let value = (row as any)[col.key];
                            if (value == null) return;
                            if (col.type === "date" || col.type === "datetime") value = formatDate(value);
                            processedRow[col.label || col.key] = value;
                        });
                    } else {
                        Object.keys(row).forEach(key => {
                            const value = (row as any)[key];
                            if (value != null) processedRow[key] = value;
                        });
                    }
                    return processedRow;
                })
                .filter(row => Object.keys(row).length > 0);
        },
        [formatDate]
    );

    const fetchData = useCallback(
        async (customParams?: Record<string, any>) => {
            if (!mountedRef.current) return;
            if (fetchQueueRef.current) return;
            fetchQueueRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const allParams = { ...stableParams, ...filtersState, ...customParams };
                Object.keys(allParams).forEach(key => {
                    if (allParams[key] == null || allParams[key] === "") delete allParams[key];
                });

                const response = await fetcher(allParams);

                if (!mountedRef.current) return;

                if (response.result) setData(response.data || []);
                else {
                    setError(response.message || t("Failed to fetch report data"));
                    setData([]);
                }
            } catch (e: any) {
                if (!mountedRef.current) return;
                setError(e.message || t("Failed to fetch report"));
                setData([]);
            } finally {
                if (mountedRef.current) setLoading(false);
                fetchQueueRef.current = false;
            }
        },
        [fetcher, stableParams, filtersState, t]
    );

    useEffect(() => {
        const timeout = setTimeout(() => fetchData(), 300); return () => clearTimeout(timeout);
    }, [filtersState, fetchData]);

    useEffect(() => {
        mountedRef.current = true;
        if (autoFetch) fetchData();
        return () => {
            mountedRef.current = false;
        };
    }, [autoFetch, fetchData]);

    const updateFilter = useCallback((key: string, value: any) => {
        setFiltersState(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFiltersState(initialFilters);
    }, [initialFilters]);

    const exportExcel = useCallback(
        async (fileName: string, columns?: ColumnConfig[]) => {
            if (!data.length) return;

            try {
                const ExcelJS = await import("exceljs");
                const exportData = processDataForExport(data, columns);
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet(t("Report"));

                worksheet.mergeCells("A1", "D1");
                worksheet.getCell("A1").value = CompanyName;
                worksheet.getCell("A1").alignment = { horizontal: "center" };
                worksheet.getCell("A1").font = { size: 16, bold: true };

                worksheet.mergeCells("A2", "D2");
                worksheet.getCell("A2").value = fileName;
                worksheet.getCell("A2").alignment = { horizontal: "center" };
                worksheet.getCell("A2").font = { size: 14, bold: true };

                worksheet.mergeCells("A3", "D3");
                worksheet.getCell("A3").value = `${t("Generated on")}: ${new Date().toLocaleString()}`;
                worksheet.getCell("A3").alignment = { horizontal: "center" };
                worksheet.getCell("A3").font = { size: 10 };

                const headerRow = worksheet.addRow(columns ? columns.map(c => c.label || c.key) : Object.keys(exportData[0]));
                headerRow.eachCell(cell => {
                    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4285F4" } };
                    cell.alignment = { horizontal: "center" };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });

                exportData.forEach(row => {
                    const rowValues = columns ? columns.map(c => row[c.label || c.key]) : Object.values(row);
                    const dataRow = worksheet.addRow(rowValues);
                    dataRow.eachCell(cell => {
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };
                    });
                });

                worksheet.columns.forEach(column => (column.width = 20));

                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });

                const cleanFileName = fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
                const timestamp = formatDate(new Date()).replace(/[^0-9]/g, "").slice(0, 14);

                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${cleanFileName}_${timestamp}.xlsx`;
                link.click();
                URL.revokeObjectURL(link.href);
            } catch (err) {
                console.error(t("Export Excel failed"), err);
            }
        },
        [data, processDataForExport, CompanyName, formatDate, t]
    );

    const exportPDF = useCallback(
        async (title: string, columns?: ColumnConfig[]) => {
            if (!data.length) return;

            try {
                const { default: jsPDF } = await import("jspdf");
                const autoTable = await import("jspdf-autotable").then(module => module.default);

                const doc = new jsPDF();
                const pageWidth = doc.internal.pageSize.getWidth();

                const addPDFContent = () => {
                    doc.setFontSize(16);
                    doc.text(CompanyName, pageWidth / 2, 20, { align: "center" });
                    doc.setFontSize(14);
                    doc.text(title, pageWidth / 2, 35, { align: "center" });
                    doc.setFontSize(10);
                    doc.text(`${t("Generated on")}: ${new Date().toLocaleString()}`, pageWidth / 2, 43, { align: "center" });

                    const exportData = processDataForExport(data, columns);
                    const exportColumns = columns ? columns.map(c => c.label || c.key) : Object.keys(exportData[0] || {});
                    const body = exportData.map(row => exportColumns.map(col => (row[col] != null ? String(row[col]) : "")));

                    autoTable(doc, {
                        head: [exportColumns],
                        body,
                        startY: 50,
                        styles: { fontSize: 9, cellPadding: 3 },
                        headStyles: { fillColor: [66, 133, 244], textColor: 255, fontStyle: "bold" },
                        alternateRowStyles: { fillColor: [245, 245, 245] },
                        margin: { top: 50 },
                        didDrawPage: (data) => {
                            doc.setFontSize(8);
                            doc.text(`${CompanyName} - ${t("Page")} ${data.pageNumber}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
                        },
                    });

                    const cleanFileName = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
                    const timestamp = formatDate(new Date()).replace(/[^0-9]/g, "").slice(0, 14);
                    doc.save(`${cleanFileName}_${timestamp}.pdf`);
                };

                if (CompanyLogo) {
                    const img = new Image();
                    img.src = CompanyLogo;
                    img.onload = () => {
                        doc.addImage(img, "PNG", 15, 10, 30, 30);
                        addPDFContent();
                    };
                    img.onerror = addPDFContent;
                } else {
                    addPDFContent();
                }
            } catch (err) {
                console.error(t("Export PDF failed"), err);
            }
        },
        [data, processDataForExport, CompanyName, CompanyLogo, formatDate, t]
    );

    const printReport = useCallback(
        (title: string, columns?: ColumnConfig[]) => {
            if (!data.length) return;

            try {
                const exportData = processDataForExport(data, columns);
                const exportColumns = columns ? columns.map(c => c.label || c.key) : Object.keys(exportData[0] || {});
                const tableRows = exportData.map(row => exportColumns.map(col => (row[col] != null ? String(row[col]) : "")));

                const printWindow = window.open("", "_blank");
                if (!printWindow) return;

                const logoHtml = CompanyLogo ? `<img src="${CompanyLogo}" style="height:50px; margin-right:10px;" />` : "";

                printWindow.document.write(`
                    <html>
                        <head>
                            <title>${title} - ${CompanyName}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { display: flex; align-items: center; justify-content: center; }
                                h2 { text-align: center; margin: 5px 0; }
                                h3 { text-align: center; margin: 5px 0; }
                                .generated { text-align: center; font-size: 10px; margin-top: 5px; }
                                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
                                th { background-color: #4285f4; color: #fff; }
                                tr:nth-child(even) { background-color: #f2f2f2; }
                            </style>
                        </head>
                        <body>
                            <div class="header">${logoHtml}<h2>${CompanyName}</h2></div>
                            <h3>${title}</h3>
                            <div class="generated">${t("Generated on")}: ${new Date().toLocaleString()}</div>
                            <table>
                                <thead>
                                    <tr>${exportColumns.map(c => `<th>${c}</th>`).join("")}</tr>
                                </thead>
                                <tbody>
                                    ${tableRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}
                                </tbody>
                            </table>
                            <script>
                                window.onload = function() { 
                                    window.print(); 
                                    setTimeout(() => window.close(), 500); 
                                }
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            } catch (err) {
                console.error(t("Print failed"), err);
            }
        },
        [data, processDataForExport, CompanyName, CompanyLogo, formatDate, t]
    );

    return {
        data,
        loading,
        error,
        filters: filtersState,
        updateFilter,
        clearFilters,
        fetchData,
        exportExcel,
        exportPDF,
        printReport,
        refetch: fetchData
    };
};