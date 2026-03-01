import React from 'react';
import { QuizItem, KAHOOT_LIMITS } from '../types';
import { AlertCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface PreviewTableProps {
  items: QuizItem[];
  onItemUpdate: (id: number, updatedItem: QuizItem) => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({ items, onItemUpdate }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-slate-300" />
        </div>
        <p className="font-medium">Nincsenek megjeleníthető kérdések.</p>
        <p className="text-sm">Ellenőrizd a fájl formátumát vagy próbáld újra.</p>
      </div>
    );
  }

  const handleQuestionChange = (item: QuizItem, newText: string) => {
    onItemUpdate(item.id, { ...item, question: newText });
  };

  const handleAnswerChange = (item: QuizItem, answerIndex: number, newText: string) => {
    const newAnswers = [...item.answers];
    newAnswers[answerIndex] = { ...newAnswers[answerIndex], text: newText };
    onItemUpdate(item.id, { ...item, answers: newAnswers });
  };

  const toggleCorrectAnswer = (item: QuizItem, answerIndex: number) => {
    const newAnswers = [...item.answers];
    const currentStatus = newAnswers[answerIndex].isCorrect;
    newAnswers[answerIndex] = { ...newAnswers[answerIndex], isCorrect: !currentStatus };
    onItemUpdate(item.id, { ...item, answers: newAnswers });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 border-collapse">
          <thead className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 w-16">#</th>
              <th className="px-8 py-5 min-w-[350px]">Kérdés szövege</th>
              <th className="px-8 py-5 min-w-[400px]">Válaszlehetőségek</th>
              <th className="px-8 py-5 w-40 text-center">Státusz</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-8 font-black text-slate-300 group-hover:text-indigo-400 transition-colors align-top text-lg">
                  {item.id.toString().padStart(2, '0')}
                </td>
                <td className="px-8 py-8 align-top">
                  <div className="relative">
                    <textarea
                      value={item.question}
                      onChange={(e) => handleQuestionChange(item, e.target.value)}
                      className={`w-full p-4 border rounded-2xl text-sm font-medium focus:ring-4 focus:outline-none transition-all resize-none ${
                        item.question.length > KAHOOT_LIMITS.question 
                          ? 'border-rose-200 bg-rose-50 text-rose-900 focus:ring-rose-100 focus:border-rose-300' 
                          : 'border-slate-100 text-slate-900 bg-slate-50/30 focus:ring-indigo-50 focus:border-indigo-200 hover:border-slate-200'
                      }`}
                      rows={3}
                    />
                    <div className={`absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-md ${
                      item.question.length > KAHOOT_LIMITS.question 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white/80 text-slate-400 border border-slate-100'
                    }`}>
                      {item.question.length} / {KAHOOT_LIMITS.question}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8 align-top">
                  <div className="grid grid-cols-1 gap-4">
                    {item.answers.map((ans, idx) => (
                      <div key={idx} className="flex items-center gap-3 group/ans">
                        <button
                          onClick={() => toggleCorrectAnswer(item, idx)}
                          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                            ans.isCorrect 
                              ? 'bg-emerald-500 text-white shadow-emerald-200' 
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                          }`}
                          title={ans.isCorrect ? "Helyes válasz" : "Helytelen válasz"}
                        >
                          {String.fromCharCode(65 + idx)}
                        </button>
                        <div className="flex-grow relative">
                            <input 
                              type="text"
                              value={ans.text}
                              onChange={(e) => handleAnswerChange(item, idx, e.target.value)}
                              className={`w-full pl-4 pr-16 py-2.5 border rounded-xl text-sm font-semibold focus:ring-4 focus:outline-none transition-all ${
                                ans.text.length > KAHOOT_LIMITS.answer
                                  ? 'border-rose-200 bg-rose-50 text-rose-900 focus:ring-rose-100'
                                  : 'border-slate-100 bg-slate-50/30 text-slate-700 focus:ring-indigo-50 focus:border-indigo-200 hover:border-slate-200'
                              }`}
                            />
                             <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black px-1.5 py-0.5 rounded ${
                               ans.text.length > KAHOOT_LIMITS.answer 
                                 ? 'bg-rose-500 text-white' 
                                 : 'text-slate-300'
                             }`}>
                                {ans.text.length} / {KAHOOT_LIMITS.answer}
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-8 align-top text-center">
                  <div className="flex flex-col items-center gap-2">
                    {item.isValid ? (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm animate-in">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">Kész</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 animate-in">
                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 shadow-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-wider">Hiba</span>
                        </div>
                        <div className="max-w-[150px]">
                          {item.validationErrors.map((err, i) => (
                            <div key={i} className="text-[10px] text-rose-400 font-medium leading-tight mb-1">
                              • {err}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
