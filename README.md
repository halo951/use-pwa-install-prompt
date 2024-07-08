# use-pwa-install-prompt

## About

遵循 google 规范 (web.dev) 设计的主动安装 pwa 应用的工具

-   `参考资料` https://web.dev/articles/install-criteria?hl=zh-cn#criteria

-   `判定规则`

    首先, 遵循 google 的规则, 当用户在页面停留够 30s, 且有一次点击行为才可以安装 pwa
    关于是否安装过的判定, 如果用户安装过, 会在 localStorage 中标记一个 `pwa-install-flag` 值, 当存在此值时, 如果超过 2s 未收到 `beforeinstallprompt` 事件, 将判定当前应用已经被安装过了
    否则, 如果超过 32s(+2s 容错时间)没有收到`beforeinstallprompt`事件, 则判定用户安装过 (或当前浏览器不支持)

## Api 说明

| Method                   | Description                                      |
| :----------------------- | :----------------------------------------------- |
| registerPWA              | 注册使用 pwa 安装的前置事件 (在应用启动前执行)   |
| pwaInstallIsReady        | 判断 pwa 安装程序是否已经就绪                    |
| usePWAInstallPrompt      | 调用浏览器的 pwa install 程序, 触发 pwa 安装操作 |

## Usage

> Tips: 此处默认你的应用已经完成 pwa 应用配置

1. 安装 `yarn add use-pwa-install-prompt`

2. 在应用启动前添加下面的代码

```typescript
import { registerPWA } from 'use-pwa-install-prompt'

// ...
registerPWA()
// > App 实例
createRoot(App).mount('#app')
```

3. 集成安装功能

```vue
<script lang="ts">
import { Ref, ref, onMounted, onBeforeUnmount } from 'vue'
import { pwaInstallIsReady, EInstallState, usePWAInstallPrompt, inPWA } from 'use-pwa-install-prompt'

const state: Ref<EInstallState> = ref(EInstallState.unready)
const loading: Ref<boolean> = ref(false)
const online: Ref<boolean> = ref(navigator.onLine)
let timer: any

const install = async (): Promise<boolean> => {
    const res = await usePWAInstallPrompt({
        delay: true,
        loading: (state) => (loading.value = state)
    })
    if (res) {
        console.log('已安装')
    } else {
        console.log('用户取消/已经安装过')
    }
    // location.href = '/home'
    console.log('模拟跳转到首页')
    return res
}

onMounted(() => {
    state.value = pwaInstallIsReady()
    timer = setInterval(() => {
        state.value = pwaInstallIsReady()
    }, 1000)
    window.addEventListener('online', () => {
        online.value = true
    })
    window.addEventListener('offline', () => {
        online.value = false
    })
})

onBeforeUnmount(() => {
    clearInterval(timer)
})
</script>
<template>
    <p>Loading 状态: {{ loading }}</p>
    <p>安装状态: {{ state }}</p>
    <p>在线状态: {{ online }}</p>
    <p>运行环境: {{ inPWA() }}</p>
    <p>
        <button @click="install">安装/唤起</button>
    </p>
</template>
```
