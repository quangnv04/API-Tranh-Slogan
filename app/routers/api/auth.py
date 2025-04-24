import re
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
    phone = data.get("phone")
    notes = data.get("notes")
    status = data.get("status")
    role = data.get("role", "admin")

    if not username or not email or not password or not phone:
        raise HTTPException(status_code=400, detail="Username, Password, Phone number, Email is required")

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    if not re.match(r"^(0|\+84)(\d{9})$", phone):
        raise HTTPException(status_code=400, detail="Invalid phone number format")
    
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    account_model = AccountModel(db)
    existing_account = account_model.get_account_by_username(username)
    if existing_account:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = account_model.get_account_by_email(email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    existing_phone = account_model.get_account_by_phone(phone)
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already exists")

    account_data = {
        'username': username,
        'password_hash': password_hash,
        'email': email,
        'phone': phone,
        'notes': notes,
        'status': status
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
    
    if account['status'] != 'active':
        raise HTTPException(status_code=403, detail="Tài khoản của bạn đã bị khóa, vui lòng liên hệ lại với quản lý.")

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
