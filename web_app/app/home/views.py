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
    Return character, word and line counts for the posted text.
    """
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "请求格式不正确，请以 JSON 提交"}), 400

    text = data.get("text", "")
    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "文本内容不能为空"}), 400

    return jsonify(
        {
            "characters": len(text),
            "words": len(text.split()),
            "lines": len(text.splitlines()),
        }
    )
