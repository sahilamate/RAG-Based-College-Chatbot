/**
 * Multi-Stage Query Understanding, Intent Router, & Entity Detection Service
 * Normalizes question variations, detects intent, extracts entities & fields.
 */

export const INTENT_TYPES = {
  LOOKUP: 'LOOKUP',
  COUNT: 'COUNT',
  DISTINCT_COUNT: 'DISTINCT_COUNT',
  LIST: 'LIST',
  FILTER: 'FILTER',
  AGGREGATION: 'AGGREGATION',
  STATISTICS: 'STATISTICS',
  FAQ: 'FAQ',
  EXPLANATION: 'EXPLANATION',
  COMPARISON: 'COMPARISON'
};

export const SOURCE_TARGETS = {
  STRUCTURED: 'STRUCTURED',   // Excel Data Priority
  UNSTRUCTURED: 'UNSTRUCTURED', // PDF Policy Priority
  HYBRID: 'HYBRID'             // Both Excel and PDF Priority
};

/**
 * Normalize common variations and typos in user questions before retrieval
 * @param {string} query 
 * @returns {string} Normalized query string
 */
export const normalizeQueryText = (query) => {
  if (!query || typeof query !== 'string') return '';
  let norm = query.toLowerCase().trim();

  // Common spelling errors and synonyms
  norm = norm.replace(/\bprinciple\b/g, 'principal');
  norm = norm.replace(/\bprinciples\b/g, 'principal');
  norm = norm.replace(/\bdept\b/g, 'department');
  norm = norm.replace(/\bdepts\b/g, 'department');
  norm = norm.replace(/\bdepartments\b/g, 'department');
  norm = norm.replace(/\bplacement report\b/g, 'placement statistics');
  norm = norm.replace(/\bplacement data\b/g, 'placement statistics');
  norm = norm.replace(/\bt&p\b/g, 'placements');
  norm = norm.replace(/\bplacement cell\b/g, 'placements');
  norm = norm.replace(/\bgpa\b/g, 'cgpa');
  norm = norm.replace(/\bmarks\b/g, 'cgpa');
  norm = norm.replace(/\btuition fees\b/g, 'tuition fee');
  norm = norm.replace(/\bhostel fees\b/g, 'hostel fee');

  // Caste / Category normalization when referring to student categories
  if (/\b(caste|castes|caste category|caste options)\b/i.test(norm)) {
    norm = norm.replace(/\b(caste|castes|caste category|caste options)\b/g, 'category');
  }

  return norm;
};

/**
 * Analyze user question, classify intent, extract entities, and extract structured filter parameters.
 * @param {string} query 
 * @returns {Object} Structured intent analysis object
 */
