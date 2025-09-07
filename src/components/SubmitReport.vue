<template>
  <div class="page-container">
    <div class="submit-report">
      <!-- Header -->
      <div class="header">
        <div class="header-icon">📂</div>
        <h1>ส่งรายงาน</h1>
        <p class="subtitle">กรุณากรอกข้อมูลให้ครบถ้วน</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" class="report-form">
        <div class="form-group">
          <label for="teacher">ชื่ออาจารย์ <span class="required">*</span></label>
          <input id="teacher" v-model="teacher" placeholder="ชื่ออาจารย์" required />
        </div>

        <div class="form-group">
          <label for="subject">รายวิชา <span class="required">*</span></label>
          <input id="subject" v-model="subject" placeholder="รายวิชา" required />
        </div>

        <div class="form-group">
          <label for="detail">รายละเอียด <span class="required">*</span></label>
          <textarea id="detail" v-model="detail" placeholder="รายละเอียด" required></textarea>
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
              <span class="file-text">{{ fileName ? 'เปลี่ยนไฟล์' : 'เลือกไฟล์' }}</span>
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
          {{ isSubmitting ? 'กำลังส่ง...' : 'ส่งรายงาน' }}
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
            <button class="copy-btn" @click="copyTracking">{{ copyButtonText }}</button>
          </div>
        </div>
        <button class="close-btn" @click="closePopup">ปิด</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { submitReport } from "../api";

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
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
  const fileInput = document.getElementById('file') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
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
    // Fallback for browsers that don't support clipboard API
    const textArea = document.createElement("textarea");
    textArea.value = tracking.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    alert("คัดลอก Tracking ID เรียบร้อยแล้ว!");
  }
};

// Keyboard event handler
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showPopup.value) {
    closePopup();
  }
};

// Setup and cleanup keyboard listener
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

