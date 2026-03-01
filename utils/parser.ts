import { QuizItem, KAHOOT_LIMITS } from '../types';
import * as XLSX from 'xlsx';

/**
 * Validates a single quiz item against Kahoot limits.
 */
export const validateQuizItem = (item: QuizItem): QuizItem => {
  const errors: string[] = [];
  
  // Validate limits based on Kahoot requirements
  if (item.question.length > KAHOOT_LIMITS.question) {
    errors.push(`A kérdés túl hosszú (${item.question.length}/${KAHOOT_LIMITS.question} karakter)`);
  }
  
  if (item.answers.length < 2) {
    errors.push("Nincs elég válaszlehetőség (min. 2)");
  }

  if (item.answers.length > 4) {
    errors.push("Túl sok válaszlehetőség (max. 4)");
  }

  item.answers.forEach((ans, idx) => {
    if (ans.text.length > KAHOOT_LIMITS.answer) {
      errors.push(`${idx + 1}. válasz túl hosszú (${ans.text.length}/${KAHOOT_LIMITS.answer} karakter)`);
    }
  });

  const hasCorrectAnswer = item.answers.some(a => a.isCorrect);
  if (!hasCorrectAnswer) {
    errors.push("Nincs megjelölve helyes válasz");
  }

  return {
    ...item,
    isValid: errors.length === 0,
    validationErrors: errors
  };
};

/**
 * Parses the raw text from NotebookLM CSV export.
 */
export const parseNotebookLMCSV = (text: string): QuizItem[] => {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  const questionsMap = new Map<string, QuizItem>();
  
  // Helper to remove BOM if present
  const cleanLine = (str: string) => str.replace(/^\uFEFF/, '').trim();

  lines.forEach((rawLine) => {
    const line = cleanLine(rawLine);
    
    // Regex to extract parts: Q: ...; A: ...; isCorrect: ...
    const match = line.match(/Q:\s*(.*?);\s*A:\s*(.*?);\s*isCorrect:\s*(true|false)/i);

    if (match) {
      const [, questionText, answerText, isCorrectStr] = match;
      const isCorrect = isCorrectStr.toLowerCase() === 'true';

      if (!questionsMap.has(questionText)) {
        questionsMap.set(questionText, {
          id: questionsMap.size + 1,
          question: questionText,
          answers: [],
          isValid: true,
          validationErrors: []
        });
      }

      const currentQuestion = questionsMap.get(questionText)!;
      currentQuestion.answers.push({
        text: answerText,
        isCorrect: isCorrect
      });
    }
  });

  // Post-processing to validate questions
  return Array.from(questionsMap.values()).map(validateQuizItem);
};

/**
 * Generates the specific CSV format required by Kahoot.
 */
export const generateKahootCSV = (items: QuizItem[], timeLimit: number = 20): string => {
  const headerRows = [
    `;;;;;;;;;;;;;;;;;;;;;;;;;;`,
    `;Quiz template;;;;;;;;;;;;;;;;;;;;;;;;;`,
    `;Add questions, at least two answer alternatives, time limit and choose correct answers (at least one). Have fun creating your awesome quiz!;;;;;;;;;;;;;;;;;;;;;;;;;`,
    `;Remember: questions have a limit of 120 characters and answers can have 75 characters max. Text will turn red in Excel or Google Docs if you exceed this limit. If several answers are correct, separate them with a comma.;;;;;;;;;;;;;;;;;;;;;;;;;`,
    `;See an example question below (don't forget to overwrite this with your first question!);;;;;;;;;;;;;;;;;;;;;;;;;`,
    `;And remember,  if you're not using Excel you need to export to .xlsx format before you upload to Kahoot!;;;;;;;;;;;;;;;;;;;;;;;;;`,
    `;;;;;;;;;;;;;;;;;;;;;;;;;;`,
    `;Question - max 120 characters;Answer 1 - max 75 characters;Answer 2 - max 75 characters;Answer 3 - max 75 characters;Answer 4 - max 75 characters;Time limit (sec) – 5, 10, 20, 30, 60, 90, 120, or 240 secs;Correct answer(s) - choose at least one;;;;;;;;;;;;;;;;;;;`
  ].join('\n');

  const dataRows = items.map((item, index) => {
    const safeText = (txt: string) => txt.replace(/;/g, ',');
    const qText = safeText(item.question);
    const answersText = Array(4).fill('').map((_, idx) => {
      return item.answers[idx] ? safeText(item.answers[idx].text) : '';
    });
    const correctIndices = item.answers
      .map((ans, idx) => ans.isCorrect ? idx + 1 : null)
      .filter(val => val !== null)
      .join(',');

    return `${index + 1};${qText};${answersText[0]};${answersText[1]};${answersText[2]};${answersText[3]};${timeLimit};${correctIndices};;;;;;;;;;;;;;;;;;;`;
  }).join('\n');

  return `${headerRows}\n${dataRows}`;
};

/**
 * Generates an XLSX blob for Kahoot.
 */
export const generateKahootXLSX = (items: QuizItem[], timeLimit: number = 20): Blob => {
  // Construct the data array (Array of Arrays)
  const aoa: any[][] = [
    [], // Row 1
    ['', 'Quiz template'], // Row 2
    ['', 'Add questions, at least two answer alternatives, time limit and choose correct answers (at least one). Have fun creating your awesome quiz!'], // Row 3
    ['', 'Remember: questions have a limit of 120 characters and answers can have 75 characters max. Text will turn red in Excel or Google Docs if you exceed this limit. If several answers are correct, separate them with a comma.'], // Row 4
    ['', 'See an example question below (don\'t forget to overwrite this with your first question!)'], // Row 5
    ['', 'And remember,  if you\'re not using Excel you need to export to .xlsx format before you upload to Kahoot!'], // Row 6
    [], // Row 7
    ['', 'Question - max 120 characters', 'Answer 1 - max 75 characters', 'Answer 2 - max 75 characters', 'Answer 3 - max 75 characters', 'Answer 4 - max 75 characters', 'Time limit (sec) – 5, 10, 20, 30, 60, 90, 120, or 240 secs', 'Correct answer(s) - choose at least one'] // Row 8 - Headers
  ];

  // Add data rows
  items.forEach((item, index) => {
    const answersText = Array(4).fill('').map((_, idx) => {
      return item.answers[idx] ? item.answers[idx].text : '';
    });

    const correctIndices = item.answers
      .map((ans, idx) => ans.isCorrect ? idx + 1 : null)
      .filter(val => val !== null)
      .join(',');

    aoa.push([
      index + 1,
      item.question,
      answersText[0],
      answersText[1],
      answersText[2],
      answersText[3],
      timeLimit,
      correctIndices
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "KahootQuiz");

  // Generate buffer
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
};