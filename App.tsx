import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { PreviewTable } from './components/PreviewTable';
import { parseNotebookLMCSV, generateKahootCSV, generateKahootXLSX, validateQuizItem } from './utils/parser';
import { QuizItem } from './types';
import { Download, RefreshCw, FileQuestion, FileSpreadsheet, Info, CheckCircle, ArrowRight, Play } from 'lucide-react';

const SAMPLE_DATA = `Q: Mi a Naprendszer legnagyobb bolygója?; A: Jupiter; isCorrect: true
Q: Mi a Naprendszer legnagyobb bolygója?; A: Szaturnusz; isCorrect: false
Q: Mi a Naprendszer legnagyobb bolygója?; A: Mars; isCorrect: false
Q: Mi a Naprendszer legnagyobb bolygója?; A: Föld; isCorrect: false
Q: Melyik évben kezdődött az első világháború?; A: 1914; isCorrect: true
Q: Melyik évben kezdődött az első világháború?; A: 1918; isCorrect: false
Q: Melyik évben kezdődött az első világháború?; A: 1939; isCorrect: false
Q: Melyik évben kezdődött az első világháború?; A: 1945; isCorrect: false
Q: Ki írta a "Bánk bán" című drámát?; A: Katona József; isCorrect: true
Q: Ki írta a "Bánk bán" című drámát?; A: Madách Imre; isCorrect: false
Q: Ki írta a "Bánk bán" című drámát?; A: Arany János; isCorrect: false
Q: Ki írta a "Bánk bán" című drámát?; A: Petőfi Sándor; isCorrect: false`;

const App: React.FC = () => {
  const [items, setItems] = useState<QuizItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<number>(20);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');
  const [step, setStep] = useState<1 | 2>(1);

  const handleFileLoaded = (content: string, name: string) => {
    try {
      const parsedItems = parseNotebookLMCSV(content);
      if (parsedItems.length === 0) {
        alert("Nem találtunk kérdéseket a fájlban. Ellenőrizd a formátumot!");
        return;
      }
      setItems(parsedItems);
      setFileName(name);
      setStep(2);
    } catch (e) {
      alert("Hiba történt a fájl feldolgozása közben. Kérlek ellenőrizd a formátumot.");
      console.error(e);
    }
  };

  const loadSampleData = () => {
    handleFileLoaded(SAMPLE_DATA, 'minta_kviz.csv');
  };

  const handleItemUpdate = (id: number, updatedItem: QuizItem) => {
    const validatedItem = validateQuizItem(updatedItem);
    setItems(prevItems => 
      prevItems.map(item => item.id === id ? validatedItem : item)
    );
  };

  const handleDownload = () => {
    const downloadName = (fileName || 'kahoot_export').replace(/\.[^/.]+$/, "") + "_kahoot." + exportFormat;
    
    if (exportFormat === 'csv') {
        const csvContent = generateKahootCSV(items, timeLimit);
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', downloadName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        const blob = generateKahootXLSX(items, timeLimit);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', downloadName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setItems([]);
    setFileName('');
    setStep(1);
  };

  const validCount = items.filter(i => i.isValid).length;
  const invalidCount = items.length - validCount;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <FileQuestion className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              NotebookLM <span className="text-indigo-600">to</span> Kahoot
            </h1>
          </div>
          {step === 2 && (
             <button 
             onClick={handleReset}
             className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
           >
             <RefreshCw className="w-4 h-4" />
             Újrakezdés
           </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {step === 1 && (
          <div className="max-w-4xl mx-auto animate-in">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                Ingyenes & Nyílt forráskódú
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Kvíz konvertálása <span className="text-indigo-600">másodpercek</span> alatt
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Töltsd fel a NotebookLM-ből exportált CSV fájlt, és mi azonnal átalakítjuk a Kahoot által elvárt Excel formátumra. Nincs regisztráció, nincs adatgyűjtés.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="md:col-span-2">
                <FileUpload onFileLoaded={handleFileLoaded} />
                <div className="mt-4 flex justify-center">
                  <button 
                    onClick={loadSampleData}
                    className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Nincs fájlom, mutass egy példát!
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-600" />
                    Hogyan működik?
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-sm text-slate-600">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">1</div>
                      <span>Exportáld a kvízt a NotebookLM-ből CSV formátumban.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">2</div>
                      <span>Húzd ide a fájlt vagy válaszd ki a gépedről.</span>
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]">3</div>
                      <span>Ellenőrizd a kérdéseket, majd töltsd le az Excel fájlt.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                  <h3 className="font-bold mb-2">Kahoot kész!</h3>
                  <p className="text-indigo-100 text-sm mb-4">
                    A generált fájl közvetlenül importálható a Kahoot "Import from spreadsheet" funkciójával.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/10 w-fit px-2 py-1 rounded">
                    <CheckCircle className="w-3 h-3" />
                    100% Kompatibilis
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-16">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Gyakori kérdések</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Milyen formátumot vár az eszköz?</h4>
                  <p className="text-sm text-slate-600">
                    A NotebookLM alapértelmezett exportját használjuk, ahol a sorok <code className="bg-slate-100 px-1 rounded text-indigo-600">Q: ...; A: ...; isCorrect: ...</code> formátumban vannak.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Biztonságban vannak az adataim?</h4>
                  <p className="text-sm text-slate-600">
                    Igen. A feldolgozás teljes egészében a böngésződben történik, semmilyen adat nem kerül feltöltésre a szervereinkre.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Felismerve</div>
                  <div className="text-3xl font-black text-slate-900">{items.length} <span className="text-sm font-medium text-slate-400">kérdés</span></div>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Állapot</div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {validCount} helyes
                    </span>
                    {invalidCount > 0 && (
                      <span className="flex items-center gap-2 text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {invalidCount} hibás
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                 <div className="flex items-center gap-3">
                    <label htmlFor="timeLimit" className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Idő (mp)</label>
                    <select 
                      id="timeLimit"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="block w-24 rounded-xl border-slate-200 py-2 text-sm font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 border px-3 cursor-pointer"
                    >
                      {[5, 10, 20, 30, 60, 90, 120, 240].map(t => (
                        <option key={t} value={t}>{t} mp</option>
                      ))}
                    </select>
                 </div>

                 <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                    <label htmlFor="format" className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Formátum</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setExportFormat('csv')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${exportFormat === 'csv' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            CSV
                        </button>
                        <button 
                            onClick={() => setExportFormat('xlsx')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${exportFormat === 'xlsx' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            EXCEL
                        </button>
                    </div>
                 </div>

                <button
                  onClick={handleDownload}
                  disabled={items.length === 0}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 min-w-[180px]"
                >
                  {exportFormat === 'xlsx' ? <FileSpreadsheet className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                  Letöltés
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Kérdések szerkesztése</h3>
              <p className="text-xs text-slate-500 italic">A módosítások automatikusan mentésre kerülnek a letöltéshez.</p>
            </div>
            
            <PreviewTable items={items} onItemUpdate={handleItemUpdate} />
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
          <p>© 2024 NotebookLM to Kahoot Converter. Készült a közösség számára.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">GitHub</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Adatvédelem</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Kapcsolat</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