export const analyzeQueryIntent = (query) => {
  const normalizedQuery = normalizeQueryText(query);
  const entities = [];
  const filters = {};

  // Extract Academic Year
  const yearMatch = normalizedQuery.match(/\b(20\d{2}(?:[–-]\d{2,4})?)\b/);
  const academicYear = yearMatch ? yearMatch[1] : null;

  // Extract Department filters (e.g., CSE, ECE, Civil)
  if (/\b(cse|computer science)\b/i.test(normalizedQuery)) filters.department = 'CSE';
  else if (/\b(ece|electronics)\b/i.test(normalizedQuery)) filters.department = 'ECE';
  else if (/\b(mech|mechanical)\b/i.test(normalizedQuery)) filters.department = 'ME';
  else if (/\b(civil)\b/i.test(normalizedQuery)) filters.department = 'CE';

  // Extract Category filters (SC, ST, OBC, EWS, General)
  if (/\b(sc|scheduled caste)\b/i.test(normalizedQuery)) filters.category = 'SC';
  else if (/\b(st|scheduled tribe)\b/i.test(normalizedQuery)) filters.category = 'ST';
  else if (/\b(obc|other backward)\b/i.test(normalizedQuery)) filters.category = 'OBC';
  else if (/\b(ews|economically weaker)\b/i.test(normalizedQuery)) filters.category = 'EWS';
  else if (/\b(general|open category)\b/i.test(normalizedQuery)) filters.category = 'General';

  // Extract Semester filter (e.g. Semester 2, Sem 2)
  const semMatch = normalizedQuery.match(/\bsem(?:ester)?\s*(\d+)\b/i);
  if (semMatch) {
    filters.semester = `Semester ${semMatch[1]}`;
  }

  // 1. DETECT ENTITY
  let entity = 'general';

  if (/\bvice principal\b/i.test(normalizedQuery)) {
    entity = 'vice_principal';
  } else if (/\bprincipal\b/i.test(normalizedQuery)) {
    entity = 'principal';
  } else if (/\b(head of training|head of placement|tpo|placement head)\b/i.test(normalizedQuery)) {
    entity = 'head_tp';
  } else if (/\b(administration|admin office|executive office|leadership)\b/i.test(normalizedQuery)) {
    entity = 'administration';
  } else if (/\b(department|departments)\b/i.test(normalizedQuery)) {
    entity = 'departments';
  } else if (/\b(placement statistics|placement report|package|highest package|average package|companies visited)\b/i.test(normalizedQuery)) {
    entity = 'placement_stats';
  } else if (/\b(minimum cgpa.*placement|placement eligibility|eligibility for placement|placement registration)\b/i.test(normalizedQuery)) {
    entity = 'placement_eligibility';
  } else if (/\b(placement|placements|recruitment)\b/i.test(normalizedQuery)) {
    entity = 'placements';
  } else if (/\b(fee|fees|tuition|hostel fee|cost|amount|payment)\b/i.test(normalizedQuery)) {
    entity = 'fees';
  } else if (/\b(scholarship|scholarships|stipend|grant|concession)\b/i.test(normalizedQuery)) {
    entity = 'scholarships';
  } else if (/\b(student|students|student category|caste|enrollment|cgpa)\b/i.test(normalizedQuery)) {
    if (/\b(category|categories|caste)\b/i.test(normalizedQuery)) {
      entity = 'student_category';
    } else {
      entity = 'students';
    }
  } else if (/\b(course|courses|program|programs|degree|b.tech|m.tech)\b/i.test(normalizedQuery)) {
    entity = 'programs';
  } else if (/\b(faculty|professor|lecturer|teacher)\b/i.test(normalizedQuery)) {
    entity = 'faculty';
  } else if (/\b(rule|rules|ordinance|misconduct|grading|policy|attendance)\b/i.test(normalizedQuery)) {
    entity = 'academic_rules';
  }

  // 2. DETECT INTENT & SUB-OPERATION
  let intent = INTENT_TYPES.LOOKUP;
  let subOperation = null;

  if (/\b(how many department|number of department|count of department|how many departments|number of departments)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.DISTINCT_COUNT;
    subOperation = 'DISTINCT_COUNT';
    entity = 'departments';
  } else if (/\b(list all department|list department|show department|all department|what are the department|list all departments)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.LIST;
    subOperation = 'LIST';
    entity = 'departments';
  } else if (/\b(what are programs|what programs|list programs|all programs|available programs|programs offered|what degrees|courses offered)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.LIST;
    subOperation = 'LIST';
    entity = 'programs';
  } else if (/\b(what are all the.*categor|category options|student categories|all categories|list.*categor)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.LIST;
    subOperation = 'DISTINCT';
    entity = 'student_category';
  } else if (/\b(how many student|count of student|number of student|how many.*belong to|how many.*in sc|how many.*in cse)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.COUNT;
    subOperation = 'COUNT';
    entity = 'students';
  } else if (/\b(average cgpa|avg cgpa|mean cgpa|what is the average)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.AGGREGATION;
    subOperation = 'AVG';
    entity = 'students';
  } else if (/\b(highest cgpa|max cgpa|best cgpa|top student|which student has the highest)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.AGGREGATION;
    subOperation = 'MAX';
    entity = 'students';
  } else if (/\b(above 9|greater than 9|cgpa > 9|show students with|top performers)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.FILTER;
    subOperation = 'FILTER';
    entity = 'students';
  } else if (/\b(placement statistics|placement report|placement metrics)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.STATISTICS;
    entity = 'placement_stats';
  } else if (/\b(minimum cgpa|eligibility for placement|requirements for placement)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.FAQ;
    entity = 'placement_eligibility';
  } else if (/\b(responsibilities of|duties of|role of|what does.*do)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.LOOKUP;
  } else if (/\b(how do i|how to|procedure|steps|apply|application process)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.EXPLANATION;
  } else if (/\b(compare|difference between)\b/i.test(normalizedQuery)) {
    intent = INTENT_TYPES.COMPARISON;
  }

  entities.push(entity);

  return {
    rawQuery: query,
    normalizedQuery,
    intent,
    subOperation,
    entity,
    entities,
    filters,
    academicYear,
    sourceTarget: (intent === INTENT_TYPES.EXPLANATION || intent === INTENT_TYPES.FAQ) ? SOURCE_TARGETS.HYBRID : SOURCE_TARGETS.STRUCTURED
  };
};

