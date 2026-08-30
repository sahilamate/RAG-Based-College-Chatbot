export const KNOWLEDGE_BASE_RESPONSES = [
  {
    keywords: ["hostel", "hostel fee", "hostel fees", "room fee", "accommodation"],
    answer: "The annual hostel accommodation fee for the 2026-2027 academic year is ₹75,000 per student. This fee includes electricity, water, high-speed Wi-Fi, and 24/7 security. Mess charges are ₹35,000 per year payable in two equal installments. A refundable caution deposit of ₹5,000 is collected at the time of initial room allotment.",
    sources: [
      {
        documentId: "doc_001",
        fileName: "Hostel_Fees_2026.pdf",
        pageNumber: 3,
        relevanceScore: 0.94,
        snippet: "Section 3.1: The annual hostel accommodation fee is fixed at ₹75,000 per academic year. Caution deposit of ₹5,000 refundable upon checkout."
      },
      {
        documentId: "doc_001",
        fileName: "Hostel_Fees_2026.pdf",
        pageNumber: 7,
        relevanceScore: 0.88,
        snippet: "Section 4.2: Mess bill is ₹35,000 per year, covering breakfast, lunch, high tea, and dinner."
      }
    ]
  },
  {
    keywords: ["attendance", "minimum attendance", "attendance requirement", "condonation", "absent"],
    answer: "Students must maintain a minimum attendance requirement of 75% in each registered course to be eligible for end-semester examinations. Condonation up to 10% may be granted by the Dean of Academic Affairs only on medical grounds (with valid medical certificate) or for official college representation in events.",
    sources: [
      {
        documentId: "doc_002",
        fileName: "Academic_Regulations_2026.pdf",
        pageNumber: 18,
        relevanceScore: 0.91,
        snippet: "Rule 4.2: Mandatory minimum 75% attendance criteria. Shortage below 65% results in strict debarment from semester exams without exception."
      }
    ]
  },
  {
    keywords: ["exam", "exams", "semester exam", "timetable", "schedule", "exam date", "midterm"],
    answer: "The Odd Semester 2026 Mid-Term Examinations are scheduled from October 12 to October 20, 2026. The End-Semester Examinations will commence on December 01, 2026. Hall tickets will be issued digitally on the student portal 5 days prior to exams, provided all fee dues and minimum attendance requirements are fulfilled.",
    sources: [
      {
        documentId: "doc_003",
        fileName: "Semester_Exam_Schedule_2026.pdf",
        pageNumber: 2,
        relevanceScore: 0.95,
        snippet: "Table 1.1: Mid-Term Oct 12-20, 2026. End-Semester Dec 01-18, 2026. Digital Hall Ticket issuance starting Nov 25."
      }
    ]
  },
  {
    keywords: ["scholarship", "scholarships", "fee waiver", "financial aid", "merit scholarship"],
    answer: "CollegeAI offers several merit and need-based scholarship schemes:\n1. Merit Scholarship: Top 5% students with CGPA > 9.0 receive a 50% tuition fee waiver.\n2. Need-Based Scholarship: Students with annual family income below ₹3.0 Lakhs receive up to 75% fee concession.\n3. Sports & Cultural Waiver: 25% waiver for national/state level medalists.\nApplications open on September 15 via the Student Portal.",
    sources: [
      {
        documentId: "doc_004",
        fileName: "Scholarship_Scheme_Details.pdf",
        pageNumber: 5,
        relevanceScore: 0.93,
        snippet: "Section 2.1: Merit-cum-Means Scholarship Guidelines. 50% tuition waiver for CGPA > 9.0."
      },
      {
        documentId: "doc_004",
        fileName: "Scholarship_Scheme_Details.pdf",
        pageNumber: 12,
        relevanceScore: 0.86,
        snippet: "Section 4.0: Financial Hardship Assistance Fund application procedure and income tax return requirements."
      }
    ]
  },
  {
    keywords: ["placement", "placements", "jobs", "internship", "highest package", "companies"],
    answer: "The Training & Placement Cell handles campus placements. For the 2025-2026 batch, over 120 recruiters visited campus, achieving an 89.4% overall placement rate. The highest domestic package was ₹44 LPA, with an average package of ₹8.5 LPA. Key hiring partners include Google, Microsoft, Amazon, TCS Digital, Infosys, and Deloitte.",
    sources: [
      {
        documentId: "doc_005",
        fileName: "Campus_Placement_Policy_2026.pdf",
        pageNumber: 4,
        relevanceScore: 0.92,
        snippet: "Placement Report Summary: 120+ recruiters, 89.4% placement rate, Highest ₹44 LPA, Average ₹8.5 LPA."
      }
    ]
  },
  {
    keywords: ["library", "books", "borrow", "library timing", "digital library", "ieee"],
    answer: "The Central Library is open Monday to Saturday from 8:00 AM to 10:00 PM (extended till 12:00 Midnight during exam weeks). Undergraduate students can borrow up to 4 books for 14 days. Students get free access to IEEE Xplore, ScienceDirect, and ACM Digital Library using their college institutional email credentials.",
    sources: [
      {
        documentId: "doc_006",
        fileName: "Library_Rules_and_Digital_Access.pdf",
        pageNumber: 4,
        relevanceScore: 0.90,
        snippet: "Section 1.3: Borrowing limits - UG: 4 books for 14 days; PG: 6 books for 28 days. Late fine ₹5 per day per book."
      }
    ]
  },
  {
    keywords: ["admission", "admissions", "cutoff", "jee", "apply", "eligibility", "fees"],
    answer: "Admissions for B.Tech programs are conducted based on JEE Main scores and state centralized counseling. Eligibility requires a minimum of 60% aggregate in Physics, Chemistry, and Mathematics in 10+2. Total tuition fee for B.Tech is ₹1,20,000 per semester.",
    sources: [
      {
        documentId: "doc_007",
        fileName: "Admission_Brochure_2026.pdf",
        pageNumber: 8,
        relevanceScore: 0.96,
        snippet: "Section 2.0: B.Tech Admission Criteria - 60% aggregate in PCM, JEE Main percentile cutoff ranking."
      }
    ]
  }
];

export const UNKNOWN_QUESTION_RESPONSE = {
  answer: "I couldn't find relevant information in the college knowledge base for your query.\n\nPlease try asking a question related to college academics, admissions, fees, hostel, library, scholarships, placements, or campus policies.",
  sources: [],
  isUnknown: true
};
