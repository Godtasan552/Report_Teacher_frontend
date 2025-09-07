import { createRouter, createWebHistory } from "vue-router";
import SubmitReport from "../components/SubmitReport.vue";
import SearchTracking from "../components/SearchTracking.vue";

const routes = [
  { path: "/",
    name: "Home", 
    component: SubmitReport },

  { path: "/search",
    name: "Search", 
    component: SearchTracking },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
