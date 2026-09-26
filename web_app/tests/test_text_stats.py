import pytest

from app import create_app


@pytest.fixture()
def client():
    app = create_app("config.TestingConfig")
    app.config.update(TESTING=True)
    with app.test_client() as client:
        yield client


def test_text_stats_success(client):
    response = client.post(
        "/api/text-stats",
        json={"text": "hello world\nsecond line"},
    )

    assert response.status_code == 200
    assert response.get_json() == {
        "characters": 23,
        "words": 4,
        "lines": 2,
    }


def test_text_stats_empty_text_returns_400(client):
    response = client.post("/api/text-stats", json={"text": "   "})

    assert response.status_code == 400
    assert "error" in response.get_json()


def test_text_stats_non_json_body_returns_400(client):
    response = client.post(
        "/api/text-stats",
        data="this is not json",
        content_type="text/plain",
    )

    assert response.status_code == 400
    assert "error" in response.get_json()
