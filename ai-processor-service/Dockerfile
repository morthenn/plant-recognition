FROM python:3.8-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY requirements-base.txt requirements-ml.txt ./

# Install base requirements first (faster to rebuild)
RUN pip install -r requirements-base.txt && \
    pip install -r requirements-ml.txt

# Final stage
FROM python:3.8-slim

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.8/site-packages/ /usr/local/lib/python3.8/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy application code
COPY src/ /app/src/
COPY requirements-base.txt requirements-ml.txt ./

# Set Python path to include src directory
ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8082/health || exit 1

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8082"]