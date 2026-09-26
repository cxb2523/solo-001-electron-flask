"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("text-stats-input");
  const button = document.getElementById("text-stats-button");
  const result = document.getElementById("text-stats-result");

  if (!input || !button || !result) {
    return;
  }

  const idleLabel = button.textContent;

  const showMessage = function (message, isError) {
    result.textContent = message;
    result.classList.toggle("text-stats-error", Boolean(isError));
    result.classList.remove("text-stats-items");
  };

  const showStats = function (stats) {
    result.textContent = "";
    result.classList.remove("text-stats-error");
    result.classList.add("text-stats-items");

    const items = [
      ["字符数", stats.characters],
      ["单词数", stats.words],
      ["行数", stats.lines],
    ];

    items.forEach(function (item) {
      const row = document.createElement("div");
      row.className = "text-stats-item";

      const label = document.createElement("span");
      label.className = "text-stats-item-label";
      label.textContent = item[0];

      const value = document.createElement("span");
      value.className = "text-stats-item-value";
      value.textContent = String(item[1]);

      row.appendChild(label);
      row.appendChild(value);
      result.appendChild(row);
    });
  };

  const setLoading = function (isLoading) {
    button.disabled = isLoading;
    button.textContent = isLoading ? "统计中..." : idleLabel;
  };

  button.addEventListener("click", function () {
    setLoading(true);
    showMessage("统计中，请稍候...", false);

    fetch("/api/text-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.value }),
    })
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return null;
          })
          .then(function (payload) {
            if (!response.ok) {
              const message =
                payload && payload.error
                  ? payload.error
                  : "统计失败（HTTP " + response.status + "），请稍后重试。";
              throw new Error(message);
            }
            if (
              !payload ||
              typeof payload.characters !== "number" ||
              typeof payload.words !== "number" ||
              typeof payload.lines !== "number"
            ) {
              throw new Error("服务返回的数据格式异常，请稍后重试。");
            }
            showStats(payload);
          });
      })
      .catch(function (error) {
        const message =
          error instanceof TypeError
            ? "无法连接到统计服务，请检查应用后端是否正常运行。"
            : error.message || "统计失败，请稍后重试。";
        showMessage(message, true);
      })
      .finally(function () {
        setLoading(false);
      });
  });
});
