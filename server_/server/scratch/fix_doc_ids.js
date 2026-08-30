import connectDB from '../config/db.js';
import DocumentChunk from '../models/DocumentChunk.js';
import Document from '../models/Document.js';

async function fixDocIds() {
  await connectDB();
  const excelDoc = await Document.findOne({ originalFileName: /College_Knowledge_Base/i }).lean();
  console.log('Excel Document:', excelDoc ? { id: excelDoc._id, title: excelDoc.title } : 'None');

  if (excelDoc) {
    const updated = await DocumentChunk.updateMany(
      { $or: [{ documentId: null }, { documentId: { $exists: false } }] },
      { $set: { documentId: excelDoc._id } }
    );
    console.log('Updated chunks without documentId:', updated.modifiedCount);
  }
  process.exit(0);
}

fixDocIds();
