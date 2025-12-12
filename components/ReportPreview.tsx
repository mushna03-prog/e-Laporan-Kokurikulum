import React from "react";
import { ReportData } from "../types";

interface ReportPreviewProps {
  data: ReportData;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    // Avoid timezone issues by splitting YYYY-MM-DD manually
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;

    const [yearStr, monthStr, dayStr] = parts;
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);

    if (!year || !month || !day) return "-";

    switch (data.dateFormat) {
      case "dd/mm/yyyy":
        return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`;
      case "dd-mm-yyyy":
        return `${day.toString().padStart(2, "0")}-${month.toString().padStart(2, "0")}-${year}`;
      case "d MMMM yyyy":
      default:
        const date = new Date(year, month - 1, day);
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ms-MY', options);
    }
  };

  const getTodayFormatted = () => {
    const today = new Date();
    // Format today based on preference, or just use default long format for signature
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return today.toLocaleDateString('ms-MY', options);
  }

  return (
    <div className="bg-white shadow-lg p-8 md:p-12 mx-auto w-full max-w-[21cm] min-h-[29.7cm] print:shadow-none print:w-full print:max-w-none print:p-0 text-slate-900 font-serif leading-relaxed">
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-xl font-bold uppercase tracking-wider mb-2">Laporan Mingguan Aktiviti Kokurikulum</h1>
        <h2 className="text-lg font-semibold">{data.unitName || "[Nama Unit/Kelab]"}</h2>
      </div>

      <table className="w-full border-collapse border border-black text-sm mb-6">
        <tbody>
          <tr>
            <td className="border border-black p-2 bg-gray-100 font-bold w-1/4">Bil. Perjumpaan</td>
            <td className="border border-black p-2 w-1/4">{data.meetingNumber}</td>
            <td className="border border-black p-2 bg-gray-100 font-bold w-1/4">Tarikh</td>
            <td className="border border-black p-2 w-1/4">{formatDate(data.date)}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 bg-gray-100 font-bold">Masa</td>
            <td className="border border-black p-2" colSpan={3}>
              {data.startTime} - {data.endTime}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-2 bg-gray-100 font-bold">Tempat</td>
            <td className="border border-black p-2" colSpan={3}>{data.venue}</td>
          </tr>
        </tbody>
      </table>

      <div className="mb-6">
        <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Kehadiran</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-gray-100 w-1/3">Kehadiran Murid</td>
              <td className="border border-black p-2">
                {data.studentsPresent} / {data.studentsTotal} orang
                {data.studentsTotal > 0 && (
                   <span className="ml-2 text-slate-500 text-xs">
                     ({Math.round((data.studentsPresent / data.studentsTotal) * 100)}%)
                   </span>
                )}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-100 align-top">Guru Penasihat</td>
              <td className="border border-black p-2 whitespace-pre-line">
                {data.teachersPresent || "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Laporan Aktiviti</h3>
        <div className="border border-black p-4 min-h-[150px] text-sm text-justify">
           {data.activities.length > 0 ? (
             <ol className="list-decimal pl-5 space-y-1">
               {data.activities.map((act, index) => (
                 <li key={index}>{act}</li>
               ))}
             </ol>
           ) : (
             <p className="text-gray-400 italic">Tiada aktiviti direkodkan.</p>
           )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
           <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Penerapan Nilai Murni</h3>
           <div className="border border-black p-2 min-h-[60px] text-sm">
             {data.values.length > 0 ? data.values.join(", ") : "-"}
           </div>
        </div>
        <div>
           <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Elemen KBAT</h3>
           <div className="border border-black p-2 min-h-[60px] text-sm">
             {data.kbat || "-"}
           </div>
        </div>
      </div>

      <div className="mb-6 bg-gray-50 print:bg-transparent">
        <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Sisipan PiKeBM</h3>
        <div className="border border-black p-4 text-sm">
           <div className="grid grid-cols-[120px_1fr] gap-2 mb-2">
              <span className="font-semibold">Tajuk:</span>
              <span>{data.pikebmTitle || "-"}</span>
           </div>
           <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="font-semibold">Ringkasan:</span>
              <span className="text-justify">{data.pikebmSummary || "-"}</span>
           </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-bold border-b border-black mb-2 pb-1 uppercase text-sm">Catatan / Ulasan Guru</h3>
        <div className="border border-black p-4 min-h-[80px] text-sm">
          {data.advisorNote || "Aktiviti dijalankan dengan lancar."}
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <div className="text-center w-48">
          <div className="h-16 mb-2 border-b border-dotted border-black"></div>
          <p className="text-sm font-bold">Tandatangan Guru Penasihat</p>
          <p className="text-xs text-gray-500 mt-1">Tarikh: {getTodayFormatted()}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
