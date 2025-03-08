# Created by: thongnt
from typing import Any, Callable, Coroutine
from sqlalchemy.ext.declarative import declarative_base
from app.constant.config import DB_CONNECTION_URL
import contextlib
import ssl
from typing import Any, AsyncIterator
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

Base = declarative_base()        
class DatabaseSessionManager:
    def __init__(self, host: str, engine_kwargs: dict[str, Any] = {}):
        self._engine = create_async_engine(host, **engine_kwargs)
        # create a sessionmaker
        self._sessionmaker = async_sessionmaker(bind=self._engine, autocommit=False, autoflush=False)
        
    async def close(self):
        if self._engine is None:
            raise Exception("DatabaseSessionManager is not initialized")
        
        await self._engine.dispose()
        
        self._engine = None
        self._sessionmaker = None
        
    @contextlib.asynccontextmanager
    async def connect(self) -> AsyncIterator[AsyncConnection]:
        if self._sessionmaker is None:
            raise Exception("DatabaseSessionManager is not initialized")

        async with self._engine.connect() as connection:
            try:
                yield connection
            except Exception as e:
                await connection.rollback()
                raise e
    
    @contextlib.asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        if self._sessionmaker is None:
            raise Exception("DatabaseSessionManager is not initialized")
        
        session = self._sessionmaker()
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()
            
    async def create_tables(self):
        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
    async def run_with_session(
        self, 
        operation: Callable[[AsyncSession, str, Any], Coroutine], 
        session_id: str, 
        *args: Any
        )-> None:
        """
        Executes a database operation with its own session.
        
        Args:
            operation: Async function that takes (session, session_id, *args) as parameters
            session_id: Session ID to pass to the operation
            args: Additional arguments to pass to the operation (query for add_user_message for example)
        """
        async with self._sessionmaker() as session:
            try:
                await operation(session, session_id, *args)
                await session.commit()
            except Exception as e:
                await session.rollback()
                print(f"Error in run_with_session: {e}")
                raise e
            finally:
                await session.close()

RDS_CERT_PATH = "DigiCertGlobalRootG2.crt.pem"

# ssl_context = ssl.create_default_context(cafile=RDS_CERT_PATH)
# ssl_context.verify_mode = ssl.CERT_REQUIRED

# connect_args = {"ssl": ssl_context}

#session_manager = DatabaseSessionManager(COSMOS_CONNECTION_URL, engine_kwargs={"connect_args": connect_args})
session_manager = DatabaseSessionManager(DB_CONNECTION_URL)

async def get_db():
    async with session_manager.session() as session:
        yield session

async def run_with_session(
    operation: Callable[[AsyncSession, str, Any], Coroutine],
    session_id: str,
    *args: Any
) -> None:
    await session_manager.run_with_session(operation, session_id, *args)
    