import React, { useState, useEffect } from 'react';
import { Search, Download, RefreshCcw, FileText, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import clsx from 'clsx';
import { gatewayClient } from '../../api/gatewayClient';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await gatewayClient.getAdminReports();
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        // Backend already sorts by created_at DESC (latest first)
        setReports(data);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    const q = searchQuery.toLowerCase();
    return (
      (report.title || '').toLowerCase().includes(q) ||
      (report.description || '').toLowerCase().includes(q) ||
      (report.reporter_id || '').toLowerCase().includes(q) ||
      (report.reported_vpa || '').toLowerCase().includes(q)
    );
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Reports History', 14, 15);
    
    const tableColumn = ["Date", "Who Reported", "User Type", "Reported User (VPA)", "Title", "Description"];
    const tableRows = [];

    filteredReports.forEach(report => {
      const rowData = [
        new Date(report.created_at).toLocaleString(),
        report.reporter_id.substring(0, 8) + '...',
        report.reporter_type,
        report.reported_vpa,
        report.title,
        report.description
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [220, 38, 38] }, // Redish color for reports
      columnStyles: { 5: { cellWidth: 50 } } // Wrap description
    });

    doc.save('reports_history.pdf');
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-2 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-admin-on-surface">Reports</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchReports}
            className="flex items-center justify-center p-2 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high rounded-lg transition-colors"
            title="Refresh Reports"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center space-x-2 bg-admin-surface-container-high hover:bg-admin-surface-container-highest text-admin-on-surface px-4 py-2 rounded-lg border border-admin-outline-variant transition-colors"
          >
            <Download size={18} />
            <span>Export to PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-admin-surface-container rounded-xl border border-admin-outline-variant overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-admin-outline-variant flex justify-between items-center bg-admin-surface-container-high">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant" size={18} />
            <input
              type="text"
              placeholder="Search by title, description, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-admin-surface-container border border-admin-outline-variant text-admin-on-surface rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
            />
          </div>
          <div className="text-sm text-admin-on-surface-variant font-medium">
            Total: {filteredReports.length}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-admin-surface-container-high sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Date</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Who Reported</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Reported User (VPA)</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Title</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading && reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCcw size={32} className="animate-spin mb-4" />
                      <p>Loading reports...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <FileText size={48} className="mb-4 opacity-20" />
                      <p className="text-lg">No reports found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr 
                    key={report.id} 
                    className="border-b border-admin-outline-variant hover:bg-admin-surface-container-high transition-colors"
                  >
                    <td className="p-4 align-top">
                      <div className="flex items-center space-x-2 text-sm text-admin-on-surface-variant">
                        <Calendar size={14} />
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-admin-on-surface-variant mt-1 ml-5">
                        {new Date(report.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-admin-on-surface">{report.reporter_type}</div>
                      <div className="text-xs text-admin-on-surface-variant font-mono mt-1" title={report.reporter_id}>
                        {report.reporter_id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className="bg-admin-error/10 text-admin-error px-2 py-1 rounded text-sm font-medium">
                        {report.reported_vpa}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-admin-on-surface">{report.title}</div>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-sm text-admin-on-surface-variant max-w-md line-clamp-3" title={report.description}>
                        {report.description}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}