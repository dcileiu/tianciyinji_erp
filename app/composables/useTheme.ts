export const useTheme = () => {
  const isDark = useState("theme.isDark", () => false);

  const toggleTheme = () => {
    isDark.value = !isDark.value;

    if (isDark.value) {
      document.documentElement.classList.add("dark");
      if (process.client) {
        localStorage.setItem("theme", "dark");
      }
    } else {
      document.documentElement.classList.remove("dark");
      if (process.client) {
        localStorage.setItem("theme", "light");
      }
    }
  };

  const initTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") {
        isDark.value = true;
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "light") {
        isDark.value = false;
        document.documentElement.classList.remove("dark");
      } else {
        // 如果没有保存的主题偏好，检查系统偏好
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        isDark.value = prefersDark;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
        }
        localStorage.setItem("theme", prefersDark ? "dark" : "light");
      }
    }
  };

  return {
    isDark: readonly(isDark),
    toggleTheme,
    initTheme,
  };
};