/**
 * Generate 5-Pass Search Variations for Fallback Retrieval
 */
export const generateMultiPassQueries = (query, intentAnalysis) => {
  const normQ = intentAnalysis.normalizedQuery || query.toLowerCase().trim();
  const pass1Original = query;

  const pass2Keywords = [];
  const pass3Semantic = [];
  const pass4Sections = [];
  const pass5Lexical = [];

  if (intentAnalysis.entity === 'principal') {
    pass2Keywords.push('principal', 'principal & director', 'dr. rajesh kumar', 'administration', 'executive office');
    pass3Semantic.push('principal responsibilities executive governance college director');
    pass4Sections.push('Administration');
    pass5Lexical.push('principal', 'director', 'dr. rajesh kumar');
  } else if (intentAnalysis.entity === 'placement_stats') {
    pass2Keywords.push('placement statistics', 'highest package', 'average package', 'companies', 'placed');
    pass3Semantic.push('placement statistics package highest average recruiters');
    pass4Sections.push('Placements');
    pass5Lexical.push('package', 'placement', 'lpa', 'recruiters');
  } else if (intentAnalysis.entity === 'placement_eligibility') {
    pass2Keywords.push('placement eligibility', 'minimum cgpa', 'backlog criteria', 'registration');
    pass3Semantic.push('minimum cgpa required for placement registration eligibility');
    pass4Sections.push('Placements', 'Academic_Rules', 'FAQs');
    pass5Lexical.push('minimum', 'cgpa', 'eligibility', 'backlog');
  } else if (intentAnalysis.entity === 'departments') {
    pass2Keywords.push('departments', 'department_name', 'hod', 'building');
    pass3Semantic.push('college departments list head of department');
    pass4Sections.push('Departments');
    pass5Lexical.push('department', 'hod', 'engineering');
  }

  const cleanTokens = normQ
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['what', 'where', 'when', 'which', 'about', 'this', 'that', 'from', 'with'].includes(w));

  if (pass2Keywords.length === 0) pass2Keywords.push(...cleanTokens);
  if (pass3Semantic.length === 0) pass3Semantic.push(query);
  if (pass4Sections.length === 0) pass4Sections.push('General Policy', 'Eligibility');
  if (pass5Lexical.length === 0) pass5Lexical.push(...cleanTokens);

  return {
    pass1Original,
    pass2Keywords: [...new Set(pass2Keywords)],
    pass3Semantic: [...new Set(pass3Semantic)],
    pass4Sections: [...new Set(pass4Sections)],
    pass5Lexical: [...new Set(pass5Lexical)]
  };
};
