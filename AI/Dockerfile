FROM python:3.11
RUN mkdir /app
WORKDIR /app

COPY ./requirements.txt /app/

COPY . /app

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# comment in local
CMD ["bash","-c","python src/main.py"]

EXPOSE 4003
