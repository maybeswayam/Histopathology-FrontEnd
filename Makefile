# HistoAI developer Makefile

.PHONY: frontend backend test-backend test-fe compose-up compose-down

frontend:
	cd frontend && npm run dev

backend:
	cd backend && python run_server.py

test-backend:
	cd backend && PYTHONPATH=. pytest -q

test-fe:
	cd frontend && npx tsc --noEmit

compose-up:
	docker compose up --build

compose-down:
	docker compose down
