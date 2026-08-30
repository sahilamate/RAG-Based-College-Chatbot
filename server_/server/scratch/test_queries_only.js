import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { retrieveContext } from '../services/ragService.js';
import { generateAnswer } from '../services/llmService.js';
import { prepareSources } from '../services/chatService.js';

dotenv.config();

const runQueryTest = async () => {
  try {
    await connectDB();

    console.log('\n==================================================');
    console.log('🔍 TESTING RAG RETRIEVAL & ANSWER GENERATION ON DB');
    console.log('==================================================');

    const totalChunks = await DocumentChunk.countDocuments();
    const docCount = await Document.countDocuments();
    console.log(`[DB STATUS] Total Documents: ${docCount} | Total Document Chunks: ${totalChunks}`);

    const testQueries = [
      "Who is the principal?",
      "Who is the dean?",
      "Who is the HOD of CSE?",
      "What is the scholarship deadline?",
      "How much is the tuition fee?",
      "How do I apply for a scholarship?",
      "What are the scholarship eligibility requirements?",
      "What happens if I miss an application deadline?",
      "What is the minimum attendance requirement?",
      "What are the examination rules?"
    ];

    for (let i = 0; i < testQueries.length; i++) {
      const q = testQueries[i];
      console.log(`\n--------------------------------------------------`);
      console.log(`TEST #${i + 1}: "${q}"`);
      console.log(`--------------------------------------------------`);

      const ragResult = await retrieveContext(q);

      if (!ragResult.hasContext) {
        console.log(`Result: ❌ No context retrieved (${ragResult.message})`);
        continue;
      }

      const llmResult = await generateAnswer({ question: q, context: ragResult.context });
      const sources = prepareSources(ragResult.chunks);

      console.log(`Answer:\n${llmResult.answer}\n`);
      console.log(`Sources Displayed (${sources.length}):`);
      sources.forEach((s, idx) => {
        if (s.fileType === 'excel') {
          console.log(`  [Source ${idx + 1}] Excel: ${s.originalFileName} | Sheet: ${s.sheetName} | Row: ${s.rowNumber}`);
          console.log(`    Snippet: ${s.snippet.slice(0, 120)}...`);
        } else {
          console.log(`  [Source ${idx + 1}] PDF: ${s.originalFileName} | Page: ${s.pageNumber} | Section: ${s.sectionTitle}`);
          console.log(`    Snippet: ${s.snippet.slice(0, 120)}...`);
        }
      });
    }

    console.log('\n==================================================');
    console.log('✅ ALL QUERY TESTS COMPLETED!');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Query Test Error:', error);
    process.exit(1);
  }
};

runQueryTest();
