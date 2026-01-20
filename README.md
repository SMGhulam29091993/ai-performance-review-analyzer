# AI Performance Review Analyzer

A comprehensive backend system for analyzing employee performance reviews using AI and RAG (Retrieval-Augmented Generation) with MongoDB Vector Search.

## 🎯 Features

- **AI-Powered Analysis**: Extract and summarize feedback from performance appraisals using Google Gemini
- **RAG Integration**: Semantic search for similar reviews using MongoDB Vector Search
- **Quarterly Analytics**: Generate comprehensive Q1, Q2, Q3, Q4 summaries with AI insights
- **Annual Reports**: Year-over-year trend analysis and strategic recommendations
- **Action Items**: AI-generated recommendations and learning programs
- **Department Analytics**: Compare performance across different departments
- **Excel Import**: Bulk upload reviews from Excel spreadsheets

## 🏗️ Architecture

### Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Vector Search
- **AI**: Google Gemini (gemini-pro, embedding-001)
- **Validation**: Zod
- **Excel Processing**: XLSX

### Key Components

1. **Models**
   - Employee: Employee information and metadata
   - PerformanceReview: Individual review data with embeddings
   - AnalyticsSummary: Aggregated analytics with AI insights

2. **Services**
   - GeminiService: AI analysis and embeddings
   - PerformanceReviewService: CRUD and vector search
   - AnalyticsService: Quarterly/annual summarization

3. **Controllers**
   - PerformanceReviewController: Review endpoints
   - AnalyticsController: Analytics endpoints

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (for Vector Search)
- Google Gemini API key

### Installation

1. Clone the repository

```bash
cd ai_performance_review_analyzer
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
GEMINI_API_KEY=your_gemini_api_key
```

5. Set up MongoDB Vector Search Indexes

Go to MongoDB Atlas → Search → Create Search Index → JSON Editor

For `performancereviews` collection:

```json
{
  "name": "vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 768,
        "similarity": "cosine"
      }
    ]
  }
}
```

For `analyticssummaries` collection (same configuration).

6. Start the development server

```bash
npm run dev
```

## 📡 API Endpoints

### Health Check

```http
GET /api/v1/health
```

### Performance Reviews

#### Create Review

```http
POST /api/v1/reviews
Content-Type: application/json

{
  "employeeId": "EMP001",
  "reviewerId": "MGR001",
  "reviewPeriod": {
    "year": 2024,
    "quarter": "Q1",
    "startDate": "2024-01-01",
    "endDate": "2024-03-31"
  },
  "ratings": {
    "technical": 4.5,
    "communication": 4.0,
    "teamwork": 5.0,
    "leadership": 3.5,
    "problemSolving": 4.0,
    "initiative": 4.5,
    "overall": 4.2
  },
  "feedback": {
    "strengths": "Excellent technical skills...",
    "weaknesses": "Needs improvement in...",
    "achievements": "Led successful migration...",
    "areasOfImprovement": "Public speaking...",
    "managerComments": "Great performer..."
  }
}
```

#### Get Review Summary (with AI Analysis)

```http
GET /api/v1/reviews/:reviewId/summary
```

#### Search Similar Reviews (RAG)

```http
GET /api/v1/reviews/search?query=leadership+skills&department=Engineering&limit=5
```

#### Get Employee Reviews

```http
GET /api/v1/reviews/employee/:employeeId?year=2024&quarter=Q1
```

#### Get Reviews by Period

```http
GET /api/v1/reviews?year=2024&quarter=Q1&department=Engineering
```

#### Update Review Status

```http
PATCH /api/v1/reviews/:reviewId/status
Content-Type: application/json

{
  "status": "approved"
}
```

#### Bulk Upload Reviews

```http
POST /api/v1/reviews/bulk-upload
Content-Type: multipart/form-data

file: performance_reviews.xlsx
```

### Analytics

#### Generate Quarterly Summary

```http
POST /api/v1/analytics/quarterly?year=2024&quarter=Q1&department=Engineering
```

Response includes:

- Total reviews count
- Average ratings across all dimensions
- Top strengths and common weaknesses
- AI-generated executive summary
- Key findings and trends
- Recommended action items
- Learning programs suggestions

#### Generate Annual Summary

```http
POST /api/v1/analytics/annual?year=2024&department=Engineering
```

Response includes:

- Year-over-year trends
- Quarterly comparison
- Key achievements and persistent challenges
- Growth areas and concern areas
- Strategic recommendations
- Learning roadmap

#### Get Analytics Summary

