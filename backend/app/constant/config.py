import os
from dotenv import load_dotenv
load_dotenv()


SERP_API_KEY = os.getenv("SERP_API_KEY")
COINBASE_KEY_NAME = os.getenv("COINBASE_KEY_NAME")
COINBASE_KEY_PRIVATE_KEY = os.getenv("COINBASE_KEY_PRIVATE_KEY")
CMC_KEY= os.getenv("CMC_KEY")
X_BEARER_TOKEN= os.getenv("X_BEARER_TOKEN")
DB_CONNECTION_URL = os.getenv("DB_CONNECTION_URL")
SECRET_KEY= os.getenv("SECRET_KEY")
BITQUERY_TOKEN = os.getenv("BITQUERY_TOKEN")
