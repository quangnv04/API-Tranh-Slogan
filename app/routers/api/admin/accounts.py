import re
import bcrypt
from fastapi import Depends, HTTPException, Request, Response
from app.models.account import AccountModel
from app.dependencies import router, get_db_for_new_thread


@router.get('/api/admin/accounts')
async def accounts(db=Depends(get_db_for_new_thread)):
    account_model = AccountModel(db)
    accounts = account_model.get_all_accounts()
    return accounts


@router.get('/api/admin/account/{account_id}')
async def get_account(account_id: int, db=Depends(get_db_for_new_thread)):
    account_model = AccountModel(db)
    account = account_model.get_account_by_id(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/api/admin/account/{account_id}")
async def update_account(account_id: int, request: Request, db=Depends(get_db_for_new_thread)):
    try:
        data = await request.json()
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        phone = data.get("phone")
        notes = data.get("notes")
        status = data.get("status")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

    if not data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    account_model = AccountModel(db)

    account = account_model.get_account_by_id(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    update_data = {'status': status}

    if username and username != account["username"]:
        if account_model.get_account_by_username(username):
            raise HTTPException(status_code=400, detail="Username already exists")
        update_data["username"] = username

    if email:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        existing_email = account_model.get_account_by_email(email)
        if email != account["email"] and existing_email and existing_email["id"] != account_id:
            raise HTTPException(status_code=400, detail="Email already exists")
        update_data["email"] = email

    if phone:
        if not re.match(r"^(0|\+84)(\d{9})$", phone):
            raise HTTPException(status_code=400, detail="Invalid phone number format")
        existing_phone = account_model.get_account_by_phone(phone)
        if phone != account["phone"] and existing_phone and existing_phone["id"] != account_id:
            raise HTTPException(status_code=400, detail="Phone number already exists")
        update_data["phone"] = phone
    if notes is not None: update_data["notes"] = notes
    
    if password:
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        update_data["password_hash"] = password_hash
        
    success = account_model.update_account(account_id, update_data)

    if success:
        return {"message": "Account updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update account")


@router.patch('/api/admin/account/{username}/delete')
async def delete_account(username: str, db=Depends(get_db_for_new_thread)):
    account_model = AccountModel(db)
    existing_account = account_model.get_account_by_username(username)

    if not existing_account:
        raise HTTPException(status_code=404, detail="Account not found")

    if existing_account.get('status') == 'deleted':
        raise HTTPException(status_code=400, detail="Account already deleted")

    success = account_model.update_account(username, {'status': 'deleted'})
    if success:
        return {"message": "Account deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete account")