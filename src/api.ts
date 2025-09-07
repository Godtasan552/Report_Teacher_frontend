// api.ts
import axios from "axios";

const apicliend = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// User ส่ง report (ไม่ต้อง login)
export const submitReport = (data: {
    teacher: string;
    subject: string;
    detail: string;
    file?: File;
}) => {
    const formData = new FormData();
    formData.append("teacher", data.teacher);
    formData.append("subject", data.subject);
    formData.append("detail", data.detail);
    if (data.file) formData.append("file", data.file);
    
    return apicliend.post("/reports/", formData, {
         headers: { "Content-Type": "multipart/form-data" },
    });
};

// Admin login
export const adminLogin = (username: string, password: string) => 
    axios.post("http://127.0.0.1:8000/api/auth/login/", { username, password });

// Admin ดึง report (ใช้ POST แทน GET)
export const getReports = (token: string, filters: any = {}) =>
    apicliend.post("/reports/get_reports/", filters, { 
        headers: { Authorization: `Bearer ${token}` } 
    });

// Search Report by Tracking ID
export const searchReport = (trackingId: string) =>
  apicliend.get(`/users_report/reports/search/${encodeURIComponent(trackingId)}/`);
