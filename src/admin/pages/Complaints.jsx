import React, { useState, useEffect } from 'react';
import { Search, Download, RefreshCcw, AlertTriangle, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import clsx from 'clsx';
import { gatewayClient } from '../../api/gatewayClient';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await gatewayClient.getAdminComplaints();
      const data = res.data?.data || res.data || [];
      if (Array.isArray(data)) {
        // Backend sorts by created_at DESC
        setComplaints(data);
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(complaint => {
    const q = searchQuery.toLowerCase();
    return (
      (complaint.title || '').toLowerCase().includes(q) ||
      (complaint.description || '').toLowerCase().includes(q) ||
      (complaint.user_id || '').toLowerCase().includes(q)
    );
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Complaints History', 14, 15);
    
    const tableColumn = ["Date", "Who Sent Complaint", "User Type", "Title", "Description"];
    const tableRows = [];

    filteredComplaints.forEach(complaint => {
      const rowData = [
        new Date(complaint.created_at).toLocaleString(),
        complaint.user_id.substring(0, 8) + '...',
        complaint.user_type,
        complaint.title,
        complaint.description
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [245, 158, 11] }, // Amberish color for complaints
      columnStyles: { 4: { cellWidth: 50 } } // Wrap description
    });

    doc.save('complaints_history.pdf');
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col p-2 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-admin-on-surface">Complaints</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchComplaints}
            className="flex items-center justify-center p-2 text-admin-on-surface-variant hover:text-admin-on-surface hover:bg-admin-surface-container-high rounded-lg transition-colors"
            title="Refresh Complaints"
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
            Total: {filteredComplaints.length}
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-admin-surface-container-high sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Date</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Who Sent Complaint</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Title</th>
                <th className="p-4 font-semibold text-admin-on-surface-variant border-b border-admin-outline-variant">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading && complaints.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCcw size={32} className="animate-spin mb-4" />
                      <p>Loading complaints...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-admin-on-surface-variant">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle size={48} className="mb-4 opacity-20" />
                      <p className="text-lg">No complaints found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr 
                    key={complaint.id} 
                    className="border-b border-admin-outline-variant hover:bg-admin-surface-container-high transition-colors"
                  >
                    <td className="p-4 align-top">
                      <div className="flex items-center space-x-2 text-sm text-admin-on-surface-variant">
                        <Calendar size={14} />
                        <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-admin-on-surface-variant mt-1 ml-5">
                        {new Date(complaint.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-admin-on-surface">{complaint.user_type}</div>
                      <div className="text-xs text-admin-on-surface-variant font-mono mt-1" title={complaint.user_id}>
                        {complaint.user_id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-admin-on-surface">{complaint.title}</div>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-sm text-admin-on-surface-variant max-w-md line-clamp-3" title={complaint.description}>
                        {complaint.description}
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
