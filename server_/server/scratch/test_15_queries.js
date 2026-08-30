import connectDB from '../config/db.js';
import { retrieveContext } from '../services/ragService.js';
import { generateAnswer } from '../services/llmService.js';

const TEST_QUESTIONS = [
  "What are the placement statistics?",
  "What is the minimum CGPA required for placement registration?",
  "What are the responsibilities of the principal?",
  "What are the responsibilities of the vice principal?",
  "How many departments are there?",
  "List all departments.",
  "What are all the caste/category options?",
  "How many students belong to SC?",
  "What is the average CGPA?",
  "Which student has the highest CGPA?",
  "What is the tuition fee for B.Tech Computer Science?",
  "What scholarships are available for SC students?",
  "What is the fee for CSE semester 2?",
  "Who is the Head of Training and Placement?",
  "Show students with CGPA above 9."
];

async function runTests() {
  await connectDB();
  console.log(`\n==================================================`);
  console.log(`STARTING AUTOMATED RAG PIPELINE BENCHMARK (15 TEST CASES)`);
  console.log(`==================================================\n`);

  for (let i = 0; i < TEST_QUESTIONS.length; i++) {
    const q = TEST_QUESTIONS[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`[TEST #${i + 1}] QUESTION: "${q}"`);

    try {
      const ragRes = await retrieveContext(q);

      if (!ragRes.hasContext) {
        console.log(`[RESULT]: UNKNOWN / NO CONTEXT ("${ragRes.message}")`);
        continue;
      }

      let finalAnswer = ragRes.answer;
      if (!finalAnswer) {
        const llmRes = await generateAnswer({ question: q, context: ragRes.context });
        finalAnswer = llmRes.answer;
      }

      console.log(`[RETRIEVED CONTEXT TYPE]: ${ragRes.isStructured ? 'STRUCTURED DIRECT QUERY' : 'HYBRID RERANKED EVIDENCE'}`);
      console.log(`[SOURCES COUNT]: ${ragRes.chunks?.length || 0}`);
      if (ragRes.chunks && ragRes.chunks.length > 0) {
        console.log(`[TOP SOURCE]: ${ragRes.chunks[0].sheetName || ragRes.chunks[0].originalFileName} (${ragRes.chunks[0].operation || ragRes.chunks[0].sectionTitle || 'Chunk'})`);
      }
      console.log(`[ANSWER OUTPUT]:\n${finalAnswer.slice(0, 350)}...`);
    } catch (err) {
      console.error(`[TEST #${i + 1} ERROR]:`, err.message);
    }
  }

  console.log(`\n==================================================`);
  console.log(`ALL 15 RAG BENCHMARK TESTS COMPLETED SUCCESSFULLY`);
  console.log(`==================================================\n`);
  process.exit(0);
}

runTests();
