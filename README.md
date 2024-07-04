# use-pwa-install-prompt

## About

遵循 google 规范 (web.dev) 设计的主动安装 pwa 应用的工具

-   `参考资料` https://web.dev/articles/install-criteria?hl=zh-cn#criteria

## Api 说明

| Method              | Description                                                                          |
| :------------------ | :----------------------------------------------------------------------------------- |
| registerPWA         | 注册使用 pwa 安装的前置事件 (在应用启动前执行)                                       |
| pwaInstallIsReady   | 判断 pwa 安装程序是否已经就绪 (可以结合 vue 的 watch, react 的 useMemo 修改成响应式) |
| usePWAInstallPrompt | 调用浏览器的 pwa install 程序, 触发 pwa 安装操作                                     |

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
import { Ref, ref } from 'vue'
import { pwaInstallIsReady, EInstallState, usePWAInstallPrompt } from 'use-pwa-install-prompt'

/** 是否允许安装 */
const allowInstall: Ref<boolean> = useMemo(() => {
    return pwaInstallIsReady() === EInstallState.ready
}, [pwaInstallIsReady()])

/** loading状态 */
const loading: Ref<boolean> = ref(false)
</script>
<template>
    <!-- ... -->
    <!-- 方式1：在 pwa install 就绪后展示安装按钮 -->
    <Button v-if="allowInstall" @click="usePWAInstallPrompt">安装</Button>
    <!-- 方式2：用户按下按钮后展示loading -->
    <LoadingComponent v-if="loading" />
    <Button
        @click="
            () =>
                usePWAInstallPrompt({
                    delay: true,
                    loading: (state) => (loading = state)
                })
        "
        >安装</Button
    >
</template>
```