```http
GET /api/v1/analytics/summary?year=2024&quarter=Q1&department=Engineering
```

#### Compare Multiple Periods

```http
POST /api/v1/analytics/compare
Content-Type: application/json

{
  "periods": [
    { "year": 2024, "quarter": "Q1" },
    { "year": 2024, "quarter": "Q2" },
    { "year": 2024, "quarter": "Q3" }
  ],
  "department": "Engineering"
}
```

#### Get Department-wise Analytics

```http
GET /api/v1/analytics/departments?year=2024&quarter=Q1
```

## 📊 Data Schema

### Employee

```typescript
{
  employeeId: string (unique)
  firstName: string
  lastName: string
  email: string (unique)
  department: enum
  position: string
  managerId?: string
  dateOfJoining: Date
  isActive: boolean
}
```

### PerformanceReview

```typescript
{
  employeeId: string (ref Employee)
  reviewerId: string (ref Employee)
  reviewPeriod: {
    year: number
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
    startDate: Date
    endDate: Date
  }
  ratings: {
    technical: number (1-5)
    communication: number (1-5)
    teamwork: number (1-5)
    leadership: number (1-5)
    problemSolving: number (1-5)
    initiative: number (1-5)
    overall: number (1-5)
  }
  feedback: {
    strengths: string
    weaknesses: string
    achievements: string
    areasOfImprovement: string
    managerComments: string
    employeeSelfReview?: string
  }
  rawText: string
  embedding: number[] (768 dimensions)
  status: 'draft' | 'submitted' | 'approved' | 'published'
}
```

### AnalyticsSummary

```typescript
{
  period: {
    type: 'quarterly' | 'annual'
    year: number
    quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  }
  department?: string
  summary: {
    totalReviews: number
    averageRatings: {...}
    topStrengths: Array
    commonWeaknesses: Array
    improvementAreas: Array
  }
  insights: {
    aiGeneratedSummary: string
    keyFindings: string[]
    trends: string[]
    recommendations: string[]
  }
  actionItems: Array<{
    category: string
    action: string
    priority: 'low' | 'medium' | 'high'
    targetEmployees: string[]
  }>
  learningPrograms: Array<{
    programName: string
    description: string
    targetSkill: string
    recommendedFor: string[]
  }>
  embedding: number[]
}
```

## 🔍 RAG Implementation

The system uses MongoDB Vector Search for semantic similarity:

1. **Embedding Generation**: Reviews are converted to 768-dimensional vectors using Gemini's embedding-001 model
2. **Vector Storage**: Embeddings stored in MongoDB with dedicated vector search indexes
3. **Similarity Search**: Cosine similarity used to find semantically similar reviews
4. **Context Enhancement**: Retrieved reviews provide context for AI analysis

### Vector Search Query Example

```javascript
{
  $vectorSearch: {
    index: 'vector_index',
    path: 'embedding',
    queryVector: [0.123, 0.456, ...], // 768 dimensions
    numCandidates: 100,
    limit: 5
  }
}
```

## 🤖 AI Features

### Review Summarization

- Extracts key strengths and weaknesses
- Identifies improvement areas
- Generates actionable recommendations
- Suggests relevant learning programs

### Quarterly Analytics

- Analyzes patterns across all reviews
- Identifies departmental trends
- Provides executive summary
- Recommends strategic actions

### Annual Analytics

- Year-over-year trend analysis
- Quarterly performance comparison
- Long-term growth tracking
- Strategic planning insights

## 📝 Excel Template

Download the Excel template to bulk import reviews:

```http
GET /api/v1/reviews/template
```

Required columns:

- employeeId, reviewerId
- year, quarter, startDate, endDate
- technical, communication, teamwork, leadership, problemSolving, initiative, overall
- strengths, weaknesses, achievements, areasOfImprovement, managerComments
- employeeSelfReview (optional)
- previousGoalsStatus, newGoals (optional)

## 🛠️ Development

### Build

```bash
npm run build
```

### Run in Production

```bash
npm start
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## 🔒 Security

- Helmet.js for security headers
- Input validation with Zod
- MongoDB injection prevention
- Rate limiting support
- CORS configuration

## 📈 Performance Optimization

- Connection pooling for MongoDB
- Efficient vector search with proper indexing
- Batch processing for bulk operations
- Optimized aggregation pipelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License

## 🙋‍♂️ Support

For issues and questions, please open a GitHub issue or contact the development team.

---

**Built with ❤️ using Node.js, TypeScript, MongoDB, and Google Gemini AI**
