import React, { useState, useEffect } from 'react';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import MerchantBottomNav from '../components/MerchantBottomNav';
import { gatewayClient } from '../../api/gatewayClient';

export default function KYCStatus({ navigate, showToast }) {
  const currentPath = '/merchant/kyc-status';
  const [status, setStatus] = useState('Pending Review');
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  const handleUpdateDocument = async (e, doc) => {
    const file = e.target.files[0];
    if (file) {
      if (showToast) showToast(`Uploading ${file.name}...`, 'info');
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          const payload = {
            aadhaarDocUrl: doc.docType === 'aadhaar' ? base64Data : undefined,
            shopLicenseUrl: doc.docType === 'shop_license' ? base64Data : undefined
          };
          
          const res = await gatewayClient.updateKYCDocuments(payload);
          if (res.success) {
            if (showToast) showToast('Document uploaded successfully!', 'success');
            fetchStatus(); // Refresh data
          }
        } catch (err) {
          console.error(err);
          if (showToast) showToast('Failed to upload document', 'error');
        }
      };
      reader.onerror = () => {
        if (showToast) showToast('Failed to read file', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDummyPDF = (docName) => {
    return `data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9DcmVhdG9yIChNb25leU1hdGUpL1Byb2R1Y2VyIChNb25leU1hdGUpL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMTAyNzEyMDAwMFopPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZSAvUGFnZXMgL0tpZHMgWzQgMCBSXSAvQ291bnQgMQo+PgplbmRvYmoKNCAwIG9iago8PC9VHlwZSAvUGFnZSAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvUGFyZW50IDMgMCBSIC9SZXNvdXJjZXMgPDwvRm9udCA8PC9GMSA1IDAgUj4+Pj4gL0NvbnRlbnRzIDYgMCBSCj4+CmVuZG9iago1IDAgb2JqCjw8L1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago2IDAgb2JqCjw8L0xlbmd0aCA3Mwo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKERvY3VtZW50IFZpZXcgLSBNb25leU1hdGUpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMTAgMDAwMDAgbiAKMDAwMDAwMDE1OSAwMDAwMCBuIAowMDAwMDAwMjE2IDAwMDAwIG4gCjAwMDAwMDAzMjUgMDAwMDAgbiAKMDAwMDAwMDQxMyAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNyAvUm9vdCAyIDAgUiAvSW5mbyAxIDAgUj4+CnN0YXJ0eHJlZgo1MzYKJSVFT0YK`;
  };

  const handleViewDocument = (doc) => {
    const isMockUrl = !doc.url || doc.url.includes('example.com') || doc.url.includes('moneymate.com');
    const pdfUrl = !isMockUrl && doc.url && (doc.url.startsWith('http') || doc.url.startsWith('data:')) ? doc.url : generateDummyPDF(doc.name);
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none; margin:0; padding:0;"></iframe>`);
      newWindow.document.close();
    } else {
      if (showToast) showToast('Please allow popups to view the document', 'warning');
    }
  };

  const handleDownloadDocument = (doc) => {
    const isMockUrl = !doc.url || doc.url.includes('example.com') || doc.url.includes('moneymate.com');
    const pdfUrl = !isMockUrl && doc.url && (doc.url.startsWith('http') || doc.url.startsWith('data:')) ? doc.url : generateDummyPDF(doc.name);
    const link = document.createElement('a');
    link.href = pdfUrl;
    
    // Determine extension from data URI if present
    let ext = 'pdf';
    if (pdfUrl.startsWith('data:')) {
      const mime = pdfUrl.substring(5, pdfUrl.indexOf(';'));
      if (mime.includes('image/')) ext = mime.split('/')[1];
      else if (mime.includes('pdf')) ext = 'pdf';
    }
    
    link.download = `${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast(`${doc.name} downloaded successfully!`, 'success');
  };

  const fetchStatus = async () => {
    try {
      const response = await gatewayClient.getKYCStatus();
      if (response.success && response.data) {
        setStatus(response.data.status || 'Pending Review');
        if (response.data.documents) {
          setDocuments(response.data.documents.map((doc, index) => ({
            id: index + 1,
            name: doc.title,
            status: doc.status,
            type: doc.doc_type === 'shop_license' ? 'description' : 'badge',
            url: doc.url,
            docType: doc.doc_type
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="font-body-md text-on-surface-variant">Loading KYC Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <MerchantSidebar currentPath={currentPath} navigate={navigate} />

      {/* Main Container */}
      <div className="flex-grow md:ml-[280px] flex flex-col">
        {/* Top Navbar */}
        <MerchantNavbar currentPath={currentPath} navigate={navigate} />

        {/* Page Content */}
        <main className="p-6 md:px-12 md:py-10 space-y-8 w-full pb-24 md:pb-8 flex-grow">
          {/* Header */}
          <div className="animate-fade-in mb-8 flex justify-between items-center">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface text-3xl">KYC Status</h2>
            <span className={`font-label-sm text-sm px-4 py-1.5 rounded-full flex items-center gap-1.5 border font-semibold ${
              status === 'Verified' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
            }`}>
              <span className="material-symbols-outlined text-sm">
                {status === 'Verified' ? 'check_circle' : 'hourglass_empty'}
              </span>
              <span>{status}</span>
            </span>
          </div>

          <div className="space-y-6">
            {/* KYC status card */}
            <div className="bg-surface-container backdrop-blur-md rounded-2xl p-6 md:p-8 border-2 border-primary/20 shadow-lg relative overflow-hidden animate-scale-up">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-2xl">{doc.type}</span>
                      </div>
                      <div>
                        <h4 className="font-label-lg text-label-lg text-on-surface font-bold text-base">{doc.name}</h4>
                        <p className={`font-label-sm text-label-sm flex items-center gap-1 mt-1 ${doc.status === 'Approved' ? 'text-emerald-600' : doc.status === 'Pending' ? 'text-yellow-600' : 'text-error'}`}>
                          <span className="material-symbols-outlined text-[16px]">
                            {doc.status === 'Approved' ? 'check_circle' : doc.status === 'Pending' ? 'pending_actions' : 'cancel'}
                          </span>
                          <span className="font-bold tracking-wider uppercase text-[11px]">{doc.status}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {doc.status !== 'Not Uploaded' && (
                        <>
                          <button 
                            onClick={() => handleViewDocument(doc)}
                            className="flex-1 md:flex-none bg-surface-container hover:bg-surface-variant text-on-surface-variant font-label-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-outline-variant/20 shadow-sm hover:text-on-surface active:scale-95" 
                            title="View Document"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                            <span>View</span>
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(doc)}
                            className="flex-1 md:flex-none bg-surface-container hover:bg-surface-variant text-on-surface-variant font-label-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-outline-variant/20 shadow-sm hover:text-on-surface active:scale-95" 
                            title="Download PDF"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            <span>Download</span>
                          </button>
                        </>
                      )}
                      <div className="flex-1 md:flex-none">
                        <input 
                          type="file" 
                          id={`doc-upload-${doc.id}`}
                          className="hidden" 
                          accept="application/pdf,image/*"
                          onChange={(e) => handleUpdateDocument(e, doc)}
                        />
                        <label 
                          htmlFor={`doc-upload-${doc.id}`}
                          className={`flex items-center justify-center gap-1.5 cursor-pointer font-label-sm py-2 px-4 rounded-lg transition-all shadow-sm active:scale-95 ${doc.status !== 'Not Uploaded' ? 'bg-primary text-on-primary hover:bg-primary/90' : 'bg-primary text-on-primary hover:bg-primary/90 w-full'}`}
                          title="Upload/Update Document"
                        >
                          <span className="material-symbols-outlined text-[18px]">upload</span>
                          <span className="whitespace-nowrap">{doc.status === 'Not Uploaded' ? 'Upload File' : 'Update'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MerchantBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </div>
  );
}
