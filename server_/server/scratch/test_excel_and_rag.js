import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { processDocument } from '../services/documentProcessingService.js';
import { generateDocumentEmbeddings } from '../services/embeddingProcessingService.js';
import { retrieveContext } from '../services/ragService.js';
import { generateAnswer } from '../services/llmService.js';
import { prepareSources } from '../services/chatService.js';

dotenv.config();

const runTest = async () => {
  try {
    await connectDB();

    console.log('\n==================================================');
    console.log('🧪 TESTING EXCEL PROCESSING & HYBRID RAG PIPELINE');
    console.log('==================================================');

    // 1. Get or create Admin user for upload attribution
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: 'College Admin',
        email: 'admin_test@college.com',
        password: 'admin123',
        role: 'admin'
      });
    }

    const excelFilePath = path.resolve('../CollegeAI_Knowledge_Base.xlsx');
    console.log(`[TEST] Target Excel path: ${excelFilePath}`);

    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Target Excel file not found at ${excelFilePath}`);
    }

    const stats = fs.statSync(excelFilePath);
    console.log(`[TEST] Excel File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

    // 2. Clean existing document with same name if any
    const existingDoc = await Document.findOne({ originalFileName: 'CollegeAI_Knowledge_Base.xlsx' });
    if (existingDoc) {
      console.log(`[TEST] Cleaning existing Document record (${existingDoc._id})...`);
      await DocumentChunk.deleteMany({ documentId: existingDoc._id });
      await existingDoc.deleteOne();
    }

    // 3. Create Document record
    const document = await Document.create({
      title: 'College Knowledge Base',
      fileName: 'CollegeAI_Knowledge_Base.xlsx',
      originalFileName: 'CollegeAI_Knowledge_Base.xlsx',
      filePath: excelFilePath,
      fileSize: stats.size,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileType: 'excel',
      department: 'All Departments',
      category: 'Other',
      academicYear: '2026',
      uploadedBy: admin._id,
      status: 'uploaded'
    });

    console.log(`[TEST] Document created in DB with ID: ${document._id}`);

    // 4. Process Excel document (Sheet & Row parsing)
    const processedDoc = await processDocument(document._id);
    console.log(`\n[TEST] Processing Result: Status=${processedDoc.status}, Sheets=${processedDoc.sheetsCount}, Rows=${processedDoc.rowsCount}, Chunks=${processedDoc.chunks}`);

    if (processedDoc.status !== 'processed' || processedDoc.chunks === 0) {
      throw new Error(`Processing failed: ${processedDoc.processingError}`);
    }

    // 5. Generate Vector Embeddings
    console.log(`\n[TEST] Generating embeddings for ${processedDoc.chunks} chunks...`);
    await generateDocumentEmbeddings(document._id);

    const embeddedCount = await DocumentChunk.countDocuments({ documentId: document._id, embeddingStatus: 'completed' });
    console.log(`[TEST] Embedding Result: ${embeddedCount}/${processedDoc.chunks} chunks completed!`);

    // 6. Test 10 Target Queries
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

    console.log('\n==================================================');
    console.log('🎯 RUNNING RAG RETRIEVAL & ANSWER GENERATION TESTS');
    console.log('==================================================');

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
        } else {
          console.log(`  [Source ${idx + 1}] PDF: ${s.originalFileName} | Page: ${s.pageNumber} | Section: ${s.sectionTitle}`);
        }
      });
    }

    console.log('\n==================================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Error:', error);
    process.exit(1);
  }
};

runTest();
