<template>
  <div class="container">
    <div class="connect-state" v-if="disconnectState">
      <div class="status-text">
        未连接到服务端
      </div>
      <el-button class="btn" @click="handleReconnect">重新连接</el-button>
    </div>
    <div class="left">
      <div class="title-section">
        <div class="title">{{ doingTitle }}</div>
        <div class="subtitle" v-if="false">{{ doingCount }}个订单制作中</div>
      </div>
      <div class="list">
        <div class="item" v-for="(item, index) in doingListComputed" :key="index">
          <div class="order-card">
            <div class="order-header">
              <div class="order-no">
                <svg-icon :icon-class="getClassByType(item)" class="icons" />
                <span class="no-text">{{ item.shopOrderNo }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="doingListComputed.length === 0" class="empty-state">
          <svg-icon icon-class="coffee" class="empty-icon" />
          <div class="empty-text">暂无制作中的订单</div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="title-section">
        <div class="title">{{ doneTitle }}</div>
        <div class="subtitle" v-if="false">{{ doneCount }}个订单待取餐</div>
      </div>
      <div class="list">
        <div class="item" v-for="(item, index) in doneListComputed" :key="index"
          :class="{ 'highlight-item': index === 0 }">
          <div class="order-card">
            <div class="order-header">
              <div class="order-no">
                <svg-icon :icon-class="getClassByType(item)" class="icons" />
                <span class="no-text">{{ item.shopOrderNo }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="doneListComputed.length === 0" class="empty-state">
          <svg-icon icon-class="package" class="empty-icon" />
          <div class="empty-text">暂无待取餐订单</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, defineEmits, watch, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import SvgIcon from '@/components/SvgIcon.vue'

// Data
const doneList = ref([])
const doingList = ref([])
const doingTitle = ref('制作中')
const doneTitle = ref('待取餐')
const webSocket = ref(null)
const heartbeatFailCount = ref(0)
const reconnectFailCount = ref(0)
let timer = null

const disconnectState = computed(() => {
  return reconnectFailCount.value >= import.meta.env.VITE_APP_WS_RECONNECT_MAX || 5
})
// 模拟WebSocket推送数据
const mockWebSocketData = () => {
  const newOrder = {
    shopOrderNo: 'H' + String(Math.floor(Math.random() * 100)).padStart(2, '0'),
    orderId: Date.now().toString(),
    payTime: new Date().toLocaleTimeString(),
    totalAmount: Math.floor(Math.random() * 100) + 20,
    waitTime: Math.floor(Math.random() * 10) + 5,
    pickUpType: Math.random() > 0.5 ? 1 : 2,
    shopId: 1,
    orderStatus: 2,
    shopName: 'Hurry Restaurant',
    shopAddress: '123 Main St, Anytown, USA',
    payType: Math.random() > 0.5 ? '微信支付' : '支付宝',
    payCode: '5500',
    frontOrderCount: 1,
    completeTime: null,
    itemCount: Math.floor(Math.random() * 5) + 1,
    itemInfo: []
  }
  console.log('New order:', JSON.stringify(newOrder));
}

// Computed
const doneListComputed = computed(() => {
  return doneList.value.slice(0, 12)
})

const doingListComputed = computed(() => {
  return doingList.value.slice(0, 12)
})

const doingCount = computed(() => {
  return doingList.value.length
})

const doneCount = computed(() => {
  return doneList.value.length
})

// Emits
const emit = defineEmits([])

// Props
const props = defineProps([])

// Lifecycle hooks
onMounted(() => {
  connectWebSocket()
})

onUnmounted(() => {
  clearInterval(timer)
  webSocket.value.close()
  webSocket.value = null
})

// Methods
const getClassByType = (item) => {
  switch (item.pickUpType) {
    case 1:
      return 'eat-in'
    case 2:
      return 'take-out'
    default:
      return 'eat-in'
  }
}

const getPickUpTypeText = (type) => {
  switch (type) {
    case 1:
      return '堂食'
    case 2:
      return '外带'
    default:
      return '堂食'
  }
}

const getStatusClass = (item) => {
  if (item.waitTime > 15) {
    return 'status-delay'
  } else if (item.waitTime > 10) {
    return 'status-warning'
  }
  return 'status-normal'
}

const formatTime = (time) => {
  if (!time) return '--:--'
  const date = new Date(time)
  return date.getHours().toString().padStart(2, '0') + ':' +
    date.getMinutes().toString().padStart(2, '0')
}

const handleReconnect = () => { 
  reconnectFailCount.value = 0
  connectWebSocket()
}

const handleTakeOrder = (shopOrderNo) => {
  const index = doneList.value.findIndex(order => order.shopOrderNo === shopOrderNo)
  if (index !== -1) {
    doneList.value.splice(index, 1)
    // ElMessage.success(`订单 ${shopOrderNo} 已取餐`)
  }
}

const handleDone = (shopOrderNo) => {
  const index = doingList.value.findIndex(order => order.shopOrderNo === shopOrderNo)
  if (index !== -1) {
    const item = doingList.value[index]
    doingList.value.splice(index, 1)
    const completedOrder = {
      ...item,
      completeTime: new Date(),
      orderStatus: 3
    }
    doneList.value.push(completedOrder)

    if (doneList.value.length > 20) {
      doneList.value = doneList.value.slice(doneList.value.length - 20)
    }

  }
}


// WebSocket连接（实际项目中实现）
const connectWebSocket = () => {
  const wsUrl = import.meta.env.VITE_APP_WEB_SOCKET_URL + "?shopId=" + import.meta.env.VITE_APP_SHOP_ID
  if (reconnectFailCount.value >= import.meta.env.VITE_APP_WS_RECONNECT_MAX) {
    ElMessage.error('WS重连次数过最大限制，请检查网络')
    console.log('WS重连次数过最大限制，放弃重连');
    return
  }
  webSocket.value = new WebSocket(wsUrl)
  webSocket.value.onopen = () => {
    reconnectFailCount.value = 0
    heartbeatFailCount.value = 0
    settingHeartbeat()
    console.log('WebSocket连接已打开')
    ElMessage.success('已连接至服务器')
  }
  webSocket.value.onmessage = (event) => {
    if (event.data === import.meta.env.VITE_APP_WS_HEARTBEAT_RESP) {
      console.log('WebSocket心跳检测成功');
      return
    }
    const data = JSON.parse(event.data)
    if (data.action === 'new_order') {
      window.electronAPI.printReceipt(data.order);
      doingList.value.unshift(data.order)
    }
    if (data.action === 'finish_order') {
      handleDone(data.shopOrderNo)
    }
    if (data.action === 'take_order') {
      handleTakeOrder(data.shopOrderNo)
    }
  }
  webSocket.value.onclose = () => {
    console.log('WebSocket连接已关闭')
  }
  webSocket.value.onerror = (e) => {
    console.log('WebSocket连接捕获到出错:', e)
    reconnectFailCount.value++
    setTimeout(() => {
      connectWebSocket()
    }, import.meta.env.VITE_APP_WS_RECONNECT_INTERVAL || 5000)
    return
  }
}

const settingHeartbeat = () => {
  timer = setInterval(() => {
    checkConnectionStatus()
  }, import.meta.env.VITE_APP_WS_HEARTBEAT_INTERVAL || 5000)
}

const checkConnectionStatus = () => {
  if (heartbeatFailCount.value >= import.meta.env.VITE_APP_WS_HEARTBEAT_RETRY_MAX) {
    console.log("心跳失效已达上限，重新连接");
    webSocket.value.close()
    heartbeatFailCount.value = 0
    webSocket.value = null
    clearInterval(timer);
    timer = null;
    connectWebSocket();
    return;
  }
  switch (webSocket.value.readyState) {
    case WebSocket.OPEN:
      try {
        webSocket.value.send(import.meta.env.VITE_APP_WS_HEARTBEAT_MESSAGE)
        heartbeatFailCount.value = 0
      } catch (error) {
        heartbeatFailCount.value = heartbeatFailCount.value + 1
      }
      break;
    case WebSocket.CLOSED:
      console.log("WebSocket 已关闭");
      connectWebSocket();
      break;
    default:
      console.log("WebSocket 状态:", webSocket.value.readyState);
  }
};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f8f4e9 0%, #f1e8d9 100%);
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  .connect-state{
    .btn{
      margin-left: 10px;
    }
  }
  .status-text{
    font-size: 0.8rem;
    color: #8b5a2b;
    padding: 10px;

    
  }
  .left,
  .right {
    flex: 1;
    padding: 30px;
    overflow-y: hidden;
    position: relative;
  }

  .left {
    border-right: 2px dashed #e6d5b8;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  }

  .right {
    background: linear-gradient(to left, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  }

  .title-section {
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(139, 90, 43, 0.08);
    border: 1px solid rgba(212, 165, 116, 0.2);

    .title {
      font-size: 2.8rem;
      font-weight: 700;
      color: #5c3d2e;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(92, 61, 46, 0.1);
    }

    .subtitle {
      font-size: 1.2rem;
      color: #8b5a2b;
      font-weight: 500;
      opacity: 0.8;
    }
  }

  .list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
    max-height: calc(100vh - 200px);

    .item {
      perspective: 1000px;

      &.highlight-item {
        .order-card {
          border: 2px solid #ff6b6b;
          animation: pulse 2s infinite;
          transform: scale(1.02);
        }
      }
    }

    .order-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(139, 90, 43, 0.12);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(212, 165, 116, 0.3);
      cursor: pointer;
      // height: 220px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 15px 40px rgba(139, 90, 43, 0.2);
        border-color: rgba(164, 113, 72, 0.5);
      }

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        // margin-bottom: 20px;

        .order-no {
          display: flex;
          align-items: center;
          font-size: 1.8rem;
          font-weight: 700;
          margin: auto;
          color: #5c3d2e;

          .no-text {
            margin-left: 10px;
          }

          .icons {
            font-size: 24px;
            color: #a47148;
          }
        }

        .order-status {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;

          &.status-normal {
            background: rgba(76, 175, 80, 0.15);
            color: #2e7d32;
          }

          &.status-warning {
            background: rgba(255, 152, 0, 0.15);
            color: #f57c00;
          }

          &.status-delay {
            background: rgba(244, 67, 54, 0.15);
            color: #d32f2f;
          }

          &.ready {
            background: rgba(33, 150, 243, 0.15);
            color: #1976d2;
          }
        }
      }

      .order-time {
        display: flex;
        align-items: center;
        color: #7d5d48;
        font-size: 1.1rem;
        margin-bottom: 15px;

        .time-icon {
          margin-right: 10px;
          color: #a47148;
          font-size: 18px;
        }
      }

      .order-items {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 12px;
        background: rgba(244, 240, 234, 0.5);
        border-radius: 10px;

        .item-count {
          display: flex;
          align-items: center;
          color: #8b5a2b;
          font-weight: 500;

          .coffee-icon {
            margin-right: 8px;
            color: #a47148;
            font-size: 18px;
          }
        }

        .total-amount {
          font-size: 1.6rem;
          font-weight: 700;
          color: #5c3d2e;
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .order-type {
          padding: 8px 16px;
          background: rgba(164, 113, 72, 0.1);
          border-radius: 12px;
          color: #8b5a2b;
          font-weight: 600;
          font-size: 1rem;
        }

        .done-btn,
        .take-btn {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          border: none;
          transition: all 0.3s;

          &:hover {
            transform: scale(1.05);
          }
        }

        .done-btn {
          background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
        }

        .take-btn {
          background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        }
      }
    }

    .call-number {
      margin-top: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
      border-radius: 16px;
      text-align: center;
      animation: slideIn 0.5s ease-out;

      .call-icon {
        font-size: 2.5rem;
        margin-bottom: 10px;
      }

      .call-text {
        color: white;
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 10px;
      }

      .call-number-text {
        color: white;
        font-size: 3rem;
        font-weight: 700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        letter-spacing: 3px;
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 40px;
      text-align: center;
      color: #a47148;
      opacity: 0.7;

      .empty-icon {
        font-size: 5rem;
        margin-bottom: 30px;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 1.8rem;
        font-weight: 500;
      }
    }
  }
}

.icons {
  margin-right: 10px;
  font-size: 20px;
  width: 32px;
  height: 32px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
  }

  70% {
    box-shadow: 0 0 0 15px rgba(255, 107, 107, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 1600px) {
  .list {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 1200px) {
  .container {
    flex-direction: column;

    .left,
    .right {
      height: 50vh;
      border-right: none;
      border-bottom: 2px dashed #e6d5b8;
    }

    .list {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
}

@media (max-width: 768px) {
  .list {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .title-section .title {
    font-size: 2rem !important;
  }

  .order-card {
    padding: 20px !important;
    height: auto !important;
  }
}

@media (max-width: 480px) {
  .list {
    grid-template-columns: 1fr !important;
  }

  .container {
    padding: 15px;
  }

  .title-section {
    padding: 15px !important;
  }
}
</style>