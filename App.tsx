import React, { useState, useRef, useEffect } from "react";
import { ReportData, INITIAL_REPORT_DATA } from "./types";
import ReportForm from "./components/ReportForm";
import ReportPreview from "./components/ReportPreview";
import SettingsModal from "./components/SettingsModal";
import { saveToGoogleSheet } from "./services/sheetService";
import { Printer, FileText, Download, Share2, Settings, Send, Eye, PenTool, Check, MessageCircle, Copy } from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";

const DEFAULT_SHEET_URL = "https://script.google.com/macros/s/AKfycbzbPJUB_XCpCKjXyYYOAHYr2NBDuq7e5HeapeQAjQoS9sTZ2KrKw0LTkU9OFMcQf61pRg/exec";

const App: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>(INITIAL_REPORT_DATA);
  const componentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  
  // Google Sheet State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
  const [isSaving, setIsSaving] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // Load saved URL from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("googleSheetUrl");
    if (savedUrl) setSheetUrl(savedUrl);
  }, []);

  const handleSaveSettings = (url: string) => {
    setSheetUrl(url);
    localStorage.setItem("googleSheetUrl", url);
    alert("Tetapan berjaya disimpan!");
  };

  const handleSaveToCloud = async () => {
    if (!sheetUrl) {
      if (confirm("URL Database belum ditetapkan. Adakah anda mahu tetapkan sekarang?")) {
        setIsSettingsOpen(true);
      }
      return;
    }

    if (!reportData.unitName || !reportData.activityTopic) {
      alert("Sila isi Nama Unit dan Topik Aktiviti sebelum menghantar.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Calculate Percentage
      const percentage = reportData.studentsTotal > 0
        ? Math.round((reportData.studentsPresent / reportData.studentsTotal) * 100)
        : 0;

      // 2. Prepare Payload (Convert arrays to strings for clean Sheet cells)
      const payload = {
        ...reportData,
        attendancePercentage: percentage,
        activities: Array.isArray(reportData.activities) ? reportData.activities.join("\n") : reportData.activities,
        values: Array.isArray(reportData.values) ? reportData.values.join(", ") : reportData.values,
        submittedAt: new Date().toLocaleString('ms-MY')
      };

      await saveToGoogleSheet(sheetUrl, payload);
      setIsSent(true);
      alert("Data berjaya dihantar ke Google Sheet!");
    } catch (error) {
      alert("Gagal menghantar data. Sila semak sambungan internet atau URL Script anda.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyWhatsApp = async () => {
    const percentage = reportData.studentsTotal > 0
      ? Math.round((reportData.studentsPresent / reportData.studentsTotal) * 100)
      : 0;

    const activitiesList = reportData.activities.map((a, i) => `${i + 1}. ${a}`).join("\n");
    const valuesList = reportData.values.join(", ");

    const text = `*LAPORAN AKTIVITI KOKURIKULUM* 📝
    
📅 *Tarikh:* ${reportData.date}
⏰ *Masa:* ${reportData.startTime} - ${reportData.endTime}
📍 *Tempat:* ${reportData.venue}
👤 *Unit:* ${reportData.unitName}

*KEHADIRAN:*
👥 Murid: ${reportData.studentsPresent}/${reportData.studentsTotal} (${percentage}%)
👨‍🏫 Guru: ${reportData.teachersPresent || "-"}

*AKTIVITI:*
${activitiesList || "-"}

✨ *Nilai:* ${valuesList || "-"}
🧠 *KBAT:* ${reportData.kbat || "-"}

_Dijana oleh e-Laporan Kokurikulum_`;

    try {
      await navigator.clipboard.writeText(text);
      alert("Teks laporan disalin! Anda boleh 'Paste' di Group WhatsApp sekolah sekarang.");
    } catch (err) {
      alert("Gagal menyalin teks. Sila cuba lagi.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'e-Laporan Kokurikulum',
          text: 'Saya guna app ini untuk buat laporan koku dengan bantuan AI. Cuba la!',
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Pautan aplikasi telah disalin! Anda boleh 'Paste' di WhatsApp atau Telegram.");
      } catch (err) {
        alert("Sila salin URL di atas manual.");
      }
    }
  };

  const handleDownloadPDF = async () => {
    const element = componentRef.current;
    if (!element) {
      alert("Sila tunggu sebentar dan cuba lagi.");
      return;
    }

    setIsExporting(true);
    
    // Config for full A4 PDF
    const opt = {
      margin: 0,
      filename: `Laporan-${reportData.unitName.replace(/[^a-z0-9]/gi, '_') || 'Kokurikulum'}-${reportData.date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Export failed", error);
      alert("Gagal menjana PDF. Sila guna butang 'Cetak' dan pilih 'Save as PDF'.");
    } finally {
      setIsExporting(false);
    }
  };

  // Reset helper
  const handleReset = () => {
    setReportData(INITIAL_REPORT_DATA);
    setIsSent(false);
  };

  // Update handler to reset 'sent' status when user edits
  const handleDataChange = (newData: ReportData) => {
    setReportData(newData);
    if (isSent) setIsSent(false);
  };

  return (
    <div className="min-h-screen bg-slate-200 sm:py-8 flex justify-center items-center font-sans print:bg-white print:py-0 print:block">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveSettings}
        currentUrl={sheetUrl}
      />

      {/* Phone Frame Container */}
      <div className="w-full sm:max-w-[430px] bg-white sm:rounded-[2.5rem] sm:border-[8px] sm:border-slate-800 shadow-2xl overflow-hidden h-screen sm:h-[880px] relative flex flex-col print:h-auto print:max-w-none print:border-none print:shadow-none">
        
        {/* Phone Notch (Visual only on desktop) */}
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>

        {/* Header */}
        <header className="bg-white border-b border-slate-100 z-10 pt-2 pb-2 px-4 print:hidden">
          <div className="h-12 flex items-center justify-between mt-2 sm:mt-6">
             <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
                   <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                   <h1 className="text-lg font-bold text-slate-800 leading-none">e-Laporan</h1>
                   <p className="text-[10px] text-slate-500 uppercase tracking-wide">Edisi Mobile</p>
                </div>
             </div>
             
             <div className="flex gap-1">
               <button 
                  onClick={handleShareApp}
                  className="p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition"
                >
                  <Share2 className="w-5 h-5" />
               </button>
               <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition"
               >
                 <Settings className="w-5 h-5" />
               </button>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide pb-20 print:overflow-visible print:pb-0">
          
          {/* EDIT TAB */}
          <div className={`${activeTab === 'edit' ? 'block' : 'hidden'} print:hidden`}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                 <h2 className="text-lg font-bold text-slate-800">Borang Laporan</h2>
                 <button 
                  onClick={handleReset}
                  className="text-xs text-red-500 font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition"
                 >
                   Reset
                 </button>
              </div>

              <ReportForm data={reportData} onChange={handleDataChange} />

              {/* Bottom Actions */}
              <div className="mt-6 mb-8">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      Selesai & Hantar
                    </h3>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleSaveToCloud}
                        disabled={isSaving}
                        className={`w-full flex justify-center items-center gap-2 px-4 py-3.5 rounded-xl font-bold text-base transition shadow-md disabled:opacity-70 disabled:shadow-none ${
                            isSent 
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200" 
                            : "bg-indigo-600 active:bg-indigo-700 text-white shadow-indigo-200"
                        }`}
                      >
                        {isSaving ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : isSent ? (
                            <Check className="w-5 h-5" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                        {isSaving ? "Menghantar..." : isSent ? "Selesai" : "Hantar Laporan"}
                      </button>

                      <button
                        onClick={handleCopyWhatsApp}
                        className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-200 transition"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Salin Laporan (WhatsApp)
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 mt-1">
                          <button 
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="flex flex-col justify-center items-center gap-1 bg-slate-50 border border-slate-200 active:bg-slate-100 text-slate-700 px-2 py-3 rounded-xl font-semibold text-sm transition"
                          >
                            {isExporting ? (
                              <span className="animate-spin h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full"></span>
                            ) : (
                              <Download className="w-5 h-5 text-slate-600" />
                            )}
                            Jana PDF
                          </button>

                          <button 
                            onClick={handlePrint}
                            className="flex flex-col justify-center items-center gap-1 bg-slate-50 border border-slate-200 active:bg-slate-100 text-slate-700 px-2 py-3 rounded-xl font-semibold text-sm transition"
                          >
                            <Printer className="w-5 h-5 text-slate-600" />
                            Cetak
                          </button>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* PREVIEW TAB - VISUAL ONLY */}
          <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} print:block h-full`}>
             <div className="p-4 print:p-0">
               <div className="flex justify-between items-center mb-4 print:hidden">
                 <h2 className="text-lg font-bold text-slate-800">Pratonton PDF</h2>
                 <div className="text-xs text-slate-500">A4 View</div>
               </div>

               {/* A4 Container Scaled Down for Phone View */}
               {/* Note: This is NOT the source for PDF generation anymore. */}
               <div className="bg-slate-200/60 rounded-xl overflow-hidden flex justify-center py-4 min-h-[500px] border border-slate-200 print:bg-white print:border-none print:min-h-0 print:block">
                  <div className="transform scale-[0.45] sm:scale-[0.5] origin-top print:scale-100 print:transform-none">
                     <div className="bg-white shadow-xl print:shadow-none">
                        <ReportPreview data={reportData} />
                     </div>
                  </div>
               </div>
               
               <p className="text-center text-xs text-slate-400 mt-4 px-8 print:hidden">
                 Paparan ini diskalakan agar muat di skrin. Hasil PDF/Cetak sebenar adalah saiz penuh A4.
               </p>
             </div>
          </div>

        </main>

        {/* Bottom Navigation Bar */}
        <div className="bg-white border-t border-slate-200 absolute bottom-0 w-full z-20 print:hidden">
           <div className="grid grid-cols-2 h-[70px] pb-2">
              <button 
                onClick={() => setActiveTab('edit')}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'edit' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <div className={`p-1 rounded-full ${activeTab === 'edit' ? 'bg-indigo-50' : ''}`}>
                   <PenTool className={`w-6 h-6 ${activeTab === 'edit' ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                 </div>
                 <span className="text-[10px] font-semibold">Isi Borang</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('preview')}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'preview' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <div className={`p-1 rounded-full ${activeTab === 'preview' ? 'bg-indigo-50' : ''}`}>
                   <Eye className={`w-6 h-6 ${activeTab === 'preview' ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                 </div>
                 <span className="text-[10px] font-semibold">Lihat Laporan</span>
              </button>
           </div>
        </div>

      </div>

      {/* 
        HIDDEN CONTAINER FOR PDF GENERATION 
        This is kept outside the mobile frame to ensure full A4 resolution and visibility 
        even when the user is on the Edit tab. 
        It is positioned off-screen so the user doesn't see it.
      */}
      <div className="fixed top-0 left-[-9999px] w-[210mm] z-[-50] pointer-events-none opacity-0">
         <div ref={componentRef} className="bg-white text-black">
            <ReportPreview data={reportData} />
         </div>
      </div>

    </div>
  );
};

export default App;