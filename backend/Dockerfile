FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/jaeminSon/StockGauger.git

WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080
CMD ["bash", "./run.sh"]
