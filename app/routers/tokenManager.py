import logging
from fastapi import HTTPException
import jwt
import datetime
from typing import Dict
from app.dependencies import SECRET_KEY, ALGORITHM

class TokenManager:
    def __init__(self, secret_key: str = SECRET_KEY, algorithm: str = ALGORITHM):
        self.secret_key = secret_key
        self.algorithm = algorithm

    def create_access_token(self, data: Dict, expires_delta: datetime.timedelta = None) -> str:
        if expires_delta:
            expire = datetime.datetime.utcnow() + expires_delta
        else:
            expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)

        to_encode = data.copy()
        to_encode.update({"exp": expire})

        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
        # return f"Bearer {encoded_jwt}"

    def create_refresh_token(self, data: Dict, expires_delta: datetime.timedelta = None) -> str:
        if expires_delta:
            expire = datetime.datetime.utcnow() + expires_delta
        else:
            expire = datetime.datetime.utcnow() + datetime.timedelta(
                days=7)

        to_encode = data.copy()
        to_encode.update({"exp": expire})

        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
        # return f"Bearer {encoded_jwt}" 

    def decode_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            # Optional: Log successful decoding
            logging.info("Token successfully decoded: %s", payload)
            return payload
        except jwt.ExpiredSignatureError:
            logging.warning("Token has expired.")
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            logging.warning("Invalid token.")
            raise HTTPException(status_code=401, detail="Invalid token")
        except jwt.DecodeError:
            logging.error("Error decoding token.")
            raise HTTPException(status_code=400, detail="Error decoding token")
        except Exception as e:
            logging.error("Unexpected error: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
