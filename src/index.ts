export enum EInstallState {
    /** 安装程序未就绪 (未获取到安装弹窗, 也可能是安装过了) */
    unready = 'unready',
    /** 安装程序就绪 */
    ready = 'ready',
    /** pwa应用可能已经被安装过 */
    installed = 'installed'
}

const LOCAL_CACHE_KEY: string = 'pwa-install-flag'
/** pwa 安装弹窗引用 */
let deferredPrompt: any | undefined = undefined
/** 用户首次在页面上点击或点按的时间 */
let firstTouchTime: number | undefined = undefined

/** 监听首次触摸行为 */
const listenFirstTouch = (): void => {
    const cb = (): void => {
        firstTouchTime = Date.now()
        window.removeEventListener('touchend', cb)
        window.removeEventListener('mouseup', cb)
    }
    window.addEventListener('touchend', cb, { once: true })
    window.addEventListener('mouseup', cb, { once: true })
}

/** 注册 pwa 事件监听器 */
export const registerPWA = (): void => {
    window.addEventListener('beforeinstallprompt', (ev: Event): void => {
        ev.preventDefault()
        deferredPrompt = ev
    })

    window.addEventListener('appinstalled', (): void => {
        localStorage.setItem(LOCAL_CACHE_KEY, '1')
        deferredPrompt = null
    })

    listenFirstTouch()
}

/**
 * pwa 安装程序是否已就绪
 *
 * @description 可以借助 vue 的 `watch` 或 react 的 `useEffect` 监听 pwa inastall 就绪状态的变化
 *
 * @returns {boolean | } 安装程序是否就绪
 */
export const pwaInstallIsReady = (): EInstallState => {
    if (!!deferredPrompt) return EInstallState.ready
    // Tips: 补2s延时, 避免极限情况
    if (Date.now() - window.performance.timeOrigin > 32 * 1000 && !!firstTouchTime) {
        localStorage.setItem(LOCAL_CACHE_KEY, '1')
        return EInstallState.installed
    }
    // ? 如果进入页面时间超过2s, 并且ls中有安装过的标记, 那么就跳过等待, 指示用户已安装
    if (Date.now() - window.performance.timeOrigin > 2 * 1000 && localStorage.getItem(LOCAL_CACHE_KEY)) {
        return EInstallState.installed
    }
    return EInstallState.unready
}

export interface IUsePWAInstallPromptOptions {
    /** 如果安装程序未就绪, 是否触发等待操作. */
    delay?: boolean
    /** 切换loading状态的方法 */
    loading?: (state: boolean) => void
}

/** 轮询任务 */
const loopTask = (check: () => boolean, time: number, durcation?: number): Promise<boolean> => {
    return new Promise((resolve) => {
        let end = Date.now() + time
        let timer = setInterval(() => {
            if (check()) {
                clearInterval(timer)
                resolve(true)
            } else if (Date.now() - end > 0) {
                // > 超时未完成, 则返回false
                clearInterval(timer)
                resolve(false)
            }
        }, durcation || 1000)
    })
}

/** 使用 pwa 弹窗
 *
 * @description
 *  - 需要先执行 `registerPWA` 获取 prompt
 *  -
 *  - 在 chrome for android/119 版本及之前的版本, 如果用户已安装pwa应用, 则不会唤起 prompt.
 *  - 在 chrome for android/126 (最新)版本上, 表现与之前不一致, 允许用户重复安装.
 *
 * @param {boolean} delay 如果安装程序未就绪, 是否触发等待操作.
 * @returns
 */
export const usePWAInstallPrompt = async (options: IUsePWAInstallPromptOptions): Promise<boolean> => {
    const status = pwaInstallIsReady()
    // ? 用户已经安装过 pwa 应用
    if (status === EInstallState.ready && deferredPrompt) {
        // > 弹出安装弹窗
        deferredPrompt.prompt()
        // > 等待结果
        const { outcome } = await deferredPrompt.userChoice
        // > 清理, prompt 弹窗仅可使用一次, 二次使用需要等待再次触发 `beforeinstallprompt` 事件
        deferredPrompt = undefined
        // ? 是否已安装
        if (outcome === 'accepted') {
            localStorage.setItem(LOCAL_CACHE_KEY, '1')
            // > 用户安装
            return true
        } else {
            // > 用户取消
            return false
        }
    }
    // ? 如果安装程序未就绪, 判断是否需要等待, 如需等待, 等待官方的触发条件完成后, 再返回失败结果
    else if (status === EInstallState.unready && options.delay) {
        // @  计算等待时间, 如果超时表明失败(一般为安装过了)
        const delayTime: number = window.performance.timeOrigin + 32 * 1000 - Date.now()
        if (delayTime < 0) return false
        // > 延时函数
        options.loading?.(true)
        const res: boolean = await loopTask(
            () => {
                return pwaInstallIsReady() === EInstallState.ready
            },
            localStorage.getItem(LOCAL_CACHE_KEY) ? 2 * 1000 : 32 * 1000
        )
        options.loading?.(false)
        // > retry
        if (res) return usePWAInstallPrompt(options)
    }
    // ?否则, 如果已经安装过或未设置等待的, 返回失败
    return false
}

export const inPWA = (): 'twa' | 'standalone' | 'browser' => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (document.referrer.startsWith('android-app://')) {
        return 'twa'
    } else if ((navigator as any)['standalone'] || isStandalone) {
        return 'standalone'
    }
    return 'browser'
}
