<template>
  <div class="submit-report">
    <h1>ส่งรายงาน</h1>

    <form @submit.prevent="submit" class="report-form">
      <div class="form-group">
        <label for="teacher">ชื่ออาจารย์</label>
        <input id="teacher" v-model="teacher" placeholder="ชื่ออาจารย์" required />
      </div>

      <div class="form-group">
        <label for="subject">รายวิชา</label>
        <input id="subject" v-model="subject" placeholder="รายวิชา" required />
      </div>

      <div class="form-group">
        <label for="detail">รายละเอียด</label>
        <textarea id="detail" v-model="detail" placeholder="รายละเอียด" required></textarea>
      </div>

      <div class="form-group">
        <label for="file">แนบไฟล์ (ถ้ามี)</label>
        <input id="file" type="file" @change="onFileChange" />
      </div>

      <button type="submit" class="submit-btn">ส่งรายงาน</button>
    </form>

    <p v-if="tracking" class="tracking-id">
      Tracking ID: <strong>{{ tracking }}</strong>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { submitReport } from "../api";

const teacher = ref("");
const subject = ref("");
const detail = ref("");
const file = ref<File | null>(null);
const tracking = ref("");

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) file.value = target.files[0];
};

const submit = async () => {
  try {
    const res = await submitReport({
      teacher: teacher.value,
      subject: subject.value,
      detail: detail.value,
      file: file.value || undefined,
    });
    tracking.value = res.data.tracking_id;
  } catch (err) {
    console.error(err);
    alert("ส่งรายงานล้มเหลว");
  }
};
</script>

<style scoped>
.submit-report {
  max-width: 500px;
  margin: 40px auto;
  padding: 25px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fdfdfd;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  font-family: Arial, sans-serif;
}

.submit-report h1 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.submit-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: #4caf50;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-btn:hover {
  background-color: #45a049;
}

.tracking-id {
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: #333;
}
</style>
