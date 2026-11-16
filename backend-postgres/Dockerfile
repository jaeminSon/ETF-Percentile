FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/jaeminSon/ETF-Percentile.git

WORKDIR /app/ETF-Percentile/backend
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080
CMD ["bash", "./run.sh"]
