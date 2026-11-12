import { apiClient } from "./api-client";

export const aiService = {
  // 1. Phân tích CV
  parseCv: async (formData: FormData) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/ai/cv-parse/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 2. Đánh giá chất lượng CV
  evaluateCv: async (
    payload:
      | { cv_id?: number | string | null; cv_data?: any; rubric_version?: string }
      | number
      | string
  ) => {
    const body =
      typeof payload === "object" && payload !== null && !("toFixed" in payload)
        ? payload
        : { cv_id: payload };
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data: any;
    }>("/ai/cv-evaluate/", body);
    return response.data;
  },

  // 3. CV - JD Matching
  matchCvJd: async (
    payload:
      | {
          cv_id?: number | string | null;
          cv_data?: any;
          job_id?: number | string | null;
          jd_text?: string;
        }
      | (number | string),
    maybeJobId?: number | string
  ) => {
    const body =
      typeof payload === "object" && payload !== null && !("toFixed" in payload)
        ? payload
        : { cv_id: payload, job_id: maybeJobId };
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data: any;
    }>("/ai/match/", body);
    return response.data;
  },

  // 4. Gợi ý việc làm phù hợp cho ứng viên (TOPSIS)
  getJobRecommendations: async (limit: number = 10, cvId?: number | string) => {
    const params: Record<string, any> = { top_k: limit, limit };
    if (cvId) params.cv_id = cvId;
    const response = await apiClient.get<{
      success: boolean;
      data: { recommendations: any[] };
    }>("/ai/recommendations/jobs/", { params });
    return response.data;
  },

  // 5. Gợi ý ứng viên cho tin tuyển dụng (Employer - TOPSIS)
  getCandidateRecommendations: async (jobId: number | string, limit: number = 10) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { candidates?: any[]; recommendations?: any[] };
    }>("/ai/recommendations/candidates/", { params: { job_id: jobId, top_k: limit, limit } });
    return response.data;
  },

  // 6. RAG Chatbot kiến thức nghề nghiệp
  chatRag: async (question: string, sessionId?: number | string, algorithm: string = "hybrid_v2") => {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        session_id: number;
        message_id: number;
        role: string;
        content: string;
        answer?: string;
        retrieved_chunks: any[];
        retrieved_chunk_ids: number[];
        created_at: string;
      };
    }>("/ai/rag/chat/", { question, session_id: sessionId, algorithm });
    return response.data;
  },

  getRagSessionHistory: async (sessionId: number | string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        session_id: number;
        title: string;
        created_at: string;
        messages: Array<{
          id: number;
          role: string;
          content: string;
          retrieved_chunk_ids: number[];
          citations?: any[];
          created_at: string;
        }>;
      };
    }>(`/ai/rag/sessions/${sessionId}/`);
    return response.data;
  },

  // 7. AI Mock Interview (Phỏng vấn thử)
  getMockInterviews: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: { interviews: any[] };
    }>("/ai/interviews/");
    return response.data;
  },

  createMockInterview: async (data: {
    job_id?: number | string;
    job_title?: string;
    target_role?: string;
    level?: string;
    years_of_experience?: number;
    skills?: string[];
  }) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { interview: any; [key: string]: any };
    }>("/ai/interviews/", data);
    return response.data;
  },

  getMockInterviewDetail: async (id: number | string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: { interview: any; [key: string]: any };
    }>(`/ai/interviews/${id}/`);
    return response.data;
  },

  submitAnswer: async (
    interviewId: number | string,
    data: { question_id: number | string; answer_text?: string; answer?: string; duration_seconds?: number }
  ) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: any;
    }>(`/ai/interviews/${interviewId}/answer/`, data);
    return response.data;
  },

  completeMockInterview: async (interviewId: number | string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: { report: any; [key: string]: any };
    }>(`/ai/interviews/${interviewId}/complete/`);
    return response.data;
  },
};
