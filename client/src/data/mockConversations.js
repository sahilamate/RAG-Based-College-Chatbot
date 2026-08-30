export const INITIAL_CONVERSATIONS = [
  {
    id: "conv_01",
    title: "Hostel Fees & Facilities",
    department: "General",
    createdAt: new Date().toISOString(), // Today
    updatedAt: new Date().toISOString(),
    messagesCount: 4,
    messages: [
      {
        id: "msg_101",
        sender: "user",
        text: "What is the hostel fee?",
        timestamp: "10:30 AM"
      },
      {
        id: "msg_102",
        sender: "bot",
        text: "The hostel accommodation fee is ₹75,000 per academic year.",
        timestamp: "10:30 AM",
        feedback: "helpful",
        sources: [
          {
            documentId: "doc_001",
            fileName: "Hostel_Fees_2026.pdf",
            pageNumber: 3,
            relevanceScore: 0.92,
            snippet: "The annual hostel accommodation fee is fixed at ₹75,000 per academic year..."
          }
        ]
      },
      {
        id: "msg_103",
        sender: "user",
        text: "Are mess charges included in the 75,000 fee?",
        timestamp: "10:32 AM"
      },
      {
        id: "msg_104",
        sender: "bot",
        text: "No, mess charges are ₹35,000 per year payable separately in two equal semester installments.",
        timestamp: "10:32 AM",
        feedback: null,
        sources: [
          {
            documentId: "doc_001",
            fileName: "Hostel_Fees_2026.pdf",
            pageNumber: 7,
            relevanceScore: 0.88,
            snippet: "Mess bill is ₹35,000 per year, covering breakfast, lunch, high tea, and dinner."
          }
        ]
      }
    ]
  },
  {
    id: "conv_02",
    title: "Exam Schedule & Rules",
    department: "Computer",
    createdAt: new Date().toISOString(), // Today
    updatedAt: new Date().toISOString(),
    messagesCount: 2,
    messages: [
      {
        id: "msg_201",
        sender: "user",
        text: "When are the semester exams?",
        timestamp: "11:15 AM"
      },
      {
        id: "msg_202",
        sender: "bot",
        text: "The Odd Semester 2026 Mid-Term Examinations are scheduled from October 12 to October 20, 2026. End-Semester Examinations commence on December 01, 2026.",
        timestamp: "11:15 AM",
        feedback: "helpful",
        sources: [
          {
            documentId: "doc_003",
            fileName: "Semester_Exam_Schedule_2026.pdf",
            pageNumber: 2,
            relevanceScore: 0.95,
            snippet: "Mid-Term Oct 12-20, 2026. End-Semester Dec 01-18, 2026."
          }
        ]
      }
    ]
  },
  {
    id: "conv_03",
    title: "Scholarship Information",
    department: "General",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    messagesCount: 2,
    messages: [
      {
        id: "msg_301",
        sender: "user",
        text: "What scholarships are available for computer engineering students?",
        timestamp: "Yesterday 3:45 PM"
      },
      {
        id: "msg_302",
        sender: "bot",
        text: "CollegeAI offers several merit and need-based scholarship schemes including a 50% tuition fee waiver for top CGPA students and up to 75% fee concession for low-income backgrounds.",
        timestamp: "Yesterday 3:45 PM",
        feedback: "helpful",
        sources: [
          {
            documentId: "doc_004",
            fileName: "Scholarship_Scheme_Details.pdf",
            pageNumber: 5,
            relevanceScore: 0.93,
            snippet: "Merit-cum-Means Scholarship Guidelines. 50% tuition waiver for CGPA > 9.0."
          }
        ]
      }
    ]
  },
  {
    id: "conv_04",
    title: "Library Timings & IEEE Access",
    department: "General",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // Previous 7 days
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    messagesCount: 2,
    messages: [
      {
        id: "msg_401",
        sender: "user",
        text: "How can I access IEEE papers from home?",
        timestamp: "3 days ago"
      },
      {
        id: "msg_402",
        sender: "bot",
        text: "Students get free access to IEEE Xplore digital library using their official college institutional email credentials via the proxy portal.",
        timestamp: "3 days ago",
        feedback: null,
        sources: [
          {
            documentId: "doc_006",
            fileName: "Library_Rules_and_Digital_Access.pdf",
            pageNumber: 4,
            relevanceScore: 0.90,
            snippet: "IEEE Xplore remote access credentials provided via college webmail login."
          }
        ]
      }
    ]
  }
];
