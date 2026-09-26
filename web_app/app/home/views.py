from flask import jsonify, render_template, request
from . import home


@home.route("/")
def homepage():
    """
    Render the homepage template on the / route
    """
    return render_template("page/home/index.html", title="Welcome")


@home.route("/dashboard")
def dashboard():
    """
    Render the dashboard template on the /dashboard route
    """
    return render_template("page/home/dashboard.html", title="Dashboard")


@home.route("/api/text-stats", methods=["POST"])
def text_stats():
    """
    Count characters, words and lines for the submitted text.
    Accepts a JSON body of the form {"text": "..."}.
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "请求体必须是 JSON 对象。"}), 400

    text = data.get("text")
    if not isinstance(text, str):
        return jsonify({"error": "缺少 text 字段，或 text 不是字符串。"}), 400

    if not text.strip():
        return jsonify({"error": "文本不能为空，请输入内容后再统计。"}), 400

    try:
        stats = {
            "characters": len(text),
            "words": len(text.split()),
            "lines": len(text.splitlines()),
        }
    except Exception:
        return jsonify({"error": "统计过程中出现异常，请稍后重试。"}), 500

    return jsonify(stats)
