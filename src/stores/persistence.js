export function readStoredState(key, fallback, isValid) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    const saved = JSON.parse(raw)
    // 调用方提供数据结构校验函数，避免加载不兼容的缓存。
    return isValid(saved) ? saved : fallback
  } catch (error) {
    console.warn(`无法读取本地状态 "${key}"，将使用初始数据。`, error)
    return fallback
  }
}

export function writeStoredState(key, state) {
  try {
    // 要求 3：将 Store 的最新状态序列化到 localStorage，供其他页面和下次访问恢复。
    localStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.error(`无法保存本地状态 "${key}"。`, error)
  }
}
