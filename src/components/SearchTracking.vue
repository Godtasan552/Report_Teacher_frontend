<template>
  <div class="page-container">
    <div class="search-tracking">
      <!-- Header -->
      <div class="header">
        <div class="header-icon">🔍</div>
        <h1>ค้นหารายงาน</h1>
        <p class="subtitle">ใส่ Tracking ID เพื่อค้นหารายงานของคุณ</p>
      </div>

      <!-- Search Form -->
      <form @submit.prevent="doSearchReport" class="search-form">
        <div class="form-group">
          <label for="trackingId"
            >Tracking ID <span class="required">*</span></label
          >
          <div class="search-input-container">
            <input
              id="trackingId"
              v-model="trackingId"
              placeholder="เช่น #ABC12345"
              required
              class="search-input"
            />
            <button
              type="submit"
              class="search-btn"
              :disabled="isSearching || !trackingId"
            >
              <span v-if="isSearching" class="loading-icon">⏳</span>
              <span v-else class="search-icon">🔍</span>
              {{ isSearching ? "กำลังค้นหา..." : "ค้นหา" }}
            </button>
          </div>
        </div>
      </form>

      <!-- Result -->
      <div v-if="searchResult" class="search-result success">
        <div class="result-header">
          <h2>พบรายงาน 📋</h2>
          <div class="tracking-badge">{{ searchResult.tracking_id }}</div>
        </div>
        <div class="result-content">
          <div class="result-item">
            <span class="label">👨‍🏫 อาจารย์:</span>
            <span class="value">{{ searchResult.teacher }}</span>
          </div>
          <div class="result-item">
            <span class="label">📚 วิชา:</span>
            <span class="value">{{ searchResult.subject }}</span>
          </div>
          <div class="result-item">
            <span class="label">📝 รายละเอียด:</span>
            <div class="detail-text">{{ searchResult.detail }}</div>
          </div>
          <div class="result-item">
            <span class="label">📊 สถานะ:</span>
            <div
              class="status-badge"
              :class="getStatusClass(searchResult.status)"
            >
              {{ searchResult.status_display }}

            </div>
          </div>
          <div v-if="searchResult.response" class="result-item">
            <span class="label">💬 การตอบกลับ:</span>
            <div class="response-text">{{ searchResult.response }}</div>
          </div>
          <div class="result-item">
            <span class="label">📅 วันที่ส่ง:</span>
            <span class="value">{{ formatDate(searchResult.created_at) }}</span>
          </div>
        </div>
      </div>

      <div v-if="showNoResult" class="search-result error">
        <div class="error-content">
          <div class="error-icon">❌</div>
          <h3>ไม่พบรายงาน</h3>
          <p>
            ไม่พบรายงานที่มี Tracking ID: <strong>{{ trackingId }}</strong>
          </p>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
      </div>

      <div class="quick-actions">
        <button
          @click="clearSearch"
          class="action-btn clear-btn"
          v-if="searchResult || showNoResult"
        >
          <span class="btn-icon">🗑️</span>
          ค้นหาใหม่
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { searchReport as apiSearchReport } from "../api";

const route = useRoute();

const trackingId = ref("");
const searchResult = ref(null);
const showNoResult = ref(false);
const isSearching = ref(false);
const errorMessage = ref("");

// ค้นหา report
const doSearchReport = async () => {
  if (!trackingId.value) return;

  try {
    isSearching.value = true;
    errorMessage.value = "";
    searchResult.value = null;
    showNoResult.value = false;

    const response = await apiSearchReport(trackingId.value);
    searchResult.value = response.data;
  } catch (err: any) {
    if (err.response?.status === 404) showNoResult.value = true;
    else errorMessage.value = "เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง";
  } finally {
    isSearching.value = false;
  }
};

// Auto-fill จาก query parameter
onMounted(() => {
  if (route.query.trackingId) {
    trackingId.value = decodeURIComponent(route.query.trackingId as string);
    doSearchReport();
  }
});

// watch query parameter
watch(
  () => route.query.trackingId,
  (newId) => {
    if (newId) {
      trackingId.value = decodeURIComponent(newId as string);
      doSearchReport();
    }
  }
);

const clearSearch = () => {
  trackingId.value = "";
  searchResult.value = null;
  showNoResult.value = false;
  errorMessage.value = "";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusText = (status: string) => {
  const map: { [key: string]: string } = {
    pending: "รอการตรวจสอบ",
    reviewing: "กำลังตรวจสอบ",
    completed: "เสร็จสิ้น",
    rejected: "ถูกปฏิเสธ",
  };
  return map[status] || status;
};

const getStatusClass = (status: string) => {
  const map: { [key: string]: string } = {
    pending: "status-pending",
    reviewing: "status-reviewing",
    completed: "status-completed",
    rejected: "status-rejected",
  };
  return map[status] || "status-default";
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.search-tracking {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 600px;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #2c3e50;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.search-form {
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #34495e;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
}

.search-input-container {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.875rem;
  border: 2px solid #ecf0f1;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  background: white;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Search Result Styles */
.search-result {
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-result.success {
  background: linear-gradient(
    135deg,
    rgba(46, 204, 113, 0.1),
    rgba(39, 174, 96, 0.1)
  );
  border: 2px solid #2ecc71;
}

.search-result.error {
  background: linear-gradient(
    135deg,
    rgba(231, 76, 60, 0.1),
    rgba(192, 57, 43, 0.1)
  );
  border: 2px solid #e74c3c;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.result-header h2 {
  margin: 0;
  color: #27ae60;
  font-size: 1.3rem;
}

.tracking-badge {
  background: #27ae60;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-family: monospace;
  font-weight: bold;
  font-size: 0.9rem;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.value {
  color: #34495e;
  font-size: 1rem;
}

.detail-text,
.response-text {
  background: rgba(255, 255, 255, 0.7);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  color: #2c3e50;
  line-height: 1.6;
}

.response-text {
  border-left-color: #27ae60;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background: #f39c12;
  color: white;
}

.status-reviewing {
  background: #3498db;
  color: white;
}

.status-completed {
  background: #27ae60;
  color: white;
}

.status-rejected {
  background: #e74c3c;
  color: white;
}

.status-default {
  background: #95a5a6;
  color: white;
}

/* Error Styles */
.error-content {
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-content h3 {
  color: #e74c3c;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.error-content p {
  color: #7f8c8d;
  margin: 0.5rem 0;
}

.error-hint {
  font-style: italic;
  font-size: 0.9rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  color: #c0392b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.clear-btn {
  background: #95a5a6;
  color: white;
}

.clear-btn:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.submit-btn {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .search-tracking {
    padding: 2rem;
    margin: 1rem;
  }

  .search-input-container {
    flex-direction: column;
  }

  .result-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .quick-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }
}
</style>
