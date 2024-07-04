declare enum EInstallState {
    /** 安装程序未就绪 (未获取到安装弹窗, 也可能是安装过了) */
    unready = "unready",
    /** 安装程序就绪 */
    ready = "ready",
    /** pwa应用可能已经被安装过 */
    installed = "installed"
}
/** 注册 pwa 事件监听器 */
declare const registerPWA: () => void;
/**
 * pwa 安装程序是否已就绪
 *
 * @description 可以借助 vue 的 `watch` 或 react 的 `useEffect` 监听 pwa inastall 就绪状态的变化
 *
 * @returns {boolean | } 安装程序是否就绪
 */
declare const pwaInstallIsReady: () => EInstallState;
interface IUsePWAInstallPromptOptions {
    /** 如果安装程序未就绪, 是否触发等待操作. */
    delay?: boolean;
    /** 切换loading状态的方法 */
    loading?: (state: boolean) => void;
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
declare const usePWAInstallPrompt: (options: IUsePWAInstallPromptOptions) => Promise<boolean>;

export { EInstallState, type IUsePWAInstallPromptOptions, pwaInstallIsReady, registerPWA, usePWAInstallPrompt };
