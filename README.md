# senhome

## Create a Virtual Environment

```bash
# Create a virtual environment
python3 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install the dependencies
pip install -r requirements.txt
```

## Create a `.env` File

```bash
cp .env.template .env
```

## Run the Application Locally

```bash
uvicorn app.main:app --reload --port 5000
```
