<template>
 <div class="body">
  <div class="title">{{title}}</div>
  <div class="content">
    <div class="btns">
      <el-button @click="router.push('/board')">叫号屏</el-button>
      <el-button @click="handleQuit">退出</el-button>
    </div>
  </div>
  <div class="footer">
    <div class="version">v0.0.1</div>
    <div class="copyright">Copyright © 2024 Hutu-Order</div>
    <div class="contact"><a href="https://github.com/isnott/hutu-order"><svg-icon icon-class="github" class="icons" /></a></div>
  </div>
 </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, defineEmits, watch, computed  } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SvgIcon from '@/components/SvgIcon.vue'
// Data
const title = ref('Hutu Order Borad')
const router = useRouter()
// Computed

// Emits
const emit = defineEmits([

])

// Props
const props = defineProps({

})

// Lifecycle hooks
onMounted(() => {
 
})

// Watchers

// Methods
const isElectron = () => {
  return window && window.electronAPI
}

const handleQuit = async () => {
  if (isElectron()) {
    try {
      window.electronAPI.quitApp('quit-app')
      
    } catch (error) {
      console.error('调用Electron API失败:', error)
    }
  } else {
    ElMessage.error('当前环境不支持退出')
    console.log('当前环境不支持退出')
  }
}
</script>

<style scoped lang="scss">
.body {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5ebe0 0%, #e6ccb2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.3;
    z-index: 0;
  }
}

.title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #5c3d2e;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(92, 61, 46, 0.1);
  letter-spacing: 1px;
  
  &::after {
    margin-left: 15px;
    font-size: 3rem;
    animation: pulse 2s infinite;
  }
}

.content {
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  padding: 3rem 4rem;
  box-shadow: 0 15px 35px rgba(92, 61, 46, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 165, 116, 0.2);
  margin-bottom: 3rem;
  min-width: 500px;
  text-align: center;
}

.btns {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  
  .el-button {
    width: 300px;
    height: 60px;
    font-size: 1.3rem;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.3s ease;
    letter-spacing: 1px;
    
    &:first-child {
      background: linear-gradient(135deg, #a47148 0%, #8b5a2b 100%);
      border: none;
      color: white;
      
      &:hover {
        background: linear-gradient(135deg, #8b5a2b 0%, #6d451c 100%);
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(139, 90, 43, 0.2);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
    
    &:last-child {
      background: transparent;
      border: 2px solid #a47148;
      color: #5c3d2e;
      
      &:hover {
        background-color: rgba(164, 113, 72, 0.1);
        border-color: #8b5a2b;
        color: #8b5a2b;
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(139, 90, 43, 0.1);
      }
    }
  }
}

.footer {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #7d5d48;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
  
  .version {
    font-weight: 600;
    color: #a47148;
  }
  
  .copyright {
    opacity: 0.8;
  }
  
  .contact {
    align-items: center;
    margin: auto;
    a {
      color: #a47148;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s;
      
      &:hover {
        color: #8b5a2b;
        text-decoration: underline;
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .body {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2.5rem;
    
    &::after {
      font-size: 2.2rem;
    }
  }
  
  .content {
    padding: 2rem;
    min-width: auto;
    width: 90%;
  }
  
  .btns .el-button {
    width: 250px;
    height: 55px;
    font-size: 1.1rem;
  }

}

.icons {
    font-size: 16px;
    position: static;
    display: block;
    width: 32px;
    height: 32px;
  }
</style>