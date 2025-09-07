<template>
  <div class="page-container">
    <div class="submit-report">
      <!-- Header -->
      <div class="header">
        <div class="header-top">
          <div class="header-left">
            <div class="header-icon">📂</div>
            <div class="header-text">
              <h1>ส่งรายงาน</h1>
              <p class="subtitle">กรุณากรอกข้อมูลให้ครบถ้วน</p>
            </div>
          </div>
          <button class="search-btn" @click="goToSearch" type="button">
            <span class="search-icon">🔍</span>
            <span>ค้นหารายงาน</span>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" class="report-form">
        <div class="form-group">
          <label for="teacher"
            >ชื่ออาจารย์ <span class="required">*</span></label
          >
          <input
            id="teacher"
            v-model="teacher"
            placeholder="ชื่ออาจารย์"
            required
          />
        </div>

        <div class="form-group">
          <label for="subject">รายวิชา <span class="required">*</span></label>
          <input
            id="subject"
            v-model="subject"
            placeholder="รายวิชา"
            required
          />
        </div>

        <div class="form-group">
          <label for="detail">รายละเอียด <span class="required">*</span></label>
          <textarea
            id="detail"
            v-model="detail"
            placeholder="รายละเอียด"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>แนบไฟล์ <span class="optional">(ถ้ามี)</span></label>
          <div class="file-upload-container">
            <input
              id="file"
              type="file"
              @change="onFileChange"
              class="file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label for="file" class="file-upload-btn">
              <span class="file-icon">📎</span>
              <span class="file-text">{{
                fileName ? "เปลี่ยนไฟล์" : "เลือกไฟล์"
              }}</span>
              <span class="file-arrow">↗</span>
            </label>
          </div>
          <div v-if="fileName" class="selected-file">
            <div class="file-info">
              <span class="file-icon-small">📄</span>
              <span class="file-name">{{ fileName }}</span>
              <span class="file-size" v-if="fileSize">{{ fileSize }}</span>
            </div>
            <button type="button" class="remove-file-btn" @click="removeFile">
              <span class="remove-icon">✕</span>
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? "กำลังส่ง..." : "ส่งรายงาน" }}
        </button>
      </form>
    </div>

    <!-- Popup Modal -->
    <div v-if="showPopup" class="popup-overlay show" @click="closePopupOverlay">
      <div class="popup-content" @click.stop>
        <div class="popup-header">
          <h2>ส่งรายงานสำเร็จ 🎉</h2>
          <p>Tracking ID ของคุณคือ:</p>
        </div>
        <div class="tracking-section">
          <div class="tracking-id-container">
            <span class="tracking-id">{{ tracking }}</span>
            <button class="copy-btn" @click="copyTracking">
              {{ copyButtonText }}
            </button>
          </div>
        </div>
        <div class="popup-actions">
          <button class="search-tracking-btn" @click="goToSearchWithId">
            <span class="search-icon">🔍</span>
            ค้นหารายงานนี้
          </button>
          <button class="close-btn" @click="closePopup">ปิด</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { submitReport } from "../api";

const router = useRouter();

const teacher = ref("");
const subject = ref("");
const detail = ref("");
const file = ref<File | null>(null);
const fileName = ref("");
const fileSize = ref("");
const tracking = ref("");
const showPopup = ref(false);
const isSubmitting = ref(false);
const copyButtonText = ref("คัดลอก");

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    fileName.value = target.files[0].name;
    fileSize.value = formatFileSize(target.files[0].size);
  }
};

const removeFile = () => {
  file.value = null;
  fileName.value = "";
  fileSize.value = "";
  const fileInput = document.getElementById("file") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
};

const submit = async () => {
  try {
    isSubmitting.value = true;

    const res = await submitReport({
      teacher: teacher.value,
      subject: subject.value,
      detail: detail.value,
      file: file.value || undefined,
    });

    tracking.value = res.data.tracking_id;
    showPopup.value = true;

    // Reset form
    teacher.value = "";
    subject.value = "";
    detail.value = "";
    removeFile();
  } catch (err) {
    console.error(err);
    alert("ส่งรายงานล้มเหลว กรุณาลองใหม่อีกครั้ง");
  } finally {
    isSubmitting.value = false;
  }
};

const closePopup = () => {
  showPopup.value = false;
  copyButtonText.value = "คัดลอก";
};

const closePopupOverlay = (e: Event) => {
  if (e.target === e.currentTarget) {
    closePopup();
  }
};

const copyTracking = async () => {
  try {
    await navigator.clipboard.writeText(tracking.value);
    copyButtonText.value = "คัดลอกแล้ว!";

    setTimeout(() => {
      copyButtonText.value = "คัดลอก";
    }, 2000);
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = tracking.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    alert("คัดลอก Tracking ID เรียบร้อยแล้ว!");
  }
};

// Navigation
const goToSearch = () => {
  router.push("/search");
};

const goToSearchWithId = () => {
  router.push({
    path: "/search",
    query: { trackingId: encodeURIComponent(tracking.value) }, // encode # ด้วย
  });
  closePopup();
};

// Keyboard listener
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && showPopup.value) closePopup();
};

onMounted(() => document.addEventListener("keydown", handleKeydown));
onUnmounted(() => document.removeEventListener("keydown", handleKeydown));
</script>

<style scoped>
/* เพิ่ม CSS สำหรับ navigation buttons */
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-text h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
  font-weight: 600;
}

.header-text .subtitle {
  margin: 0.25rem 0 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.search-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  background: linear-gradient(135deg, #2980b9, #3498db);
}

.search-btn .search-icon {
  font-size: 1rem;
}

.popup-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.search-tracking-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-tracking-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.close-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .search-btn {
    align-self: flex-end;
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }

  .popup-actions {
    flex-direction: column;
  }
}
</style>
