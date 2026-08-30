import connectDB from '../config/db.js';
import { answerQuestion } from '../services/chatService.js';
import User from '../models/User.js';

async function testQuery() {
  await connectDB();
  const user = await User.findOne().lean();
  console.log('Testing query: "what are programs"...');

  const result = await answerQuestion('what are programs', user._id);
  console.log('\n--- ANSWER RESULT ---');
  console.log('Answer:\n', result.answer);
  console.log('Has Context:', result.hasContext);
  console.log('Sources Count:', result.sources.length);
  process.exit(0);
}

testQuery();
