from fastapi import Request, HTTPException, Depends, Response
from fastapi.responses import JSONResponse
import bcrypt
from app.models.account import AccountModel
from app.routers.tokenManager import TokenManager
from app.dependencies import router, get_db_for_new_thread
from app.models.role import RolesModel
from app.models.account_role import AccountRolesModel

token_manager = TokenManager()


@router.post("/api/auth/register")
async def register(request: Request, db=Depends(get_db_for_new_thread)):
    data = await request.json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "collaborators")

    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="Missing information")

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    account_model = AccountModel(db)
    existing_account = account_model.get_account_by_username(username)
    if existing_account:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = account_model.get_account_by_username(email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    account_data = {
        'username': username,
        'password_hash': password_hash,
        'email': email
    }
    account_model.insert_account(account_data)

    account = account_model.get_account_by_username(username)
    if not account:
        raise HTTPException(status_code=500, detail="Failed to retrieve account after creation")

    account_id = account['id']

    role_model = RolesModel(db)
    default_role = role_model.get_role_by_role(role)
    if not default_role:
        account_model.delete_account(account_id)
        raise HTTPException(status_code=404, detail="Role not found")

    default_role_id = default_role['id']

    account_role_model = AccountRolesModel(db)
    account_role_model.assign_role_to_account(account_id, default_role_id)

    return JSONResponse(content={"message": "Register success"}, status_code=201)


@router.post('/api/auth/login')
async def login(request: Request, response: Response, db=Depends(get_db_for_new_thread)):
    data = await request.json()
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Vui lòng điền đầy đủ thông tin đăng nhập")
    
    account_model = AccountModel(db)
    account = account_model.get_account_by_username(username)
    if not account or not bcrypt.checkpw(password.encode('utf-8'), account['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password. Please try again.")

    account_role_model = AccountRolesModel(db)
    roles = account_role_model.get_roles_by_account_id(account['id'])
    if not roles:
        raise HTTPException(status_code=403, detail="No roles assigned to the account")
    role_name = roles[0]['role']
    access_token = token_manager.create_access_token(data={'id': account['id'], 'role': role_name})
    refresh_token = token_manager.create_refresh_token(data={'id': account['id'], 'role': role_name})
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="Strict", max_age=86400)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="Strict", max_age=604800)
    return {"message": "Login successful"}
    # return {"access_token": access_token, "refresh_token": refresh_token}

@router.post('/api/auth/google')
async def google_auth(request: Request, db=Depends(get_db_for_new_thread)):
    data = await request.json()
    google_token = data.get("google_token")
    role = data.get("role", "collaborators")

    google_user = google_auth.verify_google_token(google_token)
    if not google_user:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    email = google_user['email']

    account_model = AccountModel(db)
    account = account_model.get_account_by_username(email)
    account_role_model = AccountRolesModel(db)

    if not account:
        account_model.insert_account({'username': email, 'password_hash': '', 'email': email})
        account = account_model.get_account_by_username(email)

        role_model = RolesModel(db)
        role = role_model.get_role_by_role(role)
        if not role:
            account_model.delete_account(account['id'])
            raise HTTPException(status_code=404, detail="Role not found")

        role_id = role['id']
        account_role_model.assign_role_to_account(account['id'], role_id)

    roles = account_role_model.get_roles_by_account_id(account['id'])
    if not roles:
        account_model.delete_account(account['id'])
        raise HTTPException(status_code=403, detail="No roles assigned to the account")

    role_names = [r['role'] for r in roles]

    access_token = token_manager.create_access_token(data={'id': account['id'], 'roles': role_names})
    refresh_token = token_manager.create_refresh_token(data={'id': account['id'], 'roles': role_names})

    return JSONResponse(content={'access_token': access_token, 'refresh_token': refresh_token}, status_code=200)
