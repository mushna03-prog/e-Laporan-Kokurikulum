import React, { useState } from "react";
import { ReportData } from "../types";
import { Sparkles, Calendar, Clock, MapPin, Users, BookOpen, UserCheck, Activity } from "lucide-react";
import { generateReportContent } from "../services/geminiService";

interface ReportFormProps {
  data: ReportData;
  onChange: (data: ReportData) => void;
}

const UNIT_OPTIONS = [
  "Persatuan Agama Islam",
  "Kelab Doktor Muda",
  "Kelab Pencegahan Jenayah",
  "Kelab Robotik",
  "Kelab Kebudayaan",
  "Unit Beruniform PPIM",
  "Unit Beruniform TKRS",
  "Unit Beruniform TUSPA",
  "Unit Beruniform PENGAKAP",
  "Bola Sepak",
  "Bola Jaring",
  "Bola Tampar",
  "Sofbol"
];

const ReportForm: React.FC<ReportFormProps> = ({ data, onChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (field: keyof ReportData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAiGenerate = async () => {
    if (!data.activityTopic) {
      alert("Sila masukkan Topik Aktiviti Utama dahulu.");
      return;
    }
    setIsGenerating(true);
    try {
      const generatedContent = await generateReportContent(data.activityTopic, data.unitName);
      onChange({ ...data, ...generatedContent });
    } catch (error) {
      alert("Gagal menjana kandungan. Sila cuba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate percentage dynamically
  const presencePercentage = data.studentsTotal > 0
    ? Math.round((data.studentsPresent / data.studentsTotal) * 100)
    : 0;

  // Determine color based on percentage
  const getPercentageColor = (percent: number) => {
    if (percent >= 80) return "text-emerald-600";
    if (percent >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-100 pb-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Maklumat Asas
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Unit / Kelab</label>
          <select
            className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white text-slate-900"
            value={data.unitName}
            onChange={(e) => handleChange("unitName", e.target.value)}
          >
            <option value="" disabled>-- Sila Pilih Unit --</option>
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bilangan Perjumpaan</label>
          <input
            type="number"
            className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            value={data.meetingNumber}
            onChange={(e) => handleChange("meetingNumber", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Calendar className="w-4 h-4" /> Tarikh</label>
          <div className="space-y-2">
            <input
              type="date"
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={data.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
            <select
              value={data.dateFormat}
              onChange={(e) => handleChange("dateFormat", e.target.value)}
              className="w-full rounded-lg border-slate-300 border p-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600 cursor-pointer"
            >
              <option value="d MMMM yyyy">Format: 24 Oktober 2023</option>
              <option value="dd/mm/yyyy">Format: 24/10/2023</option>
              <option value="dd-mm-yyyy">Format: 24-10-2023</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Clock className="w-4 h-4" /> Masa Mula</label>
          <input
            type="time"
            className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            value={data.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Clock className="w-4 h-4" /> Masa Tamat</label>
          <input
            type="time"
            className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            value={data.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> Tempat</label>
        <input
          type="text"
          className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          value={data.venue}
          onChange={(e) => handleChange("venue", e.target.value)}
          placeholder="Contoh: Padang Sekolah / Dewan Terbuka"
        />
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4">
         <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-indigo-600" />
          Kehadiran
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hadir (Murid)</label>
            <input
              type="number"
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={data.studentsPresent}
              onChange={(e) => handleChange("studentsPresent", parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Ahli</label>
            <input
              type="number"
              className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              value={data.studentsTotal}
              onChange={(e) => handleChange("studentsTotal", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Automatic Percentage Calculation Display */}
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Peratus Kehadiran:
            </span>
            <span className={`text-lg font-bold ${getPercentageColor(presencePercentage)}`}>
                {presencePercentage}%
            </span>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Kehadiran Guru</label>
          <textarea
            className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-20"
            value={data.teachersPresent}
            onChange={(e) => handleChange("teachersPresent", e.target.value)}
            placeholder="Senaraikan nama guru penasihat yang hadir..."
          />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4 relative">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Laporan Aktiviti (AI Powered)
            </h2>
         </div>

         <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-100">
            <label className="block text-sm font-bold text-indigo-900 mb-1">Topik Aktiviti Utama</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border-indigo-200 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                value={data.activityTopic}
                onChange={(e) => handleChange("activityTopic", e.target.value)}
                placeholder="Contoh: Latihan Kawad Kaki Asas"
              />
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !data.activityTopic}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Jana Automatik
              </button>
            </div>
            <p className="text-xs text-indigo-600 mt-2">
              * Masukkan topik dan tekan "Jana Automatik" untuk mengisi bahagian Aktiviti, Nilai, KBAT dan PiKeBM menggunakan AI.
            </p>
         </div>

         <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Perincian Aktiviti</label>
              <textarea
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-32"
                value={data.activities.join("\n")}
                onChange={(e) => handleChange("activities", e.target.value.split("\n"))}
                placeholder="Setiap baris akan menjadi satu poin..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Penerapan Nilai Murni</label>
              <input
                type="text"
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                value={data.values.join(", ")}
                onChange={(e) => handleChange("values", e.target.value.split(",").map(s => s.trim()))}
                placeholder="Contoh: Kerjasama, Disiplin (asingkan dengan koma)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tajuk Sisipan PiKeBM</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={data.pikebmTitle}
                  onChange={(e) => handleChange("pikebmTitle", e.target.value)}
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Elemen KBAT</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={data.kbat}
                  onChange={(e) => handleChange("kbat", e.target.value)}
                />
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ringkasan Aktiviti PiKeBM</label>
              <textarea
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-20"
                value={data.pikebmSummary}
                onChange={(e) => handleChange("pikebmSummary", e.target.value)}
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Guru Penasihat</label>
              <textarea
                className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition h-20"
                value={data.advisorNote}
                onChange={(e) => handleChange("advisorNote", e.target.value)}
                placeholder="Aktiviti berjalan lancar..."
              />
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportForm;